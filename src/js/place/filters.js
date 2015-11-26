'use strict';

angular.module('bikeit.place')

.filter('osmAddress', [
	function() {
		return _.memoize(function(input, type) {
			var address = '';

			if(input) {

				if(input.road) {
					address += input.road;
				}

				if(input.house_number) {
					address += ', ' + input.house_number;
				}

				if(type != 'short') {

					if(input.suburb && input.suburb != input.city_district) {
						if(input.road) {
							address += ' - ';
						}
						address += input.suburb;
					}

					if(input.city_district) {
						if(input.road) {
							address += ' - ';
						}
						address += input.city_district;
					}

				}

			}

			return address;
		}, function() {
			return JSON.stringify(arguments);
		});
	}
])

.filter('osmPlace', [
	'$window',
	function($window) {
		return function(input) {
			if(input && input.length) {
				input = _.filter(input, function(item) {
					if(item.class == 'highway' ||
						item.class == 'place' ||
						item.class == 'waterway' ||
						item.class == 'landuse' ||
						(!item.address[item.type] && !item.address.address29) ||
						!$window.osmLabels[item.class + '/' + item.type])
						return false;
					else
						return true;
				});
			}
			return input;
		}
	}
])

.filter('osmTitle', [
	function() {
		return _.memoize(function(input) {

			var title = '';

			if(input && input.address) {
				title = input.address[input.type] || input.address.address29;
			}

			return title;

		}, function() {
			return JSON.stringify(arguments);
		});
	}
])

.filter('osmLabel', [
	'$window',
	function($window) {
		return _.memoize(function(input) {

			var label = '';

			if(input && input.type) {
				label = $window.osmLabels[input.class + '/' + input.type].name;
			}

			return label;

		}, function() {
			return JSON.stringify(arguments);
		})
	}
])

.filter('osmIcon', [
	'$window',
	function($window) {
		return _.memoize(function(input) {
			var icon = '';

			if(input && input.class && input.type) {
				if($window.osmIcons[input.class + '/' + input.type])
					icon = $window.osmIcons[input.class + '/' + input.type];
			}

			return icon;

		}, function() {
			return JSON.stringify(arguments);
		})
	}
])

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
	'MapMarkers',
	function(Markers) {
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
					if(place.scores && parseFloat(place.scores.approved) >= 0.5)
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
