'use strict';

angular.module('bikeit.user')

.controller('UserController', [
	'WPService',
	'$scope',
	'AuthService',
	'ngDialog',
	'templatePath',
	'Labels',
	'$state',
	function(WP, $scope, Auth, ngDialog, templatePath, labels, $state) {

		$scope.loadedUser = false;

		$scope.labels = labels;

		$scope.adminUrl = window.bikeit.adminUrl;

		$scope.accessUser = function() {
			if($scope.user) {
				$state.go('user', {userId: $scope.user.ID});
			}
		};

		$scope.loginForm = function() {
			$scope.dialog = ngDialog.open({
				preCloseCallback: function() {
					$state.go($state.current, {}, {reload: true});
				},
				template: templatePath + '/views/login.html',
				scope: $scope
			});
		};

		$scope.$watch(function() {
			return Auth.getUser();
		}, function(data) {
			$scope.loadedUser = true;
			if(data) {
				$scope.user = data;
				if($scope.dialog) {
					$scope.dialog.close();
					$scope.dialog = false;
				}
			} else {
				$scope.user = false;
			}
		});

	}
])

.controller('UserSingleController', [
	'UserData',
	'UserPlaces',
	'UserReviews',
	'WPService',
	'$scope',
	function(UserData, UserPlaces, UserReviews, WP, $scope) {
		$scope.user = UserData;
		$scope.places = UserPlaces.data;
		$scope.reviews = UserReviews.data;

		_.each($scope.reviews, function(review) {

			review.placeData = _.find($scope.places, function(place) { return parseInt(place.ID) == parseInt(review.place); });

		});

		$scope.getUserAvatar = function() {
			return $scope.user.avatar.replace('?s=96', '?s=400');
		};

		$scope.update = function(user) {
			WP.updateUser(user.ID, user);
		};

	}
]);
