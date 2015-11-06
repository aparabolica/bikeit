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
					MapPlaces: [
						'WPService',
						function(WP) {
							return WP.query({
								type: 'place',
								filter: {
									'posts_per_page': 100
								}
							});
						}
					],
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
	'MapPlaces',
	'FeaturedPlaces',
	'RecentReviewPlaces',
	'$scope',
	function(MapPlaces, FeaturedPlaces, RecentReviewPlaces, $scope) {

		$scope.posts = MapPlaces.data;
		$scope.featured = FeaturedPlaces.data;
		$scope.recent = RecentReviewPlaces.data;

	}
]);
