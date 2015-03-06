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
							var deferred = $q.defer();
							var data = {};
							WP.getPost($stateParams.placeId).then(function(place) {
								data.place = place;
								WP.query({
									filter: {
										'place_reviews': place.ID
									}
								}).then(function(reviews) {
									data.reviews = reviews;
									deferred.resolve(data);
								});
							});
							return deferred.promise;
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