<?php
/**
 * The template for displaying all pages.
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages and that other
 * 'pages' on your WordPress site will use a different template.
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

		if ( ! empty( $post->post_content ) ) : ?>
			<div class="content  content--page">
				<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
					<section class="page__content  js-post-gallery  cf">
						<?php the_content(); ?>
					</section>
					<?php
					global $numpages;
					if ( $numpages > 1 ) { ?>
					<div class="post-pagination">
						<h3 class="post-pagination__title"><?php _e('Pages:', 'mies_txtd') ?></h3>
						<?php
						$args = array(
							'before'           => '<ul class="menu  menu--inline  pagination--single">',
							'after'            => '</ul>',
							'next_or_number'   => 'number',
							'previouspagelink' => __( '&laquo;', 'mies_txtd' ),
							'nextpagelink'     => __( '&raquo;', 'mies_txtd' )
						);
						wp_link_pages( $args ); ?>
					</div>
					<?php } ?>
				</article>

			</div><!-- .content.content--page -->
		<?php endif; // if ( ! empty( $post->post_content ) )

		get_template_part( 'templates/subpages' );

		// If comments are open or we have at least one comment, load up the comment template
		// This only happens for the top-level pages
		if ( comments_open() || '0' != get_comments_number() ): ?>
			<div class="content  content--page">
				<?php comments_template(); ?>
			</div><!-- content  content--page -->
		<?php endif;

		if ( ! ( wpgrade::option( 'project_menu_share_label' ) == '' ) && get_post_meta( get_the_ID(), wpgrade::prefix() . 'page_enabled_social_share', true ) ) { ?>
			<div class="addthis_toolbox addthis_default_style addthis_32x32_style"
			     addthis:url="<?php echo esc_attr( wpgrade_get_current_canonical_url() ) ?>"
			     addthis:title="<?php wp_title( '|', true, 'right' ) ?>"
			     addthis:description="<?php echo esc_attr( trim( strip_tags( get_the_excerpt() ) ) ) ?>">
			<?php get_template_part( 'templates/core/addthis-social-popup' ); ?>
			</div>
		<?php }

	endwhile;

} // close if password protection

get_footer();
