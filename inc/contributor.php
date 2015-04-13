<?php

/*
 * BikeIT
 * Contributor
 */

class BikeIT_Contributor {

	function __construct() {

		add_filter('json_endpoints', array($this, 'contributor_routes'));

	}

	function contributor_routes($routes) {

		$contributor_routes = array(
			'/contributors/(?P<id>\d+)' => array(
				array(array($this, 'get_contributor'),	WP_JSON_Server::READABLE)
			)
		);

		return array_merge($routes, $contributor_routes);

	}

	function get_contributor($id) {

		$id = (int) $id;

		$user = get_userdata($id);

		if(empty($user->ID)) {
			return new WP_Error('bikeit_invalid_contributor_id', __('Invalid user ID', 'bikeit'), array('status' => 400));
		}

		return $this->prepare_contributor($user);

	}

	function prepare_contributor($user) {

		$user_fields = array(
			'ID'          => $user->ID,
			'name'        => $user->display_name,
			'first_name'  => $user->first_name,
			'last_name'   => $user->last_name,
			'nickname'    => $user->nickname,
			'URL'         => $user->user_url,
			'avatar'      => json_get_avatar_url( $user->user_email ),
			'description' => $user->description
		);

		return apply_filters('bikeit_prepare_contributor', $user_fields, $user);

	}

}

$GLOBALS['bikeit_contributor'] = new BikeIT_Contributor();