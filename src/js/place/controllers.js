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
	'ngDialog',
	'templatePath',
	function(PlaceData, PlaceReviews, $scope, $state, ngDialog, templatePath) {

		$scope.place = PlaceData;
		$scope.reviews = PlaceReviews.data;

		if($state.current.name == 'placesSingle.review') {
			$scope.openReview = true;
		}

		$scope.toggleGallery = function() {
			if(!$scope.isGallery) {
				$scope.isGallery = true;
			} else {
				$scope.isGallery = false;
			}
		};

		function getImgIdx(image) {
			var index = 0;
			_.find($scope.place.images, function(placeImage, placeImgIdx) {
				if(placeImage.ID == image.ID) {
					index = placeImgIdx;
					return true;
				}
			});
			return index;
		}

		$scope.nextImg = function() {
			var index = getImgIdx($scope.galleryImage);
			$scope.galleryImage = $scope.place.images[index+1] || $scope.place.images[0];
		}
		$scope.prevImg = function() {
			var index = getImgIdx($scope.galleryImage);
			$scope.galleryImage = $scope.place.images[index-1] || $scope.place.images[$scope.place.images.length-1];
		}

		function keyDown(e) {
			e = e || window.event;
			switch(e.which || e.keyCode) {
				case 37: // left
					$scope.$apply(function() {
						$scope.prevImg();
					});
				break
				case 39: // right
					$scope.$apply(function() {
						$scope.nextImg();
					});
				break;
				default: return;
			}
			e.preventDefault();
		}

		$scope.openGallery = function(image) {
			jQuery(document).bind('keydown', keyDown);
			$scope.galleryImage = image;
			$scope.galleryDialog = ngDialog.open({
				template: templatePath + '/views/review/gallery.html',
				scope: $scope,
				className: 'ngdialog-theme-default image-gallery',
				preCloseCallback: function() {
					jQuery(document).unbind('keydown');
				}
			});
		};

	}
])

.controller('MapSpyCtrl', [
	'$scope',
	'$state',
	'WPService',
	'$http',
	'ngDialog',
	'osmPlaceFilter',
	function($scope, $state, WP, $http, ngDialog, osmPlaceFilter) {

		$scope.clicked = false;
		$scope.latlng = false;

		$scope.$on('clickedMap', function(ev, data, latlng) {
			$scope.clicked = data;
			$scope.latlng = latlng;
		});

		$scope.$on('$stateChangeStart', function() {
			if($scope.dialog)
				$scope.dialog.close();
		});

		$scope.getAddress = function(place) {
			return {
				lat: $scope.latlng.lat,
				lon: $scope.latlng.lng,
				address: {
					road: place.address.road,
					city_district: place.address.city_district,
					house_number: place.address.house_number
				}
			};
		};

		$scope.addAddress = function(data, cb) {

			$scope.post = false;

			// Get proper data on OSM

			var bounds = window.bikeit.city ? window.bikeit.city.boundingbox : false;

			$http.get('http://nominatim.openstreetmap.org/search', {
				params: {
					format: 'json',
					q: data.namedetails.name + ' ' + data.address.road,
					addressdetails: 1,
					bounded: bounds ? 1 : '',
					viewbox: bounds ? bounds[2] + ',' + bounds[1] + ',' + bounds[3] + ',' + bounds[0] : ''
				}
			}).success(function(res) {

				// Get only places
				$scope.osmPlace = osmPlaceFilter(res);

				// Found place
				if($scope.osmPlace.length) {

					$scope.osmPlace = $scope.osmPlace[0];

					// Dialog for selection (use place or enter address)
					$scope.dialog = ngDialog.open({
						template: 'spySelection',
						scope: $scope,
						className: 'ngdialog-theme-default spy-dialog'
					});

				// Didnt find place, go to cb (view should send to SubmitPlaceCtrl)
				} else {
					if(typeof cb == 'function') {
						cb($scope.getAddress(data), $scope.latlng);
					}
				}

			});

			// Check existance on BikeIT database
			WP.query({
				filter: {
					's': data.place_id
				},
				type: 'place'
			}).then(function(res) {
				if(res.data.length) {
					$scope.post = res.data[0];
				}

			});
		};

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
	'osmTitleFilter',
	function(templatePath, ngDialog, $scope, Auth, WP, $location, $timeout, $http, leafletData, $state, osmTitleFilter) {

		$scope.loginTemplate = templatePath + '/views/login.html';

		$scope.$watch(function() {
			return Auth.getUser();
		}, function(data) {
			if(data) {
				$scope.user = data;
				$timeout(function() {
					leafletData.getMap('new-place-map').then(function(map) {
						map.invalidateSize(false);
					});
				}, 300);
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
						addressdetails: 1,
						bounded: bounds ? 1 : '',
						viewbox: bounds ? bounds[2] + ',' + bounds[1] + ',' + bounds[3] + ',' + bounds[0] : ''
					}
				}).success(function(data) {
					$scope.searchResults = data;
				});
			}
		}, 300);

		$scope.search = '';

		$scope.editPlace = function(place) {

			var cat = null;

			if(place.terms && place.terms['place-category'] && place.terms['place-category'].length)
				cat = place.terms['place-category'][0].ID

			var parsed = {
				ID: place.ID,
				name: place.title,
				lat: place.location ? place.location.lat : 0,
				lon: place.location ? place.location.lng : 0,
				category: cat,
				address: {
					road: place.location.road,
					city_district: place.location.district,
					house_number: place.location.number
				}
			};

			$scope.newPlace(parsed, {lat: parsed.lat, lng: parsed.lon });

		};

		$scope.clearPlace = function() {
			$scope.edit = {};
		}

		$scope.selectAddress = function(address) {
			$scope.edit.address = address.address;
			$scope.edit.lat = address.lat;
			$scope.edit.lon = address.lon;
			$scope.map.center = {
				lat: parseFloat($scope.edit.lat),
				lng: parseFloat($scope.edit.lon),
				zoom: 18
			}
			$timeout(function() {
				leafletData.getMap('new-place-map').then(function(map) {
					map.invalidateSize(false);
				});
			}, 300);
		};

		$scope.newPlace = function(place, latlng) {

			$scope.edit = _.clone(place) || {};

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

			$timeout(function() {
				$scope.map.center = {
					lat: latlng ? latlng.lat : 0,
					lng: latlng ? latlng.lng : 0,
					zoom: 18
				};
				if($scope.edit.osm_id) {
					$scope.edit.name = osmTitleFilter($scope.edit);
					if(!latlng) {
						$scope.map.center = {
							lat: parseFloat($scope.edit.lat),
							lng: parseFloat($scope.edit.lon),
							zoom: 18
						}
					}
				}
			}, 300);

			$scope.searchResults = [];

			var watchSearch;
			var watchMapMove;

			$scope.dialog = ngDialog.open({
				template: templatePath + '/views/place/new.html?v=2',
				scope: $scope,
				controller: ['$scope', function(scope) {

					watchSearch = scope.$watch('search', function(text) {
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
					watchMapMove = $scope.$on('leafletDirectiveMap.moveend', function(event) {
						var center = map.getCenter();
						$scope.edit.lat = center.lat;
						$scope.edit.lon = center.lng;
					});
				});

				$scope.dialog.closePromise.then(function() {
					watchSearch();
					if(typeof watchMapMove == 'function')
						watchMapMove();
				});

			}, 300);
		};

		$scope.submit = function(place) {

			var sendOSMNote = 0;

			if(
				(place.road && place.road != place.address.road) ||
				(place.district && place.district != place.address.city_district) ||
				(place.number && place.number != place.address.house_number)
			)
				sendOSMNote = 1;

			var parsed = {
				'ID': place.ID || null,
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
					'send_note': sendOSMNote
				}
			};

			if(place.osm_id) {
				parsed['place_meta'].osm_id = place.osm_id;
			}

			if(!place.ID) {
				parsed['place_meta'].params = JSON.stringify(place);
			}

			WP.post(parsed).then(function(data) {
				if($scope.dialog) {
					$scope.dialog.close();
					$scope.dialog = false;
				}
				if(!place.ID) {
					$state.go('placesSingle.review', {placeId: data.ID});
				} else {
					$state.go('placesSingle', {}, {reload: true});
				}
			}, function(error) {
			});

		}

		$scope.$on('newPlace', function(ev, place, latlng) {
			$scope.newPlace(place, latlng);
		});

	}
]);
