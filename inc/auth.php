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

		// Do we have a nonce?
		$nonce = null;
		if ( isset( $data['_wp_json_nonce'] ) ) {
			$nonce = $data['_wp_json_nonce'];
		}

		// Check the nonce
		$result = wp_verify_nonce( $nonce, 'wp_json' );
		if ( ! $result ) {
			return new WP_Error( 'json_cookie_invalid_nonce', __( 'Cookie nonce is invalid' ), array( 'status' => 403 ) );
		}

		$result = json_ensure_response(wp_signon($data, false));

		return $result;

	}

	function nonce() {

		return json_ensure_response(array('nonce' => wp_create_nonce('wp_json')));

	}

	function json_ajax_auth_errors($result) {

		if ( ! empty( $result ) ) {
			return $result;
		}

		global $wp_json_auth_cookie;

		// Are we using cookie authentication?
		// (If we get an auth error, but we're still logged in, another
		// authentication must have been used.)
		if ( $wp_json_auth_cookie !== true && is_user_logged_in() ) {
			return $result;
		}

		// Do we have a nonce?
		$nonce = null;
		if ( isset( $_REQUEST['_wp_json_nonce'] ) ) {
			$nonce = $_REQUEST['_wp_json_nonce'];
		} elseif ( isset( $_SERVER['HTTP_X_WP_NONCE'] ) ) {
			$nonce = $_SERVER['HTTP_X_WP_NONCE'];
		}

		if( is_user_logged_in() ) {
			return true;
		}

		if ( $nonce === null ) {
			// No nonce at all, so act as if it's an unauthenticated request
			wp_set_current_user( 0 );
			return true;
		}

		// Check the nonce
		$result = wp_verify_nonce( $nonce, 'wp_json' );
		if ( ! $result ) {
			return new WP_Error( 'json_cookie_invalid_nonce', __( 'Cookie nonce is invalid' ), array( 'status' => 403 ) );
		}

		return true;
	}

}


$GLOBALS['bikeit_auth'] = new BikeIT_Auth();