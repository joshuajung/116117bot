FROM node:14
COPY . /app
WORKDIR /app
RUN apt update && apt install -y libnss3 libatk-bridge2.0-0 libx11-xcb1 libdrm2 libxkbcommon0 libgtk-3-0 libasound2
RUN npm install
ENV HEADLESS=true 
ENV NO_PUPPETEER_SANDBOX=true
ENTRYPOINT npm start
