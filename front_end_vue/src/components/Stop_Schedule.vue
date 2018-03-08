<template>
    <div id="schedule">
        <div v-for='departure in departures' v-bind:key="departure.trip_id">
        {{departure.departure_time}} - {{departure.destination}}
        </div>
    </div>
    
</template>

<script>
export default {
    props:['departures']
}
</script>

<style>
    #schedule{
        flex-basis: 100%;
        font-weight: normal;
        font-size: .85em;
        margin-left: 3em;
    }
</style>
