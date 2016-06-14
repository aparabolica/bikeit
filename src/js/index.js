window._gaq = _gaq || [];
window._gaq.push(['_setAccount', "UA-79265810-1"]);
window._gaq.push(['_setDomainName', 'bikeit.com.br']);
(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

/*
 * Libraries
 */

window._ = require('underscore');
window.angular = require('angular');
window.osmIcons = require('./osm-icons');
require('leaflet');
require('angular-leaflet');
require('angular-ui-router');
require('ng-dialog');
require('ng-file-upload');

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
	'angularFileUpload',
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
.constant('mainApiUrl', window.bikeit.mainApiUrl)
.constant('nonce', window.bikeit.nonce)
.constant('baseUrl', window.bikeit.url.split(window.location.origin)[1])
.constant('templatePath', window.bikeit.templateUri.split(window.location.origin)[1])
.constant('siteName', window.bikeit.name)
.constant('labels', window.bikeit.labels)

.config([
	'$locationProvider',
	'$urlRouterProvider',
	function($locationProvider, $urlRouterProvider) {
		$locationProvider.html5Mode(false);
		$locationProvider.hashPrefix('!');

		/*
		 * Trailing slash rule
		 */
		$urlRouterProvider.rule(function($injector, $location) {
			var path = $location.path(),
				search = $location.search(),
				params;

			// check to see if the path already ends in '/'
			if (path[path.length - 1] === '/') {
				return;
			}

			// If there was no search string / query params, return with a `/`
			if (Object.keys(search).length === 0) {
				return path + '/';
			}

			// Otherwise build the search string and return a `/?` prefix
			params = [];
			angular.forEach(search, function(v, k){
				params.push(k + '=' + v);
			});

			return path + '/?' + params.join('&');
		});
	}
])

.run([
	'$rootScope',
	'$location',
	'$window',
	function($rootScope, $location, $window) {
		/*
		 * Analytics
		 */
		$rootScope.$on('$stateChangeSuccess', function(ev, toState, toParams, fromState, fromParams) {
			if($window._gaq) {
				$window._gaq.push(['_trackPageview', $location.path()]);
			}
			if(fromState.name) {
				if(toState.name != 'placesSingle.singleReview') {
					jQuery('html,body').animate({
						scrollTop: 0
					}, '200');
				}
			}
		});
	}
])

.factory('WPService', require('./wp'))

.directive('tooltip', function() {
	return {
		restrict: 'A',
		scope: {
			'tooltip': '@'
		},
		link: function(scope, element, attrs) {
			scope.$watch('tooltip', function() {
				element.removeClass('has-tooltip');
				element.find('.tooltip').remove();
				if(scope.tooltip) {
					element.addClass('has-tooltip');
					element.append('<span class="tooltip"><span>' + scope.tooltip + '</span></span>');
				}
			});
		}
	}
})

.directive('backImg', function(){
	return {
		restrict: 'A',
		scope: {
			backImg: '='
		},
		link: function(scope, element, attrs) {
			element.css({
				'background-size' : 'cover'
			});
			scope.$watch('backImg', function(url) {
				element.css({
					'background-image': 'url(' + url + ')'
				});
			});
		}
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
			else {
				console.log(text);
				return text;
			}
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
					$scope.addressResults = data;
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
])

.filter('rating', [
	function() {
		return function(input) {
			if(isNaN(input) || !input)
				return 0;
			else {
				var n = parseFloat(input).toFixed(2);
				return n.toString().replace('.00', '');
			}
		}
	}
])

.filter('fromNow', [
	function() {
		return _.memoize(function(input) {
			return moment(input).utc().fromNow();
		});
	}
])

.filter('formatDate', [
	function() {
		return _.memoize(function(input, format) {
			return moment(input).utc().format(format);
		});
	}
]);

require('./loading');

angular.element(document).ready(function() {
	angular.bootstrap(document, ['bikeit']);
});
