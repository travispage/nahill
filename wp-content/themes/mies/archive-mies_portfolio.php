<?php
/**
 * The default portfolio archive template
 *
 * @package Mies
 * @since   Mies 1.2.1
 */

get_header(); ?>

<header id="post-<?php the_ID() ?>-title" class="hero  content">
	<h1 class="archive__title  hero__title"><?php _e( 'Portfolio', 'mies_txtd' ) ?></h1>
</header>

<?php get_template_part( 'templates/page/portfolio-archive-content' ); ?>

<?php get_footer(); ?>