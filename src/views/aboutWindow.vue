<template>
	<div class="cloudSeries-about-win">
		<windowHeader :config="header" />
		<div class="cloudSeries-about-main">
			<div class="app-version">
				<div class="logo">{{ this.$projectInfo.logoText }}</div>
				<span>ver:&nbsp;{{ version }}</span>
				<span style="color: #e83c3c">{{ NewVersion }}</span>
			</div>
			<div class="app-icon" :style="{ background: 'url(' + productLogo + ')' }"></div>
			<div class="engine-info">
				<h4>核心版本&nbsp; {{ electronVersion || version }}</h4>
				<ul>
					<li v-for="(item, index) in InfoList" :key="index">{{ index }}<span />{{ item }}</li>
				</ul>
			</div>
			<div class="update-info">
				<p class="tips">{{ message }}</p>
				<div class="process">
					<Progress :percent="percent" v-show="percent > 0" />
				</div>
			</div>
			<img src="../assets/common/svg/about-footer.svg" class="footer" alt="" draggable="false" />
			<div class="bottom">
				<p>{{ this.$copyRight }}</p>
				<div>
					<button @click="OpenLink">GitHub</button>
					<button @click="OpenLink2">博客</button>
					<button @click="checkUpdate" :disabled="percent > 0 && percent !== 100" v-if="$isElectron">
						{{ !loading ? CheckText : ProcessText }}
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
const projectInfo = require('../common/projectInfo.js').default;
const projectName = projectInfo.projectName;
export default {
	name: 'aboutWindow',
	data() {
		return {
			loading: false,
			CheckText: '检查更新',
			ProcessText: '正在检查',
			NewVersion: '',
			message: '',
			percent: 0,
			header: {
				color: '#666',
				title: '',
				resize: false,
				mini: false,
				close: (win) => {
					if (this.$isElectron) {
						this.$ipc.send('system', 'about-close');
					}
					win.close();
				},
			},
			electronVersion: ' ' + process && process.versions ? process.versions.electron : false,
			InfoList: {
				Author: 'ZJINH',
				Email: '2665229856@qq.com',
				Platform: process.platform,
				Arch: process.arch,
				Vue: require('vue/package.json').version,
			},
		};
	},
	computed: {
		version() {
			return this.$packageInfo.version;
		},
		productName() {
			if (this.$isElectron) {
				return this.$packageInfo.name;
			} else {
				return document.title;
			}
		},
		productLogo() {
			return projectInfo.logo;
		},
	},
	created() {
		if (this.$isElectron) {
			this.bind();
			this.$set(this.InfoList, 'Node', process.versions.node);
		}
	},
	watch: {
		percent: {
			handler() {
				this.ProcessText = '正在下载';
			},
			deep: true,
		},
	},
	methods: {
		bind() {
			this.$ipc.on('check-for-update', (event, message) => {
				this.message = message;
				if (message === '检查更新出错, 请联系开发人员' || message === '现在使用的就是最新版本，不用更新') {
					this.loading = false;
				}
				if (message === '最新版本已下载，点击安装进行更新') {
					this.CheckText = '安装';
					this.loading = false;
					this.percent = 100;
					this.checkUpdate = () => {
						this.$ipc.send('system', 'update');
					};
				}
			});
			this.$ipc.on('update-down-success', (event, message) => {
				this.NewVersion = 'new ' + message.version;
			});
			this.$ipc.on('download-progress', (event, message) => {
				this.$nextTick(() => {
					this.percent = parseInt(message.percent);
					if (this.percent === 100) {
						this.CheckText = '安装';
						this.loading = false;
						this.checkUpdate = () => {
							this.$ipc.send('system', 'update');
						};
					}
				});
			});
		},
		checkUpdate() {
			this.$ipc.send('system', 'check-for-update', this.$api.public.server('updateUrl') + projectName);
			this.loading = true;
		},
		OpenLink() {
			if (this.$isElectron) {
				this.$electron.shell.openExternal('https://github.com/zjinh/');
			} else {
				window.open('https://github.com/zjinh/');
			}
		},
		OpenLink2() {
			if (this.$isElectron) {
				this.$electron.shell.openExternal('https://blog.zjinh.cn/');
			} else {
				window.open('https://blog.zjinh.cn/');
			}
		},
	},
};
</script>

<style scoped lang="scss">
/*关于信息窗口*/
.cloudSeries-about-win {
	width: 100%;
	height: 100%;
	-webkit-app-region: drag;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	.cloudSeries-about-main {
		width: 100%;
		height: calc(100% - 30px);
		background: #fff;
		padding: 0 30px 20px;
		position: absolute;
		top: 30px;
		.app-version {
			display: flex;
			align-items: baseline;
			.logo {
				height: 45px;
				vertical-align: bottom;
				font-size: 30px;
				color: #4c4c4c;
				font-weight: bold;
				background-size: contain;
				background-repeat: no-repeat;
				font-family: 'zk-font';
			}
			span {
				vertical-align: bottom;
				font-size: 14px;
				margin: 0 10px;
				color: #4c4c4c;
			}
		}
		.app-icon {
			position: absolute;
			top: 10px;
			right: 40px;
			width: 80px;
			height: 80px;
			border-radius: 100%;
			box-shadow: 0 0 10px 0 #6e6e6ecc;
			overflow: hidden;
			background-size: 130% !important;
			background-position: center !important;
			background-repeat: no-repeat !important;
		}
		.engine-info {
			margin: 10px 20% 0 0;
			h4 {
				font-size: 16px;
				font-weight: 400;
				color: #4c4c4c;
				padding: 15px 0;
			}
			ul {
				font-size: 12px;
				color: #bdbdbd;
				list-style: none;
				padding: 0;
				line-height: 20px;
				display: flex;
				flex-wrap: wrap;
				li {
					width: 50%;
					span {
						padding: 5px;
					}
				}
			}
		}
		.update-info {
			width: 100%;
			margin-top: 10px;
			position: relative;
			z-index: 1;
			.tips {
				font-size: 14px;
				font-weight: 400;
				color: #4f4f4f;
			}
		}
		.footer {
			width: 100%;
			position: absolute;
			left: 0;
			bottom: -20px;
		}
		.bottom {
			width: calc(100% - 60px);
			position: absolute;
			bottom: 15px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			p {
				font-size: 12px;
				color: #fff;
			}
			button {
				padding: 4px;
				background: none;
				font-size: 12px;
				color: #fff;
				margin-left: 10px;
				overflow: hidden !important;
				-webkit-app-region: no-drag;
			}
			button:hover {
				background: rgba(255, 255, 255, 0.2);
			}
		}
	}
}
</style>
