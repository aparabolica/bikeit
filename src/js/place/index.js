'use strict';

angular.module('bikeit.place', [])

.config([
	'$stateProvider',
	function($stateProvider) {
		$stateProvider
			.state('places', {
				url: '/places/',
				controller: 'PlaceIndexController',
				templateUrl: window.bikeit.templateUri.split(window.location.origin)[1] + '/views/place/index.html'
			})
			.state('placesSingle', {
				url: '/places/:placeId/',
				controller: 'PlaceSingleController',
				templateUrl: window.bikeit.templateUri.split(window.location.origin)[1] + '/views/place/single.html',
				resolve: {
					'PlaceData': [
						'$q',
						'$stateParams',
						'WPService',
						function($q, $stateParams, WP) {
							var deferred = $q.defer();
							var data = {};
							WP.getPost($stateParams.placeId).then(function(place) {
								data.place = place;
								WP.query({
									filter: {
										'place_reviews': place.ID
									}
								}).then(function(reviews) {
									data.reviews = reviews;
									deferred.resolve(data);
								});
							});
							return deferred.promise;
						}
					]
				}
			});
	}
])

.controller('PlaceController', [
	'$state',
	'$scope',
	function($state, $scope) {

		$scope.accessPlace = function(place) {
			$state.go('placesSingle', { placeId: place.ID });
		};

	}
])

.controller('PlaceSingleController', [
	'PlaceData',
	'$scope',
	function(PlaceData, $scope) {

		$scope.place = PlaceData.place;
		$scope.posts = [PlaceData.place];
		$scope.reviews = PlaceData.reviews.data;

	}
])

.directive('placeListItem', [
	'templatePath',
	function(templatePath) {
		return {
			restrict: 'E',
			scope: {
				place: '='
			},
			templateUrl: templatePath + '/views/place/partials/list-item.html',
			link: function(scope, element, attrs) {

				scope.sanitizeAddress = function(place) {

					return place.location.address;

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
		template: '<img class="place-icon" title="{{place.terms[\'place-category\'][0].name}}" alt="{{place.terms[\'place-category\'][0].name}}" ng-show="{{place.terms[\'place-category\'].length}}" ng-src="{{getPlaceIcon(place)}}" />',
		link: function(scope, element, attrs) {

			scope.getPlaceIcon = function(place) {

				var approval = 'default';

				if(parseFloat(place.scores.approved) >= 0.5)
					approval = 'approved';
				else
					approval = 'unapproved';

				if(place.terms['place-category']) {

					return place.terms['place-category'][0].markers[approval];

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

				scope.filter = function(category) {

					if(!category)
						scope.categoryId = false;
					else
						scope.categoryId = category.term_id;

				}

			}
		}
	}
])

.filter('placeToMarker', [
	'leafletData',
	'MapMarkers',
	function(leafletData, Markers) {
		return _.memoize(function(input) {

			if(input.length) {

				var markers = {};
				_.each(input, function(place) {

					var approval = 'default';

					if(parseFloat(place.scores.approved) >= 0.5)
						approval = 'approved';
					else
						approval = 'unapproved';

					var icon = {};
					if(place.terms['place-category']) {
						var catId = place.terms['place-category'][0].ID;
						icon = Markers['place-category-' + catId + '-' + approval];
					}
					markers[place.ID] = {
						lat: place.location.lat,
						lng: place.location.lng,
						icon: icon,
						message: '<h2>' + place.title + '</h2>' + '<p>' + place.location.address + '</p>'
					};
				});

				return markers;

			}

			return {};

		}, function() {
			return JSON.stringify(arguments);
		});
	}
])

.filter('placeCategory', function() {
	return function(input, categoryId) {

		if(categoryId) {

			return _.filter(input, function(place) {
				return place.terms['place-category'] && parseInt(place.terms['place-category'][0].ID) == parseInt(categoryId);
			});

		}

		return input;

	}
});