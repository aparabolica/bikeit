(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

angular.module('bikeit.auth', [])

.factory('authInterceptor', [
	'$rootScope',
	'$q',
	'nonce',
	function($rootScope, $q, nonce) {

		jQuery.ajaxSetup({
			beforeSend: function(req) {
				req.setRequestHeader("X-WP-Nonce", nonce);
			}
		});

		return {
			request: function(config) {
				config.headers = config.headers || {};
				config.headers['X-WP-Nonce'] = nonce;
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
								type: 'place'
							});
						}
					]
				}
			});

	}
])
.controller('HomeController', [
	'labels',
	'HomeData',
	'$scope',
	function(labels, HomeData, $scope) {

		$scope.labels = labels;

		$scope.posts = HomeData.data;

	}
]);
},{}],3:[function(require,module,exports){
/*
 * Modules
 */

require('./auth');

require('./user');
require('./map');
require('./home');
require('./place');

/*
 * Main module
 */

angular.module('bikeit', [
	'ngDialog',
	'ui.router',
	'bikeit.auth',
	'bikeit.user',
	'bikeit.map',
	'bikeit.home',
	'bikeit.place',
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

.factory('WPService', require('./service'))

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
});

jQuery(document).ready(function() {
	console.log(window.bikeit);
	angular.bootstrap(document, ['bikeit']);
});
},{"./auth":1,"./home":2,"./map":4,"./place":5,"./service":6,"./user":7}],4:[function(require,module,exports){
'use strict';

L.Icon.Default.imagePath = window.bikeit.templateUri + '/css/images';

angular.module('bikeit.map', [
	'leaflet-directive'
])
.controller('MapController', [
	'labels',
	'leafletData',
	'leafletEvents',
	'$scope',
	function(labels, leafletData, leafletEvents, $scope) {

		$scope.mapDefaults = {

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
			console.log('Should go to place');
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

					m.fitBounds(bounds, { reset: true });

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

			var image = place.markers.approved;
			var position = place.markers.position;
			var popupAnchor;

			if(position == 'center') {
				position = [image.width/2, image.height/2];
				popupAnchor = [0, -image.height/2-10];
			} else if(position == 'bottom_center') {
				position = [image.width/2, image.height];
				popupAnchor = [0, -image.height-10];
			} else if(position == 'bottom_left') {
				position = [0, image.height];
				popupAnchor = [image.width/2, -image.height-10];
			} else if(position == 'bottom_right') {
				position = [image.width, image.height];
				popupAnchor = [-image.width/2, -image.height-10];
			}

			markers['place-category-' + place.term_id] = {
				iconUrl: image.url,
				shadowUrl: false,
				shadowSize: [0,0],
				iconSize: [image.width, image.height],
				iconAnchor: position,
				popupAnchor: popupAnchor
			};

		});

		return markers;

	}
]);
},{}],5:[function(require,module,exports){
'use strict';

angular.module('bikeit.place', [])

.directive('placeListItem', [
	'templatePath',
	function(templatePath) {
		return {
			restrict: 'E',
			scope: {
				place: '='
			},
			templateUrl: templatePath + '/views/place/partials/place-list-item.html',
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

				if(place.terms['place-category']) {

					return place.terms['place-category'][0].markers.approved;

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
					var icon = {};
					if(place.terms['place-category']) {
						var catId = place.terms['place-category'][0].ID;
						icon = Markers['place-category-' + catId];
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
},{}],6:[function(require,module,exports){
'use strict';

module.exports = [
	'$rootScope',
	'$http',
	'$q',
	'$window',
	'apiUrl',
	function($rootScope, $http, $q, $window, apiUrl) {

		var url = apiUrl + '/posts';

		var load = function(query, cb) {

			query = query || { page: 1, filter: { posts_per_page: 10 }};

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
					url: apiUrl + '/users/' + userId,
					dataType: 'json',
					cache: true,
					success: function(data, text, xhr) {
						deferred.resolve(data);
					},
					error: function(xhr, text) {
						deferred.reject(text);
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
					error: function(xhr, text) {
						deferred.reject(text);
					}
				});

				return deferred.promise;

			}
		}

	}
];
},{}],7:[function(require,module,exports){
'use strict';

angular.module('bikeit.user', [])

.controller('UserController', [
	'WPService',
	'$scope',
	function(WP, $scope) {

		$scope.loadedUser = false;

		$scope.getUser = function() {
			WP.getUser().then(function(data) {
				$scope.loadedUser = true;
				$scope.user = data;
			}, function() {
				$scope.loadedUser = true;
			});
		};

	}
]);
},{}]},{},[3]);