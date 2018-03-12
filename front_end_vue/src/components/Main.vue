<template>
    <div>      
        <div id="header">
            <div v-if="!selected"><div id="circle_a" >A</div> <h1> Anchorage Buses</h1></div>
            <component :is='componentType'  v-if="selected"></component>
        </div>
       
        <div id="root">
           <infopanel></infopanel>        
            <div id="holder">
                <div ref="mainMap" id="mainMap"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'

import {setMap} from '@/GTFSMap.js'
import Businfo from '@/components/Businfo'
import Stopinfo from '@/components/Stopinfo'
import InfoPanel from '@/components/InfoPanel'

export default {
    name: 'Main',
    data: function(){
        return {
            routes: [],
            selectedRoute:undefined,
            map: undefined,
        }
    },
    computed: {
        componentType(){
            return this.selected ? this.selected.type+'info' : "routes"
        },
        ...mapState(['selected'])
    },
    components: {
        businfo: Businfo,
        stopinfo: Stopinfo,
        infopanel: InfoPanel
    },
    mounted: function(){
        let gMap = new google.maps.Map(this.$refs["mainMap"], {
                zoom: 12,
                center: {lat: 61.18, lng: -149.860},
                mapTypeControl: false,
                fullscreenControl: false
        })
        const styledMapType = new google.maps.StyledMapType(require("../mapstyles.js"))
        gMap.mapTypes.set('styled_map', styledMapType);
        gMap.setMapTypeId('styled_map');
        setMap(gMap)

        this.$store.dispatch('getRoutes')
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    #holder { 
        position: absolute;
        left: 18em;
        right: 0;
        top: 0;
        bottom: 0;
        height: 100%;
        border-top: 5px solid #333;
        border-bottom: 5px solid #333;
        box-sizing: border-box; 
    }
    #mainMap {
        position: relative;
        height: 100%;
        width: 100%;
       /* min-width: 300px; */  
       
    } 
    #header {
        position: relative;
        margin-top: .75em;
        display: flex;
        height: 4em;
    }
    h1 {
        font-size: 1.5em;
    }
    #circle_a {
        font-size:2em;
        border: 12px solid #f1f118;
        border-radius: 50%;
        width: 1.5em;
        height: 1.5em;
        line-height: 130%;
        text-align: center; 
        margin: 0px 20px 20px 20px;
        font-weight: bold;
    }
    #root{
        position: absolute;
        top: 6.5em;
        bottom: 3.5em;
        left: 0px;
        right: 0px;
    }
    h1, h2 {
        font-weight: normal;
    }
    a {
        color: #42b983;
    }
    @media only screen  and (max-width : 680px) {
        #header {
            align-items: baseline;
            margin-top: .5em;
        }
        #circle_a {
            font-size: 1.25em;
            border: 8px solid #f1f118;
            line-height: 130%;
            margin-left: .5em;
        }
        h1 {
            font-size: 1.25em;
        }
        #root{
            top: 4.5em;
            bottom: 1em;
        }
        #holder{
            left: 0;
            border-top: 2px solid;
            border-bottom: 2px solid
        }
    }
</style>
