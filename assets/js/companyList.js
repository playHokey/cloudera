'use strict';

var serverUrl = SERVER_URL + 'api/content/search';
var app = new Vue({
    el: '#app',
    data: {
        username: sessionStorage.getItem("username"),
        isLoading: false,
        title: 'All companies',
        resultList: [],
        total: 0,
        totalPage: 0,
        currentPage: 1,
        searchTerm: "",
        countryArray: [],
        getData: ""
    },
    mounted: function mounted() {
        if (sessionStorage.getItem("getData")) {
            var tmpData = JSON.parse(sessionStorage.getItem("getData"));
            this.getData = tmpData;
            if (tmpData.page) this.currentPage = tmpData.page;
            if (tmpData.content) this.searchTerm = tmpData.content;
            if (tmpData.county) this.countryArray = tmpData.county;
        } else {
            this.getData = {
                'page': this.currentPage
            };
        }

        this.getResultList();
    },

    methods: {
        updateResult: function updateResult() {
            this.currentPage = 1;
            this.getResultList();
        },
        getResultList: function getResultList() {
            var self = this;
            self.isLoading = true;

            self.getData.page = self.currentPage;
            if (self.searchTerm) {
                self.getData.content = self.searchTerm;
            } else {
                self.getData.content = null;
            }

            if (self.countryArray.length > 0) {
                self.getData.county = self.countryArray;
            } else {
                self.getData.county = [];
            }
            $.ajax({
                beforeSend: function beforeSend(xhr) {
                    xhr.setRequestHeader("token", sessionStorage.getItem('token'));
                },
                url: serverUrl,
                type: "get",
                data: this.getData,
                success: function success(res) {
                    if (res.status == 0) {
                        self.signOut();
                    } else {
                        if (res.data) {
                            self.resultList = res.data.data;
                            self.total = res.data.total;
                            self.totalPage = res.data.last_page;
                        } else {
                            alert("Server error");
                        }
                        self.isLoading = false;
                    }
                },
                error: function error(res) {
                    self.signOut();
                }
            });
        },
        setCPage: function setCPage(page) {
            this.currentPage = page;
            this.getResultList();
        },
        showCondition: function showCondition(count) {
            if (this.currentPage == 1 || this.currentPage == 2) {
                if (count <= 5) return true;
                else return false;
            } else if (this.currentPage == this.totalPage || this.currentPage == this.totalPage - 1) {
                if (this.totalPage - count < 5) return true;
                else return false;
            } else {
                if (Math.abs(this.currentPage - count) <= 2) return true;
                else return false;
            }
        },
        goDetail: function goDetail(id) {
            var self = this;
            sessionStorage.setItem("getData", JSON.stringify(self.getData));
            window.location.href = './companyDetail.html?id=' + id;
        },
        signOut: function signOut() {
            sessionStorage.removeItem("username");
            sessionStorage.removeItem('getData');
            sessionStorage.removeItem('token');
            window.location.href = "./login.html";
        }
    }
});