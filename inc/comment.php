<?php

/*
 * BikeIT
 * Comment
 */

class BikeIT_Comments {

	function __construct() {
		add_filter('json_endpoints', array($this, 'comment_routes'));
	}

	function comment_routes($routes) {

		$comment_routes = array(
			'/posts/(?P<id>\d+)/comment' => array(
				array( array( $this, 'comment' ), WP_JSON_Server::CREATABLE | WP_JSON_Server::ACCEPT_JSON )
			)
		);

		return array_merge($routes, $comment_routes);

	}

	function comment($id, $data) {

		global $wp_json_posts;

		if(!is_user_logged_in()) {
			return new WP_Error( 'bikeit_user_cannot_comment', __( 'Sorry, you must be logged in to comment.', 'bikeit' ), array( 'status' => 401 ) );
		}

		$user_id = get_current_user_id();

		$comment_content = $data['comment_content'];

		$comment_data = array(
			'comment_post_ID' => $id,
			'user_ID' => $user_id,
			'comment_content' => $comment_content
		);

		$comment_id = wp_new_comment($comment_data);

		$response = json_ensure_response($wp_json_posts->comments->get_comment($comment_id));
		$response->set_status(201);
		return $response;

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

}

$GLOBALS['bikeit_comments'] = new BikeIT_Comments();
