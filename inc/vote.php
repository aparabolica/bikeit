<?php

/*
 * BikeIT
 * Votes
 */

class BikeIT_Votes {

	function __construct() {
		add_action('save_post', array($this, 'save_post'));
		add_filter('json_prepare_user', array($this, 'json_prepare_user'), 10, 3);
		add_filter('json_endpoints', array($this, 'vote_routes'));
	}

	function save_post($post_id) {

		if ( wp_is_post_revision( $post_id ) )
			return;

		if(get_post_meta($post_id, '_vote_ratio', true) == '') {
			update_post_meta($post_id, '_vote_ratio', 0);
		}

	}

	function vote_routes($routes) {

		$vote_routes = array(
			'/posts/(?P<id>\d+)/vote' => array(
				array( array( $this, 'vote' ), WP_JSON_Server::CREATABLE | WP_JSON_Server::ACCEPT_JSON ),
				array( array( $this, 'delete_vote' ), WP_JSON_Server::DELETABLE ),
			)
		);

		return array_merge($routes, $vote_routes);

	}

	function json_prepare_user($user_fields, $user, $context) {
		$user_fields['votes'] = $this->get_author_votes($user->ID);
		return $user_fields;
	}

	function vote($id, $data) {

		$vote = $data['vote'];

		if(!is_user_logged_in()) {
			return new WP_Error( 'bikeit_user_cannot_vote', __( 'Sorry, you must be logged in to vote.' ), array( 'status' => 401 ) );
		}

		if(!$vote || ($vote !== 'up' && $vote !== 'down')) {
			return new WP_Error( 'bikeit_invalid_vote', __( 'Invalid vote.' ), array( 'status' => 500 ) );
		}

		$votes = get_post_meta($id, 'votes');

		$prev_value = $this->get_user_vote(get_current_user_id(), $id);

		if(!$prev_value)
			$result = add_post_meta($id, 'votes', array('user_id' => get_current_user_id(), 'vote' => $vote));
		else
			$result = update_post_meta($id, 'votes', array('user_id' => get_current_user_id(), 'vote' => $vote), $prev_value);

		$this->update_vote_totals($id);

		$post = get_post($id);
		$this->update_author_votes($post->post_author);

		$response = json_ensure_response($result);
		$response->set_status(201);
		return $response;
	}

	function delete_vote($id) {

		$user_vote = $this->get_user_vote(get_current_user_id(), $id);

		if($user_vote)
			$result = delete_post_meta($id, 'votes', $user_vote);
		else
			return new WP_Error( 'bikeit_vote_not_found', __( 'Vote not found.' ), array( 'status' => 404 ) );

		$this->update_vote_totals($id);

		$post = get_post($id);
		$this->update_author_votes($post->post_author);

		$response = json_ensure_response($result);
		return $response;

	}

	function get_user_vote($user_id, $post_id) {

		$votes = get_post_meta($post_id, 'votes');

		$user_vote = false;
		foreach($votes as $v) {
			if($v['user_id'] == $user_id) {
				$user_vote = $v;
			}
		}

		return $user_vote;
	}

	function update_author_votes($user_id) {

		$up = 0;
		$down = 0;

		$query = new WP_Query(array(
			'post_status' => 'publish',
			'posts_per_page' => -1,
			'post_type' => 'any',
			'meta_query' => array(
				array(
					'key' => 'votes',
					'compare' => 'EXISTS'
				)
			),
			'author' => $user_id
		));

		global $post;

		if($query->have_posts()) {
			while($query->have_posts()) {
				$query->the_post();
				$votes = get_post_meta($post->ID, 'votes');
				if($votes) {
					foreach($votes as $vote) {
						if($vote['vote'] == 'up')
							$up++;
						elseif($vote['vote'] == 'down')
							$down++;
					}
				}
				wp_reset_postdata();
			}
		}

		update_user_meta($user_id, 'votes_' . get_current_blog_id() . '_up', $up);
		update_user_meta($user_id, 'votes_' . get_current_blog_id() . '_down', $down);

	}

	function update_vote_totals($id) {

		$votes = get_post_meta($id, 'votes');

		$count = array(
			'up' => 0,
			'down' => 0,
			'total' => 0
		);

		foreach($votes as $vote) {
			if($vote['vote'] == 'up') {
				$count['up']++;
			} elseif($vote['vote'] == 'down') {
				$count['down']++;
			}
			$count['total']++;
		}

		$ratio = ($count['up'] / ($count['down']+1)) * $count['total'];

		update_post_meta($id, '_upvote_count', $count['up']);
		update_post_meta($id, '_downvote_count', $count['down']);
		update_post_meta($id, '_vote_total', $count['total']);
		update_post_meta($id, '_vote_ratio', $ratio);

	}

	function get_author_votes($user_id) {
		$sites = wp_get_sites();

		$up = 0;
		$down = 0;
		foreach($sites as $site) {
			$site_up = intval(get_user_meta($user_id, 'votes_' . $site['blog_id'] . '_up', true));
			$site_down = intval(get_user_meta($user_id, 'votes_' . $site['blog_id'] . '_down', true));
			$up = $up + $site_up;
			$down = $down + $site_down;
		}

		return array(
			'up' => $up,
			'down' => $down
		);
	}

}

$GLOBALS['bikeit_votes'] = new BikeIT_Votes();

function bikeit_get_user_vote($user_id, $post_id) {
	return $GLOBALS['bikeit_votes']->get_user_vote($user_id, $post_id);
}