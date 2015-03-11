'use strict';

angular.module('bikeit.place')

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
	'PlaceReviews',
	'$scope',
	'$state',
	function(PlaceData, PlaceReviews, $scope, $state) {

		$scope.place = PlaceData;
		$scope.reviews = PlaceReviews.data;

		if($state.current.name == 'placesSingle.review') {
			$scope.openReview = true;
		}

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
	'$state',
	function(templatePath, ngDialog, $scope, Auth, WP, $location, $timeout, $http, leafletData, $state) {

		$scope.loginTemplate = templatePath + '/views/login.html';

		$scope.$watch(function() {
			return Auth.getNonce();
		}, function(nonce) {
			if(nonce) {
				WP.getUser().then(function(data) {
					$scope.user = data;
					$timeout(function() {
						leafletData.getMap('new-place-map').then(function(map) {
							map.invalidateSize(false);
						});
					}, 300);
				});
			} else {
				$scope.user = false;
			}
		});

		$scope.categories = window.bikeit.placeCategories;

		var search = _.debounce(function(text) {
			if(!text || typeof text == 'undefined') {
				$scope.searchResults = [];
			} else {
				var bounds = window.bikeit.city ? window.bikeit.city.boundingbox : false;
				$http.get('http://nominatim.openstreetmap.org/search', {
					params: {
						format: 'json',
						q: text,
						bounded: bounds ? 1 : '',
						addressdetails: 1,
						viewbox: bounds ? bounds[2] + ',' + bounds[1] + ',' + bounds[3] + ',' + bounds[0] : ''
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

			if(place.address.suburb && place.address.suburb != place.address.city_district) {
				if(place.address.road) {
					address += ' - ';
				}
				address += place.address.suburb;
			}

			if(place.address.city_district) {
				if(place.address.road) {
					address += ' - ';
				}
				address += place.address.city_district;
			}

			return address;
		};

		$scope.clearPlace = function() {
			$scope.place = {};
		}

		/* TODO */
		$scope.selectAddress = function(address) {
			$scope.place.address = address.address;
			$scope.place.lat = address.lat;
			$scope.place.lon = address.lon;
			$scope.map.center = {
				lat: parseFloat($scope.place.lat),
				lng: parseFloat($scope.place.lon),
				zoom: 18
			}
			$timeout(function() {
				leafletData.getMap('new-place-map').then(function(map) {
					map.invalidateSize(false);
				});
			}, 300);
		};

		$scope.newPlace = function(place) {
			$scope.place = _.clone(place) || {};
			$scope.map = {
				center: {
					lat: 0,
					lng: 0,
					zoom: 18
				},
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
				'title': place.name,
				'content_raw': ' ',
				'type': 'place',
				'status': 'publish',
				'place_meta': {
					'category': place.category,
					'lat': parseFloat(place.lat),
					'lng': parseFloat(place.lon),
					'road': place.road || place.address.road,
					'district': place.district || place.address.city_district,
					'number': place.number || place.address.house_number,
					'osm_id': place.osm_id,
					'params': JSON.stringify(place)
				}
			}).then(function(data) {
				if($scope.dialog) {
					$scope.dialog.close();
					$scope.dialog = false;
				}
				$state.go('placesSingle.review', {placeId: data.ID});
			}, function(error) {
				console.log(error);
			});
		}

	}
]);