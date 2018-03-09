const parse         = require('csv-parse')
const fs            = require('fs')
const moment        = require('moment-timezone');
const raw_directory = (__dirname + '/../gtfs/')

/**
 * Handles reading and basic csv parsing
 * Subclasses should override processFile()
 * if the data needs special handling beyond
 * simple mapping of csv headers to objects
 */
class GTFS_File {
    constructor(filename){
        this.filename = filename;
        this.data = {}
        // Allow direct access too data
        return new Proxy(this, {
            get(target, prop){
                if (prop in target.data) {
                    return target.data[prop]
                } else {
                    return Reflect.get(...arguments)
                }
            }
        })
    }
    processFile(data) {
        this.data = data
    }
    readfile() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.filename, (err, data) => {
                if (err) {
                    console.log(err);
                    return reject(err)
                }
                // The gtfs files have a header row that will be used for object keys
                parse(data, {columns:true}, (err, output) => {
                    if (err) {
                        console.log(err);
                        return reject(err)
                    }
                    this.processFile(output)
                    resolve(output)
                })
            })
        })
    }
}

class Shapes extends GTFS_File {
    processFile(data) {
        /* data is an object keyed to shape_id like
           {shape_id: [{lat, lng}]} */
        this.data  = data.reduce((a, c) => {
            if (a[c.shape_id]){
                a[c.shape_id].push({'lat':+c.shape_pt_lat, 'lng':+c.shape_pt_lon})
            } else {
                a[c.shape_id] = [{'lat':+c.shape_pt_lat, 'lng':+c.shape_pt_lon}]
            }
            return a
        }, {})
    }   
}

class Trips extends GTFS_File{
    processFile(data) {
        this.data =  this.data  = data.reduce((a, c) => {
            a[c.trip_id] = c
            return a
        }, {})

        // parsed data is indexed by route_id
        // with arrays of trips & shapes ids

        this.data_by_route  = data.reduce((a, c) => {
            if (a[c.route_id]){
                a[c.route_id].trips.push(c.trip_id)
                a[c.route_id].shapes.add(c.shape_id)
                
            } else {
                a[c.route_id] = {'trips':[c.trip_id], shapes:new Set([c.shape_id])}
            }
            return a
        }, {})
        Object.values(this.data_by_route).map(v => v.shapes = [...v.shapes]) // convert set back to array
    }
}

class Routes extends GTFS_File{
    processFile(data) {
        this.data  = data.reduce((a, c) => {
            a[c.route_id] = c
            return a
        }, {})
    }
    getRoute(routeNumber){
        return this.data[routeNumber]
    }
}

class Stop_Times extends GTFS_File{
    stopsFromTrip(trip, route_id, direction){
        let days = [3, 1, 1, 1, 1, 1, 2]
        // all the stops along a particular trip
        let now =  moment().tz('America/Anchorage')
        let day_id = days[now.day()]
        const trip_id = [route_id, trip, direction, day_id].join('-')
        return this.data.filter(stop => stop.trip_id == trip_id)
    }
    futureStopsFromTrip(trip, route_id, direction){
        // all the stops along a particular trip that are scheduled after now
        /* The bus XML file doesn't give a complete trip_id (i.e. 10-610-I-1)
               It only gives the second value. The rest can be deduced:
               route_id-id-direction-service_id
               The service_id comes from the calendar: 1 = weekdays, 2 = saturday, 3 = sunday
               To unambigously find stops we need short trip_id and direction.
        */
        let now =  moment().tz('America/Anchorage')
        let day_id = now.day() <= 5 ? 1 : day - 4
        const trip_id = [route_id, trip, direction, day_id].join('-')
        return this.data.filter(stop => {
            return (stop.trip_id == trip_id 
                    && stop.departure_time >= now.format('HH:mm:ss'))
        })
    }
    stops(stop_id){
        // each stop can be associated with multiple trips
        this.data.filter(stop => stop.stop_id = stop_id)
    }
    scheduleAtStop(stop_id){
        // returns an object {route_id: [stop_times]}
        let now =  moment().tz('America/Anchorage')
        let today_id = now.day() <= 5 ? 1 : day - 4

        return this.data.filter(stop => (stop.stop_id == stop_id ))
        .reduce((a, c) => {
            let [route_id, trip_id, direction, day_id] = c.trip_id.split('-')
            if (today_id != day_id) return a //only today's times
            if( a[route_id] ) {
                a[route_id].push({trip_id: c.trip_id, departure_time: c.departure_time})
            } else {
                a[route_id] = [{trip_id: c.trip_id, departure_time: c.departure_time}]
            }
            return a
        }, {})
    }
}
class Stops extends GTFS_File{
    processFile(data) {
        this.data = data.reduce((a,c) => {
            a[c.stop_id] = c
            return a
        }, {})
    }
}

class GTFS {
    constructor(directory){
        this._gtfs_directory = directory
        this.shapes          = new Shapes(directory + 'shapes.txt')
        this.trips           = new Trips(directory + 'trips.txt')
        this.routes          = new Routes(directory + 'routes.txt')
        this.stop_times      = new Stop_Times(directory + 'stop_times.txt')
        this.stops           = new Stops(directory + 'stops.txt')

        this.shapes.readfile()
        this.trips.readfile()
        this.routes.readfile()
        this.stop_times.readfile()
        this.stops.readfile()
    }

    shapeFromRoute(routeID){
        // A single Route can have more than one shape associated with it
        let trip = this.trips.data_by_route[routeID]
        return trip.shapes.map(id => this.shapes[id])
    }
    routeWithShape(routeID) {
        let trip = this.trips.data_by_route[routeID]
        let shape = this.shapes[shape_id]
        let route = this.shapes[shape_id]
        route.shape = shape
        return route
    }
    allRoutes(){
        return Object.keys(this.routes.data).map(route => ({...this.routes[route], shapes: this.shapeFromRoute(route) })
        )
    }
    allStopsOnRoute(routeID){
        // get trip IDs associate with route:
        // this should be calculated once and stored.
        // ps. gtfs is annoying
        let trips = this.trips.data_by_route[routeID].trips
        let stopIDs = this.stop_times.data
                      .filter(item => trips.includes(item.trip_id))
                      .reduce((acc, item) => {
                    
                        if (!acc[item.stop_id]) {
                            acc[item.stop_id] = this.stops[item.stop_id]
                        }
                        return acc
                        }, {})
       // this is returning more data than really needed.
       // could trim url and few non-used fields
        return Object.values(stopIDs)       
    }
    stopsOnTrip(trip_id, route_id, direction){
        // Merge stop_times and stop info for a particular trip id
        return this.stop_times.stopsFromTrip(trip_id, route_id, direction).map(st => this.stops[st.stop_id])
    }
    upcomingStopsOnTrip(trip_id, route_id, direction){
        // Merge future stop_times and stop info for a particular trip id 
        return this.stop_times.futureStopsFromTrip(trip_id, route_id, direction).map(st => this.stops[st.stop_id])
    }
    stopInfo(stop_id){
        // Returns stop name and time table according to GTFS
        let now =  moment().tz('America/Anchorage')
        let day_id = now.day() <= 5 ? 1 : day - 4

        let stop_schedule = this.stop_times.scheduleAtStop(stop_id)
        // filter out already passed times and add destination from trips
        Object.entries(stop_schedule).forEach(([k, v]) => {
            stop_schedule[k] = v.filter(stop_time => stop_time.departure_time >= now.format('HH:mm:ss')).slice(0,4)
            .map(item => ({...item, ...{destination:this.trips[item.trip_id].trip_headsign}}))
        })            
        return {
            info: this.stops[stop_id],
            schedule: stop_schedule
        }
    }
}

const gtfs = new GTFS(raw_directory)


module.exports = gtfs