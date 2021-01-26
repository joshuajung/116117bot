# 116117bot

## What is this?
The [116117 Impfterminservice](https://www.impfterminservice.de) provides COVID-19 vaccination appointments for a wide range of German states. Unfortunately, it does not alert registered users when appointments become available, so users are required to manually monitor it. This is a proof of concept for a simple [Puppeteer](https://github.com/puppeteer/puppeteer)-powered bot that monitors the site and alerts via STDOUT and optionally push notification once appointments are available.

🦠 Please use this responsibly to keep it available and functional. 

## Requirements
* Node.js (>v14)
* If you want to receive push notifications for available appointments, a [Pushover](https://pushover.net) account.
* One or multiple registration code URLs for impfterminservice.de (freely available if conditions for vaccination are met).

## Configuration

116117bot reads all configuration from environment variables:

| Variable               | Required | Default | Description                                                                                                                                                                                                                                                                   |
| ---------------------- | :------: | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`                 |          | `3000`  | The port 116117bot will run on. It is not actively used at this point, but should still be available.                                                                                                                                                                         |
| `URLS`                 |    ✅    |         | The impfservice.de URLs to be monitored by the bot, comma-separated. Example: `https://123-iz.impfterminservice.de/terminservice/suche/XXXX-XXXX-XXXX/12345/L456,https://123-iz.impfterminservice.de/terminservice/suche/XXXX-XXXX-YYYY/12345/L456` |
| `PUSHOVER_TOKEN`       |          |         | If you want to receive alerts via Pushover, the app token generated there.                                                                                                                                                                                        |
| `PUSHOVER_USER`        |          |         | If you want to receive alerts via Pushover, the recipient ID (user or group) generated there.                                                                                                                                                                     |
| `TIMEOUT_REGULAR`      |          | `300`   | The number of seconds 116117bot will wait between polls.                                                                                                                                                                                                                      |
| `TIMEOUT_ERROR`        |          | `300`   | The number of seconds 116117bot will pause in case an error has been encountered during a poll.                                                                                                                                                                               |
| `NO_PUPPETEER_SANDBOX` |          | `false` | Set this to `true` to run Puppeteer without a sandbox. This is required for some hosting services.                                                                                                                                                                            |
| `LOG_HTML`             |          | `false` | Set this to `true` to log raw HTML from polls (if it has changed).                                                                                                                                                                                                            |
| `HEADLESS`             |          | `false` | Set this to `true` to run Puppeteer in headless mode.                                                                                                                                                                                                                         |

## Installing dependencies

```sh
$ npm install
```

## Startup

```sh
$ npm start
```
