const parse = require('csv-parse')
const fs    = require('fs')
const turf  = require('@turf/turf')

const {MAX_WALKING, WALKING_SPEED, TRANSFER_COST} = require('./graph_config')

module.exports = {
    initializeFromGTFS: initializeFromGTFS
}
let tripsToRoute;

class Graph{
    constructor(){
        this.stations = new Map()
        this.all_nodes = undefined
    }
    addStation(stop){
        let stop_id = stop.stop_id
        let s = new Transfer(stop_id, stop.stop_name, [stop.stop_lon, stop.stop_lat])
        this.stations.set(stop_id, s)
    }
    getStation(stop_id) {
        return this.stations.get(stop_id)
    }
    allNodes(){
        if (this.all_nodes) return this.all_nodes
        let n = new Set()
        for (let s of this.stations.values()){
            n.add(s)
            Object.values(s.outbound_nodes).forEach(n.add, n)
        }
        this.all_nodes = [...n] 
        return [...n]
    }
    addTripBetweenStations(from, next, trip, depart_time, arrival_time){
        let route_id = trip.route_id      
        let next_bypass = from.addOutgoing(next, depart_time, arrival_time, trip)
        return next_bypass
    }
    findNearestStops([lon, lat]) {
        const point = turf.point([+lon, +lat]);
        return [...this.stations.values()].reduce((out, stop) => {
            const s_point = turf.point(stop.latlon)
            const distance = turf.distance(point, s_point, {units: 'miles'})
            if (distance <= MAX_WALKING ) {
                out.push({stop:stop, distance:distance})
            }
            return out
        }, [])
    }         
}

class Node{
    /*   Nodes are not the stations themselves but are connected to stations with OutboundConnection
         This allows penalizing transfers to prevent route hopping when different routes share stop/times 
         Each route has it's own Node for a given station; kind of like aiport gates 
    */
    constructor(stop_id, route, latlon){
        /* Unique ids are needed so we can hash based on it.
           The transfer nodes just use the stop id but these outbound nodes
           will include the route in the id also
        */
        this.id = `${route}_${stop_id}`
        this.stop_id = stop_id;
        this.outgoing = {}                 // edges to other nodes
        this.route = route
        this.latlon = latlon
    }
    addOutgoing(next, depart_time, arrival_time, trip){
        let route_id = trip.route_id
        /*  In this model edges departing Nodes are really edge pairs:
              1: from outgoing node into transfer station
              2: from outgoing node to next outgoing node bypassing the station
              These both represent the same bus trip, but the trip into the transfer
              station will be charged an extra cost to discourage the model from switching
              buses unnecessarily
        */
        let next_bypass = next.getOutboundNodeForTrip(trip)
        let edge_pair = {
            start_time: depart_time,
            edges:[
                    new Edge(next, this, depart_time, arrival_time, route_id, trip),
                    new Edge(next_bypass, this, depart_time, arrival_time, route_id, trip) 
                  ]
            };
        (this.outgoing[route_id] || (this.outgoing[route_id] = [])).push(edge_pair)
        return next_bypass
    }
    getBestEdgesForRoute(route, time){
        // This returns the next edge pair after the given time for a particular route
        if (!this.outgoing[route]) return []
        return b_search(this.outgoing[route], time).edges
    }
    sortOutgoing(){
        Object.values(this.outgoing).forEach(item => 
            item.sort((a,b) => a['start_time'] - b['start_time'])
        )
    }
}

class Transfer extends Node{
    /*   Transfer objects represent the actual stations. The an outgoing Node for each route that visits the station 
         Trips should begin and end at stations. The only edges directly connecting stations to each other are Walkingpaths
    */
    constructor(stop_id, name, latlon){
        super(stop_id)
        this.id = stop_id
        this.isTransfer = true
        this.name = name
        this.route = undefined       // When we are in Transer we don't know what route is best yet
        this.latlon = latlon
        this.outbound_nodes = {}     // outbound nodes are keyed to route id. Each route will have one way out of the Transfer Station
    }
    getOutboundNodeForTrip(trip){
        /* this returns the outbound Node for a particular Route or creates it if it doesn't exist */
        let route_id = trip.route_id
        let outbound = this.outbound_nodes[route_id]
        if (outbound === undefined){
            outbound = new Node(this.stop_id, route_id, this.latlon);
            this.outbound_nodes[route_id] = outbound
            this.addOutgoing(new OutboundConnection(outbound, this, route_id, this.latlon))
        }
        return outbound
    }
    addOutgoing(edge){
        /* A transfer connects to each outgoing Node with a single edge */
        this.outgoing[edge.route_id] = edge
    }
    getBestEdgesForRoute(route, time){
        /* Transfer stations only have one edge per route, from the station to the outbound node 
           Just return all outgoing edges
        */
        return Object.values(this.outgoing)
    }
    sortOutgoing(){}

    addWalkingPathTo(station, distance) {
        let edge = new WalkingPath(station, this, distance)
        this.outgoing['w_'+station.stop_id] = edge
    }
}

class Edge{
    /* Edges connect outgoing Nodes either to other Nodes or to transfer stations */
    constructor(to, from, start_time, end_time, route, trip){
        this.to = to // this should be a node
        this.from = from
        this.start_time = start_time
        this.end_time = end_time
        this.route_id = route
        this.trip = trip
        this.isStationConnection = false
    }
    costFromTime(t) {
        /* this ensures that costs are relative to current time on graph */
        return this.end_time - this.start_time
    }
    actions(){
        return {
            type: "ride",
            from: {stop_id: this.from.stop_id, name: this.from.name, latlon:this.from.latlon},
            departs: seconds_to_time(this.start_time),
            to: {stop_id: this.to.stop_id, name: this.to.name, latlon:this.to.latlon},
            arrives: seconds_to_time(this.end_time),
            route: this.route_id,
            isLegEnd: this.to.isTransfer
        }
    }
    toString(){
        let transferType = (this.to.isTransfer) ? `Exit bus at ${this.to.name}`: ``
        return `    -- stop ${this.from.stop_id} ${seconds_to_time(this.start_time)} to ${this.to.stop_id} ${seconds_to_time(this.end_time)} ${transferType}`
    }
}

class OutboundConnection extends Edge{
    /*  OutboundConnections connect Transfers to their outgoing Nodes. 
        They add no time to the cost of the trip */
    constructor(to, from, route){
        super(to,from, undefined, undefined, route, undefined)
        this.isStationConnection = true
    }
    costFromTime(t) {
        /* Connections between transfer and outbound Node are free */
        return 0
    }
    actions(){
        return {
            type:'board',
            route: this.route_id,
            from: {stop_id: this.from.stop_id, name: this.from.name, latlon:this.from.latlon}
        }
    }
    toString(){
        return `Board the number ${this.route_id} bus`
    }
}

class WalkingPath extends Edge{
    /*   WalkingPaths give the option of walking to different station if that is faster 
         How much walking and how far can be tuned with the constants WALKING_SPEED and MAX_WALKING
    */
    constructor(to, from, distance){
        super(to, from)
        this.isWalking = true
        this.distance = distance
        this.time = distance * WALKING_SPEED
    }
    costFromTime(t) {
        /* Since we can start walking anytime, we just return the amount of time the edge takes */
        return this.time
    }
    actions(){
        return {
            type:'walk',
            from: {stop_id: this.from.stop_id, name: this.from.name, latlon:this.from.latlon},
            to: {stop_id: this.to.stop_id, name: this.to.name, latlon:this.to.latlon},
            distance: this.distance
        }
    }
    toString(){
        return `Walk from stop  ${this.from.stop_id} ${this.from.name} to stop ${this.to.stop_id} ${this.to.name}`
    }
}


/* Read the GTFS and make the graph */
function initializeFromGTFS(raw_directory){
    const graph = new Graph()
    const m = [60 * 60, 60, 1]

    return readfile(raw_directory + 'stops.txt')
    .then(gtfs_stops => {
        gtfs_stops.forEach(stop => graph.addStation(stop))
        for (stop of graph.stations.values()){
            /* Create walking paths between stations */
            let closest = graph.findNearestStops(stop.latlon)
            closest.forEach(connection => {
                if (connection.stop === stop) return
                stop.addWalkingPathTo(connection.stop, connection.distance)
            })
        }
    })
    .then(() => readfile(raw_directory + 'trips.txt'))
    .then(gtfs_trips => tripsToRoute = gtfs_trips.reduce((trips, trip) => (trips[trip.trip_id] = trip, trips),{} ))
    .then(() => readfile(raw_directory + 'stop_times.txt'))
    .then(stop_time => {
        stop_time.sort((a,b) => a.stop_sequence - b.stop_sequence)  // the csv is not necessarily sorted :(
    
        let prevStopOnTrip = {} // prevStopOnTrip is maps trip id to the most recent stop seen on trip_id
    
        stop_time.forEach(record => {
            let fromStop =  prevStopOnTrip[record.trip_id] 
            /* number of seconds into the day */
            let seconds = record.departure_time.split(/:/).reduce((a, n, i) => a + n * m[i], 0)
            
            if (fromStop === undefined) { /* this is the first stop on the trip set prevStopOnTrip to the stations outbound node */
                let first_stop = graph.getStation(record.stop_id)
                let outbound = first_stop.getOutboundNodeForTrip(tripsToRoute[record.trip_id])
                prevStopOnTrip[record.trip_id] = {stop: outbound, departs:seconds}
                return;
            }
    
            let next_station = graph.getStation(record.stop_id)   
            let next = graph.addTripBetweenStations(fromStop.stop, next_station, tripsToRoute[record.trip_id], fromStop.departs, seconds )
            prevStopOnTrip[record.trip_id] = {stop: next, departs:seconds}      
        })
        graph.allNodes().forEach(node => node.sortOutgoing())
        return graph
    }) 
}

/*********************************
*  Helper functions              
*********************************/
function readfile(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if (err) return reject(err)
            // The gtfs files have a header row that will be used for object keys
            parse(data, {columns:true}, (err, output) => {
                if (err) return reject(err)
                resolve(output)
            })
        })
    })
}

function b_search(arr, t) {
    /* Finds the first value in array whose time is greater than or equal to t */
    let low = 0
    let high = arr.length

    while( high > low ){
        let mid = ((high - low) >> 1) + low
        if (mid == 0) return arr[mid] 
        // t is between the next larger and smaller or between the next larger and start of array
        if ( t <= arr[mid]['start_time'] && (t > arr[mid-1]['start_time']  || mid-1 < 0 )) return arr[mid]
        if (t > arr[mid-1]['start_time']) low = mid + 1
        else high = mid
    }
    return {edges:[]}
}

function seconds_to_time(s){
    let pad = (n) => n.toString().padStart(2, '0')
    if (!s) return 0
    let h = Math.floor(s / (60 * 60))
    let m = Math.floor((s - (h * 60 * 60))/ 60)
    return `${pad(h)}:${pad(m)}`
}
