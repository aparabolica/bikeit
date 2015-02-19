'use strict';

angular.module('bikeit.auth', [])

.factory('AuthService', [
	'nonce',
	'$location',
	function(nonce, $location) {

		return {
			getNonce: function() {
				return nonce;
			},
			setNonce: function(val) {
				nonce = val;
			},
			login: function() {
				window.location = bikeit.url + '/wp-login.php?redirect_to=' + $location.absUrl();
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

			Auth.setNonce(false);

			$http.post(apiUrl + '/auth', data)
				.success(function(data) {
					$http.get(apiUrl + '/auth/nonce').success(function(data) {
						Auth.setNonce(data.nonce);
					});
				})
				.error(function(data) {
					console.log(data);
				});
		}

	}
]);