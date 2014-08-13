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
	console.log(window.bikeit);
	angular.bootstrap(document, ['bikeit']);
});