<template>
    <li> 
        <span class='routeNumber' v-bind:style="{backgroundColor: color, borderColor: color}">{{data.route}} </span>
        <span id="name"> {{data.from.name}}</span>
        <div class="stopInfo">depart:<b> {{data.stops[0].departs}}</b> | Stop: {{data.stops[0].from.stop_id}} </div>
        <div class="stopInfo">To: {{lastStop.to.name}}<br />arrives {{lastStop.arrives}}</div>
    </li>
</template>

<script>
import { mapState } from 'vuex'

export default {
    props: ['data'],
    data(){
        return {
            route: undefined
        }
    },
    computed: {
       color() {
            let routes = this.$store.state.routes
            return routes[this.data.route].color
       },
       lastStop() {
           return this.data.stops[this.data.stops.length - 1]
       }

    }
}
</script>

<style>
.routeNumber{
        border-width: 2px;
        border-style: solid;
        border-radius: 50%;
        border-color: #333;
        color: #fff;
        width: 1.75em;
        height: 1.75em;
        display: inline-block;
        text-align: center;
        margin-right:.5em;
        font-size: .85em;
        font-weight: bold;
    }
    #name {
        font-size: .85em;
    }
    li {     
        padding: 10px 0 10px 0;
    }
    .stopInfo{
        margin-left: 40px;
        font-size: .8em;
        text-transform: uppercase
    }
</style>
