<template>
    <ul class="CWeatherList">
        <li v-for="index in tabse">
            <div class="CWeacherCenter">
                <img draggable="false" :src="index.dayPictureUrl">
            </div>
            <p>{{index.date}}</p>
            <p>{{index.temperature}}</p>
            <p>{{index.weather}}</p>
            <p>{{index.wind}}</p>
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
            debugger
        }
    }
</script>

<style scoped>

</style>