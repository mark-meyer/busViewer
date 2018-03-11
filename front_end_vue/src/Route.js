import axios from 'axios'
import {apiBaseUrl} from './config.js'
import store from './store'

/*  Classes Route and Bus
    These wrap google maps markers and ploylines
    to keep all the Maps Api code in one contained
    package.
*/
class Route {
    constructor(data, map) {
        this.type = "route"
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
        this.buses = []
        this.selectedBus = undefined
    }
    activate(){
        // a single route can have more than one polyline
        this.polylines.map(line => line.setOptions({strokeOpacity: 1.0}))
    }
    deactivate(){
        this.polylines.map(line => line.setOptions({strokeOpacity: 0.3}))
        this.stops.map(stop => stop.deactivate())
        this.buses.map(bus => bus.deactivate())
    }
    hideStops(){
        this.stops.map(stop => stop.deactivate())
    }
    showStops(){
        this.stops.map(stop => stop.activate())
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
        store.state.map.fitBounds(bounds)
    }
}
class Stop{
    constructor(data, map, click) {
        this.type = "stop"
        this.stopID = data.stop_id
        this.coordinates = {lat: +data.stop_lat, lng: +data.stop_lon}
        this.name = data.stop_name
        this.url = data.stop_url
        this.departure_time = data.departure_time
        this.marker = new google.maps.Marker({
            position: this.coordinates,
            map: map,
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
        this.marker.addListener('click', click.bind(null, this))
    }
    activate(){
        this.marker.setMap(store.state.map)
    }
    deactivate(){
        this.marker.setMap(null)
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
    constructor(data, route, map, click){
        this.type = "bus"
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
            map: map,
            zIndex: google.maps.Marker.MAX_ZINDEX + 1,
            icon: this.icon(),
            label: this.label(),
            title: data.destination
        })
        this.marker.addListener('click', click.bind(null, this))
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
    deactivate(){
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
export {Route, Stop, Bus}