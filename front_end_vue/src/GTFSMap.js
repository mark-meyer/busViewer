import store from './store'

/*  Classes Route and Bus
    These wrap google maps markers and ploylines
    to keep all the Maps Api code in one contained
    package.
*/
let MAP = undefined

function setMap(map) {
    /* this needs to be called before anything else */
    MAP = map
}

class Directions{
    constructor(data) {
        this.type = "directions"
        this.data = data
        this.stops = []
        this.polylines = []
        
        data.forEach((inst, i) => {       
            let s = this.makeStop(inst.from)      
            s.marker.setIcon({
                path: google.maps.SymbolPath.CIRCLE,
                scale: i ? 6 : 8,
                strokeColor: '#2222ff',
                strokeWeight: 2,
                fillColor:i == 0 ? "#eeee22" : (inst.type == 'walk' ? "#2222ff": "#22dd22"),
                fillOpacity: 1
                }
            )
            s.activate()
            this.stops.push(s)
            
            
            if(inst.stops) {
                let route = store.state.routes[inst.route]
                
                let t_id = inst.stops[0].trip_id
                inst.stops.forEach(stop => {
                    if (stop.trip_id != t_id) {
                        t_id = stop.trip_id
                    }
                })

                let trip_id = inst.stops[0].trip_id
                let s1 = {lat: parseFloat(inst.stops[0].from.latlon[1]),lng: parseFloat( inst.stops[0].from.latlon[0])}
                let s2 = {lat: parseFloat(inst.stops[inst.stops.length -1].to.latlon[1]), lng: parseFloat(inst.stops[inst.stops.length -1].to.latlon[0])}

                let segment = route.pathBewteenStops(s1 ,s2, trip_id)
                
                this.polylines.push(new google.maps.Polyline({ 
                    map: MAP,
                    path: segment,
                    geodesic: true,
                    strokeColor: route.color,
                    strokeOpacity: 0.8,
                    strokeWeight: 6
                }))

                
                inst.stops.forEach((stop, i) => {
                    let s = this.makeStop(stop.to)
                    s.marker.setIcon({
                        path: google.maps.SymbolPath.CIRCLE,
                        scale:  stop.isLegEnd ? 6 : 2,
                        strokeColor: stop.isLegEnd ? '#aa2222' : '#dddddd',
                        strokeWeight: 2,
                        fillColor:stop.isLegEnd ? "#dd2222": "#fff",
                        fillOpacity: .5
                        }
                    )
                    s.activate()
                    this.stops.push(s)                 
                })
                
            }
            
            // if route ends with walking add destingation
            if (i === data.length -1 && inst.type === 'walk'){
                let s = this.makeStop(inst.to)
                s.marker.setIcon({
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    strokeColor: '#dd2222',
                    strokeWeight: 2,
                    fillColor: "#dd2222",
                    fillOpacity: 1
                    }
                )
                s.activate()
                this.stops.push(s)
            }

        })
    }
    makeStop(stop){
        return new Stop({
            stop_id:stop.stop_id,
            stop_lat:stop.latlon[1],
            stop_lon:stop.latlon[0],
            }, () => console.log("clicked")
        )
    }
    deactivate(){
        this.stops.forEach(stop => stop.deactivate())
        this.polylines.forEach(line => line.setMap(null))
    }
}

class Route {
    constructor(data) {
        this.type = "route"
        this.id        = data.route_id,
        this.name      = data.route_long_name,
        this.color     = "#" + data.route_color
        this.shapes    = data.shapes 
        this.trips     = data.trips
        this.polylines = Object.values(data.shapes).map(path => 
            new google.maps.Polyline({ 
                map: MAP,
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
    fitMapToRoute(){
        let bounds = new google.maps.LatLngBounds();
        this.stops.forEach(stop => bounds.extend(stop.marker.getPosition()) )
        MAP.fitBounds(bounds)
    }
    stop(id){
        if (!this.stops) return
        return this.stops.find(stop => stop.id == id)
    }
    pathBewteenStops(stop1, stop2, trip_id){
        /* Given two points and a trip_id, this will find the path for the trip_id and extract a segment that begins and ends
           at stops stop1 and stop2 */
        const shape = this.shapes[trip_id]
        const square = (a) => a * a
        const distanceSquared = (a, b) => square(a.lat - b.lat) + square(a.lng - b.lng) 

        /* Find the closest point on a line segment defined by s1 & s2 to point p  and its distance*/
        const distToSegmentSquared = (p, s1, s2) => {

            const l2norm = distanceSquared(s1, s2)
            // should probably check for zero since we divide by l2norm
           // if (l2norm === 0) return distanceSquared(p, s1);
            let t = ((p.lat - s1.lat) * (s2.lat - s1.lat) + (p.lng - s1.lng) * (s2.lng - s1.lng)) / l2norm;
            t = Math.max(0, Math.min(1, t));
            let test_p = {lat: s1.lat + t * (s2.lat - s1.lat), lng: s1.lng + t * (s2.lng - s1.lng)}
            return {dist: Math.sqrt(distanceSquared(p, test_p)), p:test_p}
        }

        /* look at every segment in the path and find the one closest to stop1 and stop 2 */
        let shape_id = this.trips[trip_id].shape_id
        let points = this.shapes[shape_id]
        
        let closest = [{dist: 100000}, {dist: 100000}] 
        for (let i = 1; i < points.length; i++){
            let d1 = distToSegmentSquared(stop1, points[i-1], points[i])
            let d2 = distToSegmentSquared(stop2, points[i-1], points[i])
            d1.index= i
            d2.index = i 
            if (d1.dist < closest[0].dist) closest[0] = d1
            if (d2.dist < closest[1].dist) closest[1] = d2
        }
        let start = closest[0]
        let end = closest[1]
        if(start.index > end.index) [start, end] = [end, start]
        let segment = points.slice(start.index, end.index)
        return [start.p, ...segment, end.p]
    }
}
class Stop{
    constructor(data, click, marker) {
        this.type           = "stop"
        this.id             = data.stop_id
        this.coordinates    = {lat: +data.stop_lat, lng: +data.stop_lon}
        this.name           = data.stop_name
        this.url            = data.stop_url
        this.departure_time = data.departure_time
 
        this.marker         = marker || new google.maps.Marker({
            position: this.coordinates,
            map: MAP,
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
        this.marker.setMap(MAP)
    }
    deactivate(){
        this.marker.setMap(null)
    }
    select(){
        this.marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 100)
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
        this.marker.setZIndex(google.maps.Marker.MAX_ZINDEX)
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
    center(){
        MAP.panTo(this.marker.getPosition())
    }
}
class Bus{
    constructor(data, route, click){
        this.type        = "bus"
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
            map: MAP,
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
        this.stops.map(stop => stop.activate())
        this.marker.setIcon(this.icon())
        this.marker.setLabel(this.label())
    }
    deselect() {
        this.selected = false
        this.stops.map(stop => stop.deactivate())
        this.marker.setIcon(this.icon())
        this.marker.setLabel(this.label())
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
export {Directions, Route, Stop, Bus, setMap}