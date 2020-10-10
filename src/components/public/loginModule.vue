<template>
	<div class="cloud-login-module">
		<p class="title">{{ tipsText[0] }}</p>
		<p class="sec-title">{{ tipsText[1] }}</p>
		<template v-if="nowType === 'login'">
			<loginInput :config="userNameConfig" v-model="loginModal.username" @enter="userAction"></loginInput>
			<loginInput :config="passwordConfig" v-model="loginModal.password" @enter="userAction"></loginInput>
			<div class="other-option">
				<span ripple="">
					<!--					<Checkbox v-model="RemberPass" disabled>记住我</Checkbox>-->
				</span>
				<span ripple="" @click="switchLogin('forget')">忘记密码？</span>
			</div>
		</template>
		<template v-if="nowType === 'register'">
			<loginInput :config="registerUserNameConfig" v-model="registerModal.name" @enter="userAction"></loginInput>
			<loginInput :config="emailConfig" v-model="registerModal.email" @enter="userAction"></loginInput>
			<loginInput :config="passwordConfig" v-model="registerModal.password" @enter="userAction"></loginInput>
			<loginInput :config="verifyCodeConfig" ref="registerCode" v-model="registerModal.code" @enter="userAction"></loginInput>
		</template>
		<template v-if="nowType === 'forget'">
			<loginInput :config="registerUserNameConfig" v-model="forgetModal.name" @enter="userAction"></loginInput>
			<loginInput :config="emailConfig" v-model="forgetModal.email" @enter="userAction"></loginInput>
			<loginInput :config="verifyCodeConfig" ref="forgetCode" v-model="forgetModal.code" @enter="userAction"></loginInput>
			<div class="other-option">填写以上信息开始吧</div>
		</template>
		<template v-if="nowType === 'verify'">
			<loginInput :config="registerUserNameConfig" v-model="verifyName" disabled="disabled" @enter="userAction"></loginInput>
			<loginInput :config="verifyConfig" v-model="verifyModal.verifyCode" @enter="userAction"></loginInput>
			<loginInput :config="verifyCodeConfig" ref="verifyCode" v-model="verifyModal.code" @enter="userAction"></loginInput>
			<div class="other-option">
				<span ripple="" @click="resend">{{ reSendText }}</span>
				<span ripple="" @click="changeErrorEmail()">邮箱有误</span>
			</div>
		</template>
		<div class="button-area">
			<button class="login-button" :disabled="lockSwitch" @click="userAction">{{ tipsText[2] }}{{ lockSwitch ? '中' : '' }}</button>
		</div>
		<div class="other-login" v-if="nowType === 'login'">
			<label>其他登录</label>
			<ul>
				<li class="sf-icon-wechat" ripple><span>&nbsp;&nbsp;微信</span></li>
				<div />
				<li class="sf-icon-qq" ripple><span>&nbsp;&nbsp;QQ</span></li>
			</ul>
		</div>
		<div class="login-tips">
			<p>
				{{ tipsText[3] }}&nbsp;<span @click="switchLogin(nowType !== 'login' ? 'login' : 'register')">{{ tipsText[4] }}</span>
			</p>
		</div>
	</div>
</template>

<script>
import loginInput from '../loginInput';
export default {
	name: 'loginModule',
	components: {
		loginInput,
	},
	data() {
		return {
			nowType: 'login',
			tipsTexts: {
				login: ['欢迎', '请登录后继续', '登录', '使用邮箱', '创建一个新账号'],
				register: ['开始', '创建一个新用户', '创建', '已有账号', '前往登录'],
				forget: ['帮助', '找回您的账号', '找回', '没有问题了', '前往登录'],
				verify: ['准备', '验证您的邮箱', '验证', '账号已验证', '前往登录'],
			},
			userNameConfig: {
				icon: 'user-alt',
				desp: '用户名/手机号/CLOUDID',
			},
			registerUserNameConfig: {
				icon: 'user-alt',
				desp: '用户名',
			},
			emailConfig: {
				icon: 'envelope',
				desp: '邮箱',
			},
			passwordConfig: {
				icon: 'lock-alt',
				type: 'password',
				desp: '密码',
			},
			verifyCodeConfig: {
				type: 'verify',
				icon: 'keyboard',
				desp: '验证码',
			},
			verifyConfig: {
				icon: 'keyboard',
				desp: '邮箱验证码',
			},
			lockSwitch: false,
			loginModal: {
				username: '',
				password: '',
			},
			registerModal: {
				name: '',
				email: '',
				password: '',
				code: '',
			},
			forgetModal: {
				name: '',
				email: '',
				code: '',
			},
			verifyName: '',
			verifyModal: {
				verifyCode: '',
				code: '',
			},
			lockResend: false,
			reSendText: '重新发送',
		};
	},
	computed: {
		tipsText: function () {
			return this.tipsTexts[this.nowType];
		},
	},
	mounted() {
		if (!this.$isElectron) {
			this.$cloudWindow('close').closeAll();
		}
		this.initVerify();
		if (localStorage.getItem('reSendTime')) {
			this.startResendCount();
		}
	},
	methods: {
		initVerify() {
			let id = this.$route.params.id;
			let name = this.$route.params.name;
			if (id) {
				this.verifyModal.id = id;
				this.verifyName = name;
				this.nowType = 'verify';
			}
		},
		switchLogin(type) {
			if (this.lockSwitch) {
				return;
			}
			if (type === 'forget') {
				this.nowType = 'forget';
				return;
			}
			this.nowType = this.nowType === 'login' ? 'register' : 'login';
		},
		userAction() {
			this.$debounce(() => {
				switch (this.nowType) {
					case 'login':
						if (!this.loginModal.username || this.loginModal.username.length === 0) {
							this.$Message.warning('用户名/手机号/账户不能为空');
							return;
						}
						if (!this.loginModal.password || this.loginModal.password.length === 0) {
							this.$Message.warning('密码不能为空');
							return;
						}
						this.actionPost('login', this.loginModal);
						break;
					case 'register':
						if (!this.registerModal.name || this.registerModal.name.length === 0) {
							this.$Message.warning('用户名不能为空');
							return;
						}
						if (!this.registerModal.email || this.registerModal.email.length === 0) {
							this.$Message.warning('邮箱不能为空');
							return;
						}
						if (!this.registerModal.password || this.registerModal.password.length === 0) {
							this.$Message.warning('密码不能为空');
							return;
						}
						if (!this.registerModal.code || this.registerModal.code.length === 0) {
							this.$Message.warning('验证码不能为空');
							return;
						}
						this.actionPost('register', this.registerModal);
						break;
					case 'forget':
						if (!this.forgetModal.name || this.forgetModal.name.length === 0) {
							this.$Message.warning('用户名不能为空');
							return;
						}
						if (!this.forgetModal.email || this.forgetModal.email.length === 0) {
							this.$Message.warning('邮箱不能为空');
							return;
						}
						if (!this.forgetModal.code || this.forgetModal.code.length === 0) {
							this.$Message.warning('验证码不能为空');
							return;
						}
						this.actionPost('forget', this.forgetModal);
						break;
					case 'verify':
						if (!this.verifyModal.id || this.verifyModal.id.length === 0) {
							this.$Message.warning('缺少关键参数');
							return;
						}
						if (!this.verifyModal.verifyCode || this.verifyModal.verifyCode.length === 0) {
							this.$Message.warning('邮箱验证码不能为空');
							return;
						}
						if (!this.verifyModal.code || this.verifyModal.code.length === 0) {
							this.$Message.warning('验证码不能为空');
							return;
						}
						this.actionPost('verify', this.verifyModal);
						break;
				}
			}, 500);
		},
		actionPost(type, data) {
			this.lockSwitch = true;
			this.$api.user[type](
				data,
				(rs) => {
					this.lockSwitch = false;
					if (rs.code === 0) {
						this.$Message.success(rs.msg);
						if (type === 'login') {
							this.$emit('login', rs);
						} else if (type === 'register') {
							this.$router.replace('/verify/' + rs.data.id + '/' + rs.data.name);
							this.initVerify();
						} else if (type === 'verify') {
							this.$router.replace('/login');
							this.verifyModal = {
								verifyCode: '',
								code: '',
							};
							this.switchLogin();
						} else if (type === 'forget') {
							this.forgetModal = {
								name: '',
								email: '',
								code: '',
							};
							this.switchLogin();
						} else {
							this.switchLogin();
						}
					} else {
						this.$Message.error(rs.msg);
						this.lockSwitch = false;
						if (rs.code === 2) {
							this.$refs[type + 'Code'].reload();
							this[type + 'Modal'].code = '';
						} else if (rs.code === 3) {
							this.$router.replace('/verify/' + rs.data.id + '/' + rs.data.name);
							this.initVerify();
						}
					}
				},
				() => {
					this.lockSwitch = false;
				}
			);
		},
		startResendCount() {
			let time = 120;
			this.lockResend = true;
			let timer = setInterval(() => {
				time--;
				localStorage.reSendTime = time;
				this.reSendText = time + 's后重发';
				this.lockResend = true;
				if (time === 0) {
					clearInterval(timer);
					this.reSendText = '重新发送';
					this.lockResend = false;
					localStorage.removeItem('reSendTime');
				}
			}, 1000);
		},
		resend() {
			if (this.lockResend) {
				return false;
			}
			this.$api.user.resend(
				{
					id: this.$route.params.id,
					name: this.$route.params.name,
					type: 'register',
				},
				(rs) => {
					if (rs.code === 0) {
						this.$Message.success(rs.msg);
						this.startResendCount();
					} else {
						this.$Message.error(rs.msg);
					}
				}
			);
		},
		changeErrorEmail(pass, email) {
			this.$inputConfirm({
				tips: '输入密码以继续',
				title: '邮箱有误',
				inputPattern: /\S/,
				inputErrorMessage: '密码不能为空',
				value: pass || '',
				callback: (password) => {
					this.$inputConfirm({
						tips: '邮箱有误',
						title: '修改邮箱',
						inputPattern: /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/,
						inputErrorMessage: '邮箱不正确',
						value: email || '',
						callback: (value) => {
							this.$api.user.errorEmail(
								{
									id: this.verifyModal.id,
									password: password,
									email: value,
								},
								(rs) => {
									this.$Message[rs.code === 0 ? 'success' : 'error'](rs.msg);
									if (rs.code !== 3000 && rs.code !== 0) {
										this.changeErrorEmail(password, email);
									}
								}
							);
						},
					});
				},
			});
		},
	},
};
</script>

<style scoped lang="scss">
.cloud-login-module {
	width: 100%;
	min-width: 250px;
	height: 100%;
	.title {
		color: $mainColor;
		font-size: 25px;
		font-weight: lighter;
	}
	.sec-title {
		margin-bottom: 40px;
	}
	.other-option {
		width: 100%;
		color: #7b7b7b;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 15px;
		padding: 10px 5px;
		font-size: 12px;
		span:hover {
			color: $mainColor;
			opacity: 0.9;
			cursor: pointer;
		}
	}
	.button-area {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		button {
			width: 150px;
			height: 40px;
			border-radius: 100px;
			color: #fff;
			background: #4f93f4;
			background: -webkit-linear-gradient(90deg, #600fff, #4f93f4, #600fff, #81bffa, #600fff, #4f93f4, #600fff, #600fff);
			background: -o-linear-gradient(90deg, #600fff, #4f93f4, #600fff, #81bffa, #600fff, #4f93f4, #600fff, #600fff);
			background: -moz-linear-gradient(90deg, #600fff, #4f93f4, #600fff, #81bffa, #600fff, #4f93f4, #600fff, #600fff);
			background: linear-gradient(90deg, #600fff, #4f93f4, #600fff, #81bffa, #600fff, #4f93f4, #600fff, #600fff);
			-webkit-transition: background 0.1s ease-in-out;
			-moz-transition: background 0.1s ease-in-out;
			-o-transition: background 0.1s ease-in-out;
			transition: background 0.1s ease-in-out;
			box-shadow: 0 3px 10px #7c7cee;
			background-size: 400%;
			background-position: -280%, 50%;
			margin: 30px auto;
		}
		button[disabled] {
			animation: animate_bg 5s infinite;
		}
		@keyframes animate_bg {
			0%,
			100% {
				background-position: 50%, 50%;
			}

			50% {
				background-position: -100%, 50%;
			}
		}
	}
	.other-login {
		width: 100%;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		label {
			font-size: 12px;
			color: #b8b7b7;
		}
		ul {
			height: 35px;
			margin-top: 5px;
			display: flex;
			align-items: center;
			* {
				height: 35px;
				line-height: 35px;
			}
			li {
				width: 124px;
				cursor: pointer;
				font-size: 14px;
				color: #3d4f4f;
				span {
					color: #6e6e6e;
				}
			}
			div {
				width: 1px;
				background: #eee;
			}
		}
	}
	.login-tips {
		margin-top: 30px;
		text-align: center;
		font-size: 12px;
		p {
			color: #b8b7b7;
		}
		span {
			color: $mainColor;
			cursor: pointer;
		}
	}
}
</style>
