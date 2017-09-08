<?php
/**
 * The template for the bellow the main menu widget area in the overlay.
 *
 * @package Mies
 * @since   Mies 1.0
 */
?>

<div class="overlay__sidebar  sidebar  sidebar--overlay-after  content--single">

	<?php if ( is_active_sidebar( 'sidebar-after-overlay' ) ):
		$num         = wpgrade::option( 'overlay_number_of_columns' );
		$cols_number = ( ! empty( $num ) ) ? $num : 3;

		$column_width = '';
		if ($cols_number == 1) {
			$column_width = wpgrade::option( 'overlay_column_width' );
		}
		dynamic_sidebar( 'sidebar-after-overlay' );
	endif; ?>

</div>
