<template>
    <div id="stopInfo">
        <h3>
            <svgicon icon="bus" width="2em" height="2em" color="#333"></svgicon> Upcoming Trips
            <span  @click='close()'> <svgicon icon="close" width="1.3em" height="1.3em" id="close"></svgicon> </span>
        </h3>

        <div class="routeBlock" v-for='(trips, route) in stop.schedule' v-bind:key="route">
            <route :route='routes[route]'></route>      
            <div class="schedule" v-for="trip in trips" v-bind:key="trip.trip_id">
                {{trip.departure_time | to12Hour}} | {{trip.destination}}
            </div>
        </div>
    </div>
    
</template>

<script>
import Route from '@/components/Route'
import '../compiled-icons/bus'
import '../compiled-icons/close'

export default {
    props:['stop', 'routes'],
    filters: {
        to12Hour(value) {
            let [hour, min, seconds] = value.split(':')
            hour = hour % 12 == 0 ? 12 : hour % 12 
            return `${hour}:${min} ${hour > 11 ? 'PM' : 'AM'}`
        }
    },
    components:{route: Route},
    mounted(){
        console.log(this.routes)
    },
    methods: {
        close() {
            this.$emit('close')
        }
    }
}
</script>

<style scoped>
    h3{
        margin-top: .5em;
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
