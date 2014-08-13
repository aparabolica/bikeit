'use strict';

angular.module('bikeit.place', [])

.directive('placeListItem', [
	'templatePath',
	'macroLocation',
	function(templatePath, macroLocation) {
		return {
			restrict: 'E',
			scope: {
				place: '='
			},
			templateUrl: templatePath + '/views/place/partials/place-list-item.html',
			link: function(scope, element, attrs) {

				scope.sanitizeAddress = function(place) {

					return place.location.address.split(', ' + macroLocation)[0];

				};

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
		template: '<img class="place-icon" ng-show="{{place.terms[\'place-category\'].length}}" ng-src="{{getPlaceIcon(place)}}" />',
		link: function(scope, element, attrs) {

			scope.getPlaceIcon = function(place) {

				if(place.terms['place-category']) {

					return place.terms['place-category'][0].markers.approved;

				}

				return '';

			};

		}
	}
});