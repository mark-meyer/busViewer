<template>
    <div id="panel"  v-bind:class="{menuOpen: menuOpen}">
        <div id="panelTab" @click='toggleopen'>{{tabText}}</div> 
        <div id='container'>               
            <routes v-if="!(selectedroute && selectedroute.selectedStop)" :routes='routes' :selectedroute='selectedroute' @pickRoute='pickRoute'></routes> 
            <stop_schedule :stop='selectedroute.selectedStop' :routes='routes' v-if="selectedroute && selectedroute.selectedStop" @close="closeSchedule()"></stop_schedule>   
        </div>
    </div>
</template>

<script>
import Stop_Schedule from '@/components/Stop_Schedule'
import Routes from '@/components/Routes'

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
        routes: Routes
    },
    methods: {
        pickRoute(route){
            this.$emit('pickRoute', route)
            this.menuOpen = false
        },
        toggleopen(){
          this.menuOpen = !this.menuOpen
        },
        closeSchedule(){
            this.menuOpen = false;
            this.$emit('closeInfo')
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
        }      
    }
}
</script>

<style scoped>
    
    #panel {
        position:absolute;
        left: 0;
        z-index: 100;
        box-sizing: border-box;
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
    
    #panelTab {
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
    #panelTab:hover{
        border-color: #f1f118;
    }
     #container {
        height: 100%;
        padding: 0;
        overflow-y: scroll;
    }
    h3 {
         margin-top:.5em
    }
    .closeBox {
        display: inline-block;
        font-size: .75em;
        padding-left:.2em;
        
        background-color: #aaa;
        color: #eee;
        height: 1.4em;
        width: 1.3em;
        border-radius: 50%;
    }
   
    li.noStop {
        display: none;
        opacity: .3;
    }
    
 @media only screen  and (max-width : 680px) {
     #panelTab {
         visibility: visible;
     }
     li{
         display: block;
     }
     h3 {
         margin-top: 0px;
     }
     
    #panel {
        left: -100%;
        background-color:#fefefe;
        transition: left .5s;
        width: 100%;
        margin-top: 2px;
        padding-top:.5em;     
    }
    #panel.menuOpen {
        left: 0;
    }
    .menuOpen #panelTab {
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
