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
						'$stateParams',
						'WPService',
						function($stateParams, WP) {
							return WP.getContributor($stateParams.userId);
						}
					],
					'UserPlaces': [
						'$stateParams',
						'WPService',
						function($stateParams, WP) {
							return WP.query({
								filter: {
									'user_reviewed': $stateParams.userId,
									'posts_per_page': -1
								}
							});
						}
					],
					'UserReviews': [
						'$stateParams',
						'WPService',
						function($stateParams, WP) {
							return WP.query({
								type: 'review',
								filter: {
									'author': $stateParams.userId
								}
							});
						}
					]
				}
			})
			.state('user.edit', {
				url: 'edit/',
				templateUrl: window.bikeit.templateUri.split(window.location.origin)[1] + '/views/user/edit.html'
			});
	}
])

require('./controllers.js');
