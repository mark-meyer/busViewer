const jheap = require('jheap')

module.exports =  djkstra

/********************************************************
 * Helper functions to go from seconds to  formatted time 
 */ 
function time_to_seconds(t) {
    let m = [60 * 60, 60, 1]
    return t.split(':').reduce((a,c,i) => c * m[i] + a, 0)
}
function seconds_to_time(s){
    let pad = (n) => n.toString().padStart(2, '0')
    if (!s) return 0
    let h = Math.floor(s / (60 * 60))
    let m = Math.floor((s - (h * 60 * 60))/ 60)
    return `${pad(h)}:${pad(m)}`
}

/************************************************************/

function djkstra(source, graph) {
    /* To avoid mutating the original graph all data like
       costs and times is stored in node_info which is keyed to stop_id.
       The values from this will be added to the heap
    */
    const node_info = graph.allNodes().reduce((a,node) => {
        a[node.id] = {
            node: node,
            d_score: Number.MAX_SAFE_INTEGER,
            route_time: undefined
        }
        return a
    }, {})

    const visited = new Set()
    const parents = {}

    const dt = new Date();
    let route_time = dt.getSeconds() + (60 * dt.getMinutes()) + (60 * 60 * dt.getHours());
    route_time = time_to_seconds('6:10:00')

    const source_stop = graph.getStation(source)
    /*  d_score is the accumulated time on the path it's what we are trying to minimize by definition the source has 0 d_score*/
    node_info[source_stop.id].d_score = 0

    /*  route_time should be thought of as the current time. We are only intersted in connections from this stop after route_time */
    node_info[source_stop.id].route_time = route_time

    /* heap will pop next stop with lowest d_dscore */
    const heap = jheap.fromArray(Object.values(node_info), (a,b) => a.d_score < b.d_score)

    while(heap.length) {
        /* current is the next best node accross the cut */
        const current_info = heap.pop()
        const current = current_info.node
        visited.add(current)
        /* Look at each outgoing connection and get the next upcomings route to that connection
           Set the d_score of the connecting stop it it hasn't already been visited */
        let lastEdgeWalking = false

        current.getBestEdgesForRoute(current.route, current_info.route_time)
        .forEach(edge => {
            if (edge.isWalking && lastEdgeWalking ) return
            lastEdgeWalking = edge.isWalking
            const connecting_stop = edge.to
            if(visited.has(connecting_stop)) return

            const connecting_info = node_info[connecting_stop.id]
            const time_diff = edge.costFromTime(current_info.route_time)

            const current_dscore = current_info.d_score
            const connecting_dscore =  connecting_info.d_score
            let penalty = current.isTransfer ? 300 : 0
            penalty += edge.isWalking ? 300 : 0
            if (connecting_dscore > current_dscore + time_diff + penalty ){
                connecting_info.d_score = current_dscore + time_diff + penalty
                /*  Set the route_time for this node. This will let us only look for departures after this time when it's
                    this node's turn to be processed */
                connecting_info.route_time = current_info.route_time + time_diff

                if (parents[current.id] && parents[current.id].isTransfer ){
                    // set the proper time if the current route just exiteds a station on outoging station edge
                    // this effectively passes this time back to the untimed station -> outgoing edge
                    parents[current.id]['time'] = [edge.start_time, edge.end_time]
                    parents[current.id]['trip'] = edge.trip && edge.trip.trip_headsign
                }

                parents[connecting_stop.id] = {
                    parent: current,
                    current: connecting_stop,
                    isTransfer: current.isTransfer,
                    edge: edge,
                    trip_id: edge.trip && edge.trip.trip_id,
                    trip: edge.trip && edge.trip.trip_headsign,
                    time: [edge.start_time, edge.end_time],
                    time_dif: time_diff,
                    d_score: connecting_info.d_score,
                }
            }
        })
        heap.heapify()
    }
    return parents
}