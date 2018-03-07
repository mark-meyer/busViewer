<template>
    <div id="routes"  v-bind:class="{menuOpen: menuOpen}">
        <hamburger id="hamburger" :open='menuOpen' @toggled="toggleopen"></hamburger>

        <h3>Routes</h3>
        <ul>
            <li 
                @click='handleclick(route)' 
                v-for='route in routes' 
                v-bind:key='route.id'
                v-bind:class='{selected:(selectedroute && selectedroute.id == route.id) }'
            >
            <span class="routeNumber" v-bind:style="{backgroundColor: route.color, borderColor: route.color}">{{route.id}}</span>{{route.name}}
            </li>
        </ul>
    </div>
</template>

<script>
import Hamburger from '@/components/Hamburger'

export default {
    name: "Routes",
    data: function(){
        return {
            menuOpen: false
        }
    },
    props:['routes', 'selectedroute'],

    methods: {
        handleclick(route){
            this.$emit('pickRoute', route)
            this.menuOpen = false
        },
        toggleopen(){
          this.menuOpen = !this.menuOpen
      }
    },
    components: {hamburger: Hamburger}
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
        text-align: left;
        border-top: 5px solid #333;
        border-bottom: 5px solid #333;
    }
    #hamburger {
        position: absolute;
        right: -2.5em;
        z-index: 200;
        top: 20px;
        visibility: hidden;
        padding: .5em;
        background-color: #fff;
        border-radius: 0 10px 10px 0;
    }
    
    h3 {
         margin-top:.5em
    }
    li {
        list-style: none;
        display:flex;
        align-items: center;
        margin-bottom: .25em;
        line-height: 150%;
    }
    li.selected {
        font-weight: bold;
    }
    li:hover {
        color:firebrick;
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
     #hamburger {
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
    .menuOpen #hamburger {
        right: 0px;
        border-radius: 10px 0px 0px 10px;
    }
 }
  @media only screen  and (max-width : 680px) and (orientation : landscape){
    ul{
        column-count: 2;
    }
}
</style>
