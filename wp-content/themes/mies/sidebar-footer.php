<?php
/**
 * The template for the footer widget area.
 *
 * @package Mies
 * @since   Mies 1.0
 */

if ( is_active_sidebar( 'sidebar-footer' ) ):
	$num         = wpgrade::option( 'footer_number_of_columns' );
	$cols_number = ( ! empty( $num ) ) ? $num : 3;

	$column_width = '';
	if ($cols_number == 1) {
		$column_width = wpgrade::option( 'footer_column_width' );
	}
	?>

	<footer class="footer">
		<div class="content">
			<div class="grid  <?php echo esc_attr( 'grid-' . $cols_number . '  ' . $column_width ) ?>">
				<?php dynamic_sidebar( 'sidebar-footer' ); ?>
			</div>
		</div>
	</footer>
<?php endif;