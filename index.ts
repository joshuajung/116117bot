import { default as axios, default as Axios } from "axios";
import express from "express";
import objectHash from "object-hash";
import puppeteer, { Browser } from "puppeteer";
import getConfig, { getUrls, getZipFromUrl } from "./config";

class Impfbot {
  private config = getConfig();
  private browser?: Browser;
  private errorCount: number = 0;
  private lastHash: Record<string, string> = {};
  private lastAppointmentsAvailable: Record<string, number> = {};
  private queue: string[] = getUrls();

  public boot = async () => {
    console.log("Booting 116117bot");

    const app = express();
    app.get("/", (req, res) => res.send());
    app.listen(this.config.port);

    await this.startBrowser();
    this.alertPushover(`Now monitoring ${this.queue.length} URL(s).`, -2);
    this.runLoopStep();
  };

  private startBrowser = async () => {
    this.browser?.close();
    this.browser = await puppeteer.launch({
      executablePath: this.config.chromiumExecutablePath,
      headless: this.config.headless,
      defaultViewport: null,
      args: this.config.noPuppeteerSandbox
        ? ["--no-sandbox", "--disable-setuid-sandbox"]
        : [],
    });
  };

  private limboLoop = () => {
    console.error("Caught in limbo loop, as fatal error was discovered.");
    setTimeout(this.limboLoop, 1000 * 60 * 60);
  };

  private runLoopStep = async () => {
    const url = this.queue.shift();
    try {
      if (!url) throw "No URL in queue.";
      const [
        appointmentsAvailable,
        htmlHash,
        html,
      ] = await this.findAppointmentsInUrl(url);
      this.announceNewResults(htmlHash, url, appointmentsAvailable, html);
      this.lastHash[url] = htmlHash;
      this.lastAppointmentsAvailable[url] = appointmentsAvailable;
      setTimeout(this.runLoopStep, this.nextTimeout * 1000);
      this.errorCount = 0;
    } catch (e) {
      this.errorCount++;
      console.error(e);
      this.startBrowser();
      if (this.errorCount < 10) {
        console.error(`Error ${this.errorCount}, delaying next request.`);
        setTimeout(this.runLoopStep, this.config.timeout.error * 1000);
      } else {
        console.error("Too many errors, bailing out.");
        this.alertPushover("Too many errors, bailing out.", 0);
        this.limboLoop();
      }
    } finally {
      if (url) this.queue.push(url);
    }
  };

  private findAppointmentsInUrl = async (
    url: string
  ): Promise<[number, string, string]> => {
    if (url.indexOf("impftermine/service") !== -1) {
      // the entered URL is a "new" URL (finding appointments before having a booking code)
      const zip = getZipFromUrl(url);
      const vaccinations = (
        await axios.get(
          "https://001-iz.impfterminservice.de/assets/static/its/vaccination-list.json"
        )
      ).data
        .map((v: any) => v.qualification)
        .join(",");
      const checkUrl =
        url.substr(0, 36) +
        "rest/suche/termincheck?plz=" +
        zip +
        "&leistungsmerkmale=" +
        vaccinations +
        "&cachebuster=" +
        Date.now();
      const availableResponse = (await axios.get(checkUrl)).data;
      return [
        availableResponse["termineVorhanden"] ? 1 : 0,
        objectHash(availableResponse),
        JSON.stringify(availableResponse),
      ];
    } else if (url.indexOf("terminservice/suche") !== -1) {
      // the entered URL is an "old" URL (finding appointment after having a booking code)
      const page = await this.browser!.defaultBrowserContext().newPage();
      await page.goto(url);
      const terminSuchenButtonSelector =
        ".ets-corona-search-overlay-inner .btn-magenta";
      await page.waitForSelector(terminSuchenButtonSelector, {
        timeout: 2 * 60 * 1000,
      });
      await awaitTimeout(2000);
      await page.click(terminSuchenButtonSelector);
      await page.waitForResponse(
        (res) => res.url().indexOf("ersttermin") !== -1,
        { timeout: 10 * 1000 }
      );
      const errorMessages = await page.$$(".alert-danger");
      if (errorMessages.length > 0)
        throw "Danger Alert found in HTML, likely error 429.";
      const appointmentsAvailable = (await page.$$(".ets-slot-button")).length;
      const html = await page.content();
      await page.close();
      return [
        appointmentsAvailable,
        objectHash(html.split("<body").slice(-1)),
        html,
      ];
    } else {
      throw "The URL type could not be identified.";
    }
  };

  private alertPushover = async (message: string, priority: number) => {
    if (this.config.pushover.token && this.config.pushover.user) {
      try {
        Axios.post("https://api.pushover.net/1/messages.json", {
          token: this.config.pushover.token,
          user: this.config.pushover.user,
          message,
          priority,
        });
      } catch (error) {
        console.error("Error when pushing to pushover, will retry.");
        console.error(error);
        setTimeout(() => this.alertPushover(message, priority), 10000);
      }
    }
  };

  private announceNewResults = (
    hash: string,
    url: string,
    appointmentsAvailable: number,
    html: string
  ) => {
    const hashChanged = this.lastHash[url] !== hash;
    console.info(
      "📅",
      new Date(),
      "  🌍",
      getZipFromUrl(url),
      hashChanged ? "  🔵" : "  ⚪️",
      hash.substr(0, 8),
      appointmentsAvailable > 0 ? "  ✳️" : "  ⛔️",
      `${appointmentsAvailable} appointment(s) available`
    );
    if (hashChanged) {
      if (this.config.logHtml) {
        console.log("---------------------------");
        console.log(html.replace(/(\r\n|\n|\r)/gm, ""));
        console.log("---------------------------");
      }
      if (
        (this.lastAppointmentsAvailable[url] ?? 0) === 0 &&
        appointmentsAvailable > 0
      ) {
        this.alertPushover(
          `There are ${appointmentsAvailable} available appointment(s) for ${getZipFromUrl(
            url
          )}!`,
          1
        );
      }
      if (
        (this.lastAppointmentsAvailable[url] ?? 0) > 0 &&
        appointmentsAvailable === 0
      ) {
        this.alertPushover(
          `There are no more available appointments for ${getZipFromUrl(url)}.`,
          -1
        );
      }
    }
  };

  private get nextTimeout(): number {
    let timeout: number = this.config.timeout.regular;
    return timeout;
  }
}

function awaitTimeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const impfbot = new Impfbot();
impfbot.boot();
