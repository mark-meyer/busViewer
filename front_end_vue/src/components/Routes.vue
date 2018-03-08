<template>
    <div id="routes"  v-bind:class="{menuOpen: menuOpen}">
        <div id="routeTab" @click='toggleopen'>{{tabText}}</div>
        <div id="route_list" >        
            <h3>{{heading}}</h3>
            <ul>
                <li 
                    @click='pickeRoute(route)' 
                    v-for='route in routes' 
                    v-bind:key='route.id'
                    v-bind:class='{selected:(selectedroute && selectedroute.id == route.id), noStop:(selectedroute && selectedroute.selectedStop && !(route.id in selectedroute.selectedStop.schedule))}'
                >
                <span class="routeNumber" v-bind:style="{backgroundColor: route.color, borderColor: route.color}">{{route.id}}</span>
                <span class="routeName">{{route.name}}</span>
                <stop_schedule :departures='selectedroute.selectedStop.schedule[route.id]' v-if="selectedroute && selectedroute.selectedStop && (route.id in selectedroute.selectedStop.schedule)"></stop_schedule>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import Stop_Schedule from '@/components/Stop_Schedule'
import Stopinfo from '@/components/Stopinfo'

export default {
    name: "Routes",
    data: function(){
        return {
            menuOpen: false
        }
    },
    props:['routes', 'selectedroute'],
    components: {
        stop_schedule: Stop_Schedule,
        stopinfo: Stopinfo
    },
    methods: {
        pickeRoute(route){
            this.$emit('pickRoute', route)
            this.menuOpen = false
        },
        toggleopen(){
          this.menuOpen = !this.menuOpen
      }
    },
    computed: {
        tabText(){
        if(this.menuOpen){
            return 'Close'
        }
        return this.selectedroute && this.selectedroute.selectedStop ? 'Times' :  'Routes'
        },
        selectedStop(){
            return (this.selectedroute && this.selectedroute.selectedStop) ? this.selectedroute.selectedStop : undefined
        },
        heading(){
            if (this.selectedStop) {
                return 'Upcoming Buses'
            } else { return "Routes"}
        }
    }
}
</script>

<style scoped>
    #routes {
        position:absolute;
        left: 0;
        z-index: 100;
        box-sizing: border-box;
        border-right: 2px solid #fafafa;
        background-color: #eeeeee;
        width: 18em;
        height: 100%;
        padding: 1em;
        padding-bottom: 0;
        padding-right: 0;
        text-align: left;
        border-top: 5px solid #333;
        border-bottom: 5px solid #333;
         -ms-overflow-style: none;
    }
    #route_list {
        position: relative;
        height: 100%;
        overflow-y: scroll;
         -ms-overflow-style: none;
    }
    #routeTab {
        cursor: pointer;
        position: absolute;
        right: 0px;
        transform-origin: bottom right;
        transform: rotate(90deg);
        border: 2px solid #ccc;
        background-color: #fff;
        z-index: 200;
        top: 4em;
        visibility: hidden;
        padding: .25em 1em .75em 1em;
        border-radius: 0 10px 0px 0;
    }
    #routeTab:hover{
        border-color: #f1f118;
    }
    h3 {
         margin-top:.5em
    }
    li {
        list-style: none;
        display:flex;
        flex-wrap: wrap;
        align-items: center;
        margin-bottom: .25em;
        line-height: 150%;
    }
    li.selected {
        font-weight: bold;
    }
    li.noStop {
        display: none;
        opacity: .3;
    }
    .routeName:hover {
        color:firebrick;
        cursor: pointer;
    }
    ul {
        padding: 0;
        line-height: 180%;
        overflow-y: scroll;
        margin-top: .5em
    }
 
  
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
        margin-right:1em;
        font-size: .85em;
        font-weight: bold;
    }

 @media only screen  and (max-width : 680px) {
     #routeTab {
         visibility: visible;
     }
     li{
         display: block;
     }
     h3 {
         margin-top: 0px;
     }
     
    #routes {
        left: -100%;
        transition: left .5s;
        width: 100%;
        margin-top: 2px;
        padding-top:.5em;     
    }
    #routes.menuOpen {
        left: 0;
    }
    .menuOpen #routeTab {
        right: 0px;
        transform-origin: top right;
        top: 6em;
        border-top: none;
        border-radius: 0px 0px 0px 10px;
        padding: .75em 1em .5em 1em
    }
 }
  @media only screen  and (max-width : 680px) and (orientation : landscape){
    ul{
        /*column-count: 2;*/
    }
}
</style>
