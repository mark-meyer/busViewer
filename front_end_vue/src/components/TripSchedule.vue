<template>
    <div id="stopInfo">
        <h3>
            <svgicon icon="bus" width="2em" height="2em" color="#333"></svgicon> Scheduled Stops
            <span  @click='close()'> <svgicon icon="close" width="1.3em" height="1.3em" id="close"></svgicon> </span>
        </h3>
        <table>
            <tr v-for="stop in bus.stops" v-bind:key="stop.stopID">
                <td> {{stop.departure_time | to12Hour}} </td>
                <td> {{stop.name | removeCaps}} </td>
            </tr>
        </table>
    </div>
</template>

<script>
import Route from '@/components/Route'
import '../compiled-icons/bus'
import '../compiled-icons/close'

export default {
    props:['bus'],
    methods:{
        close(){this.$emit('close')}
    },
    mounted(){ this.$emit("mounted", 'Schedule')},
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

<style>
    table{ 
        font-size: .75em;
        margin:0;
        padding:0;
        width: 100%;
    }
    h3{
        margin-top: 1em;
    }
    #stopInfo{
        padding-right: 1em;
    }
    tr {
        background-color: #fff;
    }
    tr:nth-child(even) {
        background-color: rgb(241, 241, 241);
    }
    td {
        padding: .25em;
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
    #close{
        margin-left: .5em ;
        vertical-align: -35%;
        fill: #333;
        transition: fill .25s;
    }
    #close:hover {
        fill: #aaa;
        cursor: pointer;
    }
    @media only screen  and (max-width : 680px) {
        table{
            font-size: 1em;
        }
    }
</style>
