<template>
    <div id="busInfo">
        <div id="number" v-bind:style="{borderColor: bus.color}">{{bus.routeNumber}}</div> 
        <div id="tripInfo">
            <p><b>{{bus.destination}}</b> <br>
                {{direction}} | {{bus.opStatus}}
                <br>
                Last: {{bus.laststop}}
            </p>   
        </div>
    </div>
</template>

<script>
export default {
    name: "Businfo",
    props: ['bus'],
    computed:{
        direction(){
            return this.bus.direction == 'O'
            ? "Outbound"
            : "Inbound"
        },
    },
    mounted(){
        console.log(this.bus)
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
    #busInfo{
        position: absolute;
        text-align: left;
        background-color: white;
        display: flex;  
        height: 100%;  
        width: 100%;
    }   
    #tripInfo{
       font-size: .85em;
    }
    p{
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
            top:0;
            text-align: left;
            padding:.25em;
        }
        p {margin-top: 0}
        #tripInfo{
        font-size: .75em;
        }
    }
</style>
