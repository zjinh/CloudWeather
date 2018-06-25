<template>
    <div class="CloudWeather">
        <div class="CloudWeatherHead">
            <img draggable="false">
            <div>
                <p class="CWeatherCity"></p>
                <button tooltip="更换城市">[更换]</button>
            </div>
        </div>
        <div class="CloudWeatherMain">
            <div class="CWeatherToday">
                <div class="CWeacherCenter">
                    <img id="CWeatherTImg" draggable="false" src="../../../static/img/weather/day/qing.png">
                </div>
                <p id="CWeatherTInfo">
                </p>
                <ul id="CWeatherTtemperature">
                    <li></li>
                    <li></li>
                    <li></li>
                </ul>
                <div class="CWeacherCenter">
                    <canvas width="250" height="260" id="CWeatherPM">浏览器不支持canvas</canvas>
                </div>
            </div>
            <router-view>

            </router-view>
            <div class="CWeatherLast">
                <list v-if="testtest" v-bind:tabse="lists"></list>
                <canvas id="CWeatherTread" width="550" height="233"></canvas>
                <tips v-if="testtest" v-bind:tabes="tipData"></tips>
            </div>
        </div>
    </div>
</template>

<script>
    import list from './weather/list'
    import tips from './weather/tips'
    export default {
        name: "weather",
        components: { list,tips },
        created: function() {
            let _this=this;
            this.$http({
                method: 'POST',
                params: { 'city': '深圳' },
                emulateJSON:true,
                url: 'http://cloud.com:100/service/WeatherInfo',
            }).then((response) => {
                let data=response.data.results[0].weather_data;
                let tipsData=response.data.results[0].index;
                data.forEach(function (list) {
                    list.dayPictureUrl='static/img/weather/'+list.dayPictureUrl.split('/')[5]+'/'+list.dayPictureUrl.split('/')[6];
                });
                tipsData.forEach(function (list) {
                    list.show=false
                });
                this.lists=data;
                this.tipData=tipsData;
                this.ShowPm25(response.data.results[0].pm25);
                this.ShowTread(response.data.results[0]);
                this.testtest = true
            },function (error) {
                console.log(2)
            });
        },
        data(){
            return {
                lists:[],
                tipData:[],
                testtest: false,
                showPage:0
            };
        },
        methods: {
            $(elm){
                return document.querySelectorAll(elm);
            },
            ShowPm25(pm25){
                var canvas =this.$("#CWeatherPM")[0];
                var box = {
                        width: canvas.width,
                        height: canvas.height
                    }, radius = 100,
                    beginAngle = -Math.PI / 2 - Math.PI * 6 / 7,
                    begin = beginAngle,
                    finish,
                    increment = 0,
                    strokeStyle,
                    imageData;
                var ctx = canvas.getContext('2d');
                function animation() {
                    ctx.putImageData(imageData, 0, 0);
                    ctx.save();
                    ctx.beginPath();
                    ctx.translate(box.width / 2, box.height / 2);
                    ctx.strokeStyle = strokeStyle;
                    ctx.lineWidth = 12;
                    ctx.arc(0, 0, radius, beginAngle, begin, false);
                    ctx.stroke();
                    ctx.closePath();
                    ctx.restore();
                    begin += increment;
                    if (beginAngle - (beginAngle - finish) / 2 > begin) {
                        increment += 0.003;
                    } else {
                        increment -= 0.0028;
                    }
                    if (increment < 0) {
                        increment = -increment;
                    }
                    if (begin < finish) {
                        window.requestAnimationFrame(animation);
                    } else {
                        return;
                    }
                }
                ctx.clearRect(0, 0, box.width, box.height);
                ctx.save();
                ctx.translate(box.width / 2, box.height / 2);
                ctx.beginPath();
                ctx.strokeStyle = '#fff';
                ctx.fillStyle = '#fff';
                ctx.textAlign = "center";
                ctx.lineWidth = 12;
                ctx.arc(0, 0, radius, 0, 2 * Math.PI, true);
                ctx.stroke();
                ctx.closePath();
                ctx.beginPath();
                ctx.lineWidth = 0.5;
                ctx.arc(0, 0, radius + 15, beginAngle, -Math.PI / 2 + Math.PI * 6 / 7, false);
                ctx.moveTo(-radius * Math.sin(Math.PI / 7), radius * Math.cos(Math.PI / 7));
                ctx.lineTo(-(radius + 15) * Math.sin(Math.PI / 7), (radius + 15) * Math.cos(Math.PI / 7));
                ctx.moveTo(radius * Math.sin(Math.PI / 7), radius * Math.cos(Math.PI / 7));
                ctx.lineTo((radius + 15) * Math.sin(Math.PI / 7), (radius + 15) * Math.cos(Math.PI / 7));
                ctx.stroke();
                ctx.font = "normal 14px Microsoft YaHei";
                ctx.fillText('PM2.5', 0,125);
                ctx.font = "normal 30px Microsoft YaHei";
                ctx.fillText(pm25, 0, 6);
                ctx.closePath();
                ctx.beginPath();
                ctx.font = "normal 18px Microsoft YaHei";
                if (pm25 === -1) {
                    ctx.restore();
                    return;
                } else if (pm25 <= 50) {
                    ctx.fillStyle = '#b1f71a';
                    ctx.fillText('优', 0, 50);
                    ctx.font = "normal 14px Microsoft YaHei";
                    ctx.fillStyle = '#fff';
                    ctx.fillText('空气优', 0, 155);
                    strokeStyle = '#2ec300';
                    finish = beginAngle + (pm25 / 50) * Math.PI * 2 / 7;
                } else if (pm25 <= 100) {
                    ctx.fillStyle = '#b1f71a';
                    ctx.fillText('良', 0, 50);
                    ctx.font = "normal 14px Microsoft YaHei";
                    ctx.fillStyle = '#fff';
                    ctx.fillText('空气良', 0, 155);
                    strokeStyle = '#b1f71a';
                    finish = beginAngle + (pm25 / 50) * Math.PI * 2 / 7;
                } else if (pm25 <= 150) {
                    ctx.fillStyle = '#fee400';
                    ctx.fillText('轻度污染', 0, 50);
                    ctx.font = "normal 14px Microsoft YaHei";
                    ctx.fillStyle = '#fff';
                    ctx.fillText('空气轻度污染', 0, 155);
                    strokeStyle = '#fee400';
                    finish = beginAngle + (pm25 / 50) * Math.PI * 2 / 7;
                } else if (pm25 <= 200) {
                    ctx.fillStyle = '#ff7200';
                    ctx.fillText('中度污染', 0, 50);
                    ctx.font = "normal 14px Microsoft YaHei";
                    ctx.fillStyle = '#fff';
                    ctx.fillText('空气中度污染', 0, 155);
                    strokeStyle = '#ff7200';
                    finish = beginAngle + (pm25 / 50) * Math.PI * 2 / 7;
                } else if (pm25 <= 300) {
                    ctx.fillStyle = '#ed0006';
                    ctx.fillText('重度污染', 0, 50);
                    ctx.font = "normal 14px Microsoft YaHei";
                    ctx.fillStyle = '#fff';
                    ctx.fillText('空气重度污染', 0, 155);
                    strokeStyle = '#ed0006';
                    finish = beginAngle + 4 * Math.PI * 2 / 7 + (pm25 / 100 - 2) * Math.PI * 2 / 7;
                } else if (pm25 <= 500) {
                    ctx.fillStyle = '#bf003a';
                    ctx.fillText('严重污染', 0, 50);
                    ctx.font = "normal 14px Microsoft YaHei";
                    ctx.fillStyle = '#fff';
                    ctx.fillText('空气严重污染', 0, 155);
                    strokeStyle = '#bf003a';
                    finish = beginAngle + 5 * Math.PI * 2 / 7 + (pm25 - 300) / 200 * Math.PI * 2 / 7;
                } else {
                    ctx.fillStyle = '#90002c';
                    ctx.fillText('空气剧毒', 0, 50);
                    ctx.font = "normal 14px Microsoft YaHei";
                    ctx.fillStyle = '#fff';
                    ctx.fillText('空气剧毒', 0, 155);
                    strokeStyle = '#90002c';
                    finish = beginAngle + 6 * Math.PI * 2 / 7 + (pm25 - 500) / 500 * Math.PI * 2 / 7;
                }
                imageData = ctx.getImageData(0, 0, box.width, box.height);
                var that = this;
                setTimeout(function () {
                    window.requestAnimationFrame(animation);
                }, 400);
                ctx.closePath();
                ctx.restore();
            },
            ShowTread(data){
                var dateData = this.CWeatherCandler(new Date().getFullYear()+'-'+new Date().getMonth()+1+'-'+new Date().getDay());
                var trendData = [], // 趋势数据
                    weather = [],
                    weekData = [],
                    trendText,
                    weatherText;
                for (i = 0, len = data.weather_data.length; i < len; i++) { // 更新天气详情
                    weekData[i] = data.weather_data[i].date.slice(0, 2);
                }
                for (i = 0, len = data.weather_data.length; i < len; i++) {
                    trendText = data.weather_data[i].temperature;
                    weatherText = data.weather_data[i].weather;
                    trendData[i] = [];
                    weather[i] = [];
                    if (/\~/.test(trendText)) {
                        trendData[i][0] = trendText.slice(0, trendText.indexOf('~') - 1);
                        trendData[i][1] = trendText.slice(trendText.indexOf('~') + 2, trendText.length - 1);
                    }else if (realtext != '') {
                        trendData[i][0] = realtext.slice(0, realtext.length - 1);
                        trendData[i][1] = trendText.slice(0, trendText.length - 1);
                        if (trendData[i][0]*1 < trendData[i][1]*1) {
                            var temp = trendData[i][0];
                            trendData[i][0] = trendData[i][1];
                            trendData[i][1] = temp;
                        }
                    } else {
                        trendData[i][0] = trendText.slice(0, trendText.length - 1);
                        trendData[i][1] = trendData[i][0];
                    }
                    if (/\转/.test(weatherText)) {
                        weather[i][0] = weatherText.slice(0, weatherText.indexOf('转'));
                        weather[i][1] = weatherText.slice(weatherText.indexOf('转') + 1);
                    } else {
                        weather[i][0] = weatherText;
                        weather[i][1] = weatherText;
                    }
                }
                trendData.push(weather);
                trendData.push(dateData);
                trendData.push(weekData);
                var canvas = this.$("#CWeatherTread")[0],
                    ctx = canvas.getContext('2d'),
                    box = {
                        width: canvas.width,
                        height: canvas.height
                    },
                    average = box.width/8,
                    max = Number(trendData[0][0]),
                    min = Number(trendData[0][1]),
                    center = 0,
                    radius = 6,
                    proportion,
                    date,
                    week,
                    len = trendData.length;
                for (var i = 0; i < 4; i++) {
                    if (Number(trendData[i][0]) > max) {
                        max = Number(trendData[i][0]);
                    }
                    if (Number(trendData[i][1]) < min) {
                        min = Number(trendData[i][1]);
                    }
                }
                center = max - min; // 温差
                if (center <= 10) {
                    proportion = 10;
                } else if (center <= 18) {
                    proportion = 8;
                } else if (center <= 30) {
                    proportion = 5;
                } else {
                    proportion = 2;
                }
                center = (max + min)/2;
                ctx.clearRect(0, 0, box.width, box.height);
                ctx.strokeStyle = '#fff';
                ctx.font = "normal 14px Microsoft YaHei";
                ctx.fillStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.textAlign = "center";
                for (i = 1; i <= 4; i++) {
                    date = trendData[len - 2][i - 1];
                    week = trendData[len - 1][i - 1];
                    ctx.beginPath();
                    //ctx.fillText(/*date[0] + '/' + date[1] + ' ' + */week, average*(2*i - 1), box.height-30);显示日期
                }
                ctx.beginPath();
                ctx.save();
                ctx.translate(0, box.height/2);
                ctx.lineWidth = 2;
                ctx.textAlign = "center";
                ctx.font = "normal 16px Microsoft YaHei";
                for (i = 0; i < len - 3; i++) {
                    ctx.beginPath();
                    ctx.strokeStyle = '#fff';
                    ctx.fillStyle = '#fff';
                    ctx.fillText(trendData[i][1] + '°', average*(2*i + 1), (center - trendData[i][1])*proportion + 35);
                    ctx.fillText(trendData[4][i][1], average*(2*i + 1), (center - trendData[i][1])*proportion + 55);
                    ctx.arc(average*(2*i + 1), (center - trendData[i][1])*proportion, radius, 0, 2*Math.PI, false);
                    ctx.fill();
                    ctx.moveTo(average*(2*i + 1), (center - trendData[i][1])*proportion);
                    ctx.lineTo(average*(2*i + 3), (center - trendData[i+1][1])*proportion);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.strokeStyle = '#b1f71a';
                    ctx.fillStyle = '#b1f71a';
                    ctx.fillText(trendData[i][0] + '°', average*(2*i + 1), (center - trendData[i][0])*proportion - 20);
                    ctx.fillText(trendData[4][i][0], average*(2*i + 1), (center - trendData[i][0])*proportion - 40);
                    ctx.arc(average*(2*i + 1), (center - trendData[i][0])*proportion, radius, 0, 2*Math.PI, false);
                    ctx.fill();
                    ctx.moveTo(average*(2*i + 1), (center - trendData[i][0])*proportion);
                    ctx.lineTo(average*(2*i + 3), (center - trendData[i+1][0])*proportion);
                    ctx.stroke();
                }
                ctx.restore();
            },
            CWeatherCandler(dateString) {
                var date = [],
                    nonleap = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
                    leap = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
                    year, month, theDate;
                year = dateString.slice(0, dateString.indexOf('-'));
                month = dateString.slice(dateString.indexOf('-') + 1, dateString.lastIndexOf('-'));
                theDate = dateString.slice(dateString.lastIndexOf('-') + 1);
                if (year%400 === 0||year%4===0&&year%100!=0) {
                    var monthNum = leap[Number(month)];
                } else {
                    var monthNum = nonleap[Number(month)];
                }
                for (var i = 0; i < 4; i++) {
                    date[i] = [];
                    date[i][0] = Number(month);
                    date[i][1] = theDate++;
                    if (date[i][1] > monthNum) {
                        if (++month > 12) {
                            month = 1;
                            date[i][0] = month;
                        } else {
                            date[i][0] = month;
                        }
                        theDate = 1;
                        date[i][1] = theDate++;
                    }
                }
                return date;
            }
        },
    }
</script>

<style scoped>
    @font-face {
        font-family: 'slimf-icon';
        src: url('../assets/font/slimf-icon.eot?66309867');
        src: url('../assets/font/slimf-icon.eot?66309867#iefix') format('embedded-opentype'),
        url('../assets/font/slimf-icon.woff2?66309867') format('woff2'),
        url('../assets/font/slimf-icon.woff?66309867') format('woff'),
        url('../assets/font/slimf-icon.ttf?66309867') format('truetype'),
        url('../assets/font/slimf-icon.svg?66309867#slimf-icon') format('svg');
        font-weight: normal;
        font-style: normal;
    }
    @import url("../assets/css/CloudWeather.css");

</style>