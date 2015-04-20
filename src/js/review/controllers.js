'use strict';

angular.module('bikeit.review')

.controller('ReviewSingleCtrl', [
	'SingleReview',
	'$scope',
	function(Review, $scope) {
		
		$scope.review = Review;

	}
])

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

		$scope.files = [];

		$scope.appendImages = function(files) {

			_.each(files, function(file) {
				WP.media(file).then(function(data) {
					var fileObj = {
						ID: data.ID,
						name: data.title,
						thumb: data.attachment_meta.sizes.thumbnail.url
					};
					$scope.files.push(fileObj);
				});
			});

		};

		$scope.deleteImage = function(file) {
			$scope.files = _.filter($scope.files, function(f) { return f.file !== file.file; });
		};

		$scope.$watch(function() {
			return Auth.getUser();
		}, function(data) {
			if(data)
				$scope.user = data;
			else
				$scope.user = false;
		});

		$scope.$on('bikeit.userLoggedIn', function() {
			if($scope.dialog)
				$scope.dialog.close();
			$state.go($state.current.name, {}, {reload:true});
		});

		$scope.newReview = function(place) {
			$state.go('placesSingle.review', {});
			$scope.place = place || false;
			$scope.review = place.user_review ? _.clone(place.user_review) : {};
			if(!_.isEmpty($scope.review)) {
				$scope.review.rating.stampable = $scope.review.rating.stampable ? true : false; 
			}
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
				$scope.newReview(place);
			}

		};

		$scope.submit = function(review) {

			// Get images ID

			if($scope.files.length) {
				var images = _.map($scope.files, function(file) { return file.ID; });
			}

			var data = {
				'ID': review.ID || null,
				'title': ' ',
				'content_raw': review.content,
				'type': 'review',
				'status': 'publish',
				'images': images ? images : false,
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
