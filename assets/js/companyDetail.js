'use strict';


var serverUrl = SERVER_URL + 'api/content/detail';
var map;



var app = new Vue({
    el: '#app',
    data: {
        username: sessionStorage.getItem("username"),
        isLoading: false,
        isFirst: true,
        name: '',
        address: '',
        reNo: '',
        phone: '',
        website: '',
        industry: '',
        status: '',
        leaderList: [],
        companySize: '',
        yearFounded: '',
        companyType: '',
        about: '',
        dataList: [],
        currentPage: 1,
        totalPage: 1,
        activityType: "1",
        leaderType: 2,
        total: 1
    },
    watch: {
        activityType: function activityType(cur, olv) {
            var _this = this;

            this.currentPage = 1;
            this.$nextTick(function () {
                if (!_this.isLoading) {
                    _this.getDetail();
                }
            });
        }
    },
    methods: {
        getQueryString: function getQueryString(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        },
        getDetail: function getDetail() {
            var self = this;
            var type = 'Technology News';
            self.isLoading = true;
            switch (self.activityType) {
                case '1':
                    type = 'Non Tech News';
                    break;
                case '2':
                    type = 'Technology News';
                    break;
                case '3':
                    type = 'Investment';
                    break;
                case '4':
                    type = 'Marketing events';
                    break;
                case '5':
                    type = 'Recruitment';
                    break;
            }

            $.ajax({
                beforeSend: function beforeSend(xhr) {
                    xhr.setRequestHeader("token", sessionStorage.getItem('token'));
                },
                url: serverUrl,
                type: "get",
                data: {'id': this.getQueryString("id"), 'page': this.currentPage, 'type': type},
                success: function success(res) {
                    if (res.status == 0) {
                        self.signOut();
                    } else {
                        if (self.isFirst && res.data && res.data.data.length > 0) {
                            var tmpData = res.data.data[0];
                            self.name = tmpData.account_name;
                            self.address = tmpData.office_addr;
                            self.reNo = tmpData.registration_no;
                            self.phone = tmpData.office_phone;
                            self.website = tmpData.website;
                            self.industry = tmpData.industry;
                            self.status = tmpData.status;
                            self.companySize = tmpData.company_size;
                            self.companyType = tmpData.company_type;
                            self.yearFounded = tmpData.year_founded;
                            self.about = tmpData.profile;

                            self.leaderList = res.data.structure;

                            self.setOrg();

                            map.setView({
                                center: new Microsoft.Maps.Location(tmpData.latitude, tmpData.longitude),
                                zoom: 16
                            });
                            map.entities.push(new Microsoft.Maps.Pushpin(map.getCenter(), null));
                            self.isFirst = false;
                        }


                        self.dataList = res.data.result.data;
                        self.totalPage = res.data.result.last_page;
                        self.total = res.data.result.total;
                    }
                    self.isLoading = false;
                },
                error: function error(res) {
                    self.signOut();
                    self.isLoading = false;
                }
            });
        },
        goDetail: function goDetail(url) {
            window.open(url);
        },
        setCPage: function setCPage(page) {
            this.currentPage = page;
            if (!this.isLoading) {
                this.getDetail();
            }
        },
        getDate(date,number){
            return new Date(date).toDateString().split(' ')[number];
        },
        showCondition: function showCondition(count) {
            if (this.currentPage == 1 || this.currentPage == 2) {
                if (count <= 5) return true; else return false;
            } else if (this.currentPage == this.totalPage || this.currentPage == this.totalPage - 1) {
                if (this.totalPage - count < 5) return true; else return false;
            } else {
                if (Math.abs(this.currentPage - count) <= 2) return true; else return false;
            }
        },
        changeLeader: function changeLeader(leader) {
            this.leaderType = leader;
        },
        changeAType: function changeAType(type) {
            this.activityType = type.toString();
        },
        signOut: function signOut() {
            sessionStorage.removeItem("username");
            sessionStorage.removeItem('getData');
            sessionStorage.removeItem('token');
            window.location.href = "./login.html";
        },
        setOrg: function setOrg() {
            var orgSource = {};

            for (var item in this.leaderList) {
                var tmpItem = {};
                tmpItem.name = this.leaderList[item].fullname;
                tmpItem.title = this.leaderList[item].Title;
                if (this.leaderList[item].Title && this.leaderList[item].department) {
                    tmpItem.department_title = this.leaderList[item].department + " | " + this.leaderList[item].Title;
                } else {
                    tmpItem.department_title = this.leaderList[item].department || this.leaderList[item].Title;
                }

                tmpItem.cid = this.leaderList[item].current_id;
                tmpItem.pid = this.leaderList[item].parentid;

                tmpItem.children = [];

                if (this.leaderList[item].level == 1) {
                    orgSource = tmpItem;
                }

                if (this.leaderList[item].level == 2) {
                    tmpItem.className = 'middle-level';
                    orgSource.children.push(tmpItem);
                }

                if (this.leaderList[item].level == 3) {
                    tmpItem.className = 'rd-dept';
                    for (var i in orgSource.children) {
                        if (orgSource.children[i].cid == tmpItem.pid) {
                            if (orgSource.children[i].children == null) {
                                orgSource.children[i].children = [];
                            }
                            orgSource.children[i].children.push(tmpItem);
                        }
                    }
                }
            }

            $('#chart-container').orgchart({
                'data': orgSource,
                'nodeTitle': 'name',
                'nodeContent': 'department_title',
                'depth': 2
            });
        }
    }
});

function loadMapScenario() {
    map = new Microsoft.Maps.Map(document.getElementById('map'), {});
    app.getDetail();
}