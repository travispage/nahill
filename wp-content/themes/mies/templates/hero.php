<?php
/**
 * This template handles the hero/headers with image and cover text
 * for both pages and projects
 *
 * @package Mies
 * @since   Mies 1.0
 */

global $page_section_idx, $header_height;

//increment the page section number
$page_section_idx++;

//header general classes
$classes = "hero";

//first lets get to know this page a little better
$header_height = get_post_meta( wpgrade::lang_post_id( get_the_ID() ), wpgrade::prefix() . 'header_height', true );
if ( empty($header_height) ) {
	$header_height = 'full-height'; // the default
}

$hero_content_style = get_post_meta( wpgrade::lang_post_id( get_the_ID() ), wpgrade::prefix() . 'header_content_style', true );
if ( empty($hero_content_style) ) {
	$hero_content_style = 'hero--light';
}

if ( mies_has_hero_thumbnail() ) {
	$classes .= ' ' . $header_height . ' ' . $hero_content_style;
} else {
	$classes .= ' hero--dark  auto-height';
}

/* FIRST TEST FOR CONTACT PAGE TEMPLATE */

//get the Google Maps URL to test if empty
$gmap_urls = get_post_meta( wpgrade::lang_post_id( get_the_ID() ), 'gmap_urls', true );

if ( is_page() && get_page_template_slug( wpgrade::lang_post_id( get_the_ID() ) ) == 'page-templates/contact.php' ) {

	// we really need $$gmap_urls to have a location_url
	if ( ! empty( $gmap_urls ) && isset( $gmap_urls[1]['location_url'] ) && ! empty( $gmap_urls[1]['location_url'] ) ) {
		// enqueue only on this page
		wp_enqueue_script('google-maps-api');

		$gmap_custom_style   = get_post_meta( wpgrade::lang_post_id( get_the_ID() ), wpgrade::prefix() . 'gmap_custom_style', true );
		$gmap_marker_content = get_post_meta( wpgrade::lang_post_id( get_the_ID() ), wpgrade::prefix() . 'gmap_marker_content', true );
		$gmap_height         = get_post_meta( wpgrade::lang_post_id( get_the_ID() ), wpgrade::prefix() . 'page_gmap_height', true );
		if ( empty( $gmap_height ) ) {
			$gmap_height = 'half-height'; //the default
		}
		$classes .= ' ' . $gmap_height;

		//handle the pins
		$pins = '{';
		$count = count( $gmap_urls );
		$comma = ',';
		foreach ( $gmap_urls as $order => $pin ) {
			if ( $count == $order ) {
				$comma = '';
			}
			$pins .= '"' . $pin['name'] . '":"' . $pin['location_url'] . '"' . $comma;
		}
		$pins .= '}';
		?>
		<header id="post-<?php the_ID() ?>-title" class="<?php echo esc_attr( $classes ) ?> hero--map">
			<div class="hero__bg js-hero-bg  hero__bg-map">
				<div class="gmap" id="gmap-<?php the_ID() ?>"
				<?php echo ( $gmap_custom_style == 'on' ) ? 'data-customstyle' : ''; ?>
				     data-pins='<?php echo esc_attr( $pins ) ?>'></div>
			</div>
			<div class="hero__overflow"></div>
		</header>
	<?php
	}
} else {
	/* NOW WE WORK ON THE REGULAR HEROES - SINGLE IMAGE OR SLIDESHOW */

	// GET the cover text

	$subtitle = get_post_meta( wpgrade::lang_post_id( get_the_ID() ), wpgrade::prefix() . 'header_cover_subtitle', true );
	//we need to mess with the subtitle a little bit - because it deserves it
	if ( ! empty( $subtitle ) ) {
		$subtitle   = esc_html( $subtitle );
	} elseif ( 1 == $page_section_idx && is_singular( wpgrade::shortname() . '_portfolio' ) ) {
		// When we have no subtitle for a project then we will display the categories instead, comma separated
		// This only happens for the top-level project, in case we have subprojects
		$subtitle = mies_get_hero_categories( wpgrade::lang_post_id( get_the_ID() ) );
	}

	$subtitle = trim( $subtitle );

	if ( is_archive() && !is_shop() && !is_product_category() || is_search() ) {
		$title = mies::the_archive_title() . '<br/>hiiiiiiii';
	} else {
		$title = get_post_meta( wpgrade::lang_post_id( get_the_ID() ), wpgrade::prefix() . 'header_cover_title', true );
		if ( empty( $title ) ) {
			//use the page title if empty
			$title = get_the_title();
		}
	}

	$description = get_post_meta( wpgrade::lang_post_id( get_the_ID() ), wpgrade::prefix() . 'header_cover_description', true );
	//filter the content with some limitations to avoid having plugins doing nasty things to it
	$description = wpgrade::filter_content( $description, 'default' );

	// IF we really need a header/hero
	if ( mies_has_hero_thumbnail() || ! empty( $subtitle ) || ( ! empty( $title ) && $title !== ' ' ) || ! empty( $description ) ) {
		if ( ! mies_has_hero_thumbnail() ) {
			$classes .= ' hero--no-image';
		}

		$do_slider = false; ?>

		<?php if ( mies_has_hero_thumbnail() ) { ?>
		<header id="post-<?php the_ID() ?>-title" class="<?php echo esc_attr( $classes ) ?>">
		<?php } else { ?>
		<header id="post-<?php the_ID() ?>-title" class="hero  content">
		<?php } ?>

			<?php if ( mies_has_hero_thumbnail() ) { // only go here if we have at least an image

				// First get the Hero images IDs
				$hero_images_ids = mies_get_hero_images_ids( wpgrade::lang_post_id( get_the_ID() ) );

				$do_slider = count( $hero_images_ids ) > 1; //we need to do a slider when having more than 1 image ?>

				<div class="hero__bg js-hero-bg <?php echo esc_attr( $do_slider ? 'hero--slider-container' . ' ' . $hero_content_style : '' ); ?>">

				<?php if ( $do_slider ) { //we have a slider on our hands

					//get to know the slider settings
					$image_scale_mode = get_post_meta( wpgrade::lang_post_id( get_the_ID() ), wpgrade::prefix() . 'hero_slider_image_scale_mode', true );
					if ( $image_scale_mode == '' ) { //default to fill
						$image_scale_mode = 'fill';
					}

					$slider_autoplay        = get_post_meta( wpgrade::lang_post_id( get_the_ID() ), wpgrade::prefix() . 'hero_slider_autoplay', true );

					if ( $slider_autoplay ) {
						$slider_delay = get_post_meta( wpgrade::lang_post_id( get_the_ID() ), wpgrade::prefix() . 'hero_slider_delay', true );
					}

					$data_scaling = ( $image_scale_mode == 'auto' ) ? 'data-autoheight' : 'data-imagealigncenter data-imagescale="' . esc_attr( $image_scale_mode ) . '"'; ?>

					<div class="hero__slider  js-pixslider"
						<?php echo $data_scaling . PHP_EOL; ?>
						 data-slidertransition="fade"
						 data-arrows
				         data-bullets
					<?php
						if ( $slider_autoplay ) {
							echo 'data-sliderautoplay="" ' . PHP_EOL;
							echo 'data-sliderdelay="' . esc_attr( $slider_delay ) . '" ' . PHP_EOL;
						}

						if ( wpgrade::option( 'slideshow_arrows_style' ) == 'hover' ) {
							echo ' data-hoverarrows ';
						}
					echo '>'; // finish the slider settings

					// now go through all the attachments and add them as slides
					foreach ( $hero_images_ids as $key => $attachment_id ) {

						mies_the_hero_image( $attachment_id, true );

					} ?>
				</div><!-- .hero-slider -->

				<?php } else { //only one image to play with

					mies_the_hero_image( $hero_images_ids[0] );

				} ?>

				</div><!-- .hero__bg js-hero-bg -->

			<?php
			}

			if ( ! empty( $subtitle ) || ( ! empty( $title ) && $title !== ' ' ) || ! empty( $description ) ) { ?>
				<?php if ( mies_has_hero_thumbnail() ) { ?><div class="hero__content"><div class="hero__content-wrap  content"><?php } ?>
					<?php if ( ! empty( $subtitle ) ) {
						echo '<h4 class="hero__subtitle">' . $subtitle . '</h4><br />' . PHP_EOL;
					}
					if ( ! empty( $title ) && $title !== ' ' ) {
						echo '<h1 class="hero__title">' . $title . '</h1>';
					}
					if ( ! empty( $description ) ) {
						echo '<div class="hero__description">' . $description . '</div>' . PHP_EOL;
					} ?>

					<?php if ( is_page() && get_page_template_slug( wpgrade::lang_post_id( get_the_ID() ) ) == 'page-templates/blog-archive.php' ) {
						get_template_part( 'templates/post/loop/categories' );
					}
				if ( mies_has_hero_thumbnail() ) { ?></div></div><!-- .hero__content --><?php } ?>
			<?php } ?>

			<?php if ( mies_has_hero_thumbnail() && mies_get_thumbnail_caption( $hero_images_ids[0] ) && !$do_slider ){ ?>
				<div class="hero__caption"><?php echo mies_get_thumbnail_caption( $hero_images_ids[0] ) ?></div>
			<?php } ?>

			<?php if ( mies_has_hero_thumbnail() && ! $do_slider ) {
				mies_the_header_down_arrow( $page_section_idx, $header_height );
			} ?>

		</header>
	<?php } else { // We need an empty header/hero ?>
		<header id="post-<?php the_ID() ?>-title" class="<?php echo esc_attr( $classes . ' hero--missing' ) ?>" style="display: none"></header>
	<?php }
} ?>