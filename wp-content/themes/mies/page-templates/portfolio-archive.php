<?php
/**
 * Template Name: Portfolio Archive
 *
 * @package Mies
 * @since   Mies 1.0
 */

get_header();

global $post, $wpgrade_private_post, $page_section_idx, $header_height;

//some global variables that we use in our page sections
//set them just to be sure they are defined
$page_section_idx = 0;

if ( post_password_required() && ! $wpgrade_private_post['allowed'] ) {
	// password protection
	get_template_part( 'templates/password-request-form' );

} else {

	while ( have_posts() ) : the_post();

		get_template_part( 'templates/hero' );

		get_template_part( 'templates/page/portfolio-archive-content' );

		get_template_part( 'templates/subpages' );

		if ( get_post_meta( get_the_ID(), wpgrade::prefix() . 'page_enabled_social_share', true ) ) {
			get_template_part( 'templates/core/addthis-social-popup' );
		}

	endwhile;

} // close if password protection

get_footer();