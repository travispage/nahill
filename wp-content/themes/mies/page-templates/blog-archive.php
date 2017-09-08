<?php
/**
 * Template Name: Blog Archive
 * The template for displaying the blog posts archive
 *
 * @package Mies
 * @since   Mies 1.0
 */

get_header();

global $post, $wpgrade_private_post, $page_section_idx, $header_height;

//some global variables that we use in our page sections
$page_section_idx       = 0;

if ( post_password_required() && ! $wpgrade_private_post['allowed'] ) {
	// password protection
	get_template_part( 'templates/password-request-form' );

} else {

	while ( have_posts() ) : the_post();

		get_template_part( 'templates/hero' );

		global $paged;
		global $wp_query;
		$paged = 1;
		if ( get_query_var('paged') ) $paged = get_query_var('paged');
		if ( get_query_var('page') ) $paged = get_query_var('page');
		query_posts( array('post_type' => 'post', 'paged'=>$paged));

		$blog_style = wpgrade::option( 'blog_layout', 'masonry' );

		get_template_part( 'templates/post/loop/' . $blog_style );

		wp_reset_query();

		if ( get_post_meta( get_the_ID(), wpgrade::prefix() . 'page_enabled_social_share', true ) ){
			get_template_part( 'templates/core/addthis-social-popup' );
		}

	endwhile;

	get_template_part( 'templates/subpages' );

} // close if password protection

get_footer();
