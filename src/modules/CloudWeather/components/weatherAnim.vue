<template>
	<div class="weather-anim">
		<img :src="src" draggable="false" />
	</div>
</template>

<script>
export default {
	name: 'weatherAnim',
	data() {
		return {
			animConfig: {
				thunder: {
					max: 12,
					position: 'center',
					speed: 120,
				},
			},
			src: require('../assets/anim/cloud/cloud0.png'),
		};
	},
	mounted() {
		let max = 5;
		let count = 0;
		let a = setInterval(() => {
			if (count <= max) {
				count++;
			} else {
				count = 0;
				clearInterval(a);
			}
			this.src = require('../assets/anim/cloud/cloud' + count + '.png');
		}, 100);
	},
};
</script>

<style scoped lang="scss">
.weather-anim {
	width: 100%;
	height: 100%;
	position: absolute;
	left: 0;
	top: 0;
	z-index: 0;
	text-align: center;
}
.drop {
	position: absolute;
	bottom: 100%;
	width: 15px;
	height: 120px;
	pointer-events: none;
	animation: drop 0.5s linear infinite;
}

@keyframes drop {
	0% {
		transform: translateY(0vh);
	}
	75% {
		transform: translateY(90vh);
	}
	100% {
		transform: translateY(90vh);
	}
}
</style>
