'use strict';

angular.module('bikeit.review', [])

.factory('ReviewService', [
	'$http',
	'$q',
	'apiUrl',
	function($http, $q, apiUrl) {

		return {
			vote: function(id, vote) {
				return $http.post(apiUrl + 'posts/' + id + '/vote', {vote: vote});
			},
			unvote: function(id) {
				return $http.delete(apiUrl + 'posts/' + id + '/vote');
			}
		}

	}
])

require('./directives')

require('./controllers');
