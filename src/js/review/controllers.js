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

		$scope.newReview = function(place, review) {
			$scope.place = place || false;
			$scope.review = review ? _.clone(review) : {};
			if(!_.isEmpty(review)) {
				review.rating.stampable = review.rating.stampable ? true : false; 
			}
			console.log($scope.review);
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
					$scope.newReview(place, place.user_review);
				});
			}

		};

		$scope.submit = function(review) {
			var data = {
				'ID': review.ID || null,
				'title': ' ',
				'content_raw': review.content,
				'type': 'review',
				'status': 'publish',
				'review_meta': {
					'approved': review.rating.approved,
					'kindness': review.rating.kindness,
					'structure': review.rating.structure,
					'stampable': review.rating.stampable ? 1 : 0,
					'notify': review.notify ? 1 : 0,
					'place': $scope.place.ID
				}
			};
			if(review.ID) {
				WP.update(data).then(function(data) {
					if($scope.dialog) {
						$scope.dialog.close();
						$scope.dialog = false;
					}
				}, function(error) {
					console.log(error);
				});
			} else {
				WP.post(data).then(function(data) {
					if($scope.dialog) {
						$scope.dialog.close();
						$scope.dialog = false;
					}
				}, function(error) {
					console.log(error);
				});
			}
		}

	}
]);
