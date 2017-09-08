<?php
/**
 * Template to display the article in archives in a masonry layout
 *
 * @package Mies
 * @since   Mies 1.0
 */

//post thumb specific
$has_thumb = has_post_thumbnail();

$post_class_thumb = 'has-thumbnail';
if ( ! $has_thumb ) {
	$post_class_thumb = 'no-thumbnail';
} ?>

<article <?php post_class( ' grid__item  masonry__item ' . $post_class_thumb ); ?>>
	<div class="article__body">
		<?php get_template_part( 'templates/post/loop-content/header-masonry' ); ?>
		<div class="entry-content">
			<?php echo wpgrade_better_excerpt(); ?>
		</div>
		<?php
		$read_more = wpgrade::option( 'blog_read_more_text' );
		if ( ! empty( $read_more ) ) : ?>
		<footer class="entry-meta">
			<a class="read-more" href="<?php esc_url( the_permalink() ) ?>"><?php echo $read_more; ?></a>
		</footer><!-- .entry-meta -->
		<?php endif; ?>
	</div><!-- .article__body -->
</article>