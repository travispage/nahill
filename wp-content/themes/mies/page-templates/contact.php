<?php
/**
 * Template Name: Google Map Hero
 * This is the template that is used for the contact page/section
 * It is a page with additional controls for the Google Maps section
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

		$classes = "article--page  article--main";

		if ( ! empty( $post->post_content ) ) :?>
			<div class="content  content--page">
				<article id="post-<?php the_ID(); ?>" <?php post_class( esc_attr( $classes ) ); ?>>
					<section class="page__content  js-post-gallery  cf">
						<?php the_content(); ?>
					</section>
				</article>
			</div><!-- .content.content--page -->
		<?php
		endif;

		get_template_part( 'templates/subpages' );

		if ( get_post_meta( get_the_ID(), wpgrade::prefix() . 'gmap_enabled_social_share', true ) ) { ?>
			<div class="addthis_toolbox addthis_default_style addthis_32x32_style"
			     addthis:url="<?php echo esc_attr( wpgrade_get_current_canonical_url() ) ?>"
			     addthis:title="<?php wp_title( '|', true, 'right' ) ?>"
			     addthis:description="<?php echo esc_attr( trim( strip_tags( get_the_excerpt() ) ) ) ?>">
			<?php get_template_part( 'templates/core/addthis-social-popup' ); ?>
			</div>
		<?php } ?>

	<?php endwhile;
}

get_footer();
