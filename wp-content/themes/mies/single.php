<?php
/**
 * The Template for displaying all single posts.
 *
 * @package Mies
 * @since   Mies 1.0
 */

get_header();

global $wpgrade_private_post;

if ( post_password_required() && ! $wpgrade_private_post['allowed'] ) {
	// password protection
	get_template_part( 'templates/password-request-form' );

} else {
//	$has_sidebar = false;
//	if ( wpgrade::option( 'blog_single_show_sidebar' ) ) {
//		$has_sidebar = true;
//	}

	//post thumb specific
	$has_thumb = has_post_thumbnail();

	$post_class_thumb = 'has-thumbnail';
	if ( ! $has_thumb ) {
		$post_class_thumb = 'no-thumbnail';
	}

	if ( have_posts() ) : the_post(); ?>
		<div class="content  content--single  content--single-post">
			<article <?php post_class( 'article-single  single-post ' . $post_class_thumb ) ?>>
				<?php get_template_part( 'templates/post/single-content/header' ); ?>
				<?php if ( is_active_sidebar( 'sidebar-single-post' ) && wpgrade::option( 'blog_single_show_sidebar' ) ) {
					echo '<div class="post-sidebar-wrapper">';
					echo '<div class="sidebar-helper">';
					echo '<div class="post-content-wrapper">';
				} ?>
				<section class="entry-content  js-post-gallery">
					<?php
					the_content();
					global $numpages;
					if ( $numpages > 1 ): ?>
						<div class="post-pagination">
							<h3 class="post-pagination__title"><?php _e( 'Pages:', 'mies_txtd' ) ?></h3>
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
					<?php endif; ?>
				</section><!-- .entry-content.js-post-gallery -->
				<?php get_template_part( 'templates/post/single-content/footer' ); ?>
				<?php
				// If comments are open or we have at least one comment, load up the comment template
				if ( comments_open() || '0' != get_comments_number() ) {
					comments_template();
				} ?>
				<?php
				if ( is_active_sidebar( 'sidebar-single-post' ) && wpgrade::option( 'blog_single_show_sidebar' ) ) {
					echo '</div><!--post-content-wrapper-->';
					echo '</div><!-- sidebar-helper -->';
					get_template_part( 'sidebar' );
					echo '<div><!-- post-sidebar-wrapper -->';
				}
				?>
			</article>
		</div><!-- .content.content--single.content--single-post -->
	<?php
	endif; // end the post

	if ( ! ( wpgrade::option( 'project_menu_share_label' ) == '' ) ) : ?>
		<div class="addthis_toolbox addthis_default_style addthis_32x32_style"
		     addthis:url="<?php echo esc_attr( wpgrade_get_current_canonical_url() ) ?>"
		     addthis:title="<?php wp_title( '|', true, 'right' ) ?>"
		     addthis:description="<?php echo esc_attr( trim( strip_tags( get_the_excerpt() ) ) ) ?>">
			<?php get_template_part( 'templates/core/addthis-social-popup' ); ?>
		</div>
	<?php endif;

}
get_footer();
