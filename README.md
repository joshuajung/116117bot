# 116117bot

## What is this?

The [116117 Impfterminservice](https://www.impfterminservice.de) provides COVID-19 vaccination appointments for a wide range of German states. Unfortunately, it does not alert registered users when appointments become available, so users are required to manually monitor it. This is a proof of concept for a simple [Puppeteer](https://github.com/puppeteer/puppeteer)-powered bot that monitors the site and alerts via STDOUT and optionally push notification once appointments are available.

**🦠 The 116117 booking engine changes regularly and this bot may be non-functional. It is more intended as a proof-of-concept and inspiration for own experiments than as a single point of truth, best practice or ready-for-use script. Please use it responsibly and read the complete Readme beforehand. PRs and issues will only be monitored sporadically.**

## You may also like…

…my project [Impfterminmonitor.de](https://www.impfterminmonitor.de), which provides an easy way to track appointment availability using a clean web interface.

## Requirements

- Node.js (>v14)
- If you want to receive push notifications for available appointments, a [Pushover](https://pushover.net) account.
- One or multiple URLs to be monitored (see below).

## Input URLs

116117bot requires one or multiple URLs to be monitored as its input. Right now, two types of URLs are supported:

1. URLs like `https://123-iz.impfterminservice.de/impftermine/service?plz=12345`. You are redirected to these in the browser after you have selected a location for vaccination on impfterminservice.de. You can copy them from the browser address bar.
2. URLs like `https://123-iz.impfterminservice.de/terminservice/suche/XXXX-XXXX-XXXX/12345/`. These are provided via e-mail after elegibility for a vaccination has been confirmed. _Attention:_ Since a recent change of the booking engine, monitoring URLs like this immediately results in reserved appointments, making them unavailable to the public. I therefore advise against monitoring personalized URLs like this one using the bot.

## Configuration

116117bot reads all configuration from environment variables. Only one is actually required:

| Variable               | Required | Default | Description                                                                                                                     |
| ---------------------- | :------: | ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `URLS`                 |    ✅    |         | The URLs to be monitored (see above). If you provide more than one separated by commas, they will be checked round-robin style. |
| `PUSHOVER_TOKEN`       |          |         | If you want to receive alerts via Pushover, the app token generated there.                                                      |
| `PUSHOVER_USER`        |          |         | If you want to receive alerts via Pushover, the recipient ID (user or group) generated there.                                   |
| `TIMEOUT_REGULAR`      |          | `300`   | The number of seconds 116117bot will wait between polls.                                                                        |
| `TIMEOUT_ERROR`        |          | `300`   | The number of seconds 116117bot will pause in case an error has been encountered during a poll.                                 |
| `NO_PUPPETEER_SANDBOX` |          | `false` | Set this to `true` to run Puppeteer without a sandbox. This is required for some hosting services.                              |
| `LOG_HTML`             |          | `false` | Set this to `true` to log raw HTML from polls (if it has changed).                                                              |
| `HEADLESS`             |          | `false` | Set this to `true` to run Puppeteer in headless mode.                                                                           |
| `PORT`                 |          | `3000`  | The port 116117bot will run on. It is not actively used at this point, but should still be available.                           |

## Installing dependencies

```sh
$ npm install
```

## Startup

```sh
$ npm start
```

## Run inside a docker container

Build the docker container inside the repository folder:

```sh
$ docker build -t 116117bot .
```

Run the docker container:

```sh
$ docker run --name 116117bot -e URLS="YourUrlHere" 116117bot
```
