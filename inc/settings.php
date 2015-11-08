<?php

/*
 * BikeIT
 * Settings
 */

class BikeIT_Settings {

	function __construct() {

		add_action('admin_init', array($this, 'init_theme_settings'));
		add_action('admin_enqueue_scripts', array($this, 'enqueue_scripts'));

	}

	function enqueue_scripts() {

		if(get_current_screen()->id == 'options-general') {
			wp_enqueue_media();
			wp_enqueue_script('bikeit-settings', get_template_directory_uri() . '/inc/settings.js', array('jquery', 'underscore'));
		}

	}

	function init_theme_settings() {

		add_settings_section(
			'bikeit_settings_section',
			__('BikeIT Settings', 'bikeit'),
			'',
			'general'
		);

		add_settings_field(
			'bikeit_city',
			__('City', 'bikeit'),
			array($this, 'city_field'),
			'general',
			'bikeit_settings_section'
		);

		register_setting('general', 'bikeit_city');

		if(!is_multisite() || get_current_blog_id() == 1) {

			add_settings_field(
				'bikeit_labels_approved',
				__('Approved place label image', 'bikeit'),
				array($this, 'labels_approved_field'),
				'general',
				'bikeit_settings_section'
			);

			add_settings_field(
				'bikeit_labels_failed',
				__('Failed place label image', 'bikeit'),
				array($this, 'labels_failed_field'),
				'general',
				'bikeit_settings_section'
			);

			add_settings_field(
				'bikeit_labels_stamp',
				__('BikeIT Stamp place label image', 'bikeit'),
				array($this, 'labels_stamp_field'),
				'general',
				'bikeit_settings_section'
			);

			register_setting('general', 'bikeit_labels');
			
		}

	}

	function city_field() {

		?>
		<p class="selected-city"></p>
		<p class="remove-city"><a href="#"><?php _e('Remove city', 'bikeit'); ?></a></p>
		<input type="hidden" name="bikeit_city" value='<?php echo get_option('bikeit_city'); ?>' />
		<input type="text" id="bikeit_city" class="regular-text" autocomplete="off" />
		<p class="description"><?php _e('Start typing a city name...', 'bikeit'); ?></p>
		<ul class="city-results"></ul>
		<style>
			.form-table td p.selected-city {
				width: 25em;
				margin: 0 0 20px;
				font-weight: 800;
				box-sizing: border-box;
			}
			.city-results {
				width: 25em;
				background: #fff;
				padding: 5px 10px;
				box-sizing: border-box;
			}
			.city-results li {
				color: #666;
				cursor: pointer;
				padding: 5px 0;
				margin: 0;
			}
			.city-results li:hover {
				color: #333;
			}
		</style>
		<?php

	}

	function label_images_field($l, $title) {

		$labels = get_option('bikeit_labels');
		$label = isset($labels[$l]) ? $labels[$l] : '';
		?>
		<div class="bikeit-custom-uploader">
			<input id="bikeit_labels_approved" class="image_url" name="bikeit_labels[<?php echo $l; ?>]" type="text" placeholder="<?php echo $title; ?>" value="<?php echo $label; ?>" size="60" />
			<a class="open-media-uploader button" /><?php _e('Upload'); ?></a>
			<div class="bikeit-media-uploader-preview">
				<img src="<?php echo $label; ?>" style="max-width:300px;height:auto;" />
			</div>
		</div>
		<?php
	}

	function labels_approved_field() {
		$this->label_images_field('approved', __('Approved label url', 'bikeit'));
	}

	function labels_failed_field() {
		$this->label_images_field('failed', __('Failed label url', 'bikeit'));
	}

	function labels_stamp_field() {
		$this->label_images_field('stamp', __('BikeIT stamp label url', 'bikeit'));
	}

}

if(is_admin())
	$GLOBALS['bikeit_settings'] = new BikeIT_Settings();
