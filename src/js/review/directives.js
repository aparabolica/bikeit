'use strict';

angular.module('bikeit.review')

.directive('reviewListItem', [
	'templatePath',
	'Labels',
	'$state',
	'$sce',
	'WPService',
	'AuthService',
	'ReviewService',
	function(templatePath, labels, $state, $sce, WP, Auth, Review) {
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

				};

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

				scope.deleteReview = function(review) {

					if(confirm(labels('Are you sure?'))) {
						WP.delete(review).then(function() {
							$state.go($state.current, {}, {reload: true});
						});
					}

				};

				scope.canDeleteReview = function(review) {

					var user = Auth.getUser();

					if(user) {
						if(user.capabilities.delete_others_reviews || 
							(user.capabilities.delete_reviews && review.author.ID == user.ID))
							return true;
					}

					return false;

				};

				scope.vote = function(vote) {
					if(review.user_vote == vote) {

						Review.unvote(review.ID).success(function(data, status, headers, config) {
							review.votes[review.user_vote]--;
							review.user_vote = false;
						});

					} else {
						Review.vote(review.ID, vote)
							.success(function(data, status, headers, config) {
								if(review.user_vote !== vote) {
									review.votes[review.user_vote]--;
								}
								review.votes[vote]++;
								review.user_vote = vote;
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
]);
