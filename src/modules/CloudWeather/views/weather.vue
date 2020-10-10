<template>
	<div class="cloud-main" :style="{ background: 'url(' + backgroundUrl + ')' }">
		<windowHeader :config="headerConfig">
			<template slot="left">
				<div class="logo" v-if="this.$projectEnv !== 'browser'">C-WEATHER</div>
			</template>
		</windowHeader>
		<div class="weather-main">
			<div class="now">
				<div class="city-name">
					<Tooltip content="更换城市" theme="light">
						<div class="city-name" @click="showCityDialog">
							<Icon type="ios-pin-outline" />
							<span>{{ locationName }}</span>
						</div>
					</Tooltip>
					<Tooltip content="关于" theme="light">
						<div class="about sf-icon-ellipsis-v" v-if="this.$isElectron" @click="showAbout"></div>
					</Tooltip>
				</div>
				<div class="warning-list" v-if="weatherWarning.length">
					<span class="icon sf-icon-exclamation-triangle"></span>
					<Tooltip v-for="(item, index) in weatherWarning" :key="index" max-width="300" :content="item.text" theme="light" :transfer="true">
						<div class="warning">{{ item.typeName }},{{ item.level }}预警生效中</div>
					</Tooltip>
				</div>
				<div class="update-time">最后更新时间：{{ nowWeather.updateTime }}</div>
			</div>
			<div class="live-2d" v-if="ready">
				<live2d :style="style" :model="[3, 42]" :direction="direction" :size="size" ref="live2d"></live2d>
			</div>
			<div class="top">
				<div class="info">
					<div class="temperature">{{ nowWeather.temp }}</div>
					<div class="weather-name">{{ nowWeather.text }}</div>
					<div class="redo sf-icon-redo" @click="weatherInit"></div>
				</div>
				<div class="info">
					<div class="block feelsLike">体感温度 {{ nowWeather.feelsLike }}°C</div>
					<div class="block humidity">湿度{{ nowWeather.humidity }}%</div>
					<div class="block precip">降水量{{ nowWeather.precip }}毫米</div>
					<div class="block vis">能见度{{ nowWeather.vis }}公里</div>
					<div class="block wind">
						{{ nowWeather.windDir }}
						{{ nowWeather.windScale }}级, {{ nowWeather.windSpeed }}公里/小时
					</div>
					<div class="block pressure">气压 {{ nowWeather.pressure }}百帕</div>
					<div class="block cloud">云量 {{ nowWeather.cloud }}%</div>
				</div>
			</div>
			<!--7天预报-->
			<div class="seven-day">
				<div class="day" v-for="item in sevenDaysWeather" :key="item.fxDate">
					<div class="row">
						<div class="date">{{ item.fxDate | formatDate2 }}</div>
						<div class="weather">{{ item.text }}</div>
					</div>
					<div class="row">
						<img class="icon" :src="item.icon" draggable="false" alt="" />
						<div class="container">
							<div class="wind">
								{{ item.windDirDay }}
								{{ item.windScaleDay }}级
							</div>
							<div class="temperature">{{ item.tempMin }}/{{ item.tempMax }}</div>
						</div>
					</div>
				</div>
			</div>
			<!--24小时预报-->
			<div class="twenty-four-hours" v-if="ready">
				<div class="header">未来24小时</div>
				<Carousel v-model="carousel" dots="none">
					<CarouselItem v-for="(item, index) in day24Hour" :key="index">
						<div class="hour-list">
							<div class="per-hour" v-for="(hour, i) in item" :key="i">
								<img class="icon" :src="hour.icon" draggable="false" alt="" />
								<div class="temperature">{{ hour.temp }}</div>
								<div class="name">{{ hour.text }}</div>
								<div class="precip">
									<Icon type="ios-water-outline" />
									{{ hour.pop }}%
								</div>
								<div class="wind">
									<span class="sf-icon-paper-plane"></span>
									{{ hour.windDir }}{{ hour.windScale }}级
								</div>
								<div class="hour">{{ hour.fxTime | formatDate }}</div>
							</div>
						</div>
					</CarouselItem>
				</Carousel>
			</div>
			<div class="today-detail">
				<div class="header">今日详情</div>
				<div class="today-info">
					<div class="block">
						<div class="head-text">白天</div>
						<div class="content">
							今天白天{{ todayInfo.textDay }},最高气温<span class="temperature">{{ todayInfo.tempMax }}</span>
						</div>
						<div class="head-text">夜晚</div>
						<div class="content">
							今天夜间{{ todayInfo.textNight }},最低气温<span class="temperature">{{ todayInfo.tempMin }}</span>
						</div>
					</div>
					<div class="block">
						<div class="head-text">日出</div>
						<div class="content">
							<Icon type="ios-sunny" class="sunrise" />
							<span class="sunrise-time">{{ todayInfo.sunrise }}</span>
						</div>
						<div class="head-text">日落</div>
						<div class="content">
							<Icon type="ios-sunny" class="sunset" />
							<span class="sunrise-time">{{ todayInfo.sunset }}</span>
						</div>
					</div>
					<div class="block">
						<div class="head-text">月升</div>
						<div class="content">
							<Icon type="ios-moon" class="moonrise" />
							<span class="sunrise-time">{{ todayInfo.moonrise }}</span>
						</div>
						<div class="head-text">月落</div>
						<div class="content">
							<Icon type="ios-moon" class="moonset" />
							<span class="sunrise-time">{{ todayInfo.moonset }}</span>
						</div>
						<div class="head-text">月相</div>
						<div class="content">
							{{ todayInfo.moonPhase }}
						</div>
					</div>
					<div class="block">
						<div class="content">
							<div class="container">
								<div class="head-text">降水概率</div>
								<div class="circle">
									<ICircle
										stroke-linecap="square"
										:stroke-color="circleColor[0]"
										:size="100"
										:trail-color="circleColor[1]"
										:percent="day24Hour[0] && day24Hour[0][0].pop | toNumber"
									>
										<div class="percent">{{ day24Hour[0] && day24Hour[0][0].pop }}%</div>
									</ICircle>
								</div>
							</div>
							<div class="container">
								<div class="head-text">湿度</div>
								<div class="circle">
									<ICircle
										stroke-linecap="square"
										:stroke-color="circleColor[0]"
										:size="100"
										:trail-color="circleColor[1]"
										:percent="todayInfo.humidity | toNumber"
									>
										<div class="percent">{{ todayInfo.humidity }}%</div>
									</ICircle>
								</div>
							</div>
							<div class="container">
								<div class="head-text">紫外线指数</div>
								<div class="circle">
									<ICircle
										stroke-linecap="square"
										:stroke-color="circleColor[0]"
										:size="100"
										:trail-color="circleColor[1]"
										:percent="(todayInfo.uvIndex * 10) | toNumber"
									>
										<div class="percent">
											{{ todayInfo.uvIndex }}
										</div>
										<div class="value">{{ uvText }}</div>
									</ICircle>
								</div>
							</div>
							<div class="container">
								<div class="head-text">云量</div>
								<div class="circle">
									<ICircle
										stroke-linecap="square"
										:stroke-color="circleColor[0]"
										:size="100"
										:trail-color="circleColor[1]"
										:percent="nowWeather.cloud | toNumber"
									>
										<div class="percent">{{ nowWeather.cloud }}%</div>
									</ICircle>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!--生活指数-->
			<div class="life-indices">
				<div class="header">今日生活指数</div>
				<div class="life-info">
					<div class="item" v-for="item in lifeIndices" :key="item.type">
						<div class="row">
							<div class="name">
								{{ item.name }}
							</div>
							<div class="category">
								{{ item.category }}
							</div>
						</div>
						<div class="text">
							{{ item.text }}
						</div>
					</div>
				</div>
			</div>
		</div>
		<Modal v-model="citySelectDialog" title="选择城市" @on-ok="selectCity" :closable="!!this.locationId" :mask-closable="false">
			<div class="city-search">
				<Select
					v-model="searchLocationId"
					placeholder="找不到你的城市，试试搜索吧"
					filterable
					remote
					:remote-method="citySearch"
					:label-in-value="true"
					:loading="citySearching"
					@on-change="citySelect"
				>
					<Option v-for="option in searchCityList" :value="option.id" :key="option.id">{{ option.country }},{{ option.name }}</Option>
				</Select>
			</div>
			<div class="city-list">
				<div class="city" v-for="item in hotCityList" :key="item.id" :class="item.id === locationId ? 'active' : ''" @click="setLocation(item)">
					{{ item.name }}
				</div>
			</div>
			<div slot="footer">
				<Button type="primary" @click="selectCity">确认</Button>
			</div>
		</Modal>
		<!--加载-->
		<div class="weather-loading animated" :class="loading ? 'fadeIn' : 'fadeOut'" :style="{ zIndex: loading ? '999' : '-1' }">
			<div class="cloudy"></div>
		</div>
	</div>
</template>

<script>
import live2d from '../live2d/index.vue';
export default {
	name: 'weather',
	data() {
		return {
			backgroundUrl: require('../assets/bg/bg_fog.png'),
			direction: 'right',
			style: '',
			width: 500,
			height: 500,
			size: 350,
			tips: {
				mouseover: [
					{
						selector: '.vue-live2d',
						texts: ['这样可以修改默认语句'],
					},
				],
			},
			headerConfig: {
				background: this.$projectEnv === 'browser' ? 'transparent' : 'rgba(0, 0, 0, 0)',
				color: '#fff',
				title: 'CloudWeather',
				resize: false,
				mini: true,
			},
			locationId: '', //城市id
			locationName: '',
			hotCityList: [],
			searchCityList: [],
			citySearching: false,
			searchLocationId: '',
			citySelectDialog: false,
			nowWeather: {
				temp: 0,
				text: '',
				feelsLike: 0,
				windDir: '',
				windScale: '',
				windSpeed: '',
				humidity: 0,
				pressure: 0,
				precip: 0,
				vis: 0,
			},
			sevenDaysWeather: [],
			todayInfo: {
				humidity: 0,
			},
			circleColor: ['#69eaff', 'rgba(255,255,255,0.3)'],
			uvText: '低',
			day24Hour: [],
			carousel: 0,
			lifeIndices: [],
			weatherWarning: [],
			loading: false,
			visibilityFlag: false,
			ready: false,
		};
	},
	mounted() {
		this.weatherInit();
		this.visibilityFlag = false;
		this.$nextTick(() => {
			this.ready = true;
		});
		document.addEventListener('visibilitychange', () => {
			this.visibilityFlag = true;
			if (document.visibilityState === 'visible') {
				if (!this.locationId.length) {
					this.showCityDialog();
				} else {
					this.getWeather();
					this.getWarning();
				}
			}
		});
	},
	filters: {
		formatDate(time) {
			return new Date(time).format('MM/dd HH:mm');
		},
		formatDate2(time) {
			return new Date(time).format('MM/dd');
		},
		toNumber(value) {
			return parseFloat(value);
		},
	},
	watch: {
		locationId: function () {
			this.getWeather();
			this.getWarning();
			this.get7daysWeather();
			this.getFuture24h();
			this.getIndices();
			this.citySelectDialog = false;
		},
	},
	components: {
		live2d,
	},
	methods: {
		weatherInit() {
			if (
				localStorage.weatherLocationId !== undefined &&
				localStorage.weatherLocationName !== undefined &&
				localStorage.weatherLocationId !== 'undefined' &&
				localStorage.weatherLocationName !== 'undefined'
			) {
				this.setLocation({
					id: localStorage.weatherLocationId,
					name: localStorage.weatherLocationName,
				});
			} else {
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(
						(position) => {
							var lat = position.coords.latitude;
							var lon = position.coords.longitude;
						},
						(error) => {
							switch (error.code) {
								case 1:
									this.$Message.warning('位置服务被拒绝');
									break;
								case 2:
									this.$Message.warning('暂时获取不到位置信息');
									break;
								case 3:
									this.$Message.warning('获取位置信息超时');
									break;
								default:
									this.$Message.warning('未知错误');
									break;
							}
							if (!this.locationId.length) {
								this.showCityDialog();
							}
						},
						{ timeout: 5000, enableHighAccuracy: true }
					);
				} else {
					this.$Message.warning('不支持获取地理位置信息');
					this.showCityDialog();
				}
			}
		},
		showCityDialog() {
			if (this.hotCityList.length === 0) {
				this.$api.weather.getHotCity((rs) => {
					if (rs.code === 0) {
						this.citySelectDialog = true;
						this.hotCityList = rs.data;
					} else {
						this.$Message.error('城市列表获取失败');
					}
				});
			} else {
				this.citySelectDialog = true;
			}
		},
		citySelect(item) {
			this.setLocation({
				id: item.value,
				name: item.label,
			});
		},
		citySearch(query) {
			if (query !== '') {
				this.citySearching = true;
				this.$debounce(() => {
					this.$api.weather.searchCity(query, (rs) => {
						this.citySearching = false;
						if (rs.code === 0) {
							this.searchCityList = rs.data;
						}
					});
				}, 500);
			} else {
				this.searchCityList = [];
			}
		},
		selectCity() {
			if (!this.locationId.length) {
				this.$Message.warning('请选择一个城市');
				return false;
			}
			this.citySelectDialog = false;
		},
		setLocation(item) {
			let id = typeof item === 'object' ? item.id : item;
			let name = typeof item === 'object' ? item.name : item;
			this.locationId = id;
			this.locationName = name;
			localStorage.weatherLocationId = id;
			localStorage.weatherLocationName = name;
		},
		getWeather() {
			this.loading = true;
			this.$api.weather.now(this.locationId, (rs) => {
				this.loading = false;
				if (rs.code === 0) {
					this.nowWeather = rs.data.now;
					this.nowWeather.updateTime = new Date(rs.data.updateTime).format('yyyy/MM/dd HH:mm:ss');
					this.weatherTips(this.nowWeather.text);
					this.weatherBackGround(this.nowWeather.text);
				} else {
					this.$message.error('实时天气数据获取失败');
				}
			});
		},
		get7daysWeather() {
			this.$api.weather.get7days(this.locationId, (rs) => {
				if (rs.code === 0) {
					let hour = new Date().format('HH');
					let iconKey = 'iconDay';
					let textKey = 'textDay';
					if (hour > 18) {
						iconKey = 'iconNight';
						textKey = 'textNight';
					}
					rs.data.daily.forEach((item) => {
						item.icon = require('../assets/icon/' + item[iconKey] + '.png');
						item.text = item[textKey];
					});
					this.sevenDaysWeather = rs.data.daily;
					this.todayInfo = rs.data.daily[0];
					let uvIndex = this.todayInfo.uvIndex;
					if (uvIndex >= 0 && uvIndex <= 2) {
						this.uvText = '低';
					} else if (uvIndex >= 3 && uvIndex <= 4) {
						this.uvText = '较低';
					} else if (uvIndex >= 5 && uvIndex <= 6) {
						this.uvText = '较高';
					} else if (uvIndex >= 7 && uvIndex <= 9) {
						this.uvText = '很高';
					} else {
						this.uvText = '特别高';
					}
				} else {
					this.$message.error('未来7天天气数据获取失败');
				}
			});
		},
		getFuture24h() {
			this.$api.weather.future24h(this.locationId, (rs) => {
				if (rs.code === 0) {
					let data = rs.data;
					let result = [];
					data.forEach((item) => {
						item.icon = require('../assets/icon/' + item.icon + '.png');
					});
					for (let i = 0; i < data.length; i += 8) {
						result.push(data.slice(i, i + 8));
					}
					this.day24Hour = result;
				} else {
					this.$message.error('未来24x小时天气数据获取失败');
				}
			});
		},
		getIndices() {
			this.$api.weather.indices(this.locationId, (rs) => {
				if (rs.code === 0) {
					this.lifeIndices = rs.data;
				} else {
					this.$message.error('生活指数获取失败');
				}
			});
		},
		getWarning() {
			this.$api.weather.warning(this.locationId, (rs) => {
				if (rs.code === 0) {
					this.weatherWarning = rs.data;
					if (!this.visibilityFlag) {
						rs.data.forEach((item) => {
							this.$notify(item.title, this.locationName + item.typeName + item.level + '预警');
						});
					}
				} else {
					this.$message.error('天气预警获取失败');
				}
			});
		},
		weatherTips(text) {
			let tips = '';
			if (text.includes('阴')) {
				tips = '应该很凉快吧';
			} else if (text.includes('云') && text.includes('晴')) {
				tips = '天气很不错喔';
			} else if (text.includes('云')) {
				tips = '天空应该很好看吧';
			} else if (text.includes('晴')) {
				tips = '希望你有个好心情';
			} else if (text.includes('雨') && (text.includes('雷') || text.includes('暴'))) {
				tips = '还是不要出门了吧';
			} else if (text.includes('雨')) {
				tips = '出门记得带伞喔';
			} else if (text.includes('雪') && text.includes('雨')) {
				tips = '应该会很冷吧';
			} else if (text.includes('雪') && (text.includes('暴') || text.includes('大'))) {
				tips = '应该会很冷吧';
			} else if (text.includes('雪')) {
				tips = '可以去外面打雪仗了';
			} else if (text.includes('雾')) {
				tips = '外面应该是雾蒙蒙的吧';
			} else if (text.includes('尘') || text.includes('霾')) {
				tips = '记得带好口罩喔';
			}
			this.$refs.live2d.showMessage(this.locationName + '今天的天气' + this.nowWeather.text + ',' + tips);
			if (this.$projectInfo.projectName === 'CloudWeather') {
				document.title = this.locationName + ',' + this.nowWeather.text + '-CloudWeather';
			}
		},
		weatherBackGround(icon) {
			if (icon.includes('雪')) {
				this.backgroundUrl = require('../assets/bg/bg_snow.png');
			} else if (icon.includes('晴')) {
				this.backgroundUrl = require('../assets/bg/bg_sunny.png');
			} else if (icon.includes('雾')) {
				this.backgroundUrl = require('../assets/bg/bg_fog.png');
			} else if (icon.includes('浮尘')) {
				this.backgroundUrl = require('../assets/bg/bg_haze.png');
			} else if (icon.includes('阴') || icon.includes('雷阵雨')) {
				this.backgroundUrl = require('../assets/bg/bg_cloudy.png');
			} else if (icon.includes('雨')) {
				this.backgroundUrl = require('../assets/bg/bg_rain.png');
			} else {
				this.backgroundUrl = require('../assets/bg/bg_sunny.png');
			}
		},
		showAbout() {
			this.$about();
		},
	},
};
</script>

<style scoped lang="scss">
.cloud-main {
	display: flex;
	flex-direction: column;
	background-size: 100% 100% !important;
	transition: background 0.4s ease-in-out;
	animation-duration: 0.5s;
	animation-fill-mode: both;
	.logo {
		font-family: 'zk-font';
		font-size: 16px;
	}
}
.weather-main {
	width: 100%;
	height: 100%;
	padding: 30px;
	color: #fff;
	overflow-y: auto;
	position: relative;
	.header {
		font-size: 30px;
		font-weight: lighter;
		margin-top: 40px;
	}
	.live-2d {
		width: 100%;
		display: flex;
		justify-content: flex-end;
		padding: 0 50px;
	}
	.now {
		.city-name {
			font-size: 25px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			i {
				font-size: 22px;
				margin-right: 5px;
			}
			.about {
				width: 30px;
				height: 30px;
				text-align: center;
				line-height: 30px;
				cursor: pointer;
			}
			.about:hover {
				background: rgba(255, 255, 255, 0.3);
				border-radius: 3px;
			}
		}
		.warning-list {
			font-size: 16px;
			margin: 10px 0;
			display: flex;
			align-items: center;
			.icon {
				font-size: 18px;
			}
			.warning {
				margin-left: 10px;
				padding: 3px 5px;
			}
			.warning:hover {
				background: rgba(255, 255, 255, 0.1);
			}
		}
		.update-time {
			margin: 10px 0;
		}
	}
	.top {
		width: 100%;
		margin-top: -160px;
		.info {
			display: flex;
			align-items: flex-end;
			flex-wrap: wrap;
			.temperature {
				font-size: 180px;
				font-weight: lighter;
				line-height: 140px;
			}
			.temperature:after {
				content: '°';
				margin-left: -0px;
			}
			.weather-name {
				font-size: 20px;
			}
			.block {
				font-size: 16px;
				margin-top: 20px;
				margin-right: 20px;
				padding: 2px 15px;
				background: rgba(255, 255, 255, 0.2);
				border-radius: 30px;
			}
			.redo {
				margin-left: 20px;
				font-size: 20px;
				cursor: pointer;
			}
		}
	}
	.seven-day {
		width: 100%;
		display: flex;
		align-items: center;
		background: rgba(0, 0, 0, 0.1);
		padding: 15px;
		margin-top: 40px;
		.day {
			flex: 1;
			border-right: 1px solid rgba(255, 255, 255, 0.5);
			padding: 0 20px;
			.row {
				width: 100%;
				display: flex;
				justify-content: space-between;
			}
			.container {
				margin-top: 20px;
				text-align: right;
			}
			.date {
				font-size: 18px;
			}
			.weather {
				font-size: 16px;
			}
			.icon {
				margin-top: 10px;
				width: 60px;
				height: 60px;
			}
		}
		.day:last-child {
			border: none;
		}
	}
	.twenty-four-hours {
		width: 100%;
		.hour-list {
			width: 100%;
			height: 230px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 15px;
			border-top: 1px solid rgba(255, 255, 255, 0.3);
			.per-hour {
				flex: 1;
				height: 100%;
				min-width: 110px;
				.icon {
					width: 50px;
					margin-left: -5px;
				}
				.temperature {
					font-size: 20px;
				}
				.name {
					font-size: 14px;
					margin-bottom: 20px;
				}
				.wind {
					margin-top: 5px;
					span {
						font-size: 12px;
					}
				}
				.hour {
					margin-top: 10px;
					border-top: 1px solid rgba(255, 255, 255, 0.1);
					line-height: 30px;
					font-weight: bold;
				}
			}
		}
	}
	.today-info {
		width: 100%;
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		.block {
			margin-right: 50px;
			flex: 1;
			border-top: 1px solid rgba(255, 255, 255, 0.3);
			padding-top: 10px;
			min-width: 220px;
			.head-text {
				font-weight: bold;
				font-size: 18px;
			}
			.content {
				margin-top: 5px;
				margin-bottom: 10px;
				font-size: 16px;
				display: flex;
				align-items: center;
				flex-wrap: wrap;
				.sunrise,
				.sunset,
				.moonrise,
				.moonset {
					font-size: 50px;
				}
				.sunrise,
				.sunset {
					color: #ecd76c;
				}
				.sunrise-time {
					font-size: 20px;
					margin-left: 5px;
				}
				.container {
					width: 50%;
					.circle {
						margin-top: 10px;
						.percent {
							font-size: 22px;
						}
						.value {
							font-size: 14px;
							margin-top: 5px;
						}
					}
				}
			}
		}
		.block:last-child {
			margin-right: 0;
		}
	}
	.life-info {
		display: flex;
		flex-wrap: wrap;
		.item {
			min-width: 240px;
			width: calc(25% - 30px);
			margin: 20px 30px 0 0;
			border-bottom: 1px solid rgba(255, 255, 255, 0.3);
			.row {
				display: flex;
				align-items: center;
				justify-content: space-between;
				font-size: 20px;
				font-weight: lighter;
			}
			.text {
				width: 100%;
				font-size: 16px;
				padding: 20px 0;
			}
		}
	}
}
.weather-loading {
	width: 100%;
	height: 100%;
	position: absolute;
	left: 0;
	top: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #fff;
	.cloudy {
		width: 50px;
		height: 50px;
		background: #ccc;
		border-radius: 50%;
		box-shadow: #ccc 65px -10px 0 -5px, #ccc 25px -25px, #ccc 30px 10px, #ccc 60px 15px 0 -10px, #ccc 85px 5px 0 -5px;
		animation: cloudy 5s ease-in-out infinite;
	}
	@keyframes cloudy {
		50% {
			transform: translateY(-20px);
		}
	}
	.cloudy::after {
		content: '';
		width: 120px;
		height: 15px;
		position: absolute;
		bottom: -60px;
		left: 5px;
		background: #000;
		border-radius: 50%;
		opacity: 0.2;
		animation: cloudy-shadow 5s ease-in-out infinite;
		transform: scale(0.7);
	}

	@keyframes cloudy-shadow {
		50% {
			transform: translateY(20px) scale(1);
			opacity: 0.05;
		}
	}
}
.temperature:after {
	content: '°C';
}
.city-search {
	margin-bottom: 20px;
}
.city-list {
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	.city {
		padding: 10px 15px;
		background: #eee;
		text-align: center;
		border-radius: 3px;
		margin: 5px;
	}
	.city:hover,
	.active {
		background: $mainColor;
		color: #fff;
		opacity: 0.9;
		cursor: pointer;
	}
}
.tooltip-content {
	word-break: break-all;
}
</style>
