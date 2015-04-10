'use strict';

angular.module('bikeit.place')

.filter('hideFound', [
	function() {
		return function(input, found) {

			if(input.length && found.length) {

				input = _.filter(input, function(item) {
					return !_.find(found, function(fItem) {
						return item.osm_id == fItem.osm_id;
					});
				});

			}

			return input;

		}
	}
])

.filter('placeToMarker', [
	'leafletData',
	'MapMarkers',
	function(leafletData, Markers) {
		return _.memoize(function(input) {

			if(input.length) {

				var markers = {};
				_.each(input, function(place) {

					var approval = 'default';


					if(place.stamped)
						approval = 'stamp';
					else {
						if(parseFloat(place.scores.approved) >= 0.5)
							approval = 'approved';
						else
							approval = 'failed';
					}

					var icon = {};
					if(place.terms['place-category']) {
						var catId = place.terms['place-category'][0].ID;
						icon = Markers['place-category-' + catId + '-' + approval];
					}
					markers[place.ID] = {
						lat: place.location.lat,
						lng: place.location.lng,
						icon: icon,
						message: '<h2>' + place.title + '</h2>' + '<p>' + place.formatted_address + '</p>'
					};
				});

				return markers;

			}

			return {};

		}, function() {
			return JSON.stringify(arguments);
		});
	}
])

.filter('placeCategory', function() {
	return function(input, categoryId) {

		if(categoryId) {

			return _.filter(input, function(place) {
				return place.terms['place-category'] && parseInt(place.terms['place-category'][0].ID) == parseInt(categoryId);
			});

		}

		return input;

	}
})

.filter('score', function() {
	return function(input, score) {

		if(score) {
			return _.filter(input, function(place) {
				if(score == 'stamp') {
					return parseInt(place.stamped);
				} else {
					var approval;
					if(parseFloat(place.scores.approved) >= 0.5)
						approval = 'approved';
					else
						approval = 'failed';
					return score == approval;
				}
			});
		}
		return input;

	}
});