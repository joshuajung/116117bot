const getConfig = () => {
  return {
    port: process.env.PORT ?? 3000,
    urls: process.env.URLS,
    pushover: {
      token: process.env.PUSHOVER_TOKEN,
      user: process.env.PUSHOVER_USER,
    },
    timeout: {
      regular: parseEnvInt("TIMEOUT_REGULAR", 300),
      error: parseEnvInt("TIMEOUT_ERROR", 300),
    },
    chromiumExecutablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
    noPuppeteerSandbox: !!process.env.NO_PUPPETEER_SANDBOX,
    logHtml: !!process.env.LOG_HTML,
    headless: process.env.HEADLESS?.toLowerCase() === 'false',
  };
};
export default getConfig;

const parseEnvInt = (variableName: string, fallback: number): number => {
  const envValue = process.env[variableName] ?? "";
  const envValueInt = parseInt(envValue);
  return isNaN(envValueInt) ? fallback : envValueInt;
};

export const getUrls = (): string[] => {
  const urls = getConfig().urls;
  if (!urls) throw "No URLS provided.";
  return urls.split(",").map((url) => {
    if (url.slice(-1) === "/") {
      return url.substr(0, url.length - 1);
    } else {
      return url;
    }
  });
};

export const getZipFromUrl = (url: string): string => {
  if (url.indexOf("impftermine/service") !== -1) {
    return url.substr(-5, 5);
  } else if (url.indexOf("terminservice/suche") !== -1) {
    return url.substr(71, 5);
  } else {
    throw "Could not get ZIP from URL.";
  }
};
