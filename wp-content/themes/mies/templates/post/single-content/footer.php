<?php
/**
 * The template for the single post footer info.
 *
 * @package Mies
 * @since   Mies 1.0
 */

global $post_format; ?>

	<footer class="entry-meta">
		<?php
		$categories = get_the_category();
		if ( ! is_wp_error( $categories ) && ! empty( $categories ) ):
			_e('Posted in ', 'mies_txtd'); ?>
			<span class="category-links">
			<?php
			foreach ( $categories as $category ) {
				echo '<a href="' . esc_url( get_category_link( $category->term_id ) ) . '" title="' . esc_attr( sprintf( __( "View all posts in %s", 'mies_txtd' ), $category->name ) ) . '" rel="tag">' . $category->name . '</a> ';
			}; ?>
		</span>
		<?php endif;
		$tags = get_the_tags();
		if ( ! empty( $tags ) ):
			_e(' and tagged with ', 'mies_txtd'); ?>
			<span class="tag-links">
				<?php
				foreach ( $tags as $tag ) {
					echo '<a href="' . esc_url( get_tag_link( $tag->term_id ) ) . '" title="' . esc_attr( sprintf( __( "View all posts tagged %s", 'mies_txtd' ), $tag->name ) ) . '" rel="tag">' . $tag->name . '</a> ';
				}; ?>
			</span>
		<?php endif; ?>.
	</footer>

<?php if ( function_exists( 'yarpp_related' ) ) {
	yarpp_related();
}