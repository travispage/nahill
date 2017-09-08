<?php
/**
 * The template for displaying the featured image.
 *
 * @package Mies
 * @since   Mies 1.0
 */

if ( has_post_thumbnail() ):
	$image = wp_get_attachment_image_src( get_post_thumbnail_id(), 'medium-size' );
	if ( ! empty( $image[0] ) ) : ?>
		<div class="entry-thumbnail">
			<a href="<?php esc_url( the_permalink() ); ?>"><img src="<?php echo esc_url( $image[0] ) ?>" alt="<?php esc_attr( the_title() ); ?>"/></a>
		</div>
	<?php endif;
endif;