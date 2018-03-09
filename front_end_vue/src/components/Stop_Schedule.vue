<template>
    <div id="schedule">
        <div v-for='departure in departures' v-bind:key="departure.trip_id">
        {{departure.departure_time | to12Hour}} - {{departure.destination}}
        </div>
    </div>
    
</template>

<script>
export default {
    props:['departures'],
    filters: {
        to12Hour(value) {
            let [hour, min, seconds] = value.split(':')
            return `${hour % 12}:${min} ${hour > 12 ? 'PM' : 'AM'}`
        }
    }
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
