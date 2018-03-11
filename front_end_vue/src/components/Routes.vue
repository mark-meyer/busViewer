<template>
    <div id="route_list" >  
        <h3>
            <svgicon icon="bus" width="2em" height="2em" color="#333"></svgicon> Routes
        </h3>
        <route class="routeName" v-for='route in routes' :selected='currentRoute && route.id == currentRoute.id' :route='route' v-bind:key='route.id' @click.native='pickRoute(route)' ></route>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import Route from '@/components/Route'
import '../compiled-icons/bus'

export default {
    methods: {
        pickRoute(route){
            this.$emit('clicked')
            this.$store.dispatch('showRoute', route)
        }
     },
    components:{ route: Route },
    mounted(){
        this.$emit("mounted", 'Routes')
    },
    computed:mapState(['routes', 'currentRoute'])
}
</script>

<style scoped>
    h3 {
        margin-top: 1em;
    }
    #route_list {
        position: relative;
        height: 100%;
        overflow-y: scroll;
        -ms-overflow-style: none;
    }
    .routeName {
        margin-bottom: .5em;
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
