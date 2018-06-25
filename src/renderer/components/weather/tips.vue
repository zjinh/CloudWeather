<template>
    <div class="CWeatherNumber">
        <div class="CWeatherNumberCon" v-for="(item, index) in tabes" @click="switchTab(index)">
            <p>{{item.tipt}}<span class="fa fa-angle-up"><span>{{item.zs}}</span></span></p>
            <div class="CWeatherNumberTips" style="display: block;" v-show="item.show">{{item.des}}</div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "tips",
        props:{
            tabes:{
                type:Array
            }
        },
        created: function () {
            this.tabes[0].show = true
        },


        methods: {
            switchTab: function (index) {
                this.tabes.forEach(function (item) {
                    item.show = false
                });
                this.tabes[index].show = true
            }
        }
    }
</script>

<style scoped>

</style>