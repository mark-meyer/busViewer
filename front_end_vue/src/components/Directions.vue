<template>
    <div id="navigation" >  
        <div id = "container" >
            <h3>
            Navigate
            </h3>
            <div id="time">
                <input v-model="time" type="range" min="1" max="86340" class="slider" id="time">{{seconds_to_time}}          
            </div>

            <input v-model="from" type="text" placeholder="From">
            <input v-model="to" type="text" placeholder="to"> <button @click="loadDirections()"> Navigate </button>  
            <div id = "directions" v-if="directions" >
                <ul>
                    <component :is="d.type" v-for="(d, index) in directions.data" v-bind:key="index" :data="d"></component>
                </ul>
            </div>
            <div id = "error" v-if="error" >
                <span class='icon'>!</span>
                <b id="error_title"> Error: </b>
                <div id="error_message">
                    {{error.message}}
                </div>
            </div>
            
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import Walk  from '@/components/directions/Walk.vue'
import Ride  from '@/components/directions/Ride.vue'
import Board from '@/components/directions/Board.vue'
import Exit  from '@/components/directions/Exit.vue'

export default {
    data()  {
        return {
            from: undefined,
            to: undefined,
            error: undefined,
        }
    },
    components: {
        walk: Walk,
        ride: Ride,
        board: Board,
        exit: Exit
    },
    methods: {
        loadDirections(){
            this.error = undefined          
            this.$store.dispatch('getDirections', {from: this.from, to: this.to})
            .catch(err => this.error = err)
        }

     },
    mounted(){
        this.$store.dispatch('unselect')
    },
    computed: {
        seconds_to_time(){
            let s= this.time
            let pad = (n) => n.toString().padStart(2, '0')
            if (!s) return 0
            let h = Math.floor(s / (60 * 60))
            let m = Math.floor((s - (h * 60 * 60))/ 60)
            return `${pad(h)}:${pad(m)}`
        },
        time:{
            get () {
                return this.$store.state.time
            },
            set (value) {
                 this.$store.dispatch('getDirectionsWithTime', {time: value, to: this.to, from: this.from})
                //this.$store.commit('setTime', value)
            }
        },
        ...mapState(['directions'])
    }
}
</script>

<style scoped>
  #navigation {
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
    ul{
        list-style: none;
        padding-left:0px;
    }
    #container {
        height: 100%;
        padding: 0;
        overflow-y: scroll;
    }
    #time {
        font-size: 1.5em;
        margin-bottom: .5em;
    }
    #time input{
        margin-right: .25em;
    }
    #error {
        margin-top: 2em;
        border-top: 1px solid #ddd;
        border-bottom: 1px solid #ddd;
        padding: 1em 0;

    }
    .icon{
        border-radius: 50%;
        color: #fff;
        background-color: #e85959;
        width: 1.75em;
        height: 1.75em;
        display: inline-block;
        text-align: center;
        margin-right:.5em;
        font-size: 1em;
        font-weight: bold;
    }
    #name {
        font-size: .85em;
    }
    #error_message {
        margin-top: 0px;
        margin-left: 2.5em;
    }
</style>
