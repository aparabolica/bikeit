<?php

/*
 * BikeIT
 * Settings
 */

class BikeIT_Settings {

	function __construct() {

		add_action('admin_init', array($this, 'init_theme_settings'));

	}

	function init_theme_settings() {

		add_settings_section(
			'general_settings_section',
			__('BikeIT Settings', 'bikeit'),
			'',
			'general'
		);

		add_settings_field(
			'bikeit_city',
			__('City', 'bikeit'),
			array($this, 'city_field'),
			'general',
			'general_settings_section'
		);

		register_setting('general', 'bikeit_city');

	}

	function settings_callback() {

		?>
		Teste
		<?php

	}

	function city_field() {

		?>
		<p class="selected-city"></p>
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
		<script type="text/javascript">

			jQuery(document).ready(function($) {

				var $cityResults = $('ul.city-results');

				$cityResults.hide();

				var updateSelectedCity = function(data) {

					if(typeof data == 'string') {
						try {
							data = JSON.parse(data);
						} catch(err) {
							data = '{}';
							data = JSON.parse(data);
						}
					}

					if(data) {
						$('input[name="bikeit_city"]').val(JSON.stringify(data));
						$('.selected-city').text(data.display_name);
						$('.selected-city').show();
					} else {
						$('.selected-city').hide();
					}

				};

				updateSelectedCity($('input[name="bikeit_city"]').val());

				$cityResults.on('click', 'li', function() {

					updateSelectedCity($(this).data('address'));

				});

				$('input#bikeit_city').keyup(_.debounce(function() {

					var text = $(this).val();

					if(text) {
						$cityResults.show();
					} else {
						$cityResults.hide();
					}

					$cityResults.empty();

					$.get('http://nominatim.openstreetmap.org/search?format=json&city=' + text, function(data) {

						_.each(data, function(item) {
							var $li = $('<li />');
							$li.text(item.display_name);
							$li.data('address', item);
							$cityResults.append($li);
						});

					});

				}, 300));

			});

		</script>

		<?php

	}

}

$GLOBALS['bikeit_settings'] = new BikeIT_Settings();