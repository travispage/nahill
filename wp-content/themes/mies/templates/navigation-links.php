<?php
/**
 * The template for the project and blog navigation links - Next/Prev and Share
 *
 * @package Mies
 * @since   Mies 1.0
 */

global $post; ?>

<div class="navigation__links">
	<?php if( is_single() ) : ?>
		<button class="navigation__links-trigger"></button>
	<?php endif; ?>

	<ul class="menu  menu--main">
		<?php if ( is_single() ) {

			/* THE INDEX LINK */
			$index_label = wpgrade::option( 'project_menu_archive_label' );
			if ( ! empty( $index_label ) ) {
				echo '<li><a href="' . esc_url( mies_get_archive_page_link() ) . '">' . $index_label . '</a></li>' . PHP_EOL;
			}

			/* THE PREVIOUS LINK */
			$prev_label = wpgrade::option( 'project_menu_prev_label' );
			if ( ! empty( $prev_label ) ) {
				$prev_post = mies_get_prev_post();

				if ( ! empty( $prev_post ) && $prev_post != $post->ID ) {
					echo '<li><a class="prev" href="' . esc_url( get_the_permalink( $prev_post ) ) . '">' . $prev_label . '</a></li>' . PHP_EOL;
				}
			}

			/* THE NEXT LINK */
			$next_label = wpgrade::option( 'project_menu_next_label' );
			if ( ! empty( $next_label ) ) {
				$next_post = mies_get_next_post();

				if ( ! empty( $next_post ) && $next_post != $post->ID ) {
					echo '<li><a class="next" href="' . esc_url( get_the_permalink( $next_post ) ) . '">' . $next_label . '</a></li>' . PHP_EOL;
				}
			}

		}

		/* THE SHARE LINK */
		$share_label = wpgrade::option( 'project_menu_share_label' );
		$template_name =  get_post_meta( get_the_ID(), '_wp_page_template', true );
		$is_contact_page = $template_name === 'page-templates/contact.php';

		if ( ! empty( $share_label ) /*&& !is_woocommerce()*/ ) {
			if ( is_single() ||
			     ( is_page() &&
			       ( ( !$is_contact_page && get_post_meta( get_the_ID(), wpgrade::prefix() . 'page_enabled_social_share', true ) ) || ( $is_contact_page && get_post_meta( get_the_ID(), wpgrade::prefix() . 'gmap_enabled_social_share', true ) ) )
			     )
			) {
				echo '<li><a class="share js-popup-share" href="#">' . $share_label . '</a></li>' . PHP_EOL;
			}
		} ?>
	</ul>
</div>