<template>
    <div id="busInfo">
        <div id="number" v-bind:style="{borderColor: bus.color}">{{bus.routeNumber}}</div> 
        <div id="tripInfo">
            <p><b>{{bus.destination}}</b> <br>
                {{direction}} | {{bus.opStatus}}
                <br>
                <span v-if='tripStop'>{{tripStop.name | removeCaps}} | Scheduled: {{tripStop.departure_time | to12Hour}} </span>
                <span v-else>Last: {{bus.laststop}}</span>
            </p>   
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex'
export default {
    name: "Businfo",
    computed:{
        direction(){
            const directions = {O: "Outbound", I:"Inbound" } // Govnm't Hill Bus reports 'L' in direction. Don't know how to interpret that
            return directions[this.bus.direction]
        },
        ...mapState({
            bus: 'selected',
            tripStop: 'tripStop'
        })
    },
    filters: {
        removeCaps(str) {
            let directions = ['ESE', 'ENE', 'NNW', 'SSW', 'SSE', 'WNW', 'NNE', 'WSW']
            return str.replace(/\w\S*/g, function(txt){
                if (directions.includes(txt)) return ''
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            })  
        },
        to12Hour(value) {
            let [hour, min, seconds] = value.split(':')
            hour = hour % 12 == 0 ? 12 : hour % 12 
            return `${hour}:${min}`
        }
    }
}
</script>

<style scoped> 
    #number {
        border-width: 12px;
        font-size:2em;
        border-style: solid;
        width: 1.5em;
        height: 1.5em;
        border-radius: 50%;
        background-color: white;
        margin: 0px 20px 20px 20px;        
        text-align: center;
        font-weight: bold;
    }
    #busInfo {
        position: absolute;
        padding-top:.25em;
        text-align: left;
        background-color: white;
        display: flex;  
        height: 100%;  
        width: 100%;
    }   
    #tripInfo {
       font-size: .85em;
    }
    p {
        margin-top: .25em;
    }

    @media only screen and (max-width : 680px) {
        #number {
            font-size: 1em;
            border-width: 8px;
            line-height: 130%;
            margin-left: .5em;
            margin-top:0px;
            padding: .25em;
            flex-shrink:0;
        }
        #busInfo{
            position: absolute;
            padding-top:.5em;
            text-align: left;
            padding:.25em;

        }
        p {margin-top: 0}
        #tripInfo {font-size: .75em;}
    }
</style>
