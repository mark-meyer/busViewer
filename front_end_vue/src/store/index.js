import Vue from 'vue'
import Vuex from 'vuex'
import {Route, Stop, Bus} from '../Route.js'
Vue.use(Vuex)

import axios from 'axios'
import {apiBaseUrl} from '../config.js'

export default new Vuex.Store({
    state:{
        routes: [],
        selected: undefined,
        currentRoute: undefined,
        map: undefined
    },
    mutations: {
        setRoutes(state, routes){
            state.routes = routes
        },
        setMap(state, map){
            state.map = map
        },
        selectRoute(state, route){
            if(state.currentRoute) state.currentRoute.deactivate()
            route.activate()
            state.currentRoute = route
        },
        setSelected(state, obj){
            if(state.selected) state.selected.deselect()
            state.selected = obj
            obj.select()
        },
        unsetSelected(state, obj){
            state.selected = undefined
            obj.deselect()
        },

    },
    actions: {
        getRoutes( {commit, state} ){
            return axios.get(`${apiBaseUrl}routes`)
            .then(routeData => {
                let routes = routeData.data.reduce((obj, route) => {
                    obj[route.route_id] = new Route(route, state.map)
                    return obj
                }, {})
                commit('setRoutes', routes)
            })
        },
        showRoute({commit, state, dispatch}, route){  /* Refactor Me */                
            commit('selectRoute', route)
            let busPromise = axios.get(`${apiBaseUrl}buslocations/${route.id}`)
            .then(r => {
                route.buses = r.data.map(item => new Bus(item, route, state.map, dispatch.bind(null, 'selectBus')))
            })
           
            let stopPromise = route.stops
            ? (route.stops.map(stop => stop.activate()), Promise.resolve())
            : axios.get(`${apiBaseUrl}stops_on_route/${route.id}`) 
              .then(r => {
                  route.stops = r.data.map(stopdata =>  new Stop(stopdata, state.map, dispatch.bind(null, 'selectStop')))
              })
 
            return Promise.all([busPromise, stopPromise])
            .catch(console.log)
        },
        selectStop({commit, state}, stop){
            if(state.selected === stop) return commit('unsetSelected', stop)
            axios.get(`${apiBaseUrl}stop_times/${stop.stopID}`)
            .then(stop_times => {
                stop.schedule = stop_times.data.schedule
                commit('setSelected', stop)
            })
        },
        
        selectBus({commit, state}, bus){
            if(state.selected === bus) {
                state.currentRoute.showStops()
                commit('unsetSelected', bus)
            }
            else {
                state.currentRoute.hideStops()

                axios.get(`${apiBaseUrl}route_stops/${bus.tripID}/${bus.routeNumber}/${bus.direction}`)
                .then(r => {
                    bus.stops = r.data.map(stop => new Stop(stop, state.map, () => {}))
                    //this.startChase()

                     commit('setSelected', bus)
                })
                
            }
            /*
            
            */
            console.log("bus selected", bus)
        }
        

    }
})