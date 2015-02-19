'use strict';

angular.module('bikeit.user', [])

.controller('UserController', [
	'WPService',
	'$scope',
	'AuthService',
	'ngDialog',
	'templatePath',
	'Labels',
	function(WP, $scope, Auth, ngDialog, templatePath, labels) {

		$scope.loadedUser = false;

		$scope.labels = labels;

		$scope.loginForm = function() {
			$scope.dialog = ngDialog.open({
				template: templatePath + '/views/login.html',
				scope: $scope
			});
		};

		$scope.$watch(function() {
			return Auth.getNonce();
		}, function(nonce) {
			$scope.loadedUser = false;
			if(nonce) {
				WP.getUser().then(function(data) {
					if($scope.dialog) {
						$scope.dialog.close();
						$scope.dialog = false;
					}
					$scope.user = data;
					$scope.loadedUser = true;
				}, function(reason) {
					$scope.loadedUser = true;
				});
			} else {
				$scope.user = false;
				$scope.loadedUser = true;
			}
		});

	}
]);