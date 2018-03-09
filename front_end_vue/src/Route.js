import axios from 'axios'
import {apiBaseUrl} from './config.js'
/*  Classes Route and Bus
    These wrap google maps markers and ploylines
    to keep all the Maps Api code in one contained
    package.
*/
class Route {
    static getRoutes(map){
        return axios.get(`${apiBaseUrl}routes`)
        .then(routes => routes.data.reduce((obj, route) => {
            obj[route.route_id] = new Route(route, map)
            return obj
        }, {}))
    }
    constructor(data, map) {
        this.map       = map
        this.id        = data.route_id,
        this.name      = data.route_long_name,
        this.color     = "#" + data.route_color,
        this.polylines = data.shapes.map(path => 
            new google.maps.Polyline({ 
                map: map,
                path: path,
                geodesic: true,
                strokeColor: this.color,
                strokeOpacity: 0.3,
                strokeWeight: 3
            })),
        this.stops = []
        this.buses = []
        this.selectedBus = undefined
        this.selectedStop = undefined
    }
    select(){
        // a single route can have more than one polyline
        this.polylines.map(line => line.setOptions({strokeOpacity: 1.0}))
        this.showStops()
        .then(() => this.fitMapToRoute())
        this.getBuses()
    }
    deselect(){
        this.polylines.map(line => line.setOptions({strokeOpacity: 0.3}))
        this.hideStops()
        this.buses.map(bus => bus.destroy())
        this.buses = []
    }
    showStops(){
        // We only need to get the stops from the API the first time
        if (this.stops.length){
            this.stops.map(stop => stop.marker.setMap(this.map))
            return Promise.resolve()
        }
        else {
            return axios.get(`${apiBaseUrl}stops_on_route/${this.id}`)
            .then(r => {
                this.stops = r.data.map(stopdata => {
                    let stop = new Stop(stopdata, this.map)
                    stop.marker.addListener('click', () => this.selectStop(stop))
                    return stop
                })
            })
        } 
    }
    hideStops(){
        this.stops.map(stop => stop.marker.setMap(null))
    }
    selectStop(stop){
        this.deselectBus()
        if (this.selectedStop && this.selectedStop.stopID == stop.stopID) {
            this.deselectStop()
            return Promise.resolve()
        }
        return axios.get(`${apiBaseUrl}stop_times/${stop.stopID}`)
        .then(stop_times => {
            this.deselectStop()
            stop.schedule = stop_times.data.schedule
            this.selectedStop = stop
            this.selectedStop.select()
        })
    }
    deselectStop(){
        if(this.selectedStop) this.selectedStop.deselect()
        this.selectedStop = undefined
    }
    getBuses(){
        return axios.get(`${apiBaseUrl}buslocations/${this.id}`)
        .then(r => {
            this.buses = r.data.map(item => {
                let bus = new Bus(item, this, this.map)
                bus.marker.addListener('click', () => this.selectBus(bus))
                return bus
            })
        })
    }
    selectBus(bus){
        this.deselectStop()
        if (this.selectedBus === bus) { // toggle current bus if user clicks it again
            this.deselectBus()
            this.showStops()
        } else {
            this.hideStops()
            this.deselectBus()
            this.selectedBus = bus
            bus.select()
        }     
    }
    deselectBus(){
        if(this.selectedBus) {         
            this.selectedBus.deselect()
            this.selectedBus = undefined
        }
    }
    fitMapToRoute(){
        let bounds = new google.maps.LatLngBounds();
        this.stops.forEach(stop => bounds.extend(stop.marker.getPosition()) )
        this.map.fitBounds(bounds)
    }
}
class Stop{
    constructor(data, map) {
        this.map = map
        this.stopID = data.stop_id
        this.coordinates = {lat: +data.stop_lat, lng: +data.stop_lon}
        this.name = data.stop_name
        this.url = data.stop_url
        this.departure_time = data.departure_time
        this.marker = new google.maps.Marker({
            position: this.coordinates,
            map: this.map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 3,
                strokeColor: '#22aa66',
                strokeWeight: 2,
                fillColor:"#ffffff",
                fillOpacity: 1
            },
            title: this.name
        })
    }
    select(){
        this.marker.setIcon({
                path: google.maps.SymbolPath.CIRCLE,
                scale: 6,
                strokeColor: '#22aa66',
                strokeWeight: 2,
                fillColor:"#ff2222",
                fillOpacity: 1
            }
        )
    }
    deselect(){
        this.marker.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            scale: 3,
            strokeColor: '#22aa66',
            strokeWeight: 2,
            fillColor:"#ffffff",
            fillOpacity: 1
            }
        )
    }
}
class Bus{
    constructor(data, route, map){
       // this.route       = route
        this.map         = map
        this.color       = route.color
        this.selected    = false
        this.laststop    = data.laststop
        this.direction   = data.direction
        this.routeNumber = data.routeid
        this.destination = data.destination
        this.tripID      = data.tripid
        this.opStatus    = data['$']['op-status']
        this.stops       = []
        this.marker = new google.maps.Marker({
            position: {lat: +data.latitude, lng: +data.longitude},
            map: this.map,
            zIndex: google.maps.Marker.MAX_ZINDEX + 1,
            icon: this.icon(),
            label: this.label(),
            title: data.destination
        })
        this.chaseInterval = undefined
        this.stopIcon = {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 3,
            strokeColor: this.color,
            strokeWeight: 2,
            fillColor: this.color,
            fillOpacity: 1
        }
        this.chaseIcon =  {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 3,
            strokeColor: this.color,
            strokeWeight: 2,
            fillColor:  "#ffffff",
            fillOpacity: .5
        }
    }
    destroy(){
        this.marker.setMap(null)
        this.hideStops()
    }
    select() {       
        this.selected = true
        this.marker.setIcon(this.icon())
        this.marker.setLabel(this.label())
        this.showStops()
    }
    deselect() {
        this.selected = false
        this.marker.setIcon(this.icon())
        this.marker.setLabel(this.label())
        this.hideStops()
    }
    icon(){
        return {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            strokeColor: this.color,
            strokeWeight: 2,
            fillColor: this.selected ? this.color : "#ffffff",
            fillOpacity: 1       
        }
    }    
    label(){
        return {
            text: this.routeNumber,
            fontSize: '10px',
            color: this.selected ? "#ffffff" : "#333333",
            fontWeight: '700'
        }
    }
    showStops(){
        let url = `${apiBaseUrl}route_stops/${this.tripID}/${this.routeNumber}/${this.direction}`
        return axios.get(url)
        .then(r => {
            console.log(r.data)
            this.stops = r.data.map(stop => new Stop(stop,this.map))
            this.startChase()
        })
    }
    hideStops(){
        this.stopChase()
        this.stops.map(stop => stop.marker.setMap(null))
    }
    startChase(){
        let count = 0
        this.chaseInterval = setInterval(() => {
            this.stops.forEach(stop =>  stop.marker.setIcon(this.stopIcon)) 
            this.stops.filter((s, i) => i % 8 === count % 8 )
            .forEach(stop =>  stop.marker.setIcon(this.chaseIcon))
            count++
        }, 100)
    }
    stopChase(){
        clearInterval(this.chaseInterval)
    } 
}
export {Route}