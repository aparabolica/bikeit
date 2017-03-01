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
						'$stateParams',
						'WPService',
						function($stateParams, WP) {
							return WP.getPost($stateParams.placeId);
						}
					],
					'PlaceReviews': [
						'$stateParams',
						'WPService',
						function($stateParams, WP) {
							return WP.query({
								filter: {
									'place_reviews': $stateParams.placeId,
									'order': 'DESC'
								}
							});
						}
					]
				}
			})
			.state('placesSingle.singleReview', {
				url: 'r/:reviewId/',
				controller: 'ReviewSingleCtrl',
				templateUrl: window.bikeit.templateUri.split(window.location.origin)[1] + '/views/review/single.html',
				resolve: {
					'SingleReview': [
						'$stateParams',
						'WPService',
						function($stateParams, WP) {
							return WP.getPost($stateParams.reviewId);
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
