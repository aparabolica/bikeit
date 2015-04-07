(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

angular.module('bikeit.auth', [])

.factory('AuthService', [
	'nonce',
	'$location',
	function(nonce, $location) {

		var user;

		return {
			getNonce: function() {
				return nonce;
			},
			setNonce: function(val) {
				nonce = val;
			},
			getUser: function() {
				return user;
			},
			setUser: function(val) {
				user = val;
			}
		}

	}
])

.factory('authInterceptor', [
	'$rootScope',
	'$q',
	'AuthService',
	function($rootScope, $q, Auth) {

		jQuery.ajaxSetup({
			beforeSend: function(req) {
				if(Auth.getNonce())
					req.setRequestHeader("X-WP-Nonce", Auth.getNonce());
			}
		});

		return {
			request: function(config) {
				config.headers = config.headers || {};
				if(Auth.getNonce())
					config.headers['X-WP-Nonce'] = Auth.getNonce();
				return config || $q.when(config);
			}
		};
	}
])
.config([
	'$httpProvider',
	function($httpProvider) {
		$httpProvider.interceptors.push('authInterceptor');
	}
])
.run([
	'$rootScope',
	'WPService',
	'AuthService',
	function($rootScope, WP, Auth) {

		$rootScope.$watch(function() {
			return Auth.getNonce();
		}, function(nonce) {
			if(nonce) {
				WP.getUser().then(function(data) {
					Auth.setUser(data);
				});
			}
		});

	}
])
.controller('LoginForm', [
	'$rootScope',
	'$scope',
	'$http',
	'apiUrl',
	'AuthService',
	'WPService',
	function($rootScope, $scope, $http, apiUrl, Auth, WP) {

		$scope.login = function(data) {

			$http.post(apiUrl + 'auth', _.extend({
				'_wp_json_nonce': Auth.getNonce()
			}, data))
				.success(function(data) {
					Auth.setNonce('auth');
					WP.getUser().then(function(data) {
						Auth.setUser(data);
					});
					$rootScope.$broadcast('bikeit.userLoggedIn');
				});
		}

		$scope.register = function(data) {

			$http.post(apiUrl + 'register', _.extend({
				'_wp_json_nonce': Auth.getNonce()
			}, data))
				.success(function(data) {
					Auth.setNonce('auth');
					Auth.setUser(data);
					$rootScope.$broadcast('bikeit.userRegistered');
				});
		}

	}
]);
},{}],2:[function(require,module,exports){
'use strict';

angular.module('bikeit.home', [
	'ui.router'
])
.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

		$urlRouterProvider.otherwise('/');

		$stateProvider
			.state('home', {
				url: '/',
				controller: 'HomeController',
				templateUrl: window.bikeit.templateUri.split(window.location.origin)[1] + '/views/home.html',
				resolve: {
					HomeData: [
						'WPService',
						function(WP) {
							return WP.query({
								type: 'place',
								filter: {
									'posts_per_page': 100
								}
							});
						}
					]
				}
			});

	}
])
.controller('HomeController', [
	'HomeData',
	'$scope',
	function(HomeData, $scope) {

		$scope.posts = HomeData.data;

	}
]);
},{}],3:[function(require,module,exports){
/*
 * Modules
 */

require('./util/message');

require('./auth');

require('./user');
require('./map');
require('./home');
require('./page');
require('./place');
require('./review');

/*
 * Main module
 */

angular.module('bikeit', [
	'ngDialog',
	'ui.router',
	'bikeit.message',
	'bikeit.auth',
	'bikeit.user',
	'bikeit.map',
	'bikeit.home',
	'bikeit.page',
	'bikeit.place',
	'bikeit.review',
	'leaflet-directive'
])

.constant('apiUrl', window.bikeit.apiUrl)
.constant('nonce', window.bikeit.nonce)
.constant('baseUrl', window.bikeit.url.split(window.location.origin)[1])
.constant('templatePath', window.bikeit.templateUri.split(window.location.origin)[1])
.constant('siteName', window.bikeit.name)
.constant('labels', window.bikeit.labels)

.config([
	'$locationProvider',
	function($locationProvider) {
		$locationProvider.html5Mode(false);
		$locationProvider.hashPrefix('!');
	}
])

.factory('WPService', require('./wp'))

.directive('tooltip', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			if(attrs.tooltip) {
				element.addClass('has-tooltip');
				element.append('<div class="tooltip"><span>' + attrs.tooltip + '</span></div>');
			}
		}
	}
})

.directive('backImg', function(){
    return function(scope, element, attrs){
        var url = attrs.backImg;
        element.css({
            'background-image': 'url(' + url +')',
            'background-size' : 'cover'
        });
    };
})

.factory('Labels', [
	'labels',
	function(labels) {

		return function(text) {
			if(typeof text == 'undefined')
				return '';
			else if(labels[text])
				return labels[text];
			else
				return text;
		}

	}
])

.controller('SiteController', [
	'$state',
	'Labels',
	'$scope',
	function($state, labels, $scope) {

		$scope.labels = labels;

		$scope.logoutUrl = window.bikeit.logoutUrl;

	}
])

.controller('SearchController', [
	'$scope',
	'WPService',
	'$http',
	function($scope, WP, $http) {

		$scope.searchResults = [];
		$scope.addressResults = [];

		var search = _.debounce(function(text) {
			if(!text || typeof text == 'undefined') {
				$scope.searchResults = [];
				$scope.addressResults = [];
			} else {
				WP.query({
					filter: {
						's': text
					},
					'type': $scope.searchType || 'place'
				}).then(function(data) {
					$scope.searchResults = data.data;
				});
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
					$scope.addressResults = _.filter(data, function(item) {

						// Filter places
						if(item.class == 'highway' ||
							item.class == 'place' ||
							item.class == 'waterway' ||
							item.class == 'landuse' ||
							(!item.address[item.type] && !item.address.address29) ||
							!window.osmLabels[item.class + '/' + item.type])
							return false;

						// Add title
						item.name = item.address[item.type] || item.address.address29;

						// Add label
						item.label = window.osmLabels[item.class + '/' + item.type].name;

						// Add icon
						if(window.osmIcons[item.class + '/' + item.type])
							item.icon = window.osmIcons[item.class + '/' + item.type];

						return true;

					});
				});
			}
		}, 300);

		$scope.$watch('searchText', function(text) {
			if(!text || typeof text == 'undefined' || text.length <= 2) {
				$scope.searchResults = [];
				$scope.addressResults = [];
			} else {
				search(text);
			}
		});

	}
]);

angular.element(document).ready(function() {
	console.log(bikeit);
	angular.bootstrap(document, ['bikeit']);
});

},{"./auth":1,"./home":2,"./map":4,"./page":5,"./place":9,"./review":12,"./user":14,"./util/message":15,"./wp":16}],4:[function(require,module,exports){
'use strict';

L.Icon.Default.imagePath = window.bikeit.templateUri + '/css/images';

angular.module('bikeit.map', [
	'leaflet-directive'
])
.controller('MapController', [
	'$state',
	'leafletData',
	'leafletEvents',
	'$scope',
	function($state, leafletData, leafletEvents, $scope) {

		if(window.bikeit.city) {
			var bounds = window.bikeit.city.boundingbox;
			$scope.maxbounds = {
				northEast: {
					lat: parseFloat(bounds[0]),
					lng: parseFloat(bounds[2])
				},
				southWest: {
					lat: parseFloat(bounds[1]),
					lng: parseFloat(bounds[3])
				}
			};
		}

		$scope.mapDefaults = {
			tileLayer: window.bikeit.map.tile,
			scrollWheelZoom: false

		};

		$scope.$on('leafletDirectiveMarker.mouseover', function(event, args) {
			args.leafletEvent.target.openPopup();
			args.leafletEvent.target.setZIndexOffset(1000);
		});

		$scope.$on('leafletDirectiveMarker.mouseout', function(event, args) {
			args.leafletEvent.target.closePopup();
			args.leafletEvent.target.setZIndexOffset(0);
		});

		$scope.$on('leafletDirectiveMarker.click', function(event, args) {
			$state.go('placesSingle', { placeId:  args.markerName})
		});

		$scope.$watch('markers', function(markers) {

			if(markers && !_.isEmpty(markers)) {

				var latLngs = [];

				_.each(markers, function(marker) {

					latLngs.push([
						marker.lat,
						marker.lng
					]);

				});

				var bounds = L.latLngBounds(latLngs);

				leafletData.getMap().then(function(m) {

					var rightOffset = 20;
					var leftOffset = 20;

					if(jQuery('.content-map').length) {
						rightOffset = jQuery('body').width() - jQuery('.content-map-header').position().left -20;
					}

					m.fitBounds(bounds, { reset: true, paddingBottomRight: [rightOffset, 20], paddingTopLeft: [leftOffset, 20] });

				});

			}

		});

	}
])
.factory('MapMarkers', [
	'$window',
	function($window) {

		var markers = {};

		_.each($window.bikeit.placeCategories, function(place) {

			var images = ['default', 'approved', 'failed', 'stamp'];

			_.each(images, function(image) {

				var imageObj = place.markers[image];
				var position = place.markers.position;
				var popupAnchor;
				var offset = 5;

				if(position == 'center') {
					position = [imageObj.width/2, imageObj.height/2];
					popupAnchor = [0, -imageObj.height/2 + offset];
				} else if(position == 'bottom_center') {
					position = [imageObj.width/2, imageObj.height];
					popupAnchor = [0, -imageObj.height + offset];
				} else if(position == 'bottom_left') {
					position = [0, imageObj.height];
					popupAnchor = [imageObj.width/2, -imageObj.height + offset];
				} else if(position == 'bottom_right') {
					position = [imageObj.width, imageObj.height];
					popupAnchor = [-imageObj.width/2, -imageObj.height + offset];
				}

				markers['place-category-' + place.term_id + '-' + image] = {
					iconUrl: imageObj.url,
					shadowUrl: false,
					shadowSize: [0,0],
					iconSize: [imageObj.width, imageObj.height],
					iconAnchor: position,
					popupAnchor: popupAnchor
				};

			});

		});

		return markers;

	}
]);
},{}],5:[function(require,module,exports){
'use strict';

angular.module('bikeit.page', [
	'ui.router'
])
.config([
	'$stateProvider',
	function($stateProvider) {
		$stateProvider
			.state('page', {
				url: '/page/:pageId/',
				controller: 'PageController',
				templateUrl: window.bikeit.templateUri.split(window.location.origin)[1] + '/views/page.html',
				resolve: {
					PageData: [
						'$stateParams',
						'WPService',
						function($stateParams, WP) {
							return WP.getPost($stateParams.pageId);
						}
					]
				}
			});

	}
])
.controller('PageController', [
	'PageData',
	'$sce',
	'$scope',
	function(PageData, $sce, $scope) {

		console.log(PageData);

		$scope.page = PageData;

		$scope.getContent = function() {

			return $sce.trustAsHtml($scope.page.content);

		};

	}
]);
},{}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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
					approval = 'failed';

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
},{}],8:[function(require,module,exports){
'use strict';

angular.module('bikeit.place')

.filter('hideFound', [
	function() {
		return function(input, found) {

			if(input.length && found.length) {

				input = _.filter(input, function(item) {
					return !_.find(found, function(fItem) {
						return item.osm_id == fItem.osm_id;
					});
				});

			}

			return input;

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
						approval = 'failed';

					var icon = {};
					if(place.terms['place-category']) {
						var catId = place.terms['place-category'][0].ID;
						icon = Markers['place-category-' + catId + '-' + approval];
					}
					markers[place.ID] = {
						lat: place.location.lat,
						lng: place.location.lng,
						icon: icon,
						message: '<h2>' + place.title + '</h2>' + '<p>' + place.formatted_address + '</p>'
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
})

.filter('score', function() {
	return function(input, score) {

		if(score) {

			return _.filter(input, function(place) {

				var approval;
				if(parseFloat(place.scores.approved) >= 0.5)
					approval = 'approved';
				else
					approval = 'failed';

				return score == approval;
			});

		}

		return input;

	}
});
},{}],9:[function(require,module,exports){
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
							return WP.getPost($stateParams.placeId);
						}
					],
					'PlaceReviews': [
						'$stateParams',
						'WPService',
						function($stateParams, WP) {
							return WP.query({
								filter: {
									'place_reviews': $stateParams.placeId
								}
							});
						}
					]
				}
			})
			.state('placesSingle.review', {
				url: 'review/'
			});
	}
])

require('./directives');

require('./controllers');

require('./filters');
},{"./controllers":6,"./directives":7,"./filters":8}],10:[function(require,module,exports){
'use strict';

angular.module('bikeit.review')

.controller('SubmitReviewCtrl', [
	'templatePath',
	'ngDialog',
	'$scope',
	'AuthService',
	'WPService',
	'$location',
	'$state',
	function(templatePath, ngDialog, $scope, Auth, WP, $location, $state) {

		$scope.loginTemplate = templatePath + '/views/login.html';

		$scope.$watch(function() {
			return Auth.getUser();
		}, function(data) {
			if(data)
				$scope.user = data;
			else
				$scope.user = false;
		});

		$scope.$on('bikeit.userLoggedIn', function() {
			if($scope.dialog)
				$scope.dialog.close();
			$state.go($state.current.name, {}, {reload:true});
		});

		$scope.newReview = function(place) {
			$state.go('placesSingle.review', {});
			$scope.place = place || false;
			$scope.review = place.user_review ? _.clone(place.user_review) : {};
			if(!_.isEmpty($scope.review)) {
				$scope.review.rating.stampable = $scope.review.rating.stampable ? true : false; 
			}
			$scope.dialog = ngDialog.open({
				preCloseCallback: function() {
					$state.go('placesSingle', {}, {reload: true});
				},
				template: templatePath + '/views/review/new.html',
				scope: $scope
			});
		};

		$scope.onLoadReview = function(load, place) {

			if(load) {
				$scope.$on('userReady', function(ev, data) {
					$scope.newReview(place);
				});
			}

		};

		$scope.submit = function(review) {
			var data = {
				'ID': review.ID || null,
				'title': ' ',
				'content_raw': review.content,
				'type': 'review',
				'status': 'publish',
				'review_meta': {
					'approved': review.rating.approved,
					'kindness': review.rating.kindness,
					'structure': review.rating.structure,
					'stampable': review.rating.stampable ? 1 : 0,
					'notify': review.notify ? 1 : 0,
					'place': $scope.place.ID
				}
			};
			if(review.ID) {
				WP.update(data).then(function(data) {
					if($scope.dialog) {
						$scope.dialog.close();
						$scope.dialog = false;
					}
				}, function(error) {
					console.log(error);
				});
			} else {
				WP.post(data).then(function(data) {
					if($scope.dialog) {
						$scope.dialog.close();
						$scope.dialog = false;
					}
				}, function(error) {
					console.log(error);
				});
			}
		}

	}
]);

},{}],11:[function(require,module,exports){
'use strict';

angular.module('bikeit.review')

.directive('reviewListItem', [
	'templatePath',
	'Labels',
	'$state',
	'$sce',
	'WPService',
	'ReviewService',
	function(templatePath, labels, $state, $sce, WP, Review) {
		return {
			restrict: 'E',
			scope: {
				review: '='
			},
			templateUrl: templatePath + '/views/review/partials/list-item.html',
			link: function(scope, element, attrs) {

				var review = scope.review;

				scope.labels = labels;

				scope.accessUser = function(user) {
					$state.go('user', {userId: user.ID});
				};

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

},{}],12:[function(require,module,exports){
'use strict';

angular.module('bikeit.review', [])

.factory('ReviewService', [
	'$http',
	'$q',
	'apiUrl',
	function($http, $q, apiUrl) {

		return {
			vote: function(id, vote) {
				return $http.post(apiUrl + 'posts/' + id + '/vote', {vote: vote});
			},
			unvote: function(id) {
				return $http.delete(apiUrl + 'posts/' + id + '/vote');
			}
		}

	}
])

require('./directives')

require('./controllers');

},{"./controllers":10,"./directives":11}],13:[function(require,module,exports){
'use strict';

angular.module('bikeit.user')

.controller('UserController', [
	'WPService',
	'$scope',
	'AuthService',
	'ngDialog',
	'templatePath',
	'Labels',
	'$state',
	function(WP, $scope, Auth, ngDialog, templatePath, labels, $state) {

		$scope.loadedUser = false;

		$scope.labels = labels;

		$scope.adminUrl = window.bikeit.adminUrl;

		$scope.accessUser = function() {
			if($scope.user) {
				$state.go('user', {userId: $scope.user.ID});
			}
		};

		$scope.loginForm = function() {
			$scope.dialog = ngDialog.open({
				preCloseCallback: function() {
					$state.go($state.current, {}, {reload: true});
				},
				template: templatePath + '/views/login.html',
				scope: $scope
			});
		};

		$scope.$watch(function() {
			return Auth.getUser();
		}, function(data) {
			$scope.loadedUser = true;
			if(data) {
				$scope.user = data;
				if($scope.dialog) {
					$scope.dialog.close();
					$scope.dialog = false;
				}
			} else {
				$scope.user = false;
			}
		});

	}
])

.controller('UserSingleController', [
	'UserData',
	'UserPlaces',
	'UserReviews',
	'$scope',
	function(UserData, UserPlaces, UserReviews, $scope) {
		$scope.user = UserData;
		$scope.places = UserPlaces.data;
		$scope.reviews = UserReviews.data;

		_.each($scope.reviews, function(review) {

			review.placeData = _.find($scope.places, function(place) { return parseInt(place.ID) == parseInt(review.place); });

		});

		$scope.getUserRegistration = function() {

			return moment($scope.user.registered).format('L');

		};

		$scope.getUserAvatar = function() {
			return $scope.user.avatar.replace('?s=96', '?s=400');
		};
	}
]);

},{}],14:[function(require,module,exports){
'use strict';

angular.module('bikeit.user', [])

.config([
	'$stateProvider',
	function($stateProvider) {
		$stateProvider
			.state('user', {
				url: '/user/:userId/',
				controller: 'UserSingleController',
				templateUrl: window.bikeit.templateUri.split(window.location.origin)[1] + '/views/user/single.html',
				resolve: {
					'UserData': [
						'$stateParams',
						'WPService',
						function($stateParams, WP) {
							return WP.getUser($stateParams.userId);
						}
					],
					'UserPlaces': [
						'$stateParams',
						'WPService',
						function($stateParams, WP) {
							return WP.query({
								filter: {
									'user_reviewed': $stateParams.userId,
									'posts_per_page': -1
								}
							});
						}
					],
					'UserReviews': [
						'$stateParams',
						'WPService',
						function($stateParams, WP) {
							return WP.query({
								type: 'review',
								filter: {
									'author': $stateParams.userId
								}
							});
						}
					]
				}
			});
	}
])

require('./controllers.js');

},{"./controllers.js":13}],15:[function(require,module,exports){
'use strict';

/*
 * Message module
 */
angular.module('bikeit.message', [])

.config([
	'$httpProvider',
	function($httpProvider) {
		$httpProvider.interceptors.push('MessageInterceptor');
	}
])

.factory('MessageService', [
	'$timeout',
	function($timeout) {

		var messages = [];
		var enabled = true;

		return {
			get: function() {
				return messages;
			},
			close: function(message) {
				messages = messages.filter(function(m) { return m !== message; });
			},
			add: function(val, timeout) {

				if(enabled) {

					var self = this;

					if(typeof val !== 'undefined') {

						var message = val;

						if(typeof message == 'string') {
							message = {
								text: message
							};
						}

						messages.push(message);

						if(timeout !== false) {
							timeout = timeout ? timeout : 3000;
							$timeout(function() {
								self.close(message);
							}, timeout);
						}

					}

				}

				return message;
			},
			message: function(val, timeout) {
				this.add(val, timeout);
			},
			disable: function() {
				enabled = false;
			},
			enable: function() {
				enabled = true;
			}
		}

	}
])

.factory('MessageInterceptor', [
	'$q',
	'$rootScope',
	'$timeout',
	'MessageService',
	function($q, $rootScope, $timeout, Message) {

		return {
			request: function(config) {
				return config || $q.when(config);
			},
			response: function(response) {
				if(response.data.length && response.data[0].message) {
					Message.add(response.data[0].message);
				}
				return response || $q.when(response);
			},
			responseError: function(rejection) {
				if(rejection.data.length && rejection.data[0].message) {
					Message.add(rejection.data[0].message);
				}
				return $q.reject(rejection);
			}
		}

	}
])

.run([
	'$rootScope',
	'MessageService',
	function($rootScope, Message) {

		jQuery(document).ajaxError(function(e, jqXHR) {
			if(jqXHR.responseJSON.length) {
				jQuery.each(jqXHR.responseJSON, function(i, res) {
					if(res.message) {
						$rootScope.$apply(function() {
							Message.add(res.message);
						});
					}
				});
			}
			if (jqXHR.status == 0) {
				//alert("Element not found.");
			} else {
				//alert("Error: " + textStatus + ": " + errorThrown);
			}
		});

	}
])

.controller('MessageCtrl', [
	'$scope',
	'$sce',
	'MessageService',
	function($scope, $sce, MessageService) {

		$scope.service = MessageService;

		$scope.$watch('service.get()', function(messages) {
			var $dialogs = document.querySelectorAll('.ngdialog');
			if($dialogs.length) {
				$scope.isDialog = true;
			} else {
				$scope.isDialog = false;
			}
			$scope.messages = messages;
		});

		$scope.getMessage = function(message) {
			return $sce.trustAsHtml(message.text);
		};

		$scope.close = function(message) {
			$scope.service.close(message);
		};

	}
]);;
},{}],16:[function(require,module,exports){
'use strict';

module.exports = [
	'$rootScope',
	'$http',
	'$q',
	'$window',
	'apiUrl',
	function($rootScope, $http, $q, $window, apiUrl) {

		var url = apiUrl + 'posts';

		var load = function(query, cb) {

			query = query || {};
			query = _.extend({ page: 1, filter: { posts_per_page: 10 }}, query);

			/*
			 * Using jQuery ajax because angular doesnt handle nested query string
			 */

			jQuery.ajax({
				url: url,
				data: query,
				dataType: 'json',
				cache: true,
				success: function(data, text, xhr) {

					$rootScope.$apply(function() {
						cb(data, xhr.getResponseHeader('x-wp-total'), xhr.getResponseHeader('x-wp-totalpages'));
					});

				}
			});

		};

		var query = function(query) {

			var deferred = $q.defer();
			var totalPosts;
			var totalPages;
			var currentPage;

			load(query, function(data, total, pageAmount) {

				totalPosts = total;
				totalPages = pageAmount;
				currentPage = query.page;

				deferred.resolve({
					data: data,
					totalPosts: function() {
						return parseInt(totalPosts);
					},
					totalPages: function() {
						return parseInt(totalPages);
					},
					currentPage: function() {
						return parseInt(currentPage);
					},
					nextPage: function() {
						var deferred = $q.defer();
						if(currentPage == totalPages) {
							deferred.resolve(false);
						} else {
							load(_.extend(query, { page: currentPage+1 }), function(data) {
								currentPage++;
								deferred.resolve(data);
							});
						}
						return deferred.promise;
					},
					prevPage: function() {
						var deferred = $q.defer();
						if(currentPage == 1) {
							deferred.resolve(false);
						} else {
							load(_.extend(query, { page: currentPage-1 }), function(data) {
								currentPage--;
								deferred.resolve(data);
							});
						}
						return deferred.promise;
					}
				});

			});

			return deferred.promise;

		};

		var lastPerPage;

		return {
			query: query,
			get: function(perPage, page) {
				page = page || 1;
				perPage = perPage || lastPerPage;
				lastPerPage = perPage;
				return query({
					page: page,
					filter: {
						posts_per_page: perPage
					}
				});
			},
			search: function(text, perPage, page) {
				page = page || 1;
				perPage = perPage || lastPerPage;
				return query({
					page: page,
					filter: {
						s: text,
						posts_per_page: perPage
					}
				});
			},
			getUser: function(userId) {

				userId = userId || 'me';

				var deferred = $q.defer();

				jQuery.ajax({
					url: apiUrl + 'users/' + userId,
					dataType: 'json',
					cache: true,
					success: function(data, text, xhr) {
						deferred.resolve(data);
					},
					error: function(xhr, text, error) {
						deferred.reject(xhr.responseJSON);
					}
				});

				return deferred.promise;

			},
			getPost: function(postId) {

				var deferred = $q.defer();

				jQuery.ajax({
					url: url + '/' + postId,
					dataType: 'json',
					cache: true,
					success: function(data, text, xhr) {
						deferred.resolve(data);
					},
					error: function(xhr, text, error) {
						deferred.reject(xhr.responseJSON);
					}
				});

				return deferred.promise;

			},
			getPostComments: function(postId) {

				var deferred = $q.defer();

				jQuery.ajax({
					url: url + '/' + postId + '/comments',
					dataType: 'json',
					cache: true,
					success: function(data, text, xhr) {
						deferred.resolve(data);
					},
					error: function(xhr, text, error) {
						deferred.reject(xhr.responseJSON);
					}
				});

				return deferred.promise;

			},
			post: function(data) {

				var deferred = $q.defer();

				jQuery.ajax({
					url: url,
					dataType: 'json',
					type: 'POST',
					data: {
						data: data
					},
					success: function(data, text, xhr) {
						deferred.resolve(data);
					},
					error: function(xhr, text) {
						deferred.reject(xhr.responseJSON);
					}
				});

				return deferred.promise;

			},
			update: function(data) {

				var deferred = $q.defer();

				jQuery.ajax({
					url: url + '/' + data.ID,
					dataType: 'json',
					type: 'POST',
					data: {
						data: data
					},
					success: function(data, text, xhr) {
						deferred.resolve(data);
					},
					error: function(xhr, text) {
						deferred.reject(xhr.responseJSON);
					}
				});

				return deferred.promise;

			}
		}

	}
];
},{}]},{},[3]);
