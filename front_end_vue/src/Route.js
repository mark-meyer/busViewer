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
        .then(routes => routes.data.map(route => new Route(route, map)))
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
            this.stops.map(marker => marker.setMap(this.map))
            return Promise.resolve()
        }
        else {
            return axios.get(`${apiBaseUrl}stops_on_route/${this.id}`)
            .then(r => {
                this.stops = r.data.map(stop => 
                    new google.maps.Marker({
                        position: {lat: +stop.stop_lat, lng: +stop.stop_lon},
                        map: this.map,
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 3,
                            strokeColor: '#22aa66',
                            strokeWeight: 2,
                            fillColor:"#ffffff",
                            fillOpacity: 1
                        },
                        title: stop.stop_name
                    })
                )
            })
        } 
    }
    hideStops(){
        this.stops.map(marker => marker.setMap(null))
    }
    getBuses(){
        return axios.get(`${apiBaseUrl}buslocations/${this.id}`)
        .then(r => this.buses = r.data.map(item => new Bus(item, this)))
    }
    selectBus(bus){
        if (this.selectedBus === bus) {
            // toggle current bus if user clicks it again
            this.selectedBus = undefined
            bus.deselect()
        } else {
            if (this.selectedBus) this.selectedBus.deselect()
            this.selectedBus = bus
            bus.select()
        }     
    }
    fitMapToRoute(){
        let bounds = new google.maps.LatLngBounds();
        this.stops.forEach(stop => bounds.extend(stop.getPosition()) )
        this.map.fitBounds(bounds)
    }
}

class Bus{
    constructor(data, route, map){
        this.route       = route
        this.map         = route.map
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
            map: this.route.map,
            zIndex: google.maps.Marker.MAX_ZINDEX + 1,
            icon: this.icon(),
            label: this.label(),
            title: data.destination
        })
        this.marker.addListener('click', () => this.route.selectBus(this))
        this.chaseInterval = undefined
        this.stopIcon = {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 3,
            strokeColor: this.route.color,
            strokeWeight: 2,
            fillColor: this.route.color,
            fillOpacity: 1
        }
        this.chaseIcon =  {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 3,
            strokeColor: this.route.color,
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
        this.route.hideStops()
        this.showStops()
    }
    deselect() {
        this.selected = false
        this.marker.setIcon(this.icon())
        this.marker.setLabel(this.label())
        this.hideStops()
        this.route.showStops()
    }
    icon(){
        return {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            strokeColor: this.route.color,
            strokeWeight: 2,
            fillColor: this.selected ? this.route.color : "#ffffff",
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
            this.stops = r.data.map(stop => {
                return new google.maps.Marker({
                    position: {lat: +stop.stop_lat, lng: +stop.stop_lon},
                    map: this.map,
                    icon: this.stopIcon,
                    title: stop.stop_name
                })
             })
            this.startChase()
        })
    }
    hideStops(){
        this.stopChase()
        this.stops.map(stop => stop.setMap(null))
    }
    startChase(){
        let count = 0
        this.chaseInterval = setInterval(() => {
            this.stops.forEach(stop =>  stop.setIcon(this.stopIcon)) 
            this.stops.filter((s, i) => i % 8 === count % 8 )
            .forEach(stop =>  stop.setIcon(this.chaseIcon))
            count++
        }, 100)
    }
    stopChase(){
        clearInterval(this.chaseInterval)
    } 
}
export {Route}