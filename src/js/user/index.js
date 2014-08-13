'use strict';

angular.module('bikeit.user', [])

.controller('UserController', [
	'WPService',
	'$scope',
	function(WP, $scope) {

		$scope.loadedUser = false;

		$scope.getUser = function() {
			WP.getUser().then(function(data) {
				$scope.loadedUser = true;
				$scope.user = data;
			}, function() {
				$scope.loadedUser = true;
			});
		};

	}
]);