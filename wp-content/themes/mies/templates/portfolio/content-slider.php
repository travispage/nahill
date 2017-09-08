<?php
/**
 * The template for displaying each project in the portfolio archive.
 *
 * @package Mies
 * @since   Mies 1.0
 */

global $post;

$subtitle = get_post_meta( wpgrade::lang_post_id( get_the_ID() ), wpgrade::prefix() . 'header_cover_subtitle', true );
//we need to mess with the subtitle a little bit - because it deserves it
if ( ! empty( $subtitle ) ) {
	$subtitle   = esc_html( $subtitle );
} else {
	// When we have no subtitle for a project then we will display the categories instead, comma separated
	// This only happens for the top-level project, in case we have subprojects
	$subtitle = mies_get_hero_categories( wpgrade::lang_post_id( get_the_ID() ) );
}

$title = get_post_meta( wpgrade::lang_post_id( get_the_ID() ), wpgrade::prefix() . 'header_cover_title', true );
if ( empty( $title ) ) {
	//use the page title if empty
	$title = get_the_title();
}

$description = get_post_meta( wpgrade::lang_post_id( get_the_ID() ), wpgrade::prefix() . 'header_cover_description', true );
//filter the content with some limitations to avoid having plugins doing nasty things to it
$description = wpgrade::filter_content( $description, 'default' );

$hero_images_ids = mies_get_hero_images_ids( wpgrade::lang_post_id( get_the_ID() ) );

$hero_content_style = get_post_meta( wpgrade::lang_post_id( get_the_ID() ), wpgrade::prefix() . 'header_content_style', true );
if ( empty($hero_content_style) ) {
	$hero_content_style = 'hero--light';
}

if ( empty($hero_images_ids) ) {
	$hero_content_style = 'hero--light has-no-image';
}

if ( ( ! empty( $subtitle ) && $subtitle !== ' ' ) || ( ! empty( $title ) && $title !== ' ' ) || ! empty( $description ) || ! empty( $hero_images_ids ) ) { ?>

	<div class="rsContent  table">

		<div class="hero__content <?php echo $hero_content_style; ?>">

			<div class="hero__content-wrap  content  align-center">

				<?php

				if ( ! empty( $subtitle ) && $subtitle !== ' ' ) {
					echo '<h4 class="hero__subtitle">' . $subtitle . '</h4><br />' . PHP_EOL;
				}
				if ( ! empty( $title ) && $title !== ' ' ) {
					echo '<h1 class="hero__title  large">' . $title . '</h1>';
				}
				if ( ! empty( $description ) ) {
					echo '<div class="hero__description">' . $description . '</div>' . PHP_EOL;
				}

				if ( 'page' !== get_post_type() ) { ?>

					<div class="hero__btn">
						<a href="<?php the_permalink(); ?>" class="btn"><?php _e( 'View Project', wpgrade::textdomain() ); ?></a>
					</div>

				<?php } ?>

			</div>

		</div><!-- .hero__content -->

		<div class="hero__bg">
			<?php if ( ! empty( $hero_images_ids ) ) {
				mies_the_hero_image( $hero_images_ids[0] );
			} ?>
		</div>

		<?php if ( mies_has_hero_thumbnail() && mies_get_thumbnail_caption( $hero_images_ids[0] ) && !$do_slider ){ ?>
			<div class="hero__caption"><?php echo mies_get_thumbnail_caption( $hero_images_ids[0] ) ?></div>
		<?php } ?>

	</div>

<?php }