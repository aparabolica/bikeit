<?php

/*
 * BikeIT
 * Places
 */

class BikeIT_Places {

	function __construct() {

		add_action('init', array($this, 'register_taxonomies'));
		add_action('init', array($this, 'register_post_type'));
		add_action('init', array($this, 'register_fields'));
		add_filter('json_prepare_post', array($this, 'json_prepare_post'), 10, 3);

	}

	function register_post_type() {

		$labels = array( 
			'name' => __('Places', 'bikeit'),
			'singular_name' => __('Place', 'bikeit'),
			'add_new' => __('Add place', 'bikeit'),
			'add_new_item' => __('Add new place', 'bikeit'),
			'edit_item' => __('Edit place', 'bikeit'),
			'new_item' => __('New place', 'bikeit'),
			'view_item' => __('View place', 'bikeit'),
			'search_items' => __('Search place', 'bikeit'),
			'not_found' => __('No place found', 'bikeit'),
			'not_found_in_trash' => __('No place found in the trash', 'bikeit'),
			'menu_name' => __('Places', 'bikeit')
		);

		$args = array( 
			'labels' => $labels,
			'hierarchical' => false,
			'description' => __('BikeIT Places', 'bikeit'),
			'supports' => array('title', 'editor', 'excerpt', 'author', 'revisions', 'thumbnail'),
			'public' => true,
			'show_ui' => true,
			'show_in_menu' => true,
			'has_archive' => true,
			'menu_position' => 4,
			'rewrite' => array('slug' => 'place', 'with_front' => false)
		);

		register_post_type('place', $args);

	}

	function register_taxonomies() {

		$labels = array(
			'name' => _x('Place categories', 'Place category general name', 'infoamazonia'),
			'singular_name' => _x('Place category', 'Place category singular name', 'infoamazonia'),
			'all_items' => __('All place categories', 'infoamazonia'),
			'edit_item' => __('Edit place category', 'infoamazonia'),
			'view_item' => __('View place category', 'infoamazonia'),
			'update_item' => __('Update place category', 'infoamazonia'),
			'add_new_item' => __('Add new place category', 'infoamazonia'),
			'new_item_name' => __('New place category name', 'infoamazonia'),
			'parent_item' => __('Parent place category', 'infoamazonia'),
			'parent_item_colon' => __('Parent place category:', 'infoamazonia'),
			'search_items' => __('Search place categories', 'infoamazonia'),
			'popular_items' => __('Popular place categories', 'infoamazonia'),
			'separate_items_with_commas' => __('Separate place categories with commas', 'infoamazonia'),
			'add_or_remove_items' => __('Add or remove place categories', 'infoamazonia'),
			'choose_from_most_used' => __('Choose from most used place categories', 'infoamazonia'),
			'not_found' => __('No place categories found', 'infoamazonia')
		);

		$args = array(
			'labels' => $labels,
			'public' => true,
			'show_admin_column' => true,
			'hierarchical' => true,
			'query_var' => 'place-category',
			'rewrite' => array('slug' => 'place/categories', 'with_front' => false)
		);

		register_taxonomy('place-category', 'place', $args);

	}

	function register_fields() {

		if(function_exists("register_field_group")) {
			register_field_group(array (
				'id' => 'acf_location',
				'title' => __('Location', 'bikeit'),
				'fields' => array (
					array (
						'key' => 'field_53e54cab76167',
						'label' => 'Location',
						'name' => 'location',
						'type' => 'google_map',
						'instructions' => __('Place location', 'bikeit'),
						'required' => 1,
						'center_lat' => '',
						'center_lng' => '',
						'zoom' => '',
						'height' => '',
					),
				),
				'location' => array (
					array (
						array (
							'param' => 'post_type',
							'operator' => '==',
							'value' => 'place',
							'order_no' => 0,
							'group_no' => 0,
						),
					),
				),
				'options' => array (
					'position' => 'normal',
					'layout' => 'no_box',
					'hide_on_screen' => array (
					),
				),
				'menu_order' => 0,
			));
		}

	}

	function json_prepare_post($_post, $post, $context) {

		if($post['post_type'] == 'place') {
			$_post['location'] = get_field('location', $post['ID']);

			// Parse float
			$_post['location']['lat'] = floatval($_post['location']['lat']);
			$_post['location']['lng'] = floatval($_post['location']['lng']);
		}

		return $_post;

	}

}

$GLOBALS['bikeit_places'] = new BikeIT_Places();