'use strict';

angular.module('bikeit.user', [])

.config([
	'$stateProvider',
	function($stateProvider) {
		$stateProvider
			.state('user', {
				url: '/user/:userId/',
				controller: 'UserSingleController',
				templateUrl: window.bikeit.templateUri.split(window.location.origin)[1] + '/views/user/single.html',
				resolve: {
					'UserData': [
						'$q',
						'$stateParams',
						'WPService',
						function($q, $stateParams, WP) {
							return WP.getUser($stateParams.userId);
						}
					]
				}
			});
	}
])

require('./controllers.js');
