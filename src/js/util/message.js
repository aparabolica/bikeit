'use strict';

/*
 * Message module
 */
angular.module('bikeit.message', [])

.config([
	'$httpProvider',
	function($httpProvider) {
		$httpProvider.interceptors.push('MessageInterceptor');
	}
])

.factory('MessageService', [
	'$timeout',
	function($timeout) {

		var messages = [];
		var enabled = true;

		return {
			get: function() {
				return messages;
			},
			close: function(message) {
				messages = messages.filter(function(m) { return m !== message; });
			},
			add: function(val, timeout) {

				if(enabled) {

					var self = this;

					if(typeof val !== 'undefined') {

						var message = val;

						if(typeof message == 'string') {
							message = {
								text: message
							};
						}

						messages.push(message);

						if(timeout !== false) {
							timeout = timeout ? timeout : 3000;
							$timeout(function() {
								self.close(message);
							}, timeout);
						}

					}

				}

				return message;
			},
			message: function(val, timeout) {
				this.add(val, timeout);
			},
			disable: function() {
				enabled = false;
			},
			enable: function() {
				enabled = true;
			}
		}

	}
])

.factory('MessageInterceptor', [
	'$q',
	'$rootScope',
	'$timeout',
	'MessageService',
	function($q, $rootScope, $timeout, Message) {

		return {
			request: function(config) {
				return config || $q.when(config);
			},
			response: function(response) {
				if(response.data && response.data.message) {
					Message.add(response.data.message);
				}
				return response || $q.when(response);
			},
			responseError: function(rejection) {
				if(rejection.data && rejection.data.message) {
					Message.add(rejection.data.message);
				}
				return $q.reject(rejection);
			}
		}

	}
])

.run([
	'$rootScope',
	'MessageService',
	function($rootScope, Message) {

		jQuery(document).ajaxError(function(e, jqXHR) {
			if(jqXHR.responseJSON.length) {
				jQuery.each(jqXHR.responseJSON, function(i, res) {
					if(res.message) {
						$rootScope.$apply(function() {
							Message.add(res.message);
						});
					}
				});
			}
			if (jqXHR.status == 0) {
				//alert("Element not found.");
			} else {
				//alert("Error: " + textStatus + ": " + errorThrown);
			}
		});

	}
])

.controller('MessageCtrl', [
	'$scope',
	'MessageService',
	function($scope, MessageService) {

		$scope.service = MessageService;

		$scope.$watch('service.get()', function(messages) {
			$scope.messages = messages;
		});

		$scope.close = function(message) {
			$scope.service.close(message);
		}

	}
]);;