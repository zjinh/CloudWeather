<template>
    <ul class="CWeatherList">
        <li v-for="(item, index) in tabse" :style="{animationDelay:'0.'+index+2+'s'}">
            <div class="CWeacherCenter">
                <img draggable="false" :src="item.dayPictureUrl">
            </div>
            <p>{{item.date}}</p>
            <p>{{item.temperature}}</p>
            <p>{{item.weather}}</p>
            <p>{{item.wind}}</p>
        </li>
    </ul>
</template>
<script>
    export default {
        name: "list",
        props: {
            tabse: {
                type: Array
            }
        },
        mounted(){
        }
    }
</script>

<style scoped>

</style>