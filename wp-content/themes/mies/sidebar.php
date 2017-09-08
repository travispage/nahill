<?php
/**
 * The template for the main widget area.
 *
 * @package Mies
 * @since   Mies 1.0
 */

if ( is_active_sidebar( 'sidebar-single-post' ) ): ?>
	<aside class="sidebar  sidebar--single-post">
		<?php dynamic_sidebar( 'sidebar-single-post' ); ?>
	</aside><!-- .sidebar -->
<?php endif; ?>