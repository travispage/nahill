(function ($) {

	$(document).ready(function() {
		//no need to show this for projects since it is controlled from Theme Options
		$('#_mies_page_enabled_social_share' ).closest('.cmb-type-select').hide();

		var $parent_selector =  $('#parent_id'),
			check_pixfields_visibility = function( $select ) {
				var $pixifelds = $('#pixfields');
				if ( typeof $select === 'undefined' || '' === $select.val() ) {
					$pixifelds.addClass('active');
				} else {
					$pixifelds.removeClass('active');
				}
			};

		/**
		 * Hide pixfields on suprojects
		 */
		check_pixfields_visibility( $parent_selector );
		$parent_selector.on('change', function() {
			check_pixfields_visibility( $(this) );
		});
	});

})(jQuery, window);



