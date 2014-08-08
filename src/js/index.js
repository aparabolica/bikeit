require('angular');
require('ui-router');
require('leaflet');
require('angular-leaflet/dist/angular-leaflet-directive');

/*
 * Modules
 */

require('./home');

/*
 * Main module
 */

angular.module('bikeit', [
	'ui.router',
	'bikeit.home',
	'leaflet-directive'
])

.constant('baseUrl', window.bikeit.url.split(window.location.origin)[1])
.constant('templatePath', window.bikeit.templateUri.split(window.location.origin)[1])
.constant('siteName', window.bikeit.name)

.config([
	'$locationProvider',
	function($locationProvider) {
		$locationProvider.html5Mode(false);
		$locationProvider.hashPrefix('!');
	}
])

.factory('WPService', require('./service'));

jQuery(document).ready(function() {
	angular.bootstrap(document, ['bikeit']);
});