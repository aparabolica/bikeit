<?php

/*
 * BikeIT
 * Reviews
 */

class BikeIT_Reviews {

	function __construct() {

		add_action('init', array($this, 'register_post_type'));
		add_action('init', array($this, 'register_fields'));
		add_action('save_post', array($this, 'save_post'));
		add_filter('json_prepare_post', array($this, 'json_prepare_post'), 10, 3);

	}

	function register_post_type() {

		$labels = array( 
			'name' => __('Reviews', 'bikeit'),
			'singular_name' => __('Review', 'bikeit'),
			'add_new' => __('Add review', 'bikeit'),
			'add_new_item' => __('Add new review', 'bikeit'),
			'edit_item' => __('Edit review', 'bikeit'),
			'new_item' => __('New review', 'bikeit'),
			'view_item' => __('View review', 'bikeit'),
			'search_items' => __('Search review', 'bikeit'),
			'not_found' => __('No review found', 'bikeit'),
			'not_found_in_trash' => __('No review found in the trash', 'bikeit'),
			'menu_name' => __('Reviews', 'bikeit')
		);

		$args = array( 
			'labels' => $labels,
			'hierarchical' => false,
			'description' => __('BikeIT Reviews', 'bikeit'),
			'supports' => array('editor', 'excerpt', 'author', 'revisions', 'comments'),
			'public' => true,
			'show_ui' => true,
			'show_in_menu' => true,
			'has_archive' => true,
			'menu_position' => 4,
			'rewrite' => array('slug' => 'review', 'with_front' => false)
		);

		register_post_type('review', $args);

	}

	function register_fields() {

		if(function_exists("register_field_group")) {
			register_field_group(array (
				'id' => 'acf_review-settings',
				'title' => __('Review settings', 'bikeit'),
				'fields' => array (
					array (
						'key' => 'field_place',
						'label' => __('Place', 'bikeit'),
						'name' => 'place',
						'type' => 'post_object',
						'post_type' => array (
							0 => 'place',
						),
						'taxonomy' => array (
							0 => 'all',
						),
						'allow_null' => 0,
						'multiple' => 0,
					),
					array (
						'key' => 'field_approved',
						'label' => __('Approved', 'bikeit'),
						'name' => 'approved',
						'type' => 'true_false',
						'instructions' => __('Mark if you approve it\'s bike receptivity', 'bikeit'),
						'required' => 0,
						'message' => __('I approve this place', 'bikeit'),
						'default_value' => 0,
					),
					array (
						'key' => 'field_structure',
						'label' => __('Structure score', 'bikeit'),
						'name' => 'structure',
						'type' => 'radio',
						'instructions' => __('Rate the strucutre of this place', 'bikeit'),
						'required' => 1,
						'choices' => array (
							1 => 1,
							2 => 2,
							3 => 3,
							4 => 4,
							5 => 5,
						),
						'other_choice' => 0,
						'save_other_choice' => 0,
						'default_value' => '',
						'layout' => 'horizontal',
					),
					array (
						'key' => 'field_kindness',
						'label' => __('Kindness score', 'bikeit'),
						'name' => 'kindness',
						'type' => 'radio',
						'instructions' => __('Rate the kindness of this place', 'bikeit'),
						'required' => 1,
						'choices' => array (
							1 => 1,
							2 => 2,
							3 => 3,
							4 => 4,
							5 => 5,
						),
						'other_choice' => 0,
						'save_other_choice' => 0,
						'default_value' => '',
						'layout' => 'horizontal',
					),
					array (
						'key' => 'field_stampable',
						'label' => __('Stampable', 'bikeit'),
						'name' => 'stampable',
						'type' => 'true_false',
						'instructions' => __('Mark if you want this spot as a nominee for a BikeIt Stamp', 'bikeit'),
						'message' => __('Nominate for a BikeIt Stamp', 'bikeit'),
						'default_value' => 0,
					),
				),
				'location' => array (
					array (
						array (
							'param' => 'post_type',
							'operator' => '==',
							'value' => 'review',
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

	function save_post($post_id) {

		$post = get_post($post_id);

		if($post->post_type == 'review') {

			$place = get_field('place', $post_id);

			if($place) {

				remove_action('save_post', array($this, 'save_post'));

				$author = get_the_author_meta('display_name', $post->post_author);

				$title = $place->post_title . ', por ' . $author;

				wp_update_post(array(
					'ID' => $post_id,
					'post_title' => $title
				));

				add_action('save_post', array($this, 'save_post'));

			}

		}

	}

	function json_prepare_post($_post, $post, $context) {

		if($post['post_type'] == 'review') {
			$_post['rating'] = array();
			$_post['rating']['approved'] = intval(get_post_meta($post['ID'], 'approved', true));
			$_post['rating']['structure'] = intval(get_post_meta($post['ID'], 'structure', true));
			$_post['rating']['kindness'] = intval(get_post_meta($post['ID'], 'kindness', true));
		}

		return $_post;

	}

}

$GLOBALS['bikeit_reviews'] = new BikeIT_Reviews();