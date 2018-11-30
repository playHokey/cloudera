'use strict';

var serverUrl = SERVER_URL + 'api/content/login';
var app = new Vue({
	el: '#app',
	data: {
		email: '',
		password: '',
		checkValid: false,
		isWrongLogin: false,
		isEmailSend: false,
		isRemember: true,
	},
	computed: {
		// 计算属性的 getter
		isEmailEmpty: function isEmailEmpty() {
			return this.checkValid && this.email == '';
		},
		isEmailInvalid: function isEmailInvalid() {
			var regEmail = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
			return this.checkValid && !this.isEmailEmpty && !regEmail.test(this.email);
		},

		isPasswordEmpty: function isPasswordEmpty() {
			return this.checkValid && this.password == '';
		},
	},
	mounted: function mounted() {
		this.checkLogin();
	},

	methods: {
		checkLogin: function checkLogin() {
			if (sessionStorage.getItem('token') && sessionStorage.getItem('userType') == 1) {
				window.location.href = './companyList.html';
			}

			if (localStorage.getItem('email')) {
				this.email = localStorage.getItem('email');
			}
		},
		goLogin: function goLogin() {
			window.location.href = './login.html';
		},
		signIn: function signIn() {
			this.checkValid = true;
			if (!this.isEmailEmpty && !this.isEmailInvalid && !this.isPasswordEmpty) {
				if (this.isRemember) {
					localStorage.setItem('email', this.email);
				} else {
					localStorage.removeItem('email');
				}

				this.postToServer();
			}
		},
		postToServer: function postToServer() {
			var self = this;
			$.post(
				serverUrl,
				{
					password: self.password,
					username: self.email,
				},
				function(res) {
					if (res.status == 0) {
						self.isWrongLogin = true;
					} else if (res.status == 1) {
						self.isWrongLogin = false;
						sessionStorage.setItem('token', res.data.token);
						sessionStorage.setItem('username', self.email);
						sessionStorage.setItem('userType', res.data.role);
						if (res.data.role == 1) {
							window.location.href = './companyList.html';
						} else {
							window.location.href = './manage/NewsManage.html';
						}
					}
				}
			);
		},
	},
});
