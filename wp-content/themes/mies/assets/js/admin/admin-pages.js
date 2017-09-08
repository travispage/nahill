(function ($) {

	$(document).ready(function() {
		if ($('#parent_id').val() == '') {
			$('#_mies_page_enabled_social_share' ).closest('.cmb-type-select' ).show();
		} else {
			$('#_mies_page_enabled_social_share' ).closest('.cmb-type-select' ).hide();
		}

		$('#parent_id').change(function() {
			if (this.value == '') {
				//we have no parent selected
				//hence this is a top level page
				// we need to show the option for the social share
				$('#_mies_page_enabled_social_share' ).closest('.cmb-type-select' ).show();
			} else {
				$('#_mies_page_enabled_social_share' ).closest('.cmb-type-select' ).hide();
			}
		});
	});

})(jQuery, window);



