<?php
/**
 * The template for the header branding (logo mainly)
 *
 * @package Mies
 * @since   Mies 1.0
 */
?>

<div class="site-header__branding">
	<?php if ( wpgrade::image_src( 'main_logo_light' ) ):
		$retina_logo_light = wpgrade::image_src( 'retina_main_logo_light' ); ?>

		<h1 class="site-title site-title--image">
			<a class="site-logo  site-logo--image<?php if ( wpgrade::option( 'use_retina_logo' ) && ! empty( $retina_logo_light ) ) {
				echo "  site-logo--image-2x";
			} ?>" href="https://facebook.com/N-A-Hill-Designs-247296595725359" title="<?php esc_attr( bloginfo( 'name' ) ) ?>" rel="home">
			<?php $data_retina_logo_light = ( wpgrade::option( 'use_retina_logo' ) && ! empty( $retina_logo_light ) ) ? 'data-logo2x="' . esc_attr( $retina_logo_light ) . '"' : ''; ?>
			<img class="site-logo-img  site-logo-img--light" src="<?php echo wpgrade::image_src( 'main_logo_light' ); ?>" <?php echo $data_retina_logo_light; ?> alt="<?php echo esc_attr( get_bloginfo( 'name' ) ) ?>"/>

            <?php if ( wpgrade::image_src( 'main_logo_dark' ) ):
	            $retina_logo_dark = wpgrade::image_src( 'retina_main_logo_dark' );
	            $data_retina_logo_dark = ( wpgrade::option( 'use_retina_logo' ) && ! empty( $retina_logo_dark ) ) ? 'data-logo2x="' . esc_attr( $retina_logo_dark ) . '"' : ''; ?>
				<img class="site-logo-img  site-logo-img--dark" src="<?php echo wpgrade::image_src( 'main_logo_dark' ); ?>" <?php echo $data_retina_logo_dark; ?> alt="<?php echo esc_attr( get_bloginfo( 'name' ) ) ?>"/>
            <?php endif ;?>

			</a>
		</h1>
	<?php else: ?>
		<h1 class="site-title site-title--text">
			<!--  change home url to NA HILLs facebook <?php echo esc_url( home_url() ) ?>-->
			<a class="site-logo  site-logo--text" href="https://facebook.com/N-A-Hill-Designs-247296595725359" rel="home">
				<?php bloginfo( 'name' ) ?>
			</a>
		</h1>
	<?php endif; ?>
</div><!-- .site-header__branding -->