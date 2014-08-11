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
		add_action('save_post', array($this, 'save_post'));
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
			'name' => _x('Place categories', 'Place category general name', 'bikeit'),
			'singular_name' => _x('Place category', 'Place category singular name', 'bikeit'),
			'all_items' => __('All place categories', 'bikeit'),
			'edit_item' => __('Edit place category', 'bikeit'),
			'view_item' => __('View place category', 'bikeit'),
			'update_item' => __('Update place category', 'bikeit'),
			'add_new_item' => __('Add new place category', 'bikeit'),
			'new_item_name' => __('New place category name', 'bikeit'),
			'parent_item' => __('Parent place category', 'bikeit'),
			'parent_item_colon' => __('Parent place category:', 'bikeit'),
			'search_items' => __('Search place categories', 'bikeit'),
			'popular_items' => __('Popular place categories', 'bikeit'),
			'separate_items_with_commas' => __('Separate place categories with commas', 'bikeit'),
			'add_or_remove_items' => __('Add or remove place categories', 'bikeit'),
			'choose_from_most_used' => __('Choose from most used place categories', 'bikeit'),
			'not_found' => __('No place categories found', 'bikeit')
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

	function save_post($post_id) {

		// Update place score on review save
		$post = get_post($post_id);
		if($post->post_type == 'review' && $post->post_status == 'publish') {
			$place = get_field('place', $post_id);
			$this->update_place_score($place->ID);
		}

	}

	function update_place_score($post_id) {

		$reviews_query = new WP_Query(array(
			'posts_per_page' => -1,
			'post_type' => 'review',
			'meta_query' => array(
				array(
					'key' => 'place',
					'value' => $post_id
				)
			)
		));

		update_post_meta($post_id, 'review_count', $reviews_query->found_posts);

		$approved = array();
		$structure = array();
		$kindness = array();

		while($reviews_query->have_posts()) {

			$reviews_query->the_post();

			$approved[] = get_field('approved');
			$structure[] = get_field('structure');
			$kindness[] = get_field('kindness');

			wp_reset_postdata();

		}

		update_post_meta($post_id, 'approved', $this->get_score_average($approved));
		update_post_meta($post_id, 'structure', $this->get_score_average($structure));
		update_post_meta($post_id, 'kindness', $this->get_score_average($kindness));

	}

	function get_score_average($data) {

		if(count($data)) return array_sum($data) / count($data);

		return 0;

	}

	function json_prepare_post($_post, $post, $context) {

		if($post['post_type'] == 'place') {
			/*
			 * Location
			 */
			$_post['location'] = get_field('location', $post['ID']);
			// Parse float
			$_post['location']['lat'] = floatval($_post['location']['lat']);
			$_post['location']['lng'] = floatval($_post['location']['lng']);

			/*
			 * Reviews data and scores
			 */
			$_post['review_count'] = get_post_meta($post['ID'], 'review_count', true);
			$_post['scores'] = array();
			$_post['scores']['approved'] = get_post_meta($post['ID'], 'approved', true);
			$_post['scores']['structure'] = get_post_meta($post['ID'], 'structure', true);
			$_post['scores']['kindness'] = get_post_meta($post['ID'], 'kindness', true);
		}

		return $_post;

	}

}

$GLOBALS['bikeit_places'] = new BikeIT_Places();