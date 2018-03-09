<template>
    <div id="route_list" > 
        <div id="routes">
            <h3>
                <svgicon icon="bus" width="2em" height="2em" color="#333"></svgicon> Routes
            </h3>
            <route v-for='route in routes' :selected='selectedroute && route.id == selectedroute.id' :route='route' v-bind:key='route.id' @click.native='pickRoute(route)' ></route>
        </div>
    </div>
</template>

<script>
import Route from '@/components/Route'
import '../compiled-icons/bus'

export default {
    props:['routes', 'selectedroute'],
     methods: {
        pickRoute(route){
            console.log("route picked: ", route)
            this.$emit('pickRoute', route)
            this.menuOpen = false
        }
     },
     components:{
         route: Route
     }
}
</script>

<style scoped>
    #route_list {
        position: relative;
        height: 100%;
        overflow-y: scroll;
        -ms-overflow-style: none;
    }
    #routes {
        padding: 0;
        line-height: 180%;
        overflow-y: scroll;
        margin-top: .5em
    }
    
    .routeName:hover {
        color:firebrick;
        cursor: pointer;
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
</style>
