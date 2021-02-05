FROM node:14-alpine
LABEL name "I'm X renamer"
LABEL version "1.0.0"
ENV DISCORD_TOKEN= 
WORKDIR /usr/imx

COPY package.json tsconfig.json ./
RUN npm i

COPY src .
RUN npm run build

CMD ["node", "dist/index.js"]
