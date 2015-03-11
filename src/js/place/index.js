'use strict';

angular.module('bikeit.place', [])

.config([
	'$stateProvider',
	function($stateProvider) {
		$stateProvider
			.state('places', {
				url: '/places/',
				controller: 'PlaceIndexController',
				templateUrl: window.bikeit.templateUri.split(window.location.origin)[1] + '/views/place/index.html'
			})
			.state('placesSingle', {
				url: '/places/:placeId/',
				controller: 'PlaceSingleController',
				templateUrl: window.bikeit.templateUri.split(window.location.origin)[1] + '/views/place/single.html',
				resolve: {
					'PlaceData': [
						'$q',
						'$stateParams',
						'WPService',
						function($q, $stateParams, WP) {
							return WP.getPost($stateParams.placeId);
						}
					],
					'PlaceReviews': [
						'$stateParams',
						'WPService',
						function($stateParams, WP) {
							return WP.query({
								filter: {
									'place_reviews': $stateParams.placeId
								}
							});
						}
					]
				}
			})
			.state('placesSingle.review', {
				url: 'review/'
			});
	}
])

require('./directives');

require('./controllers');

require('./filters');