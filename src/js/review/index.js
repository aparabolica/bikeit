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

.directive('reviewListItem', [
	'templatePath',
	'labels',
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
						return labels['Approved'];
					} else {
						return labels['Failed'];
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
				'type': '=',
				'rating': '='
			},
			template: '<span class="rating rating-{{type}} clearfix" title="{{rating | number:2}}/5"><span class="rating-item" ng-repeat="i in range(5) track by $index"><span class="rating-filled" style="width:{{filledAmount($index+1)}}%">&nbsp;</span></span></span>',
			link: function(scope, element, attrs) {

				scope.rating = parseFloat(scope.rating);

				scope.range = function(n) {
					return new Array(n);
				};

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