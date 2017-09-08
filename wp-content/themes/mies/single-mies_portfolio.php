<?php
/**
 * The template for the single project view.
 *
 * @package Mies
 * @since   Mies 1.0
 */

get_header();

global $post, $wpgrade_private_post, $page_section_idx, $header_height;

//some global variables that we use in our page sections
$page_section_idx = 0;

if ( have_posts() ) : the_post();

	if ( post_password_required() && ! $wpgrade_private_post['allowed'] ) {

		get_template_part( 'templates/password-request-form' );

	} else { // no password protection

		get_template_part( 'templates/hero' ); //let there be heroes

		if ( function_exists( 'display_pixfields' ) && ! has_shortcode( get_the_content(), 'pixfields' ) ) {
			display_pixfields();
		}

		if ( get_the_content() ): ?>
			<div class="content">
				<?php the_content(); ?>
			</div><!-- .content.content--portfolio -->
		<?php endif;
	}

	get_template_part( 'templates/subprojects' );

	if ( ! ( wpgrade::option( 'project_menu_share_label' ) == '' ) ) : ?>
		<div class="addthis_toolbox addthis_default_style addthis_32x32_style"
		     addthis:url="<?php echo esc_attr( wpgrade_get_current_canonical_url() ) ?>"
		     addthis:title="<?php wp_title( '|', true, 'right' ) ?>"
		     addthis:description="<?php echo esc_attr( trim( strip_tags( get_the_excerpt() ) ) ) ?>">
			<?php get_template_part( 'templates/core/addthis-social-popup' ); ?>
		</div>
	<?php endif; ?>

<?php else :
	get_template_part( 'no-results' );
endif;

get_footer();