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