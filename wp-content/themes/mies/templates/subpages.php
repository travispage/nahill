<?php
/**
 * The template for displaying the subpages.
 *
 * @package Mies
 * @since   Mies 1.0
 */

global $post, $wpgrade_private_post;

//test if the current page has child pages
if ( mies::has_children() ) {
	//get only the next level pages
	$args = array(
		'hierarchical' => 0,
		'child_of'     => wpgrade::lang_post_id( $post->ID ),
		'parent'       => wpgrade::lang_post_id( $post->ID ),
		'sort_column'  => 'menu_order, ID',
	);

	$pages = get_pages( $args );

	foreach ( $pages as $post ) : setup_postdata( $post );

		if ( post_password_required() && ! $wpgrade_private_post['allowed'] ) {

			// password protection
			get_template_part( 'templates/password-request-form' );

			continue;
		}

		// old way -> $page_template = get_post_meta( wpgrade::lang_post_id( $post->ID ), '_wp_page_template', true );
		// if WPML is active we don't need to translate the page template meta, the original one is good enough
		$page_template = get_post_meta( wpgrade::lang_original_post_id( $post->ID ), '_wp_page_template', true );

		if ( $page_template === 'default' || $page_template === 'page-templates/contact.php' ) {

			get_template_part( 'templates/hero' );

			if ( ! empty( $post->post_content ) ) { ?>
				<div class="content  content--page">
					<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
						<section class="article__content">
							<section class="page__content  js-post-gallery  cf">
								<?php the_content(); ?>
							</section>
							<?php
							global $numpages;
							if ( $numpages > 1 ) { ?>
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
							<?php } ?>
						</section>
					</article>
				</div><!-- .content.content--page -->
			<?php
			}
		} elseif ( $page_template === 'page-templates/blog-archive.php' ) { ?>

			<div class="content content--page">
				<div class="archive-blog  masonry">
					<?php
					global $paged;

					if ( get_query_var('paged') ) $paged = get_query_var('paged');
					if ( get_query_var('page') ) $paged = get_query_var('page');

					$args = array(
						'post_type' => 'post',
						'paged' => 	$paged
					);

					$new_query = new WP_Query( $args );

					if ( $new_query->have_posts() ):
						while ( $new_query->have_posts() ) : $new_query->the_post();
							get_template_part( 'templates/post/loop-content/masonry' );
						endwhile;
					else:
						get_template_part( 'no-results' );
					endif; // end if have_posts()?>
				</div>
				<?php //echo wpgrade::pagination(); ?>
			</div>

		<?php
		} else {

			$page_template = str_replace( '.php', '', $page_template );
			$page_template = str_replace( 'page-templates/', '', $page_template );
			$location      = 'templates/page/' . $page_template . '-content';
			get_template_part( $location );

		}

	endforeach;

	//reset to the main page
	wp_reset_postdata();
}