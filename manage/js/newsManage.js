'use strict';

$(function() {
	$('#showModal').click(function() {
		$('#ModalEdit').modal('hide');
		$('#confirmDelete').modal('show');
	});
	$('#showAdd').click(function() {
		$('#Modaladd').modal('show');
	});
	$('#showConfirm').click(function() {
		$('#modalNewsAdd').modal('hide');
		$('#confirmAdd').modal('show');
	});
});
var app = new Vue({
	el: '#app',
	data: {
		username: sessionStorage.getItem('username'),
		isLoading: false,
		title: 'All companies',
		resultList: [],
		total: 0,
		totalPage: 0,
		currentPage: 1,
		searchAccountName: '',
		searchTitle: '',
		searchAbstract: '',
		newsCategoryArray: [],
		getData: '',
		editData: {},
		addNewsData: {},
	},
	mounted: function mounted() {
		if (sessionStorage.getItem('getData')) {
			var tmpData = JSON.parse(sessionStorage.getItem('getData'));
			this.getData = tmpData;
			if (tmpData.page) this.currentPage = tmpData.page;
			if (tmpData.content) this.searchAccountName = tmpData.content;
			if (tmpData.county) this.countryArray = tmpData.county;
		} else {
			this.getData = {
				page: this.currentPage,
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
			if (self.searchAccountName) {
				self.getData.content = self.searchAccountName;
			} else {
				self.getData.content = null;
			}
			if (self.searchTitle) {
				self.getData.searchTitle = self.searchTitle;
			} else {
				self.getData.searchTitle = null;
			}
			if (self.searchAbstract) {
				self.getData.abstract = self.searchAbstract;
			} else {
				self.getData.abstract = null;
			}

			if (self.newsCategoryArray.length > 0) {
				self.getData.type = self.newsCategoryArray;
			} else {
				self.getData.type = [];
			}
			$.ajax({
				beforeSend: function beforeSend(xhr) {
					xhr.setRequestHeader('token', sessionStorage.getItem('token'));
				},
				url: SERVER_URL + 'api/content/detailList',
				type: 'get',
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
							alert('Server error');
						}
						self.isLoading = false;
					}
				},
				error: function error(res) {
					self.signOut();
				},
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
		edit: function goDetail(item) {
			let vm = this;
			vm.editData = item;
		},
		signOut: function signOut() {
			sessionStorage.removeItem('username');
			sessionStorage.removeItem('getData');
			sessionStorage.removeItem('token');
			window.location.href = '../login.html';
		},
		saveData() {
			var _this = this;
			$.ajax({
				type: 'post',
				data: {
					id: _this.editData.id,
					account_id: _this.editData.account_id,
					news_type: _this.editData.news_type,
					keyword: _this.editData.keyword,
					searchsource: _this.editData.searchsource,
					publishing_media: _this.editData.publishing_media,
					account_name: _this.editData.account_name,
					date: _this.editData.date,
					flag_verify: _this.editData.flag_verify,
					title: _this.editData.title,
					url_domain: _this.editData.url_domain,
					url: _this.editData.url,
					url: _this.editData.url,
					abstract: _this.editData.abstract,
					editor: sessionStorage.getItem('username'),
				},
				dataType: 'json',
				url: SERVER_URL + 'api/content/save',
				beforeSend: function(xhr) {
					// 先验证token
					xhr.setRequestHeader('token', sessionStorage.getItem('token'));
				},
				success: function(res) {
					if (res.status == 1) {
						toastr.success('Modified successfully');
						_this.getResultList();
					} else if (res.status == 0) {
						toastr.info('Nothing changed');
					} else {
						toastr.warning('Failure to modify without permission');
					}
				},
				complete: function() {
					$('#submit').removeAttr('disabled');
				},
				error: function(data) {
					toastr.warning('Unknown error.Please reload and try again');
				},
			});
		},
		addNews() {
			var _this = this;
			$(function() {
				$('#showAdd').click(function() {
					$('#Modaladd').show('show');
				});
			});
			_this.addNewsData = {};
		},
		postaddNews() {
			var _this = this;
			$.ajax({
				type: 'post',
				data: {
					account_id: _this.addNewsData.account_id,
					news_type: _this.addNewsData.news_type,
					keyword: _this.addNewsData.keyword,
					searchsource: _this.addNewsData.searchsource,
					publishing_media: _this.addNewsData.publishing_media,
					account_name: _this.addNewsData.account_name,
					flag_verify: _this.addNewsData.flag_verify,
					title: _this.addNewsData.title,
					url_domain: _this.addNewsData.url_domain,
					url: _this.addNewsData.url,
					abstract: _this.addNewsData.abstract,
					editor: sessionStorage.getItem('username'),
				},
				dataType: 'json',
				url: SERVER_URL + 'api/content/addnews',
				beforeSend: function(xhr) {
					// 先验证token
					xhr.setRequestHeader('token', sessionStorage.getItem('token'));
				},
				success: function(res) {
					if (res.status == 1) {
						window.location.reload();
						toastr.success('Add successfully');
					} else {
						toastr.info('Add failed');
					}
				},
				complete: function() {
					$('#submit').removeAttr('disabled');
				},
				error: function(data) {
					toastr.warning('Unknown error.Please reload and try again');
				},
			});
		},
		ClearData() {
			this.addNewsData = {};
		},
		deleteData(id) {
			var _this = this;
			$('#ModalEdit').hide();

			$.ajax({
				url: SERVER_URL + 'api/content/delete',
				beforeSend: function(xhr) {
					// 先验证token
					xhr.setRequestHeader('token', sessionStorage.getItem('token'));
				},
				type: 'GET',
				dataType: 'json',
				data: {
					id: id,
				},
				success: function success(res) {
					if (res.status == 1) {
						toastr.success('Delete successfully');
						_this.getResultList();
					} else if (res.status == 0) {
						toastr.warning('Failure to modify without permission');
						_this.getResultList();
					} else {
						toastr.warning('Delete failed');
					}
				},
				error: function error(res) {
					toastr.warning('Unknown error.Please reload and try again');
				},
			});
		},
	},
});
