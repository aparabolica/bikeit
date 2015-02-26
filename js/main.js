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
.controller('LoginForm', [
	'$scope',
	'$http',
	'apiUrl',
	'AuthService',
	function($scope, $http, apiUrl, Auth) {

		$scope.login = function(data) {

			$http.post(apiUrl + '/auth', _.extend({
				'_wp_json_nonce': Auth.getNonce()
			}, data))
				.success(function(data) {
					Auth.setNonce('auth');
					Auth.setUser(data);
				})
				.error(function(data) {
					console.log(data);
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
	'ngDialog',
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

		$scope.goHome = function() {
			$state.go('home');
		};

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

jQuery(document).ready(function() {
	console.log(bikeit);
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
			})
			.state('placesSingle.review', {
				url: 'review/'
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
	'$state',
	function(PlaceData, $scope, $state) {

		$scope.place = PlaceData.place;
		$scope.reviews = PlaceData.reviews.data;

		console.log($state);

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

		console.log($scope.categories);

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
		};

		$scope.newPlace = function(place) {
			$scope.place = _.clone(place) || {};
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
				'title': place.name,
				'content_raw': ' ',
				'type': 'place',
				'status': 'publish',
				'place_meta': {
					'category': place.category,
					'location': {
						'address': $scope.sanitizeAddress(place),
						'lat': parseFloat(place.lat),
						'lng': parseFloat(place.lon)
					},
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

.factory('ReviewService', [
	'$http',
	'$q',
	'apiUrl',
	function($http, $q, apiUrl) {

		return {
			vote: function(id, vote) {
				return $http.post(apiUrl + '/posts/' + id + '/vote', {vote: vote});
			},
			unvote: function(id) {
				return $http.delete(apiUrl + '/posts/' + id + '/vote');
			}
		}

	}
])

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
			return Auth.getNonce();
		}, function(nonce) {
			if(nonce) {
				WP.getUser().then(function(data) {
					$scope.user = data;
					$scope.$emit('userReady', $scope.user);
				});
			} else {
				$scope.user = false;
				$scope.$emit('userReady', false);
			}
		});

		$scope.newReview = function(place) {
			$scope.place = place || false;
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
			WP.post({
				'title': ' ',
				'content_raw': review.content,
				'type': 'review',
				'status': 'publish',
				'review_meta': {
					'approved': review.approved,
					'kindness': review.kindness,
					'structure': review.structure,
					'stampable': review.stampable ? 1 : 0,
					'notify': review.notify ? 1 : 0,
					'place': $scope.place.ID
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

.directive('reviewListItem', [
	'templatePath',
	'Labels',
	'$sce',
	'WPService',
	'ReviewService',
	function(templatePath, labels, $sce, WP, Review) {
		return {
			restrict: 'E',
			scope: {
				review: '='
			},
			templateUrl: templatePath + '/views/review/partials/list-item.html',
			link: function(scope, element, attrs) {

				var review = scope.review;

				scope.labels = labels;

				scope.getReviewDate = function() {

					return moment(review.date).format('L');

				}

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
					if(review.userVote == vote) {

						Review.unvote(review.ID).success(function(data, status, headers, config) {
							review.votes[review.userVote]--;
							review.userVote = false;
						});

					} else {
						Review.vote(review.ID, vote)
							.success(function(data, status, headers, config) {
								if(review.userVote !== vote) {
									review.votes[review.userVote]--;
								}
								review.votes[vote]++;
								review.userVote = vote;
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
	'AuthService',
	'ngDialog',
	'templatePath',
	'Labels',
	'$state',
	function(WP, $scope, Auth, ngDialog, templatePath, labels, $state) {

		$scope.loadedUser = false;

		$scope.labels = labels;

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
			return Auth.getNonce();
		}, function(nonce) {
			$scope.loadedUser = false;
			if(nonce) {
				WP.getUser().then(function(data) {
					$scope.user = data;
					$scope.loadedUser = true;
					if($scope.dialog) {
						$scope.dialog.close();
						$scope.dialog = false;
					}
				}, function(reason) {
					$scope.loadedUser = true;
				});
			} else {
				$scope.user = false;
				$scope.loadedUser = true;
			}
		});

	}
]);
},{}]},{},[3]);
