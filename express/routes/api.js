var express = require('express');
var router = express.Router();

var gtfs = require('../lib/gtfs.js')
var busXML = require('../lib/xmlBusData.js')
const raw_directory = (__dirname + '/../gtfs/')
var Transit_Graph = require('../lib/transit_graph.js')
const shortestPath = require('../lib/shortest_path.js')

let graph
Transit_Graph.initializeFromGTFS(raw_directory)
.then(g => graph = g)

/* GET api listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/directions/:from_stop/:to_stop/:time', function (req, res, next){
    let from = req.params.from_stop
    let to = req.params.to_stop
    if (!gtfs.stops[from]) {
        res.json({error: `Unrecognized Stop: ${from}`})
        return
    }
    if (!gtfs.stops[to]) {
        res.json({error: `Unrecognized Stop: ${to}`})
        return
    }
    let time = req.params.time // sceconds
    let parents = shortestPath(from, graph, time)
    let p = parents[to]
    let directions = [] 
    let text = []
    let current_leg = undefined
    while(p){
        text.unshift(p.edge.toString())
        direction = p.edge.actions()
        if(direction.isLegEnd ) {
            current_leg = {type:"board", stops: [direction]}
            directions.unshift(current_leg)
        } else if (current_leg){
            if (direction.type == 'board') {
                current_leg.route = direction.route
                current_leg.from = direction.from
                current_leg.trip_id = direction.trip_id
                current_leg = undefined
            } else current_leg.stops.unshift(direction)
        } else directions.unshift(direction)
        
        p = parents[p.parent.id]
    } 
    console.log(text.join('\n'))
    res.json(directions)
})

router.get('/shape/:shape_id', function(req, res, next) {
  const shape_id = req.params.shape_id
  if (gtfs.shape(shape_id)) {
    res.send( JSON.stringify(gtfs.shape(shape_id)));
  } else {
    res.status(404)
    next()
  }
});

router.get('/route/:route_id', function(req, res, next) {
    const route_id = req.params.route_id
    res.send(JSON.stringify(gtfs.routeWithShape(route_id)))
})

router.get('/routes', function(req, res, next) {
    res.send(JSON.stringify(gtfs.allRoutes()))
})

router.get('/stops_on_route/:route_id', function(req, res, next){
    const route_id = req.params.route_id
    res.send(JSON.stringify(gtfs.allStopsOnRoute(route_id)))
})

router.get('/buslocations/:route_id', function(req, res, next){
    const route_id = req.params.route_id
    busXML.getBusesOnRoute(route_id)
    .then(data => res.send(JSON.stringify(data)))
})

router.get('/upcoming_stops/:trip_id/:route_id/:direction', function(req, res, next){
    const trip_id = req.params.trip_id
    const direction = req.params.direction
    const route_id = req.params.route_id
    console.log("Direction: ", direction)
    res.send(JSON.stringify(gtfs.upcomingStopsOnTrip(trip_id, route_id, direction)))
})
router.get('/route_stops/:trip_id/:route_id/:direction', function(req, res, next){
    const trip_id = req.params.trip_id
    const direction = req.params.direction
    const route_id = req.params.route_id
    console.log("Direction: ", direction)
    res.send(JSON.stringify(gtfs.stopsOnTrip(trip_id, route_id, direction)))
})
router.get('/stop_times/:stop_id', function(req, res, next){
    const stop_id = req.params.stop_id
    res.send(JSON.stringify(gtfs.stopInfo(stop_id)))
})
module.exports = router;
