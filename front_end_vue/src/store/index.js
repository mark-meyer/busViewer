import Vue from 'vue'
import Vuex from 'vuex'
import {Route, Stop, Bus} from '../GTFSMap.js'
Vue.use(Vuex)

import axios from 'axios'
import {apiBaseUrl} from '../config.js'

export default new Vuex.Store({
    state:{
        routes: [],
        selected: undefined,
        currentRoute: undefined
    },
    mutations: {
        setRoutes(state, routes){
            state.routes = routes
        },
        selectRoute(state, route){
            if(state.currentRoute) state.currentRoute.deactivate()
            route.activate()
            state.currentRoute = route
        },
        setSelected(state, obj){
            if(state.selected) state.selected.deselect()
            obj.select()
            state.selected = obj
        },
        unsetSelected(state){
            if (state.selected) state.selected.deselect()
            if (state.currentRoute) state.currentRoute.showStops()
            state.selected = undefined
        },
    },
    actions: {
        getRoutes( {commit, state} ){
            return axios.get(`${apiBaseUrl}routes`)
            .then(routeData => {
                let routes = routeData.data.reduce((obj, route) => {
                    obj[route.route_id] = new Route(route)
                    return obj
                }, {})
                commit('setRoutes', routes)
            })
        },
        showRoute({commit, state, dispatch}, route){  /* Refactor Me */                
            commit('selectRoute', route)
            let busPromise = axios.get(`${apiBaseUrl}buslocations/${route.id}`)
            .then(r => {
                route.buses = r.data.map(item => new Bus(item, route, dispatch.bind(null, 'selectBus')))
            })
           
            let stopPromise = route.stops
            ? (route.stops.map(stop => stop.activate()), Promise.resolve())
            : axios.get(`${apiBaseUrl}stops_on_route/${route.id}`) 
              .then(r => {
                  route.stops = r.data.map(stopdata =>  new Stop(stopdata, dispatch.bind(null, 'selectStop')))
              })

            return Promise.all([busPromise, stopPromise])
            .then(() => route.fitMapToRoute())
            .catch(console.log)
        },
        selectStop({commit, state}, stop){
            if(state.selected === stop) return commit('unsetSelected')
            axios.get(`${apiBaseUrl}stop_times/${stop.id}`)
            .then(stop_times => {
                stop.schedule = stop_times.data.schedule
                commit('setSelected', stop)
            })
        },      
        selectBus({commit, state}, bus){
            if(state.selected === bus) {
                state.currentRoute.showStops()
                commit('unsetSelected')
            }
            else {
                state.currentRoute.hideStops()
                axios.get(`${apiBaseUrl}route_stops/${bus.tripID}/${bus.routeNumber}/${bus.direction}`)
                .then(r => {
                    bus.stops = r.data.map(stop => new Stop(stop, () => {}))
                    //this.startChase()
                     commit('setSelected', bus)
                })  
            }
        }
        

    }
})