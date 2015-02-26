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
					HomeData: [
						'WPService',
						function(WP) {
							return WP.query({
								type: 'place',
								filter: {
									'posts_per_page': 100
								}
							});
						}
					]
				}
			});

	}
])
.controller('HomeController', [
	'HomeData',
	'$scope',
	function(HomeData, $scope) {

		$scope.posts = HomeData.data;

	}
]);