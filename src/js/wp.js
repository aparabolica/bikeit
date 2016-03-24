'use strict';

module.exports = [
	'$rootScope',
	'$http',
	'$q',
	'$window',
	'apiUrl',
	'mainApiUrl',
	function($rootScope, $http, $q, $window, apiUrl, mainApiUrl) {

		var url = apiUrl + 'posts';

		var load = function(query, cb, options) {

			query = query || {};
			query = _.extend({ page: 1, filter: { posts_per_page: 10 }}, query);

			/*
			 * Using jQuery ajax because angular doesnt handle nested query string
			 */

			jQuery.ajax(_.extend({
				url: url,
				data: query,
				dataType: 'json',
				cache: true,
				success: function(data, text, xhr) {

					$rootScope.$apply(function() {
						cb(data, xhr.getResponseHeader('x-wp-total'), xhr.getResponseHeader('x-wp-totalpages'));
					});

				}
			}, options));

		};

		var query = function(query, options) {

			options = options || {};

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
							}, options);
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
							}, options);
						}
						return deferred.promise;
					}
				});

			}, options);

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
					url: apiUrl + 'users/' + userId,
					dataType: 'json',
					cache: true,
					success: function(data, text, xhr) {
						deferred.resolve(data);
					},
					error: function(xhr, text, error) {
						deferred.reject(xhr.responseJSON);
					}
				});

				return deferred.promise;

			},
			updateUser: function(userId, data) {

				userId = userId || 'me';

				var deferred = $q.defer();

				jQuery.ajax({
					url: apiUrl + 'users/' + userId,
					type: 'PUT',
					data: data,
					dataType: 'json',
					cache: true,
					success: function(data, text, xhr) {
						deferred.resolve(data);
					},
					error: function(xhr, text, error) {
						deferred.reject(xhr.responseJSON);
					}
				});

				return deferred.promise;

			},
			getContributor: function(userId) {

				var deferred = $q.defer();

				jQuery.ajax({
					url: apiUrl + 'contributors/' + userId,
					dataType: 'json',
					cache: true,
					success: function(data, text, xhr) {
						deferred.resolve(data);
					},
					error: function(xhr, text, error) {
						deferred.reject(xhr.responseJSON);
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
					error: function(xhr, text, error) {
						deferred.reject(xhr.responseJSON);
					}
				});

				return deferred.promise;

			},
			getPage: function(pageId) {

				var deferred = $q.defer();

				jQuery.ajax({
					url: mainApiUrl + 'posts/' + pageId,
					dataType: 'json',
					cache: true,
					success: function(data, text, xhr) {
						deferred.resolve(data);
					},
					error: function(xhr, text, error) {
						deferred.reject(xhr.responseJSON);
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
					error: function(xhr, text, error) {
						deferred.reject(xhr.responseJSON);
					}
				});

				return deferred.promise;

			},
			post: function(data) {

				var deferred = $q.defer();

				if(data.ID) {

					jQuery.ajax({
						url: url + '/' + data.ID,
						dataType: 'json',
						type: 'PUT',
						data: data,
						success: function(data, text, xhr) {
							deferred.resolve(data);
						},
						error: function(xhr, text) {
							deferred.reject(xhr.responseJSON);
						}
					});

				} else {

					jQuery.ajax({
						url: url,
						dataType: 'json',
						type: 'POST',
						data: data,
						success: function(data, text, xhr) {
							deferred.resolve(data);
						},
						error: function(xhr, text) {
							deferred.reject(xhr.responseJSON);
						}
					});

				}

				return deferred.promise;

			},
			comment: function(postId, comment) {

				var deferred = $q.defer();
				jQuery.ajax({
					url: url + '/' + postId + '/comment',
					dataType: 'json',
					type: 'POST',
					data: {
						'comment_content': comment
					},
					success: function(data, text, xhr) {
						deferred.resolve(data);
					},
					error: function(xhr, text) {
						deferred.reject(xhr.responseJSON);
					}
				});

				return deferred.promise;

			},
			update: function(data) {

				var deferred = $q.defer();

				jQuery.ajax({
					url: url + '/' + data.ID,
					dataType: 'json',
					type: 'POST',
					data: data,
					success: function(data, text, xhr) {
						deferred.resolve(data);
					},
					error: function(xhr, text) {
						deferred.reject(xhr.responseJSON);
					}
				});

				return deferred.promise;

			},
			delete: function(data) {

				var deferred = $q.defer();

				jQuery.ajax({
					url: url + '/' + data.ID,
					dataType: 'json',
					type: 'DELETE',
					success: function(data, text, xhr) {
						deferred.resolve(data);
					},
					error: function(xhr, text) {
						deferred.reject(xhr.responseJSON);
					}
				});

				return deferred.promise;
			},
			media: function(data) {

				var deferred = $q.defer();

				jQuery.ajax({
					url: apiUrl + 'media',
					type: 'POST',
					data: data,
					async: false,
					cache: false,
					contentType: false,
					processData: false,
					headers: { 'Content-Disposition': 'attachment;filename=' + data.name },
					success: function(data, text, xhr) {
						deferred.resolve(data);
					},
					error: function(xhr, text) {
						deferred.reject(xhr.responseJSON);
					}
				});

				return deferred.promise;

			}
		}

	}
];
