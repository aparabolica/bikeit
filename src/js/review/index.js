'use strict';

angular.module('bikeit.review', [])

.factory('ReviewService', [
	'$http',
	'$q',
	'apiUrl',
	function($http, $q, apiUrl) {

		return {
			vote: function(id, vote) {
				return $http.post(apiUrl + '/posts/' + id + '/vote', {vote: vote});
			},
			unvote: function(id) {
				return $http.delete(apiUrl + '/posts/' + id + '/vote');
			}
		}

	}
])

.controller('SubmitReviewCtrl', [
	'templatePath',
	'ngDialog',
	'$scope',
	'WPService',
	function(templatePath, ngDialog, $scope, WP) {

		$scope.newReview = function(place) {
			$scope.place = place || false;
			ngDialog.open({
				template: templatePath + '/views/review/new.html',
				scope: $scope
			});
		}

		$scope.submit = function(review) {
			console.log(review);
			WP.post({
				'title': ' ',
				'content_raw': review.content,
				'type': 'review',
				'status': 'publish',
				'review_meta': {
					'kindness': review.kindness,
					'structure': review.structure,
					'stamp': review.stamp,
					'notify': review.stamp,
					'place': review.place
				}
			}).then(function(data) {
				console.log(data);
			})
		}

	}
])

.directive('reviewListItem', [
	'templatePath',
	'Labels',
	'$sce',
	'WPService',
	'ReviewService',
	function(templatePath, labels, $sce, WP, Review) {
		return {
			restrict: 'E',
			scope: {
				review: '='
			},
			templateUrl: templatePath + '/views/review/partials/list-item.html',
			link: function(scope, element, attrs) {

				var review = scope.review;

				scope.labels = labels;

				scope.getReviewDate = function() {

					return moment(review.date).format('L');

				}

				scope.getReviewContent = function() {

					return $sce.trustAsHtml(review.content);

				};

				scope.getReviewApproval = function() {

					if(parseInt(review.rating.approved)) {
						return labels('Approved');
					} else {
						return labels('Failed');
					}

				};

				scope.vote = function(vote) {
					if(review.userVote == vote) {

						Review.unvote(review.ID).success(function(data, status, headers, config) {
							review.votes[review.userVote]--;
							review.userVote = false;
						});

					} else {
						Review.vote(review.ID, vote)
							.success(function(data, status, headers, config) {
								if(review.userVote !== vote) {
									review.votes[review.userVote]--;
								}
								review.votes[vote]++;
								review.userVote = vote;
							});
					}
				}

				scope.toggleComments = function() {

					if(!scope.comments) {
						WP.getPostComments(review.ID).then(function(data) {
							scope.comments = data;
						});
					}

					if(!scope.displayComments)
						scope.displayComments = true;
					else
						scope.displayComments = false;

				};

				scope.getCommentContent = function(c) {
					return $sce.trustAsHtml(c.content);
				};

			}
		}
	}
])

.directive('ratings', [
	function() {
		return {
			restrict: 'E',
			scope: {
				'type': '@',
				'rating': '@',
				'editable': '@',
				'model': '='
			},
			template: '<span class="rating rating-{{type}} clearfix" title="{{rating | number:2}}/5"><span ng-repeat="i in range(5) track by $index" class="rating-item rating-{{$index+1}}" ng-click="setRating($index+1)" ng-mouseover="hoverRating($index+1)" ng-mouseleave="getRating()"><span class="rating-filled" style="width:{{filledAmount($index+1)}}%">&nbsp;</span></span></span>',
			link: function(scope, element, attrs) {

				scope.rating = parseFloat(scope.rating);

				scope.range = function(n) {
					return new Array(n);
				};

				scope.setRating = function(i) {
					if(scope.editable) {
						scope.rating = i;
						scope.model = i;
					}
				};

				scope.hoverRating = function(i) {
					if(scope.editable) {
						scope.rating = i;
					}
				}

				scope.getRating = function() {
					if(scope.editable) {
						scope.rating = scope.model;
					}
				}

				scope.filledAmount = function(i) {

					var percentage = 0;

					if(i <= scope.rating) {
						percentage = 100;
					} else if(i == Math.ceil(scope.rating)) {
						percentage = (scope.rating-i+1)*100;
					}

					return percentage;

				}

			}
		}
	}
])