import Vue from 'vue'
import Router from 'vue-router'
import Main from '@/components/Main'
import Directions from '@/components/Directions'
import InfoPanel from '@/components/InfoPanel'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Main',
      component: Main,
      children: [
          {
              path: 'directions',
              component: Directions
          },
          {
              path: '/',
              component: InfoPanel
          }
      ]
    }
  ]
})
