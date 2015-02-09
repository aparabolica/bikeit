'use strict';

angular.module('bikeit.auth', [])

.factory('AuthService', [
	'nonce',
	function(nonce) {

		return {
			getNonce: function() {
				return nonce;
			},
			setNonce: function(val) {
				nonce = val;
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
				console.log('Outgoing with: ' + Auth.getNonce());
				if(Auth.getNonce())
					req.setRequestHeader("X-WP-Nonce", Auth.getNonce());
			}
		});

		return {
			request: function(config) {
				console.log('Outgoing with: ' + Auth.getNonce());
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
			// $http.post(apiUrl + '/auth', data)
			// 	.success(function(data) {
			// 		// Auth.setNonce(false);
			// 		// $http.get(apiUrl + '/auth/nonce').success(function(data) {
			// 		// 	Auth.setNonce(data.nonce);
			// 		// });
			// 	})
			// 	.error(function(data) {
			// 		console.log(data);
			// 	});
		}

	}
]);