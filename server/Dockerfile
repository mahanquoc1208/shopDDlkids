FROM node:alpine

# Create app directory
RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

# Bundle app source
COPY . /usr/src/app

RUN yarn install

EXPOSE 8000

CMD [ "yarn", "start" ]
# CMD [ "yarn", "dev" ]