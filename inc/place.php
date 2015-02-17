<?php

/*
 * BikeIT
 * Places
 */

class BikeIT_Places {

	function __construct() {

		add_action('init', array($this, 'register_taxonomies'));
		add_action('init', array($this, 'register_post_type'));
		add_action('init', array($this, 'place_caps'));
		add_action('init', array($this, 'register_fields'));
		add_filter('map_meta_cap', array($this, 'map_meta_cap'), 10, 4);
		add_filter('query_vars', array($this, 'query_vars'));
		add_action('pre_get_posts', array($this, 'pre_get_posts'));
		add_action('save_post', array($this, 'save_post'));
		add_filter('posts_clauses', array($this, 'posts_clauses'), 10, 2);
		add_filter('json_prepare_term', array($this, 'json_prepare_term'), 10, 2);
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
			'rewrite' => array('slug' => 'place', 'with_front' => false),
			'capability_type' => 'place',
			'capabilities' => array(
				'publish_posts' => 'publish_places',
				'edit_posts' => 'edit_places',
				'edit_others_posts' => 'edit_others_places',
				'delete_posts' => 'delete_places',
				'delete_others_posts' => 'delete_others_places',
				'read_private_posts' => 'read_private_places',
				'edit_post' => 'edit_place',
				'delete_post' => 'delete_place',
				'read_post' => 'read_place'
			)
		);

		register_post_type('place', $args);

	}

	function place_caps() {
		global $wp_roles;

		if ( isset($wp_roles) ) {

			$master_roles = array(
				'administrator',
				'editor'
			);

			$contrib_roles = array(
				'author',
				'contributor'
			);

			foreach($master_roles as $role) {
				$wp_roles->add_cap( $role, 'publish_places' );
				$wp_roles->add_cap( $role, 'edit_places' );
				$wp_roles->add_cap( $role, 'edit_others_places' );
				$wp_roles->add_cap( $role, 'delete_places' );
				$wp_roles->add_cap( $role, 'delete_others_places' );
				$wp_roles->add_cap( $role, 'read_private_places' );
				$wp_roles->add_cap( $role, 'edit_place' );
				$wp_roles->add_cap( $role, 'delete_place' );
				$wp_roles->add_cap( $role, 'read_place' );
			}

			foreach($contrib_roles as $role) {

				$wp_roles->add_cap( $role, 'publish_places' );
				$wp_roles->add_cap( $role, 'edit_places' );
				$wp_roles->add_cap( $role, 'edit_place' );

			}

		}
	}

	function map_meta_cap( $caps, $cap, $user_id, $args ) {

		/* If editing, deleting, or reading a place, get the post and post type object. */
		if ( 'edit_place' == $cap || 'delete_place' == $cap || 'read_place' == $cap ) {
			$post = get_post( $args[0] );
			$post_type = get_post_type_object( $post->post_type );

			/* Set an empty array for the caps. */
			$caps = array();
		}

		/* If editing a place, assign the required capability. */
		if ( 'edit_place' == $cap ) {
			if ( $post->post_status == 'publish' )
				$caps[] = $post_type->cap->edit_others_posts;
			elseif( $user_id == $post->post_author )
				$caps[] = $post_type->cap->edit_posts;
		}

		/* If deleting a place, assign the required capability. */
		elseif ( 'delete_place' == $cap ) {
			if ( $user_id == $post->post_author )
				$caps[] = $post_type->cap->delete_posts;
			else
				$caps[] = $post_type->cap->delete_others_posts;
		}

		/* If reading a private place, assign the required capability. */
		elseif ( 'read_place' == $cap ) {

			if ( 'private' != $post->post_status )
				$caps[] = 'read';
			else
				$caps[] = $post_type->cap->read_private_posts;
		}

		/* Return the capabilities required by the user. */
		return $caps;
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

		$map_lat = '';
		$map_lng = '';

		$city = get_option('bikeit_city');

		if($city) {
			$city = json_decode($city, true);

			$map_lat = $city['geometry']['location']['lat'];
			$map_lng = $city['geometry']['location']['lng'];

		}

		if(function_exists("register_field_group")) {
			// Place location
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
						'center_lat' => $map_lat,
						'center_lng' => $map_lng,
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

			// Place category markers
			register_field_group(array (
				'id' => 'acf_place-category-settings',
				'title' => __('Place category settings', 'bikeit'),
				'fields' => array (
					array (
						'key' => 'field_marker',
						'label' => __('Marker', 'bikeit'),
						'name' => 'marker',
						'type' => 'image',
						'save_format' => 'object',
						'preview_size' => 'full',
						'library' => 'all',
					),
					array (
						'key' => 'field_approved_marker',
						'label' => __('Approved marker', 'bikeit'),
						'name' => 'approved_marker',
						'type' => 'image',
						'save_format' => 'object',
						'preview_size' => 'full',
						'library' => 'all',
					),
					array (
						'key' => 'field_unapproved_marker',
						'label' => __('Unapproved marker', 'bikeit'),
						'name' => 'unapproved_marker',
						'type' => 'image',
						'save_format' => 'object',
						'preview_size' => 'full',
						'library' => 'all',
					),
					array (
						'key' => 'field_marker_position',
						'label' => __('Marker position', 'bikeit'),
						'name' => 'marker_position',
						'type' => 'radio',
						'choices' => array (
							'center' => __('Center', 'bikeit'),
							'bottom_center' => __('Bottom center', 'bikeit'),
							'bottom_right' => __('Botttom right', 'bikeit'),
							'bottom_left' => __('Bottom left', 'bikeit'),
						),
						'other_choice' => 0,
						'save_other_choice' => 0,
						'default_value' => '',
						'layout' => 'horizontal',
					),
				),
				'location' => array (
					array (
						array (
							'param' => 'ef_taxonomy',
							'operator' => '==',
							'value' => 'place-category',
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

	function query_vars($vars) {

		$vars[] = 'place_reviews';

		return $vars;

	}


	/*
	 * Include meta key in search
	 */

	function posts_clauses($clauses, $query) {
		global $wpdb, $wp;
		if($query->is_search) {
			$clauses['join'] .= " LEFT JOIN $wpdb->postmeta ON ($wpdb->posts.ID = $wpdb->postmeta.post_id) ";
			$like = '%' . $wpdb->esc_like( $query->get('s') ) . '%';
			$clauses['where'] = preg_replace(
				"/($wpdb->posts.post_title LIKE '{$like}')/i",
				"$0 OR ( $wpdb->postmeta.meta_value LIKE '{$like}' )",
				$clauses['where']
			);
			$clauses['distinct'] = 'DISTINCT';
		}
		return $clauses;
	}

	function pre_get_posts($query) {

		$place = $query->get('place_reviews');
		if($place) {

			$query->set('post_type', 'review');
			$query->set('meta_query', array(
				array(
					'key' => 'place',
					'value' => $place
				)
			));

		}

		// if($query->is_search) {

		// 	$query->set('meta_query', array(
		// 		'relation' => 'OR',
		// 		array(
		// 			'key' => 'location',
		// 			'value' => $query->get('s'),
		// 			'compare' => 'LIKE'
		// 		)
		// 	));

		// }

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

	function json_prepare_term($data, $term) {

		if($term->taxonomy == 'place-category') {
			$data['markers'] = array();
			$data['markers']['default'] = get_field('marker', 'place-category_' . $data['ID'])['url'];
			$data['markers']['approved'] = get_field('approved_marker', 'place-category_' . $data['ID'])['url'];
			$data['markers']['unapproved'] = get_field('unapproved_marker', 'place-category_' . $data['ID'])['url'];
			$data['markers']['position'] = get_field('marker_position', 'place-category_' . $data['ID']);
		}

		return $data;

	}

}

$GLOBALS['bikeit_places'] = new BikeIT_Places();