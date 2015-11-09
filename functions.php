<?php

/*
 * Theme setup
 */
function bikeit_theme_setup() {
	// Text domain
	load_theme_textdomain('bikeit', get_template_directory() . '/languages');

	// Nav menus
	register_nav_menus(
		array(
			'header-nav' => __('Header nav', 'bikeit'),
			'footer-nav' => __('Footer menu', 'bikeit')
		)
	);
}
add_action('after_setup_theme', 'bikeit_theme_setup');

function bikeit_sidebars() {
	register_sidebar( array(
		'name' => __( 'Footer widgets', 'bikeit' ),
		'id' => 'footer-sidebar',
		'description' => __( 'Widgets in this area will be shown on the footer of every page.', 'bikeit' ),
		'before_widget' => '<li id="%1$s" class="widget %2$s">',
		'after_widget'  => '</li>',
		'before_title'  => '<h2 class="widgettitle">',
		'after_title'   => '</h2>',
	) );
}
add_action( 'widgets_init', 'bikeit_sidebars' );

/*
 * Required plugins
 */
require_once(TEMPLATEPATH . '/inc/class-tgm-plugin-activation.php');

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
 * Set API route
 */
function bikeit_json_url_prefix() {
	return 'api';
}
add_filter('json_url_prefix', 'bikeit_json_url_prefix');

add_filter('show_admin_bar', '__return_false');

/*
 * Advanced Custom Fields
 */
if(!class_exists('Acf')) {
	function bikeit_acf_dir() {
		return get_template_directory_uri() . '/inc/acf/';
	}
	add_filter('acf/helpers/get_dir', 'bikeit_acf_dir');

	define('ACF_LITE', true);
	require_once(TEMPLATEPATH . '/inc/acf/acf.php');
}

/*
 * Theme WP features
 */
add_theme_support('post-thumbnails');

/*
 * i18n labels
 */
function bikeit_labels() {

	$labels = array(
		'Featured places' => __('Featured places', 'bikeit'),
		'Viewing list of reviews' => __('Viewing list of reviews', 'bikeit'),
		'featured' => __('Featured', 'bikeit'),
		'Filter your search' => __('Filter your search', 'bikeit'),
		'Structure' => __('Structure', 'bikeit'),
		'Kindness' => __('Kindness', 'bikeit'),
		'Total reviews' => __('Total reviews', 'bikeit'),
		'Submit review' => __('Submit review', 'bikeit'),
		'Edit review' => __('Edit review', 'bikeit'),
		'Update review' => __('Update review', 'bikeit'),
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
		'Send photos' => __('Send photos', 'bikeit'),
		'Where are you going?' => __('Where are you going?', 'bikeit'),
		'Collaborative mapping bike-friendly city spots' => __('Collaborative mapping bike-friendly city spots', 'bikeit'),
		'Adding' => __('Adding', 'bikeit'),
		'Name' => __('Name', 'bikeit'),
		'Search address' => __('Search address', 'bikeit'),
		'Address' => __('Address', 'bikeit'),
		'Number' => __('Number', 'bikeit'),
		'District' => __('District', 'bikeit'),
		'Exact location' => __('Exact location', 'bikeit'),
		'Submit place' => __('Submit place', 'bikeit'),
		'OpenStreetMap Results' => __('OpenStreetMap Results', 'bikeit'),
		'Logout' => __('Logout', 'bikeit'),
		'My profile' => __('My profile', 'bikeit'),
		'Edit my profile' => __('Edit my profile', 'bikeit'),
		'Login/Register' => __('Login/Register', 'bikeit'),
		'Control panel' => __('Control panel', 'bikeit'),
		'Recently reviewed' => __('Recently reviewed', 'bikeit'),
		'New place' => __('New place', 'bikeit'),
		'Review' => __('Review', 'bikeit'),
		'Review count' => __('Review count', 'bikeit')
	);

	return apply_filters('bikeit_labels', $labels);
}

/*
 * Get place categories
 */
function bikeit_get_place_categories() {

	if(is_multisite())
		switch_to_blog(1);

	$terms = get_terms('place-category', array('hide_empty' => 0));

	foreach($terms as &$term) {

		$term = get_object_vars($term);

		$term['markers'] = array();
		$term['markers']['default'] = get_field('marker', 'place-category_' . $term['term_id']);
		$term['markers']['approved'] = get_field('approved_marker', 'place-category_' . $term['term_id']);
		$term['markers']['failed'] = get_field('failed_marker', 'place-category_' . $term['term_id']);
		$term['markers']['stamp'] = get_field('stamp_marker', 'place-category_' . $term['term_id']);
		$term['markers']['position'] = get_field('marker_position', 'place-category_' . $term['term_id']);

	}

	if(is_multisite())
		restore_current_blog();

	return $terms;

}

function bikeit_get_place_labels() {
	if(is_multisite())
		switch_to_blog(1);

	$labels = get_option('bikeit_labels');

	if(is_multisite())
		restore_current_blog();

	return $labels;
}

function bikeit_get_main_site_api() {
	if(is_multisite())
		switch_to_blog(1);

	$url = get_option('permalink_structure') ? esc_url(get_json_url()) . '/' : esc_url(get_json_url());

	if(is_multisite())
		restore_current_blog();

	return $url;
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
	wp_enqueue_style('maki', get_template_directory_uri() . '/css/maki-sprite.css');
	wp_enqueue_style('bikeit-main', get_template_directory_uri() . '/css/main.css', array('bikeit-reset', 'bikeit-skeleton'));
	wp_enqueue_style('bikeit-responsive', get_template_directory_uri() . '/css/responsive.css', array('bikeit-main'));

	wp_register_script('moment', get_template_directory_uri() . '/js/moment.js');
	wp_enqueue_script('bikeit-main', get_template_directory_uri() . '/js/main.js', array('jquery', 'moment'));
	wp_localize_script('bikeit-main', 'bikeit', array(
		'name' => get_bloginfo('name'),
		'locale' => get_bloginfo('language'),
		'url' => home_url(),
		'adminUrl' => admin_url(),
		'templateUri' => get_template_directory_uri(),
		'apiUrl' => get_option('permalink_structure') ? esc_url(get_json_url()) . '/' : esc_url(get_json_url()),
		'mainApiUrl' => bikeit_get_main_site_api(),
		'nonce' => wp_create_nonce('wp_json'),
		'logoutUrl' => wp_logout_url(home_url()),
		'labels' => bikeit_labels(),
		'placeCategories' => bikeit_get_place_categories(),
		'city' => json_decode(get_option('bikeit_city')),
		'placeLabels' => bikeit_get_place_labels(),
		'map' => array(
			'tile' => 'https://{s}.tiles.mapbox.com/v4/miguelpeixe.l94olf54/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWlndWVscGVpeGUiLCJhIjoiVlc0WWlrQSJ9.pIPkSx25w7ossO6rZH9Tcw'
		)
	));

}
add_action('wp_enqueue_scripts', 'bikeit_scripts');

/*
 * Set momentjs local
 */
function bikeit_moment_locale() {
	?>
	<script type="text/javascript">
		moment.locale('<?php echo strtolower(get_locale()); ?>');
	</script>
	<?php
}
add_action('wp_head', 'bikeit_moment_locale');

/*
 * Print OSM labels
 */
function bikeit_osm_labels() {
	$locale = str_replace('_', '-', get_locale());
	$labels = @file_get_contents(TEMPLATEPATH . '/osm-labels/' . $locale . '.json');
	if(!$labels)
		$labels = file_get_contents(TEMPLATEPATH . '/osm-labels/en.json');
	?>
	<script type="text/javascript">
		window.osmLabels = <?php echo $labels; ?>.presets.presets;
	</script>
	<?php
}
add_action('wp_head', 'bikeit_osm_labels', 5);

/*
 * Remove unnecessary content from API responses
 */
function bikeit_json_prepare_post($_post, $post, $context) {

	unset($_post['guid']);
	unset($_post['menu_order']);
	unset($_post['parent']);
	unset($_post['excerpt']);
	unset($_post['password']);

	return $_post;
}
add_filter('json_prepare_post', 'bikeit_json_prepare_post', 10, 3);

/*
 * Set page link (angularjs routing)
 */
function bikeit_page_link($url, $post_id) {
	if(is_multisite()) {
		global $switched;
		if($switched) {
			$local_switch = true;
			restore_current_blog();
		}
	}

	$url = get_bloginfo('url') . '/#!/page/' . $post_id . '/';

	if(is_multisite() && $local_switch)
		switch_to_blog(1);

	return $url;
}
add_filter('page_link', 'bikeit_page_link', 10, 2);

/*
 * Hide get shortlink from post edition
 */
add_filter( 'pre_get_shortlink', '__return_empty_string' );

/*
 * Disable dashboard widgets
 */

function bikeit_disable_default_dashboard_widgets() {
	global $wp_meta_boxes;
	unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_activity']);
	unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_right_now']);
	unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_recent_comments']);
	unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_incoming_links']);
	unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_plugins']);
	unset($wp_meta_boxes['dashboard']['side']['core']['dashboard_primary']);
	unset($wp_meta_boxes['dashboard']['side']['core']['dashboard_secondary']);
	unset($wp_meta_boxes['dashboard']['side']['core']['dashboard_quick_press']);
	unset($wp_meta_boxes['dashboard']['side']['core']['dashboard_recent_drafts']);
}
add_action('wp_dashboard_setup', 'bikeit_disable_default_dashboard_widgets', 999);

function bikeit_ms_disable_dashboard_pages() {
	if(is_multisite() && get_current_blog_id() != 1) {
		?>
		<style>
			#menu-posts,
			#menu-pages,
			#menu-plugins,
			#wp-admin-bar-my-sites-list .ab-sub-wrapper {
				display: none !important;
			}
		</style>
		<?php
	}
}
add_action('admin_init', 'bikeit_ms_disable_dashboard_pages');

/*
 * BikeIT modules
 */

require_once(TEMPLATEPATH . '/inc/settings.php');

require_once(TEMPLATEPATH . '/inc/auth.php');

require_once(TEMPLATEPATH . '/inc/contributor.php');

require_once(TEMPLATEPATH . '/inc/vote.php');

require_once(TEMPLATEPATH . '/inc/place.php');

require_once(TEMPLATEPATH . '/inc/review.php');

require_once(TEMPLATEPATH . '/inc/one-content.php');
