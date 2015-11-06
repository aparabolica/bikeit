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
		add_action('wp_dashboard_setup', array($this, 'nominee_dashboard_widget_setup'));

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
			register_field_group(array(
				'id' => 'acf_place-settings',
				'title' => __('Place setings', 'bikeit'),
				'fields' => array(
					array(
						'key' => 'field_stamped',
						'label' => __('BikeIt Stamp', 'bikeit'),
						'name' => 'stamped',
						'type' => 'true_false',
						'instructions' => __('Mark to give a BikeIT Stamp to this place', 'bikeit'),
						'required' => 0,
						'message' => __('Give a BikeIT Stamp to this place', 'bikeit'),
						'default_value' => 0
					),
					array(
						'key' => 'field_featured',
						'label' => __('Featured place', 'bikeit'),
						'name' => 'featured',
						'type' => 'true_false',
						'instructions' => __('Mark to feature this page in the homepage', 'bikeit'),
						'required' => 0,
						'message' => __('Feature this place on the homepage', 'bikeit'),
						'default_value' => 0
					)
				),
				'location' => array(
					array(
						array(
							'param' => 'post_type',
							'operator' => '==',
							'value' => 'place',
							'order_no' => 0,
							'group_no' => 0
						)
					)
				),
				'options' => array (
					'position' => 'normal',
					'layout' => 'no_box',
					'hide_on_screen' => array (
					),
				),
				'menu_order' => 0
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

	function update_place_score($post_id, $exclude = false) {

		$reviews_query = new WP_Query(array(
			'post_status' => 'publish',
			'posts_per_page' => -1,
			'post_type' => 'review',
			'post__not_in' => $exclude ? array($exclude) : null,
			'meta_query' => array(
				array(
					'key' => 'place',
					'value' => $post_id
				)
			)
		));

		update_post_meta($post_id, 'review_count', $reviews_query->found_posts);

		$stamp_points = 0;
		$approved = array();
		$structure = array();
		$kindness = array();

		while($reviews_query->have_posts()) {

			$reviews_query->the_post();

			if(get_field('stampable'))
				$stamp_points++;

			$approved[] = get_field('approved');
			$structure[] = get_field('structure');
			$kindness[] = get_field('kindness');

			wp_reset_postdata();

		}

		update_post_meta($post_id, 'stamp_points', $stamp_points);
		update_post_meta($post_id, 'stamp_score', $reviews_query->found_posts ? $stamp_points / $reviews_query->found_posts : 0);
		update_post_meta($post_id, 'approved', $this->get_score_average($approved));
		update_post_meta($post_id, 'structure', $this->get_score_average($structure));
		update_post_meta($post_id, 'kindness', $this->get_score_average($kindness));

	}

	function update_last_review($post_id) {
		update_post_meta($post_id, 'last_review_timestamp', time());
	}

	function query_vars($vars) {

		$vars[] = 'place_reviews';
		$vars[] = 'user_reviewed';
		$vars[] = 'featured';

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
			$meta_query = $query->get('meta_query') ? $query->get('meta_query') : array();
			$meta_query[] = array(
				'key' => 'users_reviewed',
				'value' => $user_reviewed,
				'compare' => '='
			);
			$query->set('post_type', 'place');
			$query->set('meta_query', $meta_query);

		}

		if($query->get('featured')) {
			$meta_query = $query->get('meta_query') ? $query->get('meta_query') : array();
			$meta_query[] = array(
				'key' => 'featured',
				'value' => 1,
				'compare' => '='
			);
			$query->set('meta_query', $meta_query);
		}

		if($query->get('orderby') == 'review') {

			$query->set('meta_key', 'last_review_timestamp');
			$query->set('orderby', 'meta_value_num');

		}

	}

	function get_place_images($place_id) {
		$images_query = new WP_Query(array(
			'post_type' => 'attachment',
			'meta_query' => array(
				array(
					'key' => 'place',
					'value' => $place_id
				)
			),
			'posts_per_page' => -1,
			'post_status' => array('publish', 'inherit')
		));

		$images = array();

		if($images_query->have_posts()) {
			global $post;
			while($images_query->have_posts()) {
				$images_query->the_post();

				if(!wp_attachment_is_image(get_the_ID()))
					continue;

				$data = array();
				$data['ID'] = get_the_ID();
				$data['name'] = get_the_title();
				$data['source']          = wp_get_attachment_url(get_the_ID());
				$data['attachment_meta'] = wp_get_attachment_metadata(get_the_ID());

				// Ensure empty meta is an empty object
				if ( empty( $data['attachment_meta'] ) ) {
					$data['attachment_meta'] = new stdClass;
				} elseif ( ! empty( $data['attachment_meta']['sizes'] ) ) {
					$img_url_basename = wp_basename( $data['source'] );

					foreach ($data['attachment_meta']['sizes'] as $size => &$size_data) {
						// Use the same method image_downsize() does
						$size_data['url'] = str_replace( $img_url_basename, $size_data['file'], $data['source'] );
					}
					$data['thumb'] = $data['attachment_meta']['sizes']['thumbnail']['url'];
				} else {
					$data['attachment_meta']['sizes'] = new stdClass;
				}

				$images[] = $data;

				wp_reset_postdata();
			}
		}

		return $images;
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
			$_post['stamped'] = intval(get_post_meta($post['ID'], 'stamped', true));
			$_post['review_count'] = get_post_meta($post['ID'], 'review_count', true);
			$_post['scores'] = array();
			$_post['scores']['approved'] = get_post_meta($post['ID'], 'approved', true);
			$_post['scores']['structure'] = get_post_meta($post['ID'], 'structure', true);
			$_post['scores']['kindness'] = get_post_meta($post['ID'], 'kindness', true);

			$_post['images'] = $this->get_place_images($post['ID']);
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

		$place_meta = $data['place_meta'];

		// TODO Validation

		if($place_meta['category'])
			wp_set_object_terms($post['ID'], intval($place_meta['category']), 'place-category');

		if($place_meta['road'])
			update_post_meta($post['ID'], 'road', $place_meta['road']);

		if($place_meta['number'])
			update_post_meta($post['ID'], 'number', $place_meta['number']);

		if($place_meta['district'])
			update_post_meta($post['ID'], 'district', $place_meta['district']);

		if($place_meta['lat'])
			update_post_meta($post['ID'], 'lat', $place_meta['lat']);

		if($place_meta['lng'])
			update_post_meta($post['ID'], 'lng', $place_meta['lng']);

		if($place_meta['osm_id'])
			update_post_meta($post['ID'], '_osm_id', $place_meta['osm_id']);

		if($place_meta['params'])
			update_post_meta($post['ID'], '_params', $place_meta['params']);

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
				'lat' => $place_meta['location']['lat'],
				'lon' => $place_meta['location']['lng'],
				'text' => $data['title'] . ' ' . $this->get_formatted_address($location) . " " . $place_meta['category'] . " Submitted via BikeIT"
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

	/*
	 * Stamp nominees dashboard widget
	 */
	function nominee_dashboard_widget_setup() {
		wp_add_dashboard_widget(
			'bikeit_nominee_dashboard_widget',
			__('Stamp nominees', 'bikeit'),
			array($this, 'nominee_dashboard_widget'),
			'dashboard',
			'side',
			'high'
		);
	}

	function nominee_dashboard_widget() {

		$query = new WP_Query(array(
			'posts_per_page' => 10,
			'post_type' => 'place',
			'orderby' => 'meta_value_num',
			'order' => 'DESC',
			'meta_key' => 'stamp_points',
			'meta_query' => array(
				'relation' => 'OR',
				array(
					'key' => 'stamped',
					'value' => 0,
					'compare' => '='
				),
				array(
					'key' => 'stamped',
					'compare' => 'NOT EXISTS'
				)
			)
		));

		if($query->have_posts()) {
			?>
			<p><?php _e('Selected nominees for a BikeIT Stamp', 'bikeit'); ?></p>
			<div class="places">
				<table style="width:100%;">
					<thead>
						<tr style="text-align:left;">
							<th>
								<?php _e('Place', 'bikeit'); ?>
							</th>
							<th>
								<?php _e('Stamp rate', 'bikeit'); ?>
							</th>
							<th>
								<?php _e('Approval', 'bikeit'); ?>
							</th>
							<th>
								<?php _e('Stamp points', 'bikeit'); ?>
							</th>
							<th>
								<?php _e('Review count', 'bikeit'); ?>
							</th>
						</tr>
					</thead>
					<?php
					global $post;
					while($query->have_posts()) {
						$query->the_post();
						?>
						<tr>
							<td>
								<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a> (<a href="<?php echo admin_url('post.php?post=' . $post->ID . '&action=edit'); ?>"><?php _e('edit', 'bikeit'); ?></a>)
							</td>
							<td>
								<?php echo get_post_meta($post->ID, 'stamp_score', true)*100; ?>%
							</td>
							<td>
								<?php echo get_post_meta($post->ID, 'approved', true)*100; ?>%
							</td>
							<td>
								<?php echo get_post_meta($post->ID, 'stamp_points', true); ?>
							</td>
							<td>
								<?php echo get_post_meta($post->ID, 'review_count', true); ?>
							</td>
						</tr>
						<?php
						wp_reset_postdata();
					}
					?>
				</table>
			</div>
			<?php
		}

	}

}

$GLOBALS['bikeit_places'] = new BikeIT_Places();
