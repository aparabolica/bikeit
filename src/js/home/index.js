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
								type: 'place'
							});
						}
					]
				}
			});

	}
])
.controller('HomeController', [
	'labels',
	'HomeData',
	'$scope',
	function(labels, HomeData, $scope) {

		$scope.labels = labels;

		$scope.posts = HomeData.data;

		$scope.map = {
			markers: {}
		};

		angular.forEach($scope.posts, function(post) {
			$scope.map.markers[post.ID] = {
				lat: post.location.lat,
				lng: post.location.lng,
				message: post.title
			}
		});

	}
]);