<?php
/**
 * The main template file.
 * This is the most generic template file in a WordPress theme and one of the
 * two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 * For example, it puts together the home page when no home.php file exists.
 * Learn more: http://codex.wordpress.org/Template_Hierarchy
 *
 * @package Mies
 * @since   Mies 1.0
 */

get_header();
?>

<header id="post-<?php the_ID() ?>-title" class="hero  content">
	<?php
		mies::the_archive_title();
		if( is_home() ) get_template_part( 'templates/post/loop/categories');
	?>
</header>
<?php $blog_style = wpgrade::option( 'blog_layout', 'masonry' );

get_template_part( 'templates/post/loop/' . $blog_style );

get_footer();