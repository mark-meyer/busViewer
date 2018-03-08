# Anchorage Bus Routes

> This runs an express server that serves an API and a Vue.js single page app (SPA) that runs in the browser and consumes this API.

> The Vue app requires a webpack build to deploy. The deploy step transpiles ES6, and loads with .vue files, minifies, etc.. Running `npm run build` will build the Vue app for production and put the packeged files in the /dist directory. The express server will look here and serve these files as static files to the browser.

> In development running `npm start` will start both the express server on port 3000 and the webpack dev server on port 8080. If you have previously built the Vue app, visiting http://localhost:3000/ will show the result of the build. Visiting http://localhost:8080 will show the currect live dev build using webpack's dev server. During development the Webpack server is convenient because it provides hot reloading and doesn't require an explicit build step. 

> Both servers are running because even when using the Webpack dev server the Vue app still needs to hit the API for GTFS information and this is serverd by express on port 3000.

> To run in production you will need to point the Vue app to the API url in /front_end_vue/src/config.js before running 'npm run build'

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
# express API at 3000
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
