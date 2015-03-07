/*
 * Media uploader
 */
jQuery(document).ready(function($){
	var _custom_media = true,
	_orig_send_attachment = wp.media.editor.send.attachment;

	$('.bikeit-custom-uploader .open-media-uploader').click(function(e) {
		var send_attachment_bkp = wp.media.editor.send.attachment;
		var button = $(this);
		_custom_media = true;
		wp.media.editor.send.attachment = function(props, attachment){
			if ( _custom_media ) {
				button.parents('.bikeit-custom-uploader').find('.image_url').val(attachment.url);
			} else {
				return _orig_send_attachment.apply( this, [props, attachment] );
			};
		}

		wp.media.editor.open(button);
		return false;
	});

	$('.add_media').on('click', function(){
		_custom_media = false;
	});
});

/*
 * City
 */
jQuery(document).ready(function($) {

	var $cityResults = $('ul.city-results');

	$cityResults.hide();

	$('.remove-city').hide();

	$('.remove-city a').on('click', function() {
		$('input[name="bikeit_city"]').val('');
		$('.selected-city').text('');
		$('.remove-city,.selected-city').hide();
		return false;
	});

	var updateSelectedCity = function(data) {

		if(typeof data == 'string') {
			try {
				data = JSON.parse(data);
			} catch(err) {
				data = {};
			}
		}

		if(!_.isEmpty(data)) {
			$('.remove-city').show();
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

		$.get('http://nominatim.openstreetmap.org/search?format=json&q=' + text, function(data) {

			_.each(data, function(item) {
				var $li = $('<li />');
				$li.text(item.display_name);
				$li.data('address', item);
				$cityResults.append($li);
			});

		});

	}, 300));

});