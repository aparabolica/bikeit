'use strict';

angular.module('bikeit.map', [
	'leaflet-directive'
])
.controller('MapController', [
	'labels',
	'leafletData',
	'$scope',
	function(labels, leafletData, $scope) {

		$scope.mapDefaults = {

			scrollWheelZoom: false

		};

		$scope.$parent.$watch('map.markers', function(markers) {

			var latLngs = [];

			for(var key in markers) {

				latLngs.push([
					markers[key].lat,
					markers[key].lng
				]);

			}

			var bounds = L.latLngBounds(latLngs);

			leafletData.getMap().then(function(m) {

				m.fitBounds(bounds, { reset: true });

			});

		});

	}
]);