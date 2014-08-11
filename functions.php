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

/*
 * Advanced Custom Fields
 */

function bikeit_acf_dir() {
	return get_template_directory_uri() . '/inc/acf/';
}
add_filter('acf/helpers/get_dir', 'bikeit_acf_dir');

define('ACF_LITE', false);
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
		'featured' => __('Featured', 'bikeit')
	);

	return apply_filters('bikeit_labels', $labels);
}


/*
 * Scripts and styles
 */

function bikeit_scripts() {

	wp_enqueue_style('bikeit-base', get_template_directory_uri() . '/css/base.css');
	wp_enqueue_style('bikeit-skeleton', get_template_directory_uri() . '/css/skeleton.css');
	wp_enqueue_style('leaflet', get_template_directory_uri() . '/css/leaflet.css');
	wp_enqueue_style('bikeit-main', get_template_directory_uri() . '/css/main.css', array('bikeit-base', 'bikeit-skeleton'));
	wp_enqueue_style('bikeit-responsive', get_template_directory_uri() . '/css/responsive.css', array('bikeit-main'));

	wp_enqueue_script('bikeit-main', get_template_directory_uri() . '/js/main.js', array('jquery'), '0.0.0');
	wp_localize_script('bikeit-main', 'bikeit', array(
		'name' => get_bloginfo('name'),
		'url' => home_url(),
		'templateUri' => get_template_directory_uri(),
		'macroLocation' => 'São Paulo, Brasil',
		'labels' => bikeit_labels()
	));

}
add_action('wp_enqueue_scripts', 'bikeit_scripts');

/*
 * BikeIT functions
 */

require_once(TEMPLATEPATH . '/inc/place.php');
require_once(TEMPLATEPATH . '/inc/review.php');
