FROM node:11-slim

# set /app directory as default working directory
WORKDIR /app

## only copy package.json initially so that `RUN yarn` layer is recreated only
## if there are changes in package.json
ADD package.json /app/

## --pure-lockfile: Don’t generate a yarn.lock lockfile
RUN npm install --no-save

# copy all file from current dir to /app in container
COPY . /app/

# expose port 8000
EXPOSE 8000

# cmd to start service
CMD [ "npm", "start" ]
