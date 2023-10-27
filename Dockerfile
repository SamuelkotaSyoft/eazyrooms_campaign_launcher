FROM node:18

WORKDIR /usr/src/eazyrooms_campaign_launcher

COPY package*.json ./

COPY . .

RUN npm install

EXPOSE 3012

CMD ["node", "server.js"]