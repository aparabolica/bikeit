'use strict';

L.Icon.Default.imagePath = window.bikeit.templateUri + '/css/images';

angular.module('bikeit.map', [
	'leaflet-directive'
])
.controller('MapController', [
	'$state',
	'leafletData',
	'leafletEvents',
	'$scope',
	function($state, leafletData, leafletEvents, $scope) {

		$scope.mapDefaults = {

			scrollWheelZoom: false

		};

		$scope.$on('leafletDirectiveMarker.mouseover', function(event, args) {
			args.leafletEvent.target.openPopup();
			args.leafletEvent.target.setZIndexOffset(1000);
		});

		$scope.$on('leafletDirectiveMarker.mouseout', function(event, args) {
			args.leafletEvent.target.closePopup();
			args.leafletEvent.target.setZIndexOffset(0);
		});

		$scope.$on('leafletDirectiveMarker.click', function(event, args) {
			$state.go('placesSingle', { placeId:  args.markerName})
		});

		$scope.$watch('markers', function(markers) {

			if(markers && !_.isEmpty(markers)) {

				var latLngs = [];

				_.each(markers, function(marker) {

					latLngs.push([
						marker.lat,
						marker.lng
					]);

				});

				var bounds = L.latLngBounds(latLngs);

				leafletData.getMap().then(function(m) {

					m.fitBounds(bounds, { reset: true });

				});

			}

		});

	}
])
.factory('MapMarkers', [
	'$window',
	function($window) {

		var markers = {};

		_.each($window.bikeit.placeCategories, function(place) {

			var image = place.markers.approved;
			var position = place.markers.position;
			var popupAnchor;

			if(position == 'center') {
				position = [image.width/2, image.height/2];
				popupAnchor = [0, -image.height/2-10];
			} else if(position == 'bottom_center') {
				position = [image.width/2, image.height];
				popupAnchor = [0, -image.height-10];
			} else if(position == 'bottom_left') {
				position = [0, image.height];
				popupAnchor = [image.width/2, -image.height-10];
			} else if(position == 'bottom_right') {
				position = [image.width, image.height];
				popupAnchor = [-image.width/2, -image.height-10];
			}

			markers['place-category-' + place.term_id] = {
				iconUrl: image.url,
				shadowUrl: false,
				shadowSize: [0,0],
				iconSize: [image.width, image.height],
				iconAnchor: position,
				popupAnchor: popupAnchor
			};

		});

		return markers;

	}
]);