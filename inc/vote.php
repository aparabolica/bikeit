<?php

/*
 * BikeIT
 * Votes
 */

class BikeIT_Votes {

	function __construct() {
		add_filter('json_endpoints', array($this, 'vote_routes'));
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

}



$GLOBALS['bikeit_votes'] = new BikeIT_Votes();

function bikeit_get_user_vote($user_id, $post_id) {
	return $GLOBALS['bikeit_votes']->get_user_vote($user_id, $post_id);
}