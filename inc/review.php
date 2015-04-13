<?php

/*
 * BikeIT
 * Reviews
 */

class BikeIT_Reviews {

	function __construct() {

		add_action('init', array($this, 'register_post_type'));
		add_filter('post_type_link', array($this, 'post_type_link'), 10, 2);
		add_filter('the_permalink', array($this, 'post_type_link'));
		add_action('init', array($this, 'register_fields'));
		add_action('init', array($this, 'review_caps'));
		add_filter('map_meta_cap', array($this, 'map_meta_cap'), 10, 4);
		add_action('save_post', array($this, 'save_post'));
		add_action('save_post', array($this, 'change_post'));
		add_action('before_delete_post', array($this, 'change_post'));
		add_action('before_delete_post', array($this, 'before_delete'));
		add_filter('pre_get_posts', array($this, 'pre_get_posts'));
		add_filter('json_prepare_post', array($this, 'json_prepare_post'), 10, 3);
		add_filter('json_prepare_post', array($this, 'json_prepare_place'), 10, 3);
		add_filter('json_prepare_user', array($this, 'json_prepare_user'), 10, 3);
		add_action('json_insert_post', array($this, 'json_insert_post'), 10, 3);
		add_action('wp_dashboard_setup', array($this, 'latest_reviews_dashboard_widget_setup'));

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
			'rewrite' => array('slug' => 'review', 'with_front' => false),
			'capability_type' => 'review',
			'capabilities' => array(
				'publish_posts' => 'publish_reviews',
				'edit_posts' => 'edit_reviews',
				'edit_others_posts' => 'edit_others_reviews',
				'delete_posts' => 'delete_reviews',
				'delete_others_posts' => 'delete_others_reviews',
				'read_private_posts' => 'read_private_reviews',
				'edit_post' => 'edit_review',
				'delete_post' => 'delete_review',
				'read_post' => 'read_review'
			)
		);

		register_post_type('review', $args);

	}

	function post_type_link($url, $post = false) {
		if(!$post) global $post;
		$place = intval(get_post_meta($post->ID, 'place', true));
		if('review' == get_post_type($post)) {
			return get_bloginfo('url') . '/#!/places/' . $place . '/#review-' . $post->ID;
		}
		return $url;
	}

	function review_caps() {
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
				$wp_roles->add_cap( $role, 'publish_reviews' );
				$wp_roles->add_cap( $role, 'edit_reviews' );
				$wp_roles->add_cap( $role, 'edit_others_reviews' );
				$wp_roles->add_cap( $role, 'delete_reviews' );
				$wp_roles->add_cap( $role, 'delete_others_reviews' );
				$wp_roles->add_cap( $role, 'read_private_reviews' );
				$wp_roles->add_cap( $role, 'edit_review' );
				$wp_roles->add_cap( $role, 'delete_review' );
				$wp_roles->add_cap( $role, 'read_review' );
			}

			foreach($contrib_roles as $role) {

				$wp_roles->add_cap( $role, 'publish_reviews' );
				$wp_roles->add_cap( $role, 'delete_reviews' );
				$wp_roles->add_cap( $role, 'edit_reviews' );
				$wp_roles->add_cap( $role, 'edit_review' );

			}

		}
	}

	function map_meta_cap( $caps, $cap, $user_id, $args ) {

		/* If editing, deleting, or reading a review, get the post and post type object. */
		if ( 'edit_review' == $cap || 'delete_review' == $cap || 'read_review' == $cap ) {
			$post = get_post( $args[0] );
			$post_type = get_post_type_object( $post->post_type );

			/* Set an empty array for the caps. */
			$caps = array();
		}

		/* If editing a review, assign the required capability. */
		if ( 'edit_review' == $cap ) {
			if ( $user_id == $post->post_author )
				$caps[] = $post_type->cap->edit_posts;
			else
				$caps[] = $post_type->cap->edit_others_posts;
		}

		/* If deleting a review, assign the required capability. */
		elseif ( 'delete_review' == $cap ) {
			if ( $user_id == $post->post_author )
				$caps[] = $post_type->cap->delete_posts;
			else
				$caps[] = $post_type->cap->delete_others_posts;
		}

		/* If reading a private review, assign the required capability. */
		elseif ( 'read_review' == $cap ) {

			if ( 'private' != $post->post_status )
				$caps[] = 'read';
			else
				$caps[] = $post_type->cap->read_private_posts;
		}

		/* Return the capabilities required by the user. */
		return $caps;
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

	function before_delete($post_id) {
		$this->change_post($post_id, true);
	}

	function change_post($post_id, $deleting = false) {
		global $bikeit_places, $bikeit_votes;
		$deleting = $deleting ? $post_id : false;
		$place_id = get_post_meta($post_id, 'place', true);
		if($bikeit_places && $place_id) {
			$bikeit_places->update_place_score($place_id, $deleting);
		}
		if($bikeit_votes) {
			$bikeit_votes->update_author_votes(get_post($post_id)->post_author, $deleting);
		}
		$post = get_post($post_id);
		if($post->post_status != 'publish' || $deleting) {
			$this->delete_user_reviewed_place(get_post_meta($post_id, 'place', true), $post->post_author);
		} else {
			$this->add_user_reviewed_place(get_post_meta($post_id, 'place', true), $post->post_author);
		}
	}

	function pre_get_posts($query) {

		if(!is_admin() && ($query->get('post_type') == 'review' || $query->get('post_type') == array('review'))) {
			$query->set('order', 'DESC');
			$query->set('orderby', 'meta_value');
			$query->set('meta_key', '_vote_ratio');
		}

	}

	function json_prepare_post($_post, $post, $context) {

		if($post['post_type'] == 'review') {

			$_post['place'] = get_post_meta($post['ID'], 'place', true);

			$_post['rating'] = array();
			$_post['rating']['approved'] = intval(get_post_meta($post['ID'], 'approved', true));
			$_post['rating']['structure'] = intval(get_post_meta($post['ID'], 'structure', true));
			$_post['rating']['kindness'] = intval(get_post_meta($post['ID'], 'kindness', true));
			$_post['rating']['stampable'] = intval(get_post_meta($post['ID'], 'stampable', true));

			$_post['votes'] = array();
			$_post['votes']['up'] = intval(get_post_meta($post['ID'], '_upvote_count', true));
			$_post['votes']['down'] = intval(get_post_meta($post['ID'], '_downvote_count', true));
			$_post['votes']['total'] = intval(get_post_meta($post['ID'], '_vote_total', true));
			$_post['votes']['ratio'] = intval(get_post_meta($post['ID'], '_vote_ratio', true));

			if(is_user_logged_in()) {
				$user_vote = bikeit_get_user_vote(get_current_user_id(), $post['ID']);
				if($user_vote)
					$_post['user_vote'] = $user_vote['vote'];
			}
		}

		return $_post;

	}

	function get_user_review($place_id) {

		global $wp_json_posts;

		if(is_user_logged_in()) {
			$user_id = get_current_user_id();
			$post = $wp_json_posts->get_posts(array(
				'post_type' => 'place',
				'author' => $user_id,
				'place_reviews' => $place_id
			));
			if($post) {
				return $post->data[0];
			}
		}

		return false;

	}

	function json_prepare_place($_post, $post, $context) {

		if($post['post_type'] == 'place') {

			$user_review = $this->get_user_review($post['ID']);

			if($user_review) {
				$_post['user_review'] = $user_review;
				$_post['user_review']['content'] = get_post($user_review['ID'])->post_content;
			}

		}

		return $_post;
	}

	function json_prepare_user($user_fields, $user, $context) {
		$query = new WP_Query(array('post_type' => 'review', 'author' => $user->ID));
		$user_fields['total_reviews'] = $query->found_posts;
		return $user_fields;
	}

	function add_user_reviewed_place($place_id, $user_id) {
		if(!$this->get_user_reviewed_place($place_id, $user_id)) {
			add_post_meta($place_id, 'users_reviewed', $user_id);
		}
	}

	function delete_user_reviewed_place($place_id, $user_id) {
		if($this->get_user_reviewed_place($place_id, $user_id)) {
			delete_post_meta($place_id, 'users_reviewed', $user_id);
		}
	}

	function get_user_reviewed_place($place_id, $user_id) {

		$reviewed = false;

		$users_reviewed = get_post_meta($place_id, 'users_reviewed');
		if($users_reviewed) {
			foreach($users_reviewed as $user_reviewed) {
				if($user_reviewed == $user_id)
					$reviewed = true;
			}
		}

		return $reviewed;

	}

	function json_insert_post($post, $data, $update) {

		$review_meta = $data['review_meta'];

		// TODO Validation

		if($review_meta['place']) {
			update_field('place', $review_meta['place'], $post['ID']);
		}

		if(isset($review_meta['approved'])) {
			if($review_meta['approved'])
				update_field('approved', $review_meta['approved'], $post['ID']);
			else
				update_field('approved', 0, $post['ID']);
		}

		if(isset($review_meta['kindness']))
			update_field('kindness', $review_meta['kindness'], $post['ID']);

		if(isset($review_meta['structure']))
			update_field('structure', $review_meta['structure'], $post['ID']);

		if(isset($review_meta['stampable'])) {
			if($review_meta['stampable'])
				update_field('stampable', $review_meta['stampable'], $post['ID']);
			else
				update_field('stampable', 0, $post['ID']);
		}

		do_action('save_post', $post['ID'], get_post($post['ID']), true);

	}

	/*
	 * Latest reviews dashboard widget
	 */
	function latest_reviews_dashboard_widget_setup() {
		wp_add_dashboard_widget(
			'bikeit_latest_reviews_dashboard_widget',
			__('Latest reviews', 'bikeit'),
			array($this, 'latest_reviews_dashboard_widget'),
			'dashboard',
			'side',
			'high'
		);
	}

	function latest_reviews_dashboard_widget() {

		$query = new WP_Query(array(
			'posts_per_page' => 10,
			'post_type' => 'review'
		));

		if($query->have_posts()) {
			?>
			<div class="places">
				<table style="width:100%;">
					<thead>
						<tr style="text-align:left;">
							<th>
								<?php //_e('Place', 'bikeit'); ?>
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
								<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
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

$GLOBALS['bikeit_reviews'] = new BikeIT_Reviews();