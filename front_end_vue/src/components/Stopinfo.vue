<template>
  <div id="stopInfo">
      <h3>{{obj.stopID}}</h3>
      <h4 v-if="obj">{{obj.name}}</h4>
  </div>
</template>

<script>
export default {
    props:['obj']
}
</script>

<style scoped>
    #stopInfo{
        position: absolute;
        width: 100%;
        background-color: #fff;
    }
    h3 {
        border-top: 12px solid #f1f118;
        border-bottom: 12px solid #f1f118;
        
        padding: .25em;
        font-size: 1.5em;
        margin-bottom: 0;
        margin-top: 0;
        margin-right: .5em;
        margin-left: .75em;
        display: inline-block;
        
    }
    h4 {
        display: inline-block;
        font-size: 1.2em;
        margin-top:0;
        font-weight: normal;
    }
     @media only screen and (max-width : 680px) {
        h3 {
            border-top: 9px solid #f1f118;
            border-bottom: 9px solid #f1f118;
            padding: .2em;
        }
        #stopInfo{
            font-size: .75em;
        }
     }
</style>
