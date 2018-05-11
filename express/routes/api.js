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
//console.log("graph", graph)

/* GET api listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/shortest_path/:from_stop/:to_stop', function (req, res, next){
    let from = req.params.from_stop
    let to = req.params.to_stop
    let parents = shortestPath(from, graph)
    let p = parents[to]
    let directions = [] 
    while(p){
        directions = p.edge.actions().concat(directions)
        p = parents[p.parent.id]
    } 
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
