'use strict';

angular.module('bikeit.review')

.controller('SubmitReviewCtrl', [
	'templatePath',
	'ngDialog',
	'$scope',
	'AuthService',
	'WPService',
	'$location',
	'$state',
	function(templatePath, ngDialog, $scope, Auth, WP, $location, $state) {

		$scope.loginTemplate = templatePath + '/views/login.html';

		$scope.$watch(function() {
			return Auth.getNonce();
		}, function(nonce) {
			if(nonce) {
				WP.getUser().then(function(data) {
					$scope.user = data;
					$scope.$emit('userReady', $scope.user);
				});
			} else {
				$scope.user = false;
				$scope.$emit('userReady', false);
			}
		});

		$scope.newReview = function(place) {
			$scope.place = place || false;
			$scope.dialog = ngDialog.open({
				preCloseCallback: function() {
					$state.go('placesSingle', {}, {reload: true});
				},
				template: templatePath + '/views/review/new.html',
				scope: $scope
			});
		};

		$scope.onLoadReview = function(load, place) {

			if(load) {
				$scope.$on('userReady', function(ev, data) {
					$scope.newReview(place);
				});
			}

		};

		$scope.submit = function(review) {
			WP.post({
				'title': ' ',
				'content_raw': review.content,
				'type': 'review',
				'status': 'publish',
				'review_meta': {
					'approved': review.approved,
					'kindness': review.kindness,
					'structure': review.structure,
					'stampable': review.stampable ? 1 : 0,
					'notify': review.notify ? 1 : 0,
					'place': $scope.place.ID
				}
			}).then(function(data) {
				console.log(data);
				if($scope.dialog) {
					$scope.dialog.close();
					$scope.dialog = false;
				}
			}, function(error) {
				console.log(error);
			});
		}

	}
]);
