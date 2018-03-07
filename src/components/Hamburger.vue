<template>
  <div class="frame" @click="toggle()" >
  <svg width="24" height="24" id="hamburger" viewBox="0 0 24 16" v-bind:class="{ open: open }">
    <line class="a" fill="none" stroke="#FFF" stroke-width="3" x1="0" y1="1" x2="24" y2="1" />
    <line class="b" fill="none" stroke="#FFF" stroke-width="3" x1="0" y1="8" x2="24" y2="8" />
    <line class="c" fill="none" stroke="#FFF" stroke-width="3" x1="0" y1="15" x2="24" y2="15" />
  </svg>
</div>


</template>

<script>
export default {
    name: "Hamburger",
   
    props: ['open'],
    methods:{
        toggle(){
            console.log("toggled: ", this.open)
            this.$emit("toggled", this.open)
        }
    }
}
</script>

<style scoped>
 
    .a, .b, .c {
    opacity: 1;
    stroke: #333;
    }

    @-webkit-keyframes flip {
        15% {
            opacity: 0.8;
            -webkit-transform: translateZ(0) scale(0.8) rotateZ(0);
                    transform: translateZ(0) scale(0.8) rotateZ(0);
        }
        30% {
            -webkit-transform: translateZ(0) scale(0.8) rotateZ(0);
                    transform: translateZ(0) scale(0.8) rotateZ(0);
        }
        100% {
            opacity: 1;
            -webkit-transform: translateZ(0) scale(1) rotateZ(405deg);
                    transform: translateZ(0) scale(1) rotateZ(405deg);
        }
    }

    @keyframes flip {
        15% {
            opacity: 0.8;
            -webkit-transform: translateZ(0) scale(0.8) rotateZ(0);
                    transform: translateZ(0) scale(0.8) rotateZ(0);
        }
        30% {
            -webkit-transform: translateZ(0) scale(0.8) rotateZ(0);
                    transform: translateZ(0) scale(0.8) rotateZ(0);
        }
        100% {
            opacity: 1;
            -webkit-transform: translateZ(0) scale(1) rotateZ(405deg);
                    transform: translateZ(0) scale(1) rotateZ(405deg);
        }
    }
    .frame {
    -webkit-transform: scale(1) translate(0, 10px);
            transform: scale(1) translate(0, 10px);
    }

    #hamburger {
        color: #333;
        cursor: pointer;
        display: inline-block;
        -webkit-transform: translateZ(0) scale(1);
                transform: translateZ(0) scale(1);
        -webkit-transition: 600ms -webkit-transform;
        transition: 600ms -webkit-transform;
        transition: 600ms transform;
        transition: 600ms transform, 900ms -webkit-transform;
    }
    #hamburger:active {
        color: orange;
    }

    #hamburger line {
        stroke: currentColor;
        -webkit-transition: 0.45s all;
        transition: 0.45s all;
    }
    #hamburger.open {
        -webkit-animation: 1050ms flip;
                animation: 1050ms flip;
        -webkit-animation-fill-mode: forwards;
                animation-fill-mode: forwards;
    }
    #hamburger.open .a {
        -webkit-transform: translate(0, 7px);
                transform: translate(0, 7px);
    }
    #hamburger.open .b {
    -webkit-transform: translate(20px, -4px) rotate(90deg);
            transform: translate(20px, -4px) rotate(90deg);
    -webkit-transition: 0.45s color, 0.45s -webkit-transform 0.6s;
    transition: 0.45s color, 0.45s -webkit-transform 0.6s;
    transition: 0.45s transform 0.6s, 0.45s color;
    transition: 0.45s transform 0.6s, 0.45s color, 0.45s -webkit-transform 0.6s;
    }
    #hamburger.open .c {
    -webkit-transform: translate(0, -7px);
            transform: translate(0, -7px);
    }
</style>
