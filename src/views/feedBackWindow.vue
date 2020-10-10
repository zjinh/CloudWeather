<template>
	<div class="cloudSeries-feedback-win">
		<windowHeader :config="header" ref="windowHeader" />
		<div class="cloudSeries-feedback-main">
			<div class="app-version">
				<div class="logo">{{ this.$projectInfo.logoText }}</div>
				<span>ver: {{ version }}</span>
			</div>
			<div class="cd-feedback-main">
				<p>我们需要以下信息进行问题反馈</p>
				<input v-model="feedBackObject.title" placeholder="简单的描述" />
				<textarea v-model="feedBackObject.content" placeholder="遇到的问题，报错信息等" />
			</div>
			<div class="bottom">
				<p class="release">{{ this.$copyRight }}</p>
				<button :disabled="loading" @click="FeedBack">提交{{ loading ? '中' : '' }}</button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'feedBackWindow',
	data() {
		return {
			loading: false,
			FeedBackTitle: '',
			FeedBackContent: '',
			feedBackObject: {
				title: '',
				content: '',
			},
			header: {
				color: '#666',
				title: '',
				resize: false,
				mini: false,
			},
		};
	},
	computed: {
		version() {
			return this.$packageInfo.version;
		},
	},
	methods: {
		FeedBack() {
			if (!this.feedBackObject.title.length) {
				this.$Message.warning('请先简单的描述下问题');
				return;
			}
			if (!this.feedBackObject.content.length) {
				this.$Message.warning('请详细描述问题');
				return;
			}
			this.loading = true;
			this.$api.user.feedBack(
				{
					...this.feedBackObject,
					app: this.$projectInfo.logoText,
					version: this.version,
				},
				(rs) => {
					this.loading = false;
					if (rs.code === 0) {
						this.$Message.info({
							content: '感谢您的反馈，问题已被记录',
							onClose: () => {
								if (this.$isElectron) {
									this.$refs.windowHeader.close();
								} else {
									this.$parent.close();
								}
							},
						});
						this.feedBackObject = {
							title: '',
							content: '',
						};
					} else {
						this.$Message.error(rs.msg);
					}
				},
				() => {
					this.loading = false;
				}
			);
		},
	},
};
</script>

<style scoped lang="scss">
.cloudSeries-feedback-win {
	width: 100%;
	height: 100%;
	.cloudSeries-feedback-main {
		width: 100%;
		height: calc(100% - 50px);
		background: #fff;
		padding: 0 20px;
		position: relative;
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
		.bottom {
			width: 92%;
			position: absolute;
			bottom: 0;
			display: flex;
			align-items: center;
			justify-content: space-between;
			p {
				font-size: 12px;
				color: #333;
			}
			button {
				padding: 4px 10px;
				background: none;
				font-size: 12px;
				color: #333;
				overflow: hidden !important;
				-webkit-app-region: no-drag;
			}
			button:hover {
				background: rgba(0, 0, 0, 0.1);
			}
		}
	}
	.cd-feedback-main {
		height: calc(100% - 50px);
		background: #fff;
		p {
			font-size: 14px;
			color: #4f4f4f;
			margin-bottom: 10px;
		}
		input,
		textarea {
			width: 100%;
			-webkit-app-region: no-drag;
			height: 32px;
			border-radius: 3px;
			border: 1px solid #eee;
			padding: 0 5px;
			margin-bottom: 15px;
		}
		textarea {
			padding: 5px;
			height: 110px;
			resize: none;
		}
		input:focus,
		textarea:focus {
			border-color: #7c7cee;
			outline: 0;
			box-shadow: 0 0 0 2px rgba(91, 91, 234, 0.2);
		}
	}
}
</style>
