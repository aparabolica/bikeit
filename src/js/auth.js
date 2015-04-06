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
	'$rootScope',
	'$scope',
	'$http',
	'apiUrl',
	'AuthService',
	'WPService',
	function($rootScope, $scope, $http, apiUrl, Auth, WP) {

		$scope.login = function(data) {

			$http.post(apiUrl + 'auth', _.extend({
				'_wp_json_nonce': Auth.getNonce()
			}, data))
				.success(function(data) {
					Auth.setNonce('auth');
					WP.getUser().then(function(data) {
						Auth.setUser(data);
					});
					$rootScope.$broadcast('bikeit.userLoggedIn');
				})
				.error(function(data) {
					console.log(data);
				});
		}

		$scope.register = function(data) {

			$http.post(apiUrl + 'register', _.extend({
				'_wp_json_nonce': Auth.getNonce()
			}, data))
				.success(function(data) {
					Auth.setNonce('auth');
					Auth.setUser(data);
					$rootScope.$broadcast('bikeit.userRegistered');
				})
				.error(function(data) {
					console.log(data);
				});

		}

	}
]);