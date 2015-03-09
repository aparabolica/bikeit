/*
 * Modules
 */

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
