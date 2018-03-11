// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'vue-svgicon/dist/polyfill' // make svg-icon work with IE
import Vue from 'vue'
import App from './App'
import Vuex from 'vuex'
import router from './router'
import VueSVGIcon from 'vue-svgicon'

import store from './store'

Vue.use(VueSVGIcon)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>'
})
