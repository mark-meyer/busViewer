<template>
    <div id="stopInfo">
        <h3>
            <svgicon icon="bus" width="2em" height="2em" color="#333"></svgicon> Upcoming Trips
            <span  @click='close()'> <svgicon icon="close" width="1.3em" height="1.3em" id="close"></svgicon> </span>
        </h3>
        <div class=routeBlock v-if="Object.keys(stop.schedule).length === 0">
            There are no upcoming trips scheduled at this stop today.
        </div>
        <div class="routeBlock" v-for='(trips, route) in stop.schedule' v-bind:key="route">
            <route :route='routes[route]' @click.native='pickRoute(route)'></route>  
            <div  class="schedule" v-if="trips.length == 0">There are no upcoming trips scheduled at this stop today.</div>    
            <div class="schedule" v-for="trip in trips" v-bind:key="trip.trip_id+trip.departure_time">
                {{trip.departure_time | to12Hour}} | {{trip.destination}}
            </div>
        </div>
    </div>
    
</template>

<script>
import Route from '@/components/Route'
import '../compiled-icons/bus'
import '../compiled-icons/close'
import { mapState } from 'vuex'

export default {
    filters: {
        to12Hour(value) {
            let [hour, min, seconds] = value.split(':')
            const ampm = hour > 11 ? 'PM' : 'AM'
            hour = hour % 12 == 0 ? 12 : hour % 12 
            return `${hour}:${min} ${ampm}`
        }
    },
    components:{route: Route},
    mounted(){
        this.$emit("mounted", 'Times')
    },
    methods: {
        close() {
            this.$emit('exit')
        },
        pickRoute(route){
            // keep the schedule and stop in place while changing routes.
            let next_route = this.$store.state.routes[route]
            this.$store.dispatch('showRoute', next_route)
            .then(() => {
                let stop = this.$store.state.routes[route].stop(this.stop.id)
                this.$store.dispatch('selectStop', stop)
                this.close()
            })
        }
    },
    computed: mapState({
        routes: 'routes', 
        stop: 'selected'
        })
}
</script>

<style scoped>
    h3{
        margin-top: 1em;
    }
    #stopInfo{
        overflow-y: scroll;
        height: 100%;
    }
    .routeBlock{
        margin-bottom: 1em;
    }
    .schedule{
        margin-left: 3em;
        font-weight: normal;
        font-size: .85em;       
    }
    .svg-icon {
        display: inline-block;
        width: 16px;
        height: 16px;
        color: inherit;
        vertical-align: middle;
        fill: none;
        stroke: currentColor;
    }
    #close{
        margin-left: .5em ;
        vertical-align: -35%;
        fill: #333;
        transition: fill .25s;
    }
    #close:hover {
        fill: #aaa;
        cursor: pointer;
    }
</style>
