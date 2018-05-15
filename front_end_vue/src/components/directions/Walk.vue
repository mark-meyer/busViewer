<template>
    <li class="walk"> 
        <span class="w"> w</span> WALK TO:
        <div id="instruction">
            {{data.to.name}}<br />
            {{distance}} miles
        </div>
    </li>
</template>

<script>

export default {
    props: ['data'],
    computed:{
        distance(){
            return this.data.distance.toFixed(2)
        }
    }
}
</script>

<style scoped>
    #instruction{
 margin-left: 40px;
    }
    li {
        position:relative;
        font-size: .75em;
        border-top: 1px solid #ddd;
        border-bottom: 1px solid #ddd;
        padding:10px 0 10px 0;
       
    }
   .w{
        border-width: 2px;
        border-style: solid;
        border-radius: 50%;
        background-color:  #aaddc3;
        color:#fff;
        width: 1.75em;
        height: 1.75em;
        display: inline-block;
        text-align: center;
        margin-right:.5em;
        font-size: 1.2em;
        font-weight: bold;
    }
</style>
