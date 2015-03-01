'use strict';

angular.module('bikeit.page', [
	'ui.router'
])
.config([
	'$stateProvider',
	function($stateProvider) {
		$stateProvider
			.state('page', {
				url: '/page/:pageId/',
				controller: 'PageController',
				templateUrl: window.bikeit.templateUri.split(window.location.origin)[1] + '/views/page.html',
				resolve: {
					PageData: [
						'$stateParams',
						'WPService',
						function($stateParams, WP) {
							return WP.getPost($stateParams.pageId);
						}
					]
				}
			});

	}
])
.controller('PageController', [
	'PageData',
	'$sce',
	'$scope',
	function(PageData, $sce, $scope) {

		console.log(PageData);

		$scope.page = PageData;

		$scope.getContent = function() {

			return $sce.trustAsHtml($scope.page.content);

		};

	}
]);