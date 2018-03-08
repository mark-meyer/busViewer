# bus-routes

> Bus Route app. This has both an express server and a Vue single page app (SPA) that runs in the browser. The express app serves the API that the Vue app consumes. The epxress app also serves the actual Vue SPA to the browser on /.

> The Vue app requires a webpack build to deploy. This transpiles ES6, and loads with .vue files. Running `npm run build` will build the Vue app for production and put the packeged files in the /dist directory. The express server will look here and server these files as static file to the browser.

> In development running `npm start` will start both the express server on port 3000 and the webpack dev server on port 8080. If you have previously built the Vue app, visiting http://localhost:3000/ will show the result of the build. Visiting http://localhost:8080 will show the currect live dev build using webpack's dev server. During development this has advantages: hot reloading and no required explicit build step. 

> Both servers are running becuase even when using the Webpack dev server the Vue app needs to hit the API for GTFS information and this is serverd by express.

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
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
