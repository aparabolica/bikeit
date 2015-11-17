'use strict';

angular.module('bikeit.home', [
	'ui.router'
])
.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

		$urlRouterProvider.otherwise('/');

		$stateProvider
			.state('home', {
				url: '/',
				controller: 'HomeController',
				templateUrl: window.bikeit.templateUri.split(window.location.origin)[1] + '/views/home.html',
				resolve: {
					FeaturedPlaces: [
						'WPService',
						function(WP) {
							return WP.query({
								type: 'place',
								filter: {
									'posts_per_page': 4,
									'featured': true
								}
							})
						}
					],
					RecentReviewPlaces: [
						'WPService',
						function(WP) {
							return WP.query({
								type: 'place',
								filter: {
									'posts_per_page': 8,
									'orderby': 'review',
									'order': 'DESC'
								}
							})
						}
					]
				}
			});

	}
])
.controller('HomeController', [
	'FeaturedPlaces',
	'RecentReviewPlaces',
	'WPService',
	'$scope',
	function(FeaturedPlaces, RecentReviewPlaces, WP, $scope) {

		$scope.loadingMap = true;

		$scope.posts = [];
		var query = {
			type: 'place',
			page: 1,
			filter: {
				'posts_per_page': 20
			}
		};
		WP.query(query, {loadingMsg: false}).then(function(res) {
			$scope.posts = $scope.posts.concat(res.data);
			if(res.currentPage() == res.totalPages()) {
				$scope.loadingMap = false;
			} else {
				var i = 2;
				for(; i <= res.totalPages(); i++) {
					WP.query({
						type: 'place',
						page: i,
						filter: {
							'posts_per_page': 20
						}
					}, {loadingMsg: false}).then(function(res) {
						$scope.posts = $scope.posts.concat(res.data);
						if(res.currentPage() == res.totalPages()) {
							$scope.loadingMap = false;
						}
					});
				}
			}
		});

		$scope.featured = FeaturedPlaces.data;
		$scope.recent = RecentReviewPlaces.data;

	}
]);
