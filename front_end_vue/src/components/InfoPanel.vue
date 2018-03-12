<template>
    <div id="panel"  v-bind:class="{menuOpen: menuOpen}">
        <div id="panelTab" @click='toggleopen'>{{menuOpen ? "Close": tabText}}</div> 
        <div id='container'>               
            <routes v-if="!selected" @mounted="setTab" @clicked='close'></routes> 
            <component :is="componentType" v-if="selected" @mounted="setTab" @close="closeSchedule()"></component>
        </div>
    </div>
</template>

<script>
import Stop_Schedule from '@/components/Stop_Schedule'
import Routes from '@/components/Routes'
import TripSchedule from '@/components/TripSchedule'
import { mapState } from 'vuex'

export default {
    name: "InfoPanel",
    data: function(){
        return {
            menuOpen: false,
            tabText: "Routes"
        }
    },
    components: {
        stop: Stop_Schedule,
        bus: TripSchedule,
        routes: Routes
    },
    methods: {
        close(){
            this.menuOpen = false
        },
        toggleopen(){
            this.menuOpen = !this.menuOpen
        },
        closeSchedule(){
            this.menuOpen = false;
            this.$store.commit('unsetSelected')
            //this.$emit('closeInfo')
        },
        setTab(value){
            this.tabText = value
        }
    },
    computed: {
        componentType(){
            return this.selected ? this.selected.type : "routes"
        },
        ...mapState(['currentRoute', 'routes', 'selected'])
    }
}
</script>

<style scoped>
    #container {
        border-right: 2px solid #fafafa;
    }
    #panel {
        position:absolute;
        left: 0;
        z-index: 100;
        box-sizing: border-box;
        background-color: #eeeeee;
        width: 18em;
        height: 100%;
        padding: 0;
        padding-left: 1em;
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
   
 @media only screen  and (max-width : 680px) {
    #panelTab {
        visibility: visible;
    }
    li { display: block; }
    h3 { margin-top: 0px; }
     
    #panel {
        position: relative;
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
</style>
