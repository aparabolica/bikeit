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
			return Auth.getNonce();
		}, function(nonce) {
			$scope.loadedUser = false;
			if(nonce) {
				WP.getUser().then(function(data) {
					$scope.user = data;
					$scope.loadedUser = true;
					if($scope.dialog) {
						$scope.dialog.close();
						$scope.dialog = false;
					}
				}, function(reason) {
					$scope.loadedUser = true;
				});
			} else {
				$scope.user = false;
				$scope.loadedUser = true;
			}
		});

	}
])

.controller('UserSingleController', [
	'UserData',
	'UserPlaces',
	'UserReviews',
	'$scope',
	function(UserData, UserPlaces, UserReviews, $scope) {
		$scope.user = UserData;
		$scope.places = UserPlaces.data;
		$scope.reviews = UserReviews.data;

		_.each($scope.reviews, function(review) {

			review.placeData = _.find($scope.places, function(place) { return parseInt(place.ID) == parseInt(review.place); });

			console.log(review.placeData);

		});

		$scope.getUserRegistration = function() {

			return moment($scope.user.registered).format('L');

		};

		$scope.getUserAvatar = function() {
			return $scope.user.avatar.replace('?s=96', '?s=400');
		};
	}
]);
