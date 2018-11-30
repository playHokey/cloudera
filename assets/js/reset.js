'use strict';

var serverUrl1 = SERVER_URL + 'api/content/email';
var serverUrl2 = SERVER_URL + 'api/content/check';
var serverUrl3 = SERVER_URL + 'api/content/reset';
var app = new Vue({
    el: '#app',
    data: {
        email: '',
        code: '',
        password: '',
        re_password: '',
        checkValid: false,
        isWrongEmail: false,
        isCodeRight: false,
        isEmailSend: false,
        isCheckSend: false
    },
    computed: {
        // 计算属性的 getter
        isEmailEmpty: function isEmailEmpty() {
            return this.checkValid && this.email == '';
        },
        isEmailInvalid: function isEmailInvalid() {
            var regEmail = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
            return this.checkValid && !this.isEmailEmpty && !regEmail.test(this.email);
        }
    },
    mounted: function mounted() {
        this.checkLogin();
    },

    methods: {
        checkLogin: function checkLogin() {
            if (sessionStorage.getItem("token")) {
                window.location.href = "./companyList.html";
            }
            if (localStorage.getItem("email")) {
                this.email = localStorage.getItem("email");
            }
        },
        goLogin: function goLogin() {
            window.location.href = "./login.html";
        },
        checkCode: function checkCode() {
            var self = this;
            $.post(serverUrl2, { email: this.email, code: this.code }, function (res) {
                self.isCheckSend = true;
                if (res.status == 1) {
                    self.isCodeRight = true;
                } else {
                    self.isCodeRight = false;
                }
            });
        },
        reset: function reset() {
            var self = this;
            self.checkValid = true;
            if (self.password != '' && self.re_password != '' && self.re_password == self.password) {
                $.post(serverUrl3, { email: self.email, password: self.password }, function (res) {
                    if (res.status == 1) {
                        self.goLogin();
                    }
                });
                self.checkValid = false;
            }
        },
        sendEmail: function sendEmail() {
            var self = this;
            self.checkValid = true;
            if (!this.isEmailEmpty && !this.isEmailInvalid) {
                $.post(serverUrl1, { email: this.email }, function (res) {
                    if (res.status == 0) {
                        self.isWrongEmail = true;
                    } else if (res.status == 1) {
                        self.isWrongEmail = false;
                        self.isEmailSend = true;
                    }
                    self.checkValid = false;
                });
            }
        }
    }
});