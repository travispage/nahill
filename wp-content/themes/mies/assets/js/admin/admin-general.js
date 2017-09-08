;
(function ($) {
	$(document).ready(function () {


		// make a tip for fields which can store a space character only to hide the value
		$( "#_mies_header_cover_subtitle, #_mies_header_cover_title" ).keyup(function() {
			var value = $( this ).val(),
				parentContainer = $( this ).parents('tr');
			if (value == " ") {
				parentContainer.addClass('empty');
			} else {
				parentContainer.removeClass('empty');
			}
		}).keyup();


		//hide the featured image side section when selecting certain page templates
		if ($('#page_template').val() == 'page-templates/contact.php' || $('#page_template').val() == 'page-templates/slideshow.php') {
			$('#postimagediv').hide();
		} else {
			$('#postimagediv').show();
		}

		$('#page_template').on('change', function () {
			if ($('#page_template').val() == 'page-templates/contact.php' || $('#page_template').val() == 'page-templates/slideshow.php') {
				$('#postimagediv').hide();
			} else {
				$('#postimagediv').show();
			}
		});

		//portfolio and pages related

		// classify the gallery number
		$('#pixgallery').on('html-change-post', function() {
			// Mark The Slideshow Options first
			$('#mies_header_area_settings tr.cmb-type-title').addClass('slideshow-option')
															 .nextAll(':not(.display_on.hidden)').addClass('slideshow-option');

			var $gallery = $( this ).children('ul'),
				nr_of_images = $gallery.children('li').length,
				metabox_class = '',
				options_container = $('.slideshow-option');


			if ( nr_of_images == 0 ) {
				metabox_class = 'no-image';
			} else if ( nr_of_images == 1 ) {
				metabox_class = 'single-image';
			} else {
				metabox_class = 'multiple-images';
			}

			if ( metabox_class !== '' ) {
				$( '#_post_aside')
					.removeClass('no-image single-image multiple-images')
					.addClass(metabox_class);
			}
			toggleSliderOptions(nr_of_images, options_container);
		});

		// Show/Hide "Slideshow Options"
		var toggleSliderOptions = function(no, el) {
			if (no <= 1) {
				el.slideUp();
			} else {
				el.slideDown();
			}
		};
	});

	// Redefines jQuery.fn.html() to add custom events that are triggered before and after a DOM element's innerHtml is changed
	// html-change-pre is triggered before the innerHtml is changed
	// html-change-post is triggered after the innerHtml is changed
	var eventName = 'html-change';
	// Save a reference to the original html function
	jQuery.fn.originalHtml = jQuery.fn.html;
	// Let's redefine the html function to include a custom event
	jQuery.fn.html = function() {
		var currentHtml = this.originalHtml();
		if(arguments.length) {
			this.trigger(eventName + '-pre', jQuery.merge([currentHtml], arguments));
			jQuery.fn.originalHtml.apply(this, arguments);
			this.trigger(eventName + '-post', jQuery.merge([currentHtml], arguments));
			return this;
		} else {
			return currentHtml;
		}
	};

})(jQuery, window);