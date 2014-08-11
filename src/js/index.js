require('angular');
require('ui-router');
require('leaflet');
require('angular-leaflet/dist/angular-leaflet-directive');

/*
 * Modules
 */

require('./map');
require('./home');
require('./place');

/*
 * Main module
 */

angular.module('bikeit', [
	'ui.router',
	'bikeit.map',
	'bikeit.home',
	'bikeit.place',
	'leaflet-directive'
])

.constant('baseUrl', window.bikeit.url.split(window.location.origin)[1])
.constant('templatePath', window.bikeit.templateUri.split(window.location.origin)[1])
.constant('siteName', window.bikeit.name)
.constant('macroLocation', window.bikeit.macroLocation)
.constant('labels', window.bikeit.labels)

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