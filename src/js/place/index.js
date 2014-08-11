'use strict';

angular.module('bikeit.place', [])
.controller('PlaceController', [
	'labels',
	'macroLocation',
	'$scope',
	function(labels, macroLocation, $scope) {

		$scope.sanitizeAddress = function(place) {

			return place.location.address.split(', ' + macroLocation)[0];

		};

	}
]);