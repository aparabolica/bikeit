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