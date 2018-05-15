<template>
    <li>
        {{data.from.stop_id}} depart: {{data.departs}} <br />
        {{data.to.stop_id}} arrive: {{data.arrives}}
    </li>
</template>

<script>

export default {
    props: ['data']
}
</script>

<style scoped>
    li {
        font-size: .75em;
        margin-left: 40px;
        padding: 0px;
        padding-bottom: 5px;
    }

</style>
