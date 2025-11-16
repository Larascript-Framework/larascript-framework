FROM node:20
WORKDIR /app
COPY . .
RUN yarn install && yarn build
EXPOSE 5000
CMD ["yarn", "start"]
