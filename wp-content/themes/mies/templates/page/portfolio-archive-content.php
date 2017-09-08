<div class="content  content--portfolio-archive">

	<?php
	// lets make sure we have the paging right
	global $paged;

	$paged = 1;
	if ( get_query_var( 'paged' ) ) {
		$paged = get_query_var( 'paged' );
	}
	if ( get_query_var( 'page' ) ) {
		$paged = get_query_var( 'page' );
	}

	//how many per page
	$projects_per_page = wpgrade::option('portfolio_projects_per_page');

	// set the query args
	$args = array(
		'post_type'      => wpgrade::shortname() . '_portfolio',
		'paged'          => $paged,
		'posts_per_page' => $projects_per_page,
		'post_parent__in' => array( 0 ),
		'orderby'        => array( 'menu_order' => 'ASC', 'date' => 'DESC' ),
	);

	$large_no               = wpgrade::option('projects_grid_large_columns');
	$medium_no              = wpgrade::option('projects_grid_medium_columns');
	$small_no               = wpgrade::option('projects_grid_small_columns');
	$projects_columns_class     = 'masonry-large-col-' . $large_no . ' masonry-medium-col-' . $medium_no . ' masonry-small-col-' . $small_no;

	// Fire up The Query
	$the_query = new WP_Query( $args );

	// The Loop
	if ( $the_query->have_posts() ):

		get_template_part('templates/portfolio/filter-box'); ?>

		<div class="projects  projects--grid  masonry infinite_scroll infinite_scroll_with_button  <?php echo esc_attr( $projects_columns_class ); ?>" data-maxpages="<?php echo esc_attr( $the_query->max_num_pages ) ?>"
			data-projects-per-page="<?php echo $projects_per_page; ?>" data-total-posts="<?php echo $the_query->found_posts; ?>">
			<?php while ( $the_query->have_posts() ): $the_query->the_post();

				get_template_part( 'templates/portfolio/content-portfolio' );

			endwhile; ?>
		</div><!-- .projects.projects--grid -->

		<div class="pagination  pagination--archive hidden">
			<?php echo wpgrade::pagination($the_query); ?>
		</div>

		<div class="load-more__container align-center">
			<a class="btn" href="#">
				<span class="regular-text"><?php _e( 'Load More', 'mies_txtd' ); ?></span>
				<span class="loading-text"><?php _e( 'Loading', 'mies_txtd' ); ?></span>
				<img class="loading-img" alt="loading..." src="<?php echo get_template_directory_uri() . '/assets/images/loader-puff.svg' ?>">
			</a>
		</div>
	<?php else:
		get_template_part( 'templates/no-results' );
	endif;

	/* Restore original Post Data */
	wp_reset_postdata(); ?>

</div><!-- .content -->