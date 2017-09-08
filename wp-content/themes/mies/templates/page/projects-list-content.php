<?php

$header_height = get_post_meta( wpgrade::lang_post_id( get_the_ID() ), wpgrade::prefix() . 'header_height', true );
if ( empty($header_height) ) {
	$header_height = 'full-height'; // the default
}

// you may need the page layout first
$layout = get_post_meta( get_the_ID(), 'projects_layout', true );

// lets make sure we have the paging right
global $paged;

$paged = 1;
if ( get_query_var( 'paged' ) ) {
	$paged = get_query_var( 'paged' );
}

if ( get_query_var( 'page' ) ) {
	$paged = get_query_var( 'page' );
}

$source = get_post_meta( get_the_ID(), 'projects_source', true );
$view_more_link_label = get_post_meta( get_the_ID(), 'view_more_link_label', true );
$number_of_projects = intval( get_post_meta( get_the_ID(), 'number_of_projects', true ) );

//set the query args
$args = array(
	'post_type'      => wpgrade::shortname() . '_portfolio',
	'paged'          => $paged,
	'posts_per_page' => '-1',
	'post_parent__in' => array( 0 ),
	'orderby'        => array( 'menu_order' => 'ASC', 'date' => 'DESC' ),
);

if ( $source == 'category' ) {

	$projects_category = get_post_meta( get_the_ID(), 'selected_portfolio_category', true );

	if ( ! empty( $projects_category ) ) {
		$args['tax_query'] = array(
			array(
				'taxonomy' => wpgrade::shortname() . '_portfolio_categories',
				'field'    => 'slug',
				'terms'    => $projects_category,
			),
		);
	}

} elseif ( $source == 'selected' ) {
	$selected_ids = get_post_meta( get_the_ID(), 'selected_projects', true );

	// ensure that we have what to explode
	if ( ! empty( $selected_ids ) ) {
		$args['post__in'] = explode(',', $selected_ids );

		//keep the order
		$args['orderby'] = 'post__in';

		unset( $args['post_parent__in'] );
	}

}

if ( ! empty( $number_of_projects ) && $source !== 'selected' ) {
	$args['posts_per_page'] = $number_of_projects;
}

// Fire up The Query
$the_query = new WP_Query( $args );

if ('slider' == $layout) { ?>

	<div class="hero  <?php echo $header_height; ?>  projects  projects--slider">

		<div class="hero__bg  js-hero-bg  hero--slider-container  js-projects-slider">
		<?php
		$slider_autoplay = get_post_meta( wpgrade::lang_post_id( get_the_ID() ), wpgrade::prefix() . 'hero_slider_autoplay', true );
		if ( $slider_autoplay ) {
			$slider_delay = get_post_meta( wpgrade::lang_post_id( get_the_ID() ), wpgrade::prefix() . 'hero_slider_delay', true );
		}
		?>
			<div class="hero__slider  js-pixslider" data-slidertransition="fade" data-arrows data-bullets
			<?php
			if ( $slider_autoplay ) {
				echo 'data-sliderautoplay="" ' . PHP_EOL;
				echo 'data-sliderdelay="' . esc_attr( $slider_delay ) . '" ' . PHP_EOL;
			} ?>
			>

				<?php get_template_part( 'templates/portfolio/content-slider' ); ?>

				<?php while ( $the_query->have_posts() ) : $the_query->the_post();
					get_template_part( 'templates/portfolio/content-slider' );
				endwhile; ?>

			</div><!-- .hero-slider -->

		</div>

	</div>

	<?php
	wp_reset_postdata();

	if ( get_the_content() ) { ?>
		<div class="content">
			<?php the_content(); ?>
		</div>
	<?php }

} else { ?>

	<div class="content  content--portfolio-archive">

		<?php
		the_content();
		if ( $the_query->have_posts() ): ?>

			<div class="projects  projects--grid  masonry">
				<?php while ( $the_query->have_posts() ) : $the_query->the_post(); ?>
					<?php get_template_part( 'templates/portfolio/content-portfolio' ); ?>
				<?php endwhile; ?>
			</div>

			<div class="align-center">
				<a class="btn" href="<?php echo esc_url( mies_get_portfolio_page_link() ) ?>"><?php echo $view_more_link_label; ?></a>
			</div>

		<?php endif; ?>

	</div><!-- .content -->

<?php } ?>

<?php
/* Restore original Post Data */
wp_reset_postdata();

