(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

require('./auth');

require('./user');
require('./map');
require('./home');
require('./place');
require('./review');

/*
 * Main module
 */

angular.module('bikeit', [
	'ui.router',
	'bikeit.auth',
	'bikeit.user',
	'bikeit.map',
	'bikeit.home',
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

.controller('SiteController', [
	'$state',
	'labels',
	'$scope',
	function($state, labels, $scope) {

		$scope.labels = labels;

		$scope.goHome = function() {
			$state.go('home');
		};

	}
]);

jQuery(document).ready(function() {
	console.log(window.bikeit);
	angular.bootstrap(document, ['bikeit']);
});
},{"./auth":1,"./home":2,"./map":4,"./place":5,"./review":6,"./service":7,"./user":8}],4:[function(require,module,exports){
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

			var images = ['default', 'approved', 'unapproved'];

			_.each(images, function(image) {

				var imageObj = place.markers[image];
				var position = place.markers.position;
				var popupAnchor;

				if(position == 'center') {
					position = [imageObj.width/2, imageObj.height/2];
					popupAnchor = [0, -imageObj.height/2-10];
				} else if(position == 'bottom_center') {
					position = [imageObj.width/2, imageObj.height];
					popupAnchor = [0, -imageObj.height-10];
				} else if(position == 'bottom_left') {
					position = [0, imageObj.height];
					popupAnchor = [imageObj.width/2, -imageObj.height-10];
				} else if(position == 'bottom_right') {
					position = [imageObj.width, imageObj.height];
					popupAnchor = [-imageObj.width/2, -imageObj.height-10];
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
},{}],6:[function(require,module,exports){
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
			template: '<span class="rating rating-{{type}} clearfix" title="{{rating | number}}/5"><span class="rating-item" ng-repeat="i in range(5) track by $index"><span class="rating-filled" style="width:{{filledAmount($index+1)}}%">&nbsp;</span></span></span>',
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
},{}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
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
