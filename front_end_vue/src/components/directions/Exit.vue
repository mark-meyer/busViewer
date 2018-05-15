<template>
    <li> 
        Exit: <br />
         {{data.stop.stop_id}} {{data.stop.stop_name}}
    </li>
</template>

<script>

export default {
    props: ['data']
}
</script>

<style scoped>
    li{
        border-top: 1px solid #ddd;
        margin-left: 40px;
        font-size: .8em;
    }
</style>
