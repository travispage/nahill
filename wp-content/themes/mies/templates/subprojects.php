<?php
/**
 * The template for displaying the sub-projects.
 *
 * @package Mies
 * @since   Mies 1.0
 */

global $post, $wpgrade_private_post;

//test if the current project has child projects
if ( mies::has_children() ) {
	//get only the next level pages
	$args = array(
		'hierarchical' => 0,
		'child_of'     => wpgrade::lang_post_id( $post->ID ),
		'parent'       => wpgrade::lang_post_id( $post->ID ),
		'sort_column'  => 'menu_order, ID',
		'post_type'    => wpgrade::$shortname . '_portfolio'
	);

	$projects = get_pages( $args );

	foreach ( $projects as $post ) : setup_postdata( $post );

		if ( post_password_required() && ! $wpgrade_private_post['allowed'] ) {
			// password protection
			get_template_part( 'templates/password-request-form' );

		} else {

			get_template_part( 'templates/hero' ); //let there be heroes

			if ( get_the_content() ): ?>
				<div class="content  content--portfolio">
					<?php the_content(); ?>
				</div><!-- .content.content--portfolio -->
			<?php endif;

		} // close if password protection

	endforeach;

	//reset to the main page
	wp_reset_postdata();
}