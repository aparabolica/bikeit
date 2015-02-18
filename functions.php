<?php

/*
 * Required WP REST API plugin
 */
require_once dirname(__FILE__) . '/inc/class-tgm-plugin-activation.php';

function bikeit_register_required_plugins() {

	$plugins = array(
		array(
			'name' => 'JSON REST API (WP API)',
			'slug' => 'json-rest-api',
			'required' => true,
			'force_activation' => true
		)
	);

	$options = array(
		'default_path'	=> '',
		'menu'			=> 'bikeit-install-plugins',
		'has_notices'	=> true,
		'dismissable'	=> true,
		'dismiss_msg'	=> '',
		'is_automatic'	=> false,
		'message'		=> ''
	);

	tgmpa($plugins, $options);
}
add_action('tgmpa_register', 'bikeit_register_required_plugins');

function bikeit_json_url_prefix() {
	return 'api';
}
add_filter('json_url_prefix', 'bikeit_json_url_prefix');

/*
 * Advanced Custom Fields
 */

function bikeit_acf_dir() {
	return get_template_directory_uri() . '/inc/acf/';
}
add_filter('acf/helpers/get_dir', 'bikeit_acf_dir');

define('ACF_LITE', true);
require_once(TEMPLATEPATH . '/inc/acf/acf.php');

/*
 * Theme WP features
 */

add_theme_support('post-thumbnails');

/*
 * i18n labels
 */

function bikeit_labels() {

	$labels = array(
		'Viewing list of reviews' => __('Viewing list of reviews', 'bikeit'),
		'featured' => __('Featured', 'bikeit'),
		'Filter your search' => __('Filter your search', 'bikeit'),
		'Structure' => __('Structure', 'bikeit'),
		'Kindness' => __('Kindness', 'bikeit'),
		'Total reviews' => __('Total reviews', 'bikeit'),
		'Submit review' => __('Submit review', 'bikeit'),
		'Reviews' => __('Reviews', 'bikeit'),
		'Rating' => __('Rating', 'bikeit'),
		'Approved' => __('Approved', 'bikeit'),
		'Failed' => __('Failed', 'bikeit'),
		'Published' => __('Published', 'bikeit'),
		'Reply this review' => __('Reply this review', 'bikeit'),
		'Reviewing' => __('Reviewing', 'bikeit'),
		'Nominate for BikeIT Stamp' => __('Nominate for BikeIT Stamp', 'bikeit'),
		'Notify place about your review' => __('Notify place about your review', 'bikeit'),
		'Tell us about your experience' => __('Tell us about your experience', 'bikeit'),
		'Send photos' => __('Send photos', 'bikeit')
	);

	return apply_filters('bikeit_labels', $labels);
}

/*
 * Get place categories
 */

function bikeit_get_place_categories() {

	$terms = get_terms('place-category', array('hide_empty' => 0));

	foreach($terms as &$term) {

		$term = get_object_vars($term);

		$term['markers'] = array();
		$term['markers']['default'] = get_field('marker', 'place-category_' . $term['term_id']);
		$term['markers']['approved'] = get_field('approved_marker', 'place-category_' . $term['term_id']);
		$term['markers']['unapproved'] = get_field('unapproved_marker', 'place-category_' . $term['term_id']);
		$term['markers']['position'] = get_field('marker_position', 'place-category_' . $term['term_id']);

	}

	return $terms;

}


/*
 * Scripts and styles
 */

function bikeit_scripts() {

	wp_enqueue_style('open-sans-condensed', 'http://fonts.googleapis.com/css?family=Open+Sans+Condensed:300,700,300italic');
	wp_enqueue_style('open-sans', 'http://fonts.googleapis.com/css?family=Open+Sans:400italic,600italic,400,300,600,700,800');
	wp_enqueue_style('bikeit-reset', get_template_directory_uri() . '/css/reset.css');
	wp_enqueue_style('bikeit-skeleton', get_template_directory_uri() . '/css/skeleton.css');
	wp_enqueue_style('leaflet', get_template_directory_uri() . '/css/leaflet.css');
	wp_enqueue_style('ng-dialog', get_template_directory_uri() . '/css/ngDialog.min.css');
	wp_enqueue_style('ng-dialog-default', get_template_directory_uri() . '/css/ngDialog-theme-default.min.css');
	wp_enqueue_style('bikeit-main', get_template_directory_uri() . '/css/main.css', array('bikeit-reset', 'bikeit-skeleton'));
	wp_enqueue_style('bikeit-responsive', get_template_directory_uri() . '/css/responsive.css', array('bikeit-main'));

	wp_enqueue_script('bikeit-vendor', get_template_directory_uri() . '/js/vendor.js', array('jquery'), '0.0.0');
	wp_enqueue_script('bikeit-main', get_template_directory_uri() . '/js/main.js', array('bikeit-vendor'), '0.0.0');
	wp_localize_script('bikeit-vendor', 'bikeit', array(
		'name' => get_bloginfo('name'),
		'locale' => get_bloginfo('language'),
		'url' => home_url(),
		'templateUri' => get_template_directory_uri(),
		'apiUrl' => esc_url_raw(get_json_url()),
		'nonce' => wp_create_nonce('wp_json'),
		'logoutUrl' => wp_logout_url(home_url()),
		'labels' => bikeit_labels(),
		'placeCategories' => bikeit_get_place_categories(),
		'city' => json_decode(get_option('bikeit_city'))
	));

}
add_action('wp_enqueue_scripts', 'bikeit_scripts');

function bikeit_admin_scripts() {

	wp_enqueue_script('bikeit-vendor', get_template_directory_uri() . '/js/vendor.js', array('jquery'), '0.0.0');

}
add_action('admin_footer', 'bikeit_admin_scripts');

/*
 * BikeIT functions
 */

require_once(TEMPLATEPATH . '/inc/settings.php');

//require_once(TEMPLATEPATH . '/inc/auth.php');

require_once(TEMPLATEPATH . '/inc/vote.php');

require_once(TEMPLATEPATH . '/inc/place.php');
require_once(TEMPLATEPATH . '/inc/review.php');
