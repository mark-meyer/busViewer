<template>
    <div class="routeName" v-bind:class='{selected:selected}' @click="goToRoute()"> 
        <span class="routeNumber" v-bind:style="{backgroundColor: route.color, borderColor: route.color}">{{route.id}}</span>
        <span class="routeName">{{route.name}}</span>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    props: ['route', 'selected'],
    methods:{
        goToRoute(){
            console.log("route picked: ", this.route)
            // it would be a nice feature to keep the stop selected to compare routes
            // that share a stop, This might require keeping a single 'stops' object that routes reference
            // rather than having routes 'own' a stops array.
            this.$store.commit('unsetSelected')
            this.$store.dispatch('showRoute', this.route)      
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
        margin-right:1em;
        font-size: .85em;
        font-weight: bold;
    }
    .routeName:hover {
        color:firebrick;
        cursor: pointer;
    }
    .routeName {
        display:flex;
        flex-wrap: wrap;
        align-items: center;
        margin-bottom: .25em;
        line-height: 150%;
    }
    .routeName.selected {
        font-weight: bold;
    }
</style>
