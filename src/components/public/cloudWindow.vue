<template>
	<div
		v-show="config.width && show"
		@mousedown="top"
		class="cloud-window-main"
		:style="{ background: this.config.transparent ? 'transparent' : '#fff' }"
		:class="showAnim"
		:id="'cloud_window' + id"
	>
		<div class="header" :style="{ background: !this.config.frame ? 'none' : this.config.background }" @dblclick="restore">
			<div class="left" v-if="this.config.frame">
				<img v-if="config.img" :src="config.img" draggable="false" alt="" />
				<span :style="{ color: this.config.color }">{{ config.title }}</span>
			</div>
			<div v-else></div>
			<div class="control">
				<button class="sf-icon-minus" :style="{ color: this.config.color }" @click.stop="mini" v-if="config.minimizable"></button>
				<button :class="buttonState" :style="{ color: this.config.color }" @click.stop="restore" v-if="config.maximizable"></button>
				<button class="sf-icon-times" :style="{ color: this.config.color }" @click.stop="close()"></button>
			</div>
		</div>
		<div class="container" :class="!this.config.frame ? 'frame' : ''"></div>
		<div v-if="config.resizable" v-show="state !== 'max'">
			<div class="drag control-y control-bar-left"></div>
			<div class="drag control-y control-bar-right"></div>
			<div class="drag control-x control-bar-top"></div>
			<div class="drag control-x control-bar-bottom"></div>

			<div class="drag control-block control-top-left"></div>
			<div class="drag control-block control-top-right"></div>
			<div class="drag control-block control-bottom-right"></div>
			<div class="drag control-block control-bottom-left"></div>
		</div>
	</div>
</template>

<script>
import Vue from 'vue';
export default {
	name: 'cloudWindow',
	data() {
		return {
			id: parseInt((Math.random() + 1) * Math.pow(10, 9)),
			resizeConfig: [
				{ fx1: true, fx2: false, fx3: false, fx4: true },
				{ fx1: false, fx2: false, fx3: false, fx4: true },
				{ fx1: false, fx2: true, fx3: true, fx4: false },
				{ fx1: false, fx2: false, fx3: true, fx4: false },
				{ fx1: true, fx2: true, fx3: false, fx4: false },
				{ fx1: false, fx2: true, fx3: false, fx4: false },
				{ fx1: false, fx2: false, fx3: false, fx4: false },
				{ fx1: true, fx2: false, fx3: false, fx4: false },
			],
			options: {
				width: 800,
				height: 600,
				minWidth: 400,
				minHeight: 300,
				img: '',
				title: 'cloudWindow',
				frame: true,
				minimizable: true,
				maximizable: true,
				resizable: true,
				alwaysOnTop: false,
				component: '',
				openAnim: 'bounceInDown',
				closeAnim: 'backOutUp',
				background: '#fff',
				color: '#333',
				transparent: false,
			},
			minWidth: 0,
			minHeight: 0,
			component: false,
			config: {},
			state: 'restore',
			win: false,
			show: true,
			oldPosition: {},
			showAnim: 'animated bounceInDown',
			closeData: '',
		};
	},
	beforeDestroy() {
		this.config.close && this.config.close(this.closeData);
		this.component && this.component.$destroy();
	},
	computed: {
		buttonState: function () {
			return this.state === 'restore' ? 'sf-icon-window-maximize' : 'sf-icon-window-restore';
		},
	},
	methods: {
		init(config) {
			if (config === 'close') {
				this.close();
				return this.id;
			}
			this.config = Object.assign(this.options, config);
			this.showAnim = 'animated ' + this.config.openAnim;
			this.$nextTick(() => {
				let win = document.getElementById('cloud_window' + this.id);
				this.win = win;
				let head = win.getElementsByClassName('header')[0];
				let container = win.getElementsByClassName('container')[0];
				if (this.config.resizable) {
					let drags = win.getElementsByClassName('drag');
					for (let i = 0; i < drags.length; i++) {
						let config = this.resizeConfig[i];
						this.resize(win, drags[i], config.fx1, config.fx2, config.fx3, config.fx4);
					}
				}
				this.minWidth = this.config.minWidth;
				this.minHeight = this.config.minHeight;
				this.win.style.width = this.config.width + 'px';
				this.win.style.height = this.config.height + 'px';
				if (this.config.x) {
					if (this.config.x < 0) {
						this.config.x = document.body.offsetWidth - Math.abs(this.config.x) - this.config.width;
					}
					this.win.style.left = this.config.x + 'px';
				} else {
					this.win.style.left = (document.body.offsetWidth - this.win.offsetWidth) / 2 + 'px';
				}
				if (this.config.y) {
					this.win.style.top = this.config.y + 'px';
				} else {
					this.win.style.top =
						((document.body.offsetHeight - this.win.offsetHeight) / 2 >= 0 ? (document.body.offsetHeight - this.win.offsetHeight) / 2 : '0') + 'px';
				}
				this.move(head, win);
				this.top();
				if (config.component && config.component.default) {
					let component = Vue.extend(config.component.default);
					this.component = new component().$mount();
					this.component.$parent = this;
					container.append(this.component.$el);
					this.config.callback && this.config.callback(this.component, this);
				}
			});
			return this.id;
		},
		resize(oParent, handle, isLeft, isTop, lockX, lockY) {
			handle.onmousedown = (event) => {
				event = event || window.event;
				let disX = event.clientX - handle.offsetLeft;
				let disY = event.clientY - handle.offsetTop;
				let iParentTop = oParent.offsetTop;
				let iParentLeft = oParent.offsetLeft;
				let iParentWidth = oParent.offsetWidth;
				let iParentHeight = oParent.offsetHeight;
				document.onmousemove = (event) => {
					event = event || window.event;
					let iL = event.clientX - disX;
					let iT = (event.clientY < 40 ? 40 : event.clientY) - disY;
					let maxW = document.documentElement.clientWidth - oParent.offsetLeft - 4;
					let maxH = document.documentElement.clientHeight - oParent.offsetTop - 4;
					let iW = isLeft ? iParentWidth - iL : handle.offsetWidth + iL;
					let iH = isTop ? iParentHeight - iT : handle.offsetHeight + iT;
					isLeft && (oParent.style.left = iParentLeft + iL + 'px');
					isTop && (oParent.style.top = iParentTop + iT + 'px');
					iW < this.minWidth && (iW = this.minWidth);
					iW > maxW && (iW = maxW);
					lockX || (oParent.style.width = iW + 'px');
					iH < this.minHeight && (iH = this.minHeight);
					iH > maxH && (iH = maxH);
					lockY || (oParent.style.height = iH + 'px');
					if ((isLeft && iW === this.minWidth) || (isTop && iH === this.minHeight)) document.onmouseup();
					return false;
				};
				document.onmouseup = function () {
					document.onmousemove = null;
					document.onmouseup = null;
				};
				return false;
			};
		},
		move(handle, oDrag) {
			let disX = 0;
			handle = handle || oDrag;
			handle.onmousedown = (event) => {
				event = event || window.event;
				disX = event.clientX - oDrag.offsetLeft;
				let disY = event.clientY - oDrag.offsetTop;
				document.onmousemove = (event) => {
					event = event || window.event;
					let node = oDrag.parentNode;
					let iL = event.clientX - disX;
					let iT = event.clientY - disY;
					if (this.state === 'restore') {
						if (iL > node.clientWidth - oDrag.offsetWidth / 4) {
							iL = node.clientWidth - oDrag.offsetWidth / 4;
						} else if (iL < 0 - (oDrag.offsetWidth / 4) * 3) {
							iL = 0 - (oDrag.offsetWidth / 4) * 3;
						}
						if (iT < 40) {
							iT = 40;
						} else if (iT > node.clientHeight - handle.offsetHeight) {
							iT = node.clientHeight - handle.offsetHeight;
						}
						oDrag.style.left = iL + 'px';
						oDrag.style.top = iT + 'px';
						return false;
					}
				};
				document.onmouseup = function () {
					document.onmousemove = null;
					document.onmouseup = null;
				};
				return false;
			};
		},
		top() {
			let wins = document.getElementsByClassName('cloud-window-main');
			for (let i = 0; i < wins.length; i++) {
				wins[i].style.zIndex = 1;
			}
			this.win.style.zIndex = 99;
			this.show = true;
		},
		close(data) {
			this.showAnim = 'animated ' + this.config.closeAnim;
			let a = setTimeout(() => {
				if (this.$el && this.$el.parentNode) {
					this.$el.parentNode.removeChild(this.$el);
				}
				// 调用组件的$destroy方法进行组件销毁
				clearTimeout(a);
				this.closeData = data;
				this.$destroy();
			}, 500);
		},
		restore() {
			if (!this.config.maximizable) {
				return false;
			}
			if (this.state === 'restore') {
				this.state = 'max';
				let { width, height, top, left } = JSON.handle(this.win.style);
				this.oldPosition = { width, height, top, left };
				this.win.style.width = this.win.style.height = '100%';
				this.win.style.top = '40px';
				this.win.style.left = '0';
			} else {
				this.state = 'restore';
				for (let key in this.oldPosition) {
					if (this.oldPosition.hasOwnProperty(key)) {
						this.win.style[key] = this.oldPosition[key];
					}
				}
			}
		},
		mini() {
			this.show = false;
		},
		active() {
			this.top();
			this.showAnim = 'animated headShake';
			let a = setTimeout(() => {
				this.showAnim = '';
				clearTimeout(a);
			}, 550);
			return false;
		},
	},
};
</script>

<style scoped lang="scss">
.cloud-window-main {
	width: 800px;
	height: 600px;
	position: absolute;
	left: 100px;
	top: 100px;
	background: #fff;
	box-shadow: rgba(0, 0, 0, 0.3) 1px 1px 24px;
	z-index: 2;
	.header {
		width: 100%;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;
		z-index: 1;
		.left {
			display: flex;
			align-items: center;
			padding-left: 5px;
			img {
				width: 20px;
				height: 20px;
				margin-right: 5px;
			}
			span {
				font-size: 14px;
				color: #666;
			}
		}
		.control {
			display: flex;
			align-items: center;
			button {
				width: 45px;
				height: 30px;
				font-size: 14px;
				background: none;
			}
			button:hover {
				background: #e5e5e5;
			}
			.sf-icon-times {
				font-size: 16px;
				line-height: 0;
			}
			.sf-icon-times:hover {
				background: #e81123;
				color: #fff !important;
			}
		}
	}
	.container {
		width: 100%;
		height: calc(100% - 30px);
		position: relative;
		overflow: hidden;
	}
	.frame {
		height: 100%;
		margin-top: -30px;
		z-index: 0;
	}
	.control-x {
		width: 100%;
		height: 6px;
		z-index: 2;
		cursor: n-resize;
	}
	.control-y {
		width: 6px;
		height: 100%;
		z-index: 2;
		cursor: w-resize;
	}
	.control-block {
		width: 6px;
		height: 6px;
		z-index: 3;
	}
	.control-bar-top,
	.control-bar-left,
	.control-top-left {
		position: absolute;
		left: 0;
		top: 0;
	}
	.control-bar-bottom,
	.control-bottom-left {
		position: absolute;
		left: 0;
		bottom: 0;
	}
	.control-bar-right,
	.control-top-right {
		position: absolute;
		right: 0;
		top: 0;
	}
	.control-bottom-right {
		position: absolute;
		right: 0;
		bottom: 0;
	}
	.control-top-left,
	.control-bottom-right {
		cursor: se-resize;
	}
	.control-top-right,
	.control-bottom-left {
		cursor: sw-resize;
	}
}
</style>
