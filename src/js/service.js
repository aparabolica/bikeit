'use strict';

module.exports = [
	'$rootScope',
	'$http',
	'$q',
	'$window',
	'apiUrl',
	function($rootScope, $http, $q, $window, apiUrl) {

		var url = apiUrl + '/posts';

		var load = function(query, cb) {

			query = query || {};
			query = _.extend({ page: 1, filter: { posts_per_page: 10 }}, query);

			/*
			 * Using jQuery ajax because angular doesnt handle nested query string
			 */

			jQuery.ajax({
				url: url,
				data: query,
				dataType: 'json',
				cache: true,
				success: function(data, text, xhr) {

					$rootScope.$apply(function() {
						cb(data, xhr.getResponseHeader('x-wp-total'), xhr.getResponseHeader('x-wp-totalpages'));
					});

				}
			});

		};

		var query = function(query) {

			var deferred = $q.defer();
			var totalPosts;
			var totalPages;
			var currentPage;

			load(query, function(data, total, pageAmount) {

				totalPosts = total;
				totalPages = pageAmount;
				currentPage = query.page;

				deferred.resolve({
					data: data,
					totalPosts: function() {
						return parseInt(totalPosts);
					},
					totalPages: function() {
						return parseInt(totalPages);
					},
					currentPage: function() {
						return parseInt(currentPage);
					},
					nextPage: function() {
						var deferred = $q.defer();
						if(currentPage == totalPages) {
							deferred.resolve(false);
						} else {
							load(_.extend(query, { page: currentPage+1 }), function(data) {
								currentPage++;
								deferred.resolve(data);
							});
						}
						return deferred.promise;
					},
					prevPage: function() {
						var deferred = $q.defer();
						if(currentPage == 1) {
							deferred.resolve(false);
						} else {
							load(_.extend(query, { page: currentPage-1 }), function(data) {
								currentPage--;
								deferred.resolve(data);
							});
						}
						return deferred.promise;
					}
				});

			});

			return deferred.promise;

		};

		var lastPerPage;

		return {
			query: query,
			get: function(perPage, page) {
				page = page || 1;
				perPage = perPage || lastPerPage;
				lastPerPage = perPage;
				return query({
					page: page,
					filter: {
						posts_per_page: perPage
					}
				});
			},
			search: function(text, perPage, page) {
				page = page || 1;
				perPage = perPage || lastPerPage;
				return query({
					page: page,
					filter: {
						s: text,
						posts_per_page: perPage
					}
				});
			},
			getUser: function(userId) {

				userId = userId || 'me';

				var deferred = $q.defer();

				jQuery.ajax({
					url: apiUrl + '/users/' + userId,
					dataType: 'json',
					cache: true,
					success: function(data, text, xhr) {
						deferred.resolve(data);
					},
					error: function(xhr, text) {
						deferred.reject(text);
					}
				});

				return deferred.promise;

			},
			getPost: function(postId) {

				var deferred = $q.defer();

				jQuery.ajax({
					url: url + '/' + postId,
					dataType: 'json',
					cache: true,
					success: function(data, text, xhr) {
						deferred.resolve(data);
					},
					error: function(xhr, text) {
						deferred.reject(text);
					}
				});

				return deferred.promise;

			},
			getPostComments: function(postId) {

				var deferred = $q.defer();

				jQuery.ajax({
					url: url + '/' + postId + '/comments',
					dataType: 'json',
					cache: true,
					success: function(data, text, xhr) {
						deferred.resolve(data);
					},
					error: function(xhr, text) {
						deferred.reject(text);
					}
				});

				return deferred.promise;

			},
			post: function(data) {

				var deferred = $q.defer();

				console.log(data);

				jQuery.ajax({
					url: url,
					dataType: 'json',
					type: 'POST',
					data: {
						data: data
					},
					success: function(data, text, xhr) {
						deferred.resolve(data);
					},
					error: function(xhr, text) {
						deferred.reject(text);
					}
				});

				return deferred.promise;

			}
		}

	}
];