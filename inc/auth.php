<?php

/*
 * BikeIT
 * Auth
 */

class BikeIT_Auth {

	function __construct() {
		add_filter('json_endpoints', array($this, 'auth_routes'));
		add_filter('json_authentication_errors', array($this, 'json_ajax_auth_errors'), 99);
	}

	function auth_routes($routes) {

		$auth_routes = array(
			'/auth' => array(
				array( array( $this, 'auth' ), WP_JSON_Server::CREATABLE | WP_JSON_Server::ACCEPT_JSON ),
			),
			'/auth/nonce' => array(
				array( array( $this, 'nonce' ), WP_JSON_Server::READABLE ),
			)
		);

		return array_merge($routes, $auth_routes);

	}

	function auth($data) {

		$result = json_ensure_response(wp_signon($data, false));

		return $result;

	}

	function nonce() {

		return json_ensure_response(array('nonce' => wp_create_nonce('wp_json')));

	}

	function json_ajax_auth_errors($result) {

		$result = true;

		return $result;
	}

}


$GLOBALS['bikeit_auth'] = new BikeIT_Auth();