<template>
    <div id="routes"  v-bind:class="{menuOpen: menuOpen}">
        <div id="routeTab" @click='toggleopen'>{{tabText}}</div>
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
    computed: {
        tabText(){
           return this.menuOpen ? 'Cancel' :  'Routes'
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
        padding-right: 0;
        text-align: left;
        border-top: 5px solid #333;
        border-bottom: 5px solid #333;
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
        top: 3em;
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
        column-count: 2;
    }
}
</style>
