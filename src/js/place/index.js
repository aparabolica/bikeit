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
		$scope.reviews = PlaceData.reviews.data;

		console.log($scope.reviews);

	}
])

.controller('SubmitPlaceCtrl', [
	'templatePath',
	'ngDialog',
	'$scope',
	'AuthService',
	'WPService',
	'$location',
	'$timeout',
	'$http',
	'leafletData',
	function(templatePath, ngDialog, $scope, Auth, WP, $location, $timeout, $http, leafletData) {

		$scope.loginTemplate = templatePath + '/views/login.html';

		$scope.$watch(function() {
			return Auth.getNonce();
		}, function(nonce) {
			if(nonce) {
				WP.getUser().then(function(data) {
					$scope.user = data;
				});
			} else {
				$scope.user = false;
			}
		});

		var search = _.debounce(function(text) {
			if(!text || typeof text == 'undefined') {
				$scope.searchResults = [];
			} else {
				var bounds = window.bikeit.city.boundingbox;
				$http.get('http://nominatim.openstreetmap.org/search', {
					params: {
						format: 'json',
						q: text,
						bounded: 1,
						addressdetails: 1,
						viewbox: bounds[2] + ',' + bounds[1] + ',' + bounds[3] + ',' + bounds[0]
					}
				}).success(function(data) {
					$scope.searchResults = data;
				});
			}
		}, 300);

		$scope.search = '';

		$scope.sanitizeAddress = function(place) {
			var address = '';
			if(place.address.road) {
				address += place.address.road;
			}

			if(place.address.house_number) {
				address += ', ' + place.address.house_number;
			}

			if(place.address.city_district) {
				if(place.address.road) {
					address += ' - ';
				}
				address += place.address.city_district;
			}

			return address;
		};

		/* TODO */
		$scope.selectAddress = function(address) {
			console.log(address);
			$scope.place.lat = address.lat;
			$scope.place.lon = address.lon;
			$scope.place.address = address;
		};

		$scope.newPlace = function(place) {
			$scope.place = place || {};
			$scope.map = {
				defaults: {
					tileLayer: window.bikeit.map.tile,
					scrollWheelZoom: false
				},
				controls: false
			};
			if($scope.place.osm_id) {
				$scope.map.center = {
					lat: parseFloat($scope.place.lat),
					lng: parseFloat($scope.place.lon),
					zoom: 18
				}
			};

			$scope.searchResults = [];

			$scope.dialog = ngDialog.open({
				template: templatePath + '/views/place/new.html',
				scope: $scope,
				controller: ['$scope', function(scope) {

					scope.$watch('search', function(text) {
						if(!text || typeof text == 'undefined' || text.length <= 2) {
							$scope.searchResults = [];
						} else {
							search(text);
						}
					});

				}]
			});

			$timeout(function() {
				leafletData.getMap('new-place-map').then(function(map) {
					map.invalidateSize(false);
					$scope.$on('leafletDirectiveMap.moveend', function(event) {
						var center = map.getCenter();
						$scope.place.lat = center.lat;
						$scope.place.lon = center.lng;
					});
				});
			}, 300);
		};

		$scope.submit = function(place) {
			WP.post({
				'title': place.title,
				'content_raw': '',
				'type': 'place',
				'status': 'publish',
				'place_meta': {
				}
			}).then(function(data) {
				console.log(data);
				if($scope.dialog) {
					$scope.dialog.close();
					$scope.dialog = false;
				}
			}, function(error) {
				console.log(error);
			});
		}

	}
])

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

				scope.sanitizeAddress = function(place) {

					return place.location.address;

				};

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

				scope.sanitizeAddress = function(place) {

					var address = '';
					if(place.address.road) {
						address += place.address.road;
					}

					if(place.address.house_number) {
						address += ', ' + place.address.house_number;
					}

					if(place.address.city_district) {
						if(place.address.road) {
							address += ' - ';
						}
						address += place.address.city_district;
					}

					return address;

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