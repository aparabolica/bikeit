'use strict';

angular.module('bikeit.review', [])

.directive('reviewListItem', [
	'templatePath',
	'labels',
	'$sce',
	function(templatePath, labels, $sce) {
		return {
			restrict: 'E',
			scope: {
				review: '='
			},
			templateUrl: templatePath + '/views/review/partials/list-item.html',
			link: function(scope, element, attrs) {

				scope.labels = labels;

				scope.getReviewDate = function(review) {

					return moment(review.date).format('L');

				}

				scope.getReviewContent = function(review) {

					return $sce.trustAsHtml(review.content);

				};

				scope.getReviewApproval = function(review) {

					if(parseInt(review.rating.approved)) {
						return labels['Approved'];
					} else {
						return labels['Disapproved'];
					}

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
			template: '<span class="rating rating-{{type}}" title="{{rating | number}}/5"><span class="rating-item" ng-repeat="i in range(5) track by $index"><span class="rating-filled" style="width:{{filledAmount($index+1)}}%">&nbsp;</span></span></span>',
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