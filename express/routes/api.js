var express = require('express');
var router = express.Router();

var gtfs = require('../lib/gtfs.js')
var busXML = require('../lib/xmlBusData.js')
/* GET api listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

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
module.exports = router;
