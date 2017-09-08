<?php
/**
 * The template for the single post header.
 *
 * @package Mies
 * @since   Mies 1.0
 */

//post format specific
$post_format = get_post_format();
if ( empty( $post_format ) || $post_format == 'standard' ) {
	$post_format = '';
}

$date = get_the_time( get_option( 'date_format' ) );

?>

<header class="entry-header">
	<div class="entry-meta">
		<?php if (wpgrade::option('blog_show_date')) : ?>
		<span class="entry-date">
			<a href="<?php esc_url( the_permalink() ) ?>"><time class="published" datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><?php echo $date ?></time></a>
		</span>
		<?php endif; ?>
		<span class="cat-links"><?php echo get_the_category_list( _x( ', ', 'Used between list items, there is a space after the comma.', 'mies_txtd' ) ) ?></span>
	</div><!-- entry-meta -->
	<?php get_template_part( 'templates/post/loop-content/featured-masonry/image' ); ?>
	<h3 class="entry-title"><a href="<?php esc_url( the_permalink() ) ?>" rel="bookmark"><?php the_title(); ?></a></h3>
</header><!-- entry-header -->