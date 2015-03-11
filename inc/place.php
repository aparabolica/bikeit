<?php

/*
 * BikeIT
 * Places
 */

class BikeIT_Places {

	function __construct() {

		add_action('init', array($this, 'register_taxonomies'));
		add_action('init', array($this, 'register_post_type'));
		add_filter('post_type_link', array($this, 'post_type_link'), 10, 2);
		add_filter('the_permalink', array($this, 'post_type_link'));
		add_action('init', array($this, 'place_caps'));
		add_action('init', array($this, 'register_fields'));
		add_filter('map_meta_cap', array($this, 'map_meta_cap'), 10, 4);
		add_filter('query_vars', array($this, 'query_vars'));
		add_action('pre_get_posts', array($this, 'pre_get_posts'));
		add_filter('posts_clauses', array($this, 'posts_clauses'), 10, 2);
		add_filter('json_prepare_term', array($this, 'json_prepare_term'), 10, 2);
		add_filter('json_prepare_post', array($this, 'json_prepare_post'), 10, 3);
		add_action('json_insert_post', array($this, 'json_insert_post'), 10, 3);

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
			'supports' => array('title', 'author', 'revisions', 'thumbnail', 'custom-fields'),
			'public' => true,
			'show_ui' => true,
			'show_in_menu' => true,
			'has_archive' => true,
			'menu_position' => 4,
			'rewrite' => false,
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

	function post_type_link($url, $post = false) {
		if(!$post) global $post;
		if('place' == get_post_type($post)) {
			return get_bloginfo('url') . '/#!/places/' . $post->ID . '/';
		}
		return $url;
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

		if(function_exists("register_field_group")) {
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
						'key' => 'field_failed_marker',
						'label' => __('Failed marker', 'bikeit'),
						'name' => 'failed_marker',
						'type' => 'image',
						'save_format' => 'object',
						'preview_size' => 'full',
						'library' => 'all',
					),
					array (
						'key' => 'field_stamp_marker',
						'label' => __('BikeIT Stamp marker', 'bikeit'),
						'name' => 'stamp_marker',
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

	function update_place_score($post_id) {

		$reviews_query = new WP_Query(array(
			'post_status' => 'publish',
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
		$vars[] = 'user_reviewed';

		return $vars;

	}


	/*
	 * Post meta as searchable data
	 */

	function posts_clauses($clauses, $query) {
		global $wpdb, $wp;
		if($query->is_search && ($query->get('post_type') == 'place' || $query->get('post_type') == array('place'))) {
			$clauses['join'] .= " LEFT JOIN $wpdb->postmeta ON ($wpdb->posts.ID = $wpdb->postmeta.post_id) ";
			$like = '%' . $wpdb->esc_like( $query->get('s') ) . '%';
			$meta_like = str_replace(' ', '%', $like);
			$clauses['where'] = preg_replace(
				"/$wpdb->posts.post_title/",
				"$wpdb->postmeta.meta_value",
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

		$user_reviewed = $query->get('user_reviewed'); 
		if($user_reviewed) {

			$query->set('post_type', 'place');
			$query->set('meta_query', array(
				array(
					'key' => 'users_reviewed',
					'value' => $user_reviewed,
					'compare' => '='
				)
			));

		}

	}

	function get_score_average($data) {

		if(count($data)) return array_sum($data) / count($data);

		return 0;

	}

	function json_prepare_post($_post, $post, $context) {

		if($post['post_type'] == 'place') {

			unset($_post['content']);

			/*
			 * Location
			 */
			$_post['location'] = array();
			// Parse float
			$_post['location']['road'] = get_post_meta($post['ID'], 'road', true);
			$_post['location']['number'] = get_post_meta($post['ID'], 'number', true);
			$_post['location']['district'] = get_post_meta($post['ID'], 'district', true);
			$_post['location']['lat'] = floatval(get_post_meta($post['ID'], 'lat', true));
			$_post['location']['lng'] = floatval(get_post_meta($post['ID'], 'lng', true));
			$_post['formatted_address'] = $this->get_formatted_address($_post['location']);

			// OSM
			$_post['osm_id'] = get_post_meta($post['ID'], '_osm_id', true);

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

	function get_formatted_address($location) {

		$address = '';

		if($location['road'])
			$address .= $location['road'];

		if($location['road'] && $location['number'])
			$address .= ', ' . $location['number'];

		if($location['district']) {
			if($location['road'])
				$address .= ' - ';
			$address .= $location['district'];
		}

		return $address;

	}

	function json_prepare_term($data, $term) {

		if($term->taxonomy == 'place-category') {
			$data['markers'] = array();
			$data['markers']['default'] = get_field('marker', 'place-category_' . $data['ID'])['url'];
			$data['markers']['approved'] = get_field('approved_marker', 'place-category_' . $data['ID'])['url'];
			$data['markers']['failed'] = get_field('failed_marker', 'place-category_' . $data['ID'])['url'];
			$data['markers']['stamp'] = get_field('stamp_marker', 'place-category_' . $data['ID'])['url'];
			$data['markers']['position'] = get_field('marker_position', 'place-category_' . $data['ID']);
		}

		return $data;

	}

	function json_insert_post($post, $data, $update) {

		$review_meta = $data['place_meta'];

		// TODO Validation

		if($review_meta['category'])
			wp_set_object_terms($post['ID'], intval($review_meta['category']), 'place-category');

		if($review_meta['road'])
			update_post_meta($post['ID'], 'road', $review_meta['road']);

		if($review_meta['number'])
			update_post_meta($post['ID'], 'number', $review_meta['number']);

		if($review_meta['district'])
			update_post_meta($post['ID'], 'district', $review_meta['district']);

		if($review_meta['lat'])
			update_post_meta($post['ID'], 'lat', $review_meta['lat']);

		if($review_meta['lng'])
			update_post_meta($post['ID'], 'lng', $review_meta['lng']);

		if($review_meta['osm_id'])
			update_post_meta($post['ID'], '_osm_id', $review_meta['osm_id']);

		if($review_meta['params'])
			update_post_meta($post['ID'], '_params', $review_meta['params']);

		// Send note to OSM
		// TODO check changes to original OSM (if any)
		$osm_note = false;
		if($osm_note) {

			$osm_url = 'http://api.openstreetmap.org/api/0.6/notes';

			$location = array();
			$location['road'] = get_post_meta($post['ID'], 'road', true);
			$location['number'] = get_post_meta($post['ID'], 'number', true);
			$location['district'] = get_post_meta($post['ID'], 'district', true);

			$osm_data = array(
				'lat' => $review_meta['location']['lat'],
				'lon' => $review_meta['location']['lng'],
				'text' => $data['title'] . ' ' . $this->get_formatted_address($location) . " " . $review_meta['category'] . " Submitted via BikeIT"
			);

			$osm_context = stream_context_create(array(
				'http' => array(
					'header' => "Content-type: application/x-www-form-urlencoded\r\n",
					'method' => 'POST',
					'content' => http_build_query($osm_data)
				)
			));

			$osm_result = file_get_contents($osm_url, false, $osm_context);
		}

		do_action('save_post', $post['ID'], get_post($post['ID']), true);

	}

}

$GLOBALS['bikeit_places'] = new BikeIT_Places();