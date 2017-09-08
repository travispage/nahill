<?php
/**
 * The template for displaying each project in the portfolio archive.
 *
 * @package Mies
 * @since   Mies 1.0
 */

global $post;

$filter_by_terms = '';

if ( wpgrade::option( 'portfolio_allow_filter_by_category', true ) ) {

	$terms = get_the_terms( wpgrade::lang_post_id( get_the_ID() ), wpgrade::$shortname . '_portfolio_categories');

	if ( ! is_wp_error($terms) && ! empty( $terms ) ) {
		foreach ( $terms as $term ) {
			$filter_by_terms .= esc_attr( ' cat-' . $term->slug );
		}
	}
}

$pixfields = array();
if ( function_exists('get_pixfields') ) {
	$pixfields = get_pixfields();
} ?>

<article id="post-<?php echo wpgrade::lang_post_id( get_the_ID() ) ?>" class="project<?php foreach( $pixfields as $pixfield => $label ) { mies::display_pixfield_string($label, $prepend = ' pixfield_value-' . $pixfield . '-' ); }; echo $filter_by_terms; ?>  masonry__item">
	<a href="<?php echo esc_url( get_the_permalink() ); ?>">
		<?php if ( mies_has_thumbnail() ): ?>

		<div class="masonry__item-image">

			<?php
			$id = mies_get_thumbnail_id( wpgrade::lang_post_id( get_the_ID() ) );
			$markup = '';

			//just use the size defined by the user in Settings > Media > Portfolio Thumbnail
			$image_portfolio_size = wp_get_attachment_image_src( $id, 'portfolio_thumbnail' );
			//the responsive image
			$image_meta = get_post_meta( $id, '_wp_attachment_metadata', true );
			$image_markup = '<img src="' . esc_url( $image_portfolio_size[0] ) . '" alt="' . esc_attr( mies::get_img_alt( $id ) ) . '">';
			$markup .= wp_image_add_srcset_and_sizes( $image_markup, $image_meta, $id ) . PHP_EOL;

			echo $markup; ?>
		</div><!-- .masonry__item-image -->

		<?php endif; ?>

		<h4 class="masonry__item-title"><?php the_title(); ?></h4>
		<?php $categories = get_the_terms( wpgrade::lang_post_id( get_the_ID() ), wpgrade::shortname() . '_portfolio_categories' );
		if ( ! is_wp_error( $categories ) && ! empty( $categories ) ):
			echo '<ul class="masonry__item-meta  menu  menu--inline">' . PHP_EOL;
			foreach ( $categories as $category ) {
				echo '<li>' . $category->name . '</li>' . PHP_EOL;
			};
			echo '</ul>' . PHP_EOL;
		endif ?>
	</a>
</article>
