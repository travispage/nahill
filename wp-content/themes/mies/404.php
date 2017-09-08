<?php
/**
 * The template for displaying 404 pages (Not Found).
 *
 * @package Mies
 * @since   Mies 1.0
 */

get_header(); ?>

	<div class="hero  hero--light">
		<div class="hero__content">
			<div class="container">
				<h1 class="hero__title  large"><?php _e( 'Whoops!', 'mies_txtd' ); ?></h1><br/>

				<h3 class="hero__description"><?php _e( "The page you're looking for could have been deleted or never have existed", 'mies_txtd' ); ?></h3>
				<br/>
				<a class="btn btn--primary btn--beta btn--large" href="<?php echo esc_url( home_url() ); ?>" title="<?php esc_attr( bloginfo( 'name' ) ) ?>" rel="home">
					<?php _e( '&#8592; Return to the Home Page', 'mies_txtd' ); ?>
				</a>
			</div>
		</div><!-- .hero__content -->
	</div><!-- .hero -->

<?php get_footer();