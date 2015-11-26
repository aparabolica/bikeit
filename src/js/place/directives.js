'use strict';

angular.module('bikeit.place')

.directive('placeListItem', [
	'Labels',
	'templatePath',
	function(labels, templatePath) {
		return {
			restrict: 'E',
			scope: {
				place: '=',
				style: '@'
			},
			templateUrl: templatePath + '/views/place/partials/list-item.html',
			link: function(scope, element, attrs) {

				scope.labels = labels;

				if(!scope.style)
					scope.style = 'row';

			}
		}
	}
])

.directive('osmListItem', [
	'Labels',
	'templatePath',
	function(labels, templatePath) {
		return {
			restrict: 'E',
			scope: {
				place: '=',
				style: '@'
			},
			templateUrl: templatePath + '/views/place/partials/osm-list-item.html',
			link: function(scope, element, attrs) {

				scope.labels = labels;

				scope.sanitizeTitle = function(place) {
					return place.address[place.type] || place.address.address29;
				}

			}
		}
	}
])

.directive('placeIcon', function() {
	return {
		restrict: 'E',
		scope: {
			place: '='
		},
		template: '<img class="place-icon" title="{{place.terms[\'place-category\'][0].name}}" alt="{{place.terms[\'place-category\'][0].name}}" ng-show="{{place.terms[\'place-category\'].length}}" ng-src="{{getPlaceIcon(place)}}" />',
		link: function(scope, element, attrs) {

			scope.getPlaceIcon = function(place) {

				if(place) {

					var approval = 'default';

					if(place.scores && parseFloat(place.scores.approved) >= 0.5)
						approval = 'approved';
					else
						approval = 'failed';

					if(place.stamped) {
						approval = 'stamp';
					}

					if(place.terms && place.terms['place-category']) {

						return place.terms['place-category'][0].markers[approval];

					}
					
				}

				return '';

			};

		}
	}
})

.directive('mapFilters', [
	'templatePath',
	'$window',
	function(templatePath, $window) {
		return {
			restrict: 'E',
			templateUrl: templatePath + '/views/place/partials/map-filters.html',
			link: function(scope, element, attrs) {

				scope.categoryId = false;

				scope.categories = $window.bikeit.placeCategories;

				scope.placeLabels = $window.bikeit.placeLabels;

				scope.filter = function(f, type) {

					if(type == 'category') {
						if(!f || scope.categoryId == f.term_id)
							scope.categoryId = false;
						else
							scope.categoryId = f.term_id;
					} else if(type == 'score') {
						if(!f || scope.score == f)
							scope.score = false;
						else
							scope.score = f;
					}

				}

			}
		}
	}
]);
