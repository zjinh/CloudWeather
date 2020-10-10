<template>
	<div :class="config.disabled || inputData ? 'input-container focus' : focusState">
		<span :class="'sf-icon-' + config.icon"></span>
		<input
			:id="id"
			:type="config.type === 'verify' ? 'text' : config.type || 'text'"
			v-model="inputData"
			autocomplete="off"
			spellcheck="false"
			@focus="focusState = 'input-container focus'"
			@blur="blur"
			@input="update"
			@keyup.enter="goEnter"
			:disabled="disabled ? disabled : false"
		/>
		<label :for="id">{{ config.desp }}</label>
		<Tooltip v-if="config.type === 'verify'" content="点击刷新" placement="bottom-end" :transfer="true">
			<img draggable="false" :src="url" @click="reload" alt="" />
		</Tooltip>
	</div>
</template>

<script>
export default {
	name: 'l-input',
	data() {
		return {
			id: 'input-' + Math.random(),
			focusState: 'input-container',
			url: this.$api.public.verifyCode(),
			inputData: '',
			timeFlag: false,
		};
	},
	model: {
		prop: 'propValue',
		event: 'input',
	},
	props: {
		config: {
			type: Object,
		},
		propValue: {
			type: [String, Number, undefined],
			default: function () {
				return '';
			},
		},
		disabled: {
			type: [Boolean, String],
			default: function () {
				return false;
			},
		},
	},
	mounted() {
		this.inputData = this.propValue;
	},
	watch: {
		propValue: function () {
			this.inputData = this.propValue;
		},
	},
	methods: {
		update() {
			this.$emit('input', this.inputData);
		},
		goEnter() {
			this.$emit('enter');
		},
		blur() {
			if (this.config.value) {
				this.focusState = 'input-container focus';
			} else {
				this.focusState = 'input-container';
			}
		},
		reload() {
			if (this.timeFlag) {
				this.$Message.info(this.timeFlag + 's后可重新获取');
				return;
			}
			this.url = this.$api.public.verifyCode();
			this.$Message.info('验证码已刷新,2分钟内有效');
			this.timeFlag = 10;
			let a = setInterval(() => {
				this.timeFlag--;
				if (this.timeFlag === 0) {
					clearInterval(a);
				}
			}, 1000);
		},
	},
};
</script>

<style scoped lang="scss">
.input-container {
	width: 100%;
	height: 40px;
	position: relative;
	border-bottom: 1px solid #eee;
	margin-top: 20px;
	overflow: unset !important;
	span,
	label {
		color: #b8b7b7;
	}
	span {
		float: left;
		width: 30px;
		height: 40px;
		position: absolute;
		text-align: center;
		line-height: 40px;
		font-size: 14px;
	}
	label {
		position: absolute;
		left: 35px;
		font-size: 14px;
		top: 10px;
		cursor: text;
		-webkit-transition: all 0.35s;
		-moz-transition: all 0.35s;
		-o-transition: all 0.35s;
	}
	input {
		width: 100%;
		height: 32px;
		padding-left: 35px;
		margin-top: 4px;
		background: none;
	}
	input[disabled='disabled'] {
		cursor: not-allowed;
	}
	.ivu-tooltip {
		height: 40px;
		position: absolute;
		top: 0;
		right: 0;
	}
	img {
		width: 100%;
		height: 100%;
		cursor: pointer;
	}
}
.focus label {
	top: -10px !important;
	color: #5b5bea !important;
	font-size: 12px !important;
}
</style>
