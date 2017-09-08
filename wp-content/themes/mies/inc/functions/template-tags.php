<?php
/**
 * Template tags provided by the theme
 *
 * @package Mies
 * @since   Mies 1.0
 */

/**
 * @param null $id
 * @param bool $slide
 */
function mies_the_hero_image( $id = null, $slide = false, $ignore_video = false ) {
	//if we have no ID then use the post thumbnail, if present
	if ( empty( $id ) ) {
		$id = get_post_thumbnail_id( get_the_ID() );
	}

	//do nothing if we have no ID
	if ( empty( $id ) ) {
		return;
	}

	$attachment        = get_post( $id );
	$attachment_fields = get_post_custom( $id );
	$image_meta = get_post_meta( $id, '_wp_attachment_metadata', true );
	$image_full_size   = wp_get_attachment_image_src( $id, 'full-size' );

	$markup = '';

	// this image will be used in a slideshow so no need for responsive images
	if ( $slide ) {
		$markup .= '<div class="rsContent">'; //open the wrapper

		//prepare the attachment fields
		if ( ! isset( $attachment_fields['_wp_attachment_image_alt'] ) ) {
			$attachment_fields['_wp_attachment_image_alt'] = array( '' );
		} else {
			$attachment_fields['_wp_attachment_image_alt'][0] = trim( strip_tags( $attachment_fields['_wp_attachment_image_alt'][0] ) );
		}
		if ( ! isset( $attachment_fields['_video_autoplay'][0] ) ) {
			$attachment_fields['_video_autoplay'] = array( '' );
		}

		// prepare the video url if there is one
		$video_url = ( isset( $attachment_fields['_custom_video_url'][0] ) && ! empty( $attachment_fields['_custom_video_url'][0] ) ) ? esc_url( $attachment_fields['_custom_video_url'][0] ) : '';

		if ( ! $ignore_video && ! empty( $video_url ) ) {

			// should the video auto play?
			$video_autoplay = ( $attachment_fields['_video_autoplay'][0] === 'on' ) ? 'on' : '';

			$markup .= '<div class="' . ( ! empty( $video_url ) ? ' video' : '' ) . ( $video_autoplay == 'on' ? ' video_autoplay' : '' ) . '" itemscope itemtype="http://schema.org/ImageObject" ' . ( ! empty( $video_autoplay ) ? 'data-video_autoplay="' . esc_attr( $video_autoplay ) . '"' : '' ) . '>' . PHP_EOL;

			//the responsive image
			$image_markup = '<img src="' . esc_url( $image_full_size[0] ) . '" class="rsImg" alt="' . esc_attr( $attachment_fields['_wp_attachment_image_alt'][0] ) . '" itemprop="contentURL" ' . ( ! empty( $video_url ) ? ' data-rsVideo="' . esc_attr( $video_url ) . '"' : '' ) . ' data-caption="' . htmlspecialchars( $attachment->post_excerpt ) . '" data-description="' . htmlspecialchars( $attachment->post_content ) . '" />';
			$markup .= wp_image_add_srcset_and_sizes( $image_markup, $image_meta, $id ) . PHP_EOL;

			$markup .= '</div>';

		} else { // just a simple image, no video

			//the responsive image
			$image_markup = '<img class="rsImg" src="' . esc_url( $image_full_size[0] ) . '" alt="' . esc_attr( $attachment_fields['_wp_attachment_image_alt'][0] ) . '" data-caption="' . htmlspecialchars( $attachment->post_excerpt ) . '" data-description="' . htmlspecialchars( $attachment->post_content ) . '" />';
			$markup .= wp_image_add_srcset_and_sizes( $image_markup, $image_meta, $id ) . PHP_EOL;

		}

		if ( $attachment->post_excerpt ) {
			$markup .= '<div class="hero__caption">' . $attachment->post_excerpt . '</div>';
		}

		$markup .= '</div>'; //close the wrapper

	} else {
		// Put in the video markup if present
		$attachment_fields = get_post_custom( $id );

		//prepare the attachment fields
		if ( ! isset( $attachment_fields['_video_autoplay'][0] ) ) {
			$attachment_fields['_video_autoplay'] = array( '' );
		}

		$has_video = false;

		// prepare the video url if there is one
		$video_url = ( isset( $attachment_fields['_custom_video_url'][0] ) && ! empty( $attachment_fields['_custom_video_url'][0] ) ) ? esc_url( $attachment_fields['_custom_video_url'][0] ) : '';

		if ( ! $ignore_video && ! empty( $video_url ) ) $has_video = true;

		// the responsive image
		$image_markup = '<img';
		if( $has_video ) $image_markup .= ' class="is--overridden-by-video"';
		$image_markup .= ' itemprop="image" src="' . esc_url( $image_full_size[0] ) . '" alt="' . esc_attr( mies::get_img_alt( $id ) ) . '" />';

		$markup .= wp_image_add_srcset_and_sizes( $image_markup, $image_meta, $id ) . PHP_EOL;

		// prepare the video url if there is one
		$video_url = ( isset( $attachment_fields['_custom_video_url'][0] ) && ! empty( $attachment_fields['_custom_video_url'][0] ) ) ? esc_url( $attachment_fields['_custom_video_url'][0] ) : '';

		if ( $has_video ) {
			// should the video auto play?
			$video_autoplay = ( $attachment_fields['_video_autoplay'][0] === 'on' ) ? 'on' : '';

			$markup .= '<div class="hero__overflow"><div class="video-iframe-holder ' . ( $video_autoplay == 'on' ? ' video_autoplay' : '' ) . '" itemscope itemtype="http://schema.org/ImageObject" data-url="' . esc_attr( $video_url ) . '" ' . ( ! empty( $video_autoplay ) ? 'data-video_autoplay="' . esc_attr( $video_autoplay ) . '"' : '' ) . '></div></div>' . PHP_EOL;
		}
	}

	echo $markup;
}

/**
 * @param null $id
 */
function mies_get_hero_images_ids( $id = null ) {
	//if we have no ID then use the current post ID
	if ( empty( $id ) ) {
		$id = get_the_ID();
	}

	//get the hero gallery image IDs - they should be comma separated attachment IDs
	$gallery_ids = get_post_meta( $id, wpgrade::prefix() . 'second_image', true );

	//a little bit of cleanup, just to be sure
	$gallery_ids = trim( $gallery_ids );
	$gallery_ids = str_replace( ' ', '', $gallery_ids );

	if ( empty( $gallery_ids ) ) {
		//bail because we have nothing
		return false;
	}

	//split the string by comma so we get only an array of attachment ids
	$gallery_ids = explode( ',', $gallery_ids );

	return $gallery_ids;
}

/**
 * @param null $id
 */
function mies_has_hero_thumbnail( $id = null ) {
	//if we have no ID then use the current post ID
	if ( empty( $id ) ) {
		$id = get_the_ID();
	}

	if ( mies_get_hero_images_ids( $id ) !== false ) {
		return true;
	}

	return false;
}

/**
 * @param null $id
 */
function mies_get_hero_thumbnail_id( $id = null ) {
	//if we have no ID then use the current post ID
	if ( empty( $id ) ) {
		$id = get_the_ID();
	}

	$hero_images_ids = mies_get_hero_images_ids( $id );

	if ( $hero_images_ids !== false ) {
		//it seems we have some images in the hero area - sweet
		//not let's take the first one and promote it to Thumbnail

		return $hero_images_ids[0];
	}

	return false;
}

/**
 * @param null $id
 */
function mies_has_thumbnail( $id = null ) {
	//if we have no ID then use the current post ID
	if ( empty( $id ) ) {
		$id = get_the_ID();
	}

	//if it has a featured image then we will use this one
	if ( has_post_thumbnail( $id ) ) {
		return true;
	}

	if ( mies_get_hero_images_ids( $id ) !== false ) {
		return true;
	}

	return false;
}

/**
 * @param null $id
 */
function mies_get_thumbnail_id( $id = null ) {
	//if we have no ID then use the current post ID
	if ( empty( $id ) ) {
		$id = get_the_ID();
	}

	//if it has a featured image then we will use this one
	if ( has_post_thumbnail( $id ) ) {
		return get_post_thumbnail_id( $id );
	}

	$hero_images_ids = mies_get_hero_images_ids( $id );

	if ( $hero_images_ids !== false ) {
		//it seems we have some images in the hero area - sweet
		//not let's take the first one and promote it to Thumbnail

		return $hero_images_ids[0];
	}

	return false;
}

function mies_the_header_down_arrow( $page_section_idx, $header_height ) {

	if ( $page_section_idx !== 1 || $header_height !== 'full-height' ) {
		return;
	}

	get_template_part( 'assets/images/arrow-down-svg' );

}

function mies_get_hero_categories( $id = null ) {
	//if we have no ID then use the current post ID
	if ( empty( $id ) ) {
		$id = get_the_ID();
	}

	$markup = '';

	$categories = get_the_terms( $id, wpgrade::shortname() . '_portfolio_categories' );
	if ( ! is_wp_error( $categories ) && ! empty( $categories ) ) {
		$markup .= '<span class="meta-list  meta-list--categories">' . PHP_EOL;
		foreach ( $categories as $category ) {
			$markup .= '<a class="meta-list__item" href="' . esc_url( get_term_link( $category->slug, $category->taxonomy ) ) . '" title="' . esc_attr( sprintf( __( "View all projects in %s", wpgrade::textdomain() ), $category->name ) ) . '" rel="tag">' . $category->name . '</a>' . PHP_EOL;
		};
		$markup .= '</span>' . PHP_EOL;
	}

	return $markup;
}

// Return the slug of the page with the page-templates/portfolio-archive.php template or the post type archive if no page was found
function  mies_get_archive_page_link( $post_type = null ) {
	//if there is no post type use the one of the current post
	if ( empty( $post_type ) ) {
		$post_type = get_post_type();
	}

	if ( empty( $post_type ) ) { //bail if no post type
		return false;
	}

	if ( $post_type == wpgrade::$shortname . '_portfolio' ) {
		return mies_get_portfolio_page_link();
	} elseif ( $post_type == 'post' ) {
		return mies_get_blog_page_link();
	}

	//fallback to the archive slug
	return get_post_type_archive_link( $post_type );

}

// Return the slug of the page with the page-templates/portfolio-archive.php template or the post type archive if no page was found
function  mies_get_portfolio_page_link() {

	$pages = get_pages(
		array(
			'sort_order'  => 'DESC',
			'sort_column' => 'ID',
			'meta_key'    => '_wp_page_template',
			'meta_value'  => 'page-templates/portfolio-archive.php',
			'parent'      => -1,
			'suppress_filters' => false, //allow filters - like WPML
		)
	);

	if ( count( $pages ) ) {
		$page_id = wpgrade::lang_page_id( $pages[0]->ID );

		return get_page_link( $page_id );
	}

	//fallback to the archive slug
	return get_post_type_archive_link( wpgrade::shortname() . '_portfolio' );
}

// Return the slug of the page with the page-templates/blog-archive.php template or the post type archive if no page was found
function  mies_get_blog_page_link() {

	$pages = get_pages(
		array(
			'sort_order'  => 'DESC',
			'sort_column' => 'ID',
			'meta_key'    => '_wp_page_template',
			'meta_value'  => 'page-templates/blog-archive.php',
			'parent'      => 0,
			'suppress_filters' => false, //allow filters - like WPML
		)
	);

	if ( count( $pages ) ) {
		$page_id = wpgrade::lang_page_id( $pages[0]->ID );

		return get_page_link( $page_id );
	}

	//fallback to the archive slug
	return get_post_type_archive_link( 'post' );
}

// Given a post type we will return all the top level posts ids
function mies_get_post_type_toplevel_ids( $post_type, $order ) {
	$args            = array(
		'post_parent'    => 0, //all top level posts have a parent of id 0
		'post_type'      => $post_type,
		'posts_per_page' => - 1,
		'post_status'    => 'publish',
		'orderby'        => $order,
		'suppress_filters' => false, //allow filters - like WPML

	);
	$top_level_posts = get_children( $args, ARRAY_A );

	$posts_ids = array();
	foreach ( $top_level_posts as $id => $post ) {
		$posts_ids[] = wpgrade::lang_post_id( $id );
	}

	return $posts_ids;
}

function mies_get_prev_post( $post_type = null ) {
	//if there is no post type use the one of the current post
	if ( empty( $post_type ) ) {
		$post_type = get_post_type();
	}

	if ( empty( $post_type ) ) { //bail if no post type
		return false;
	}

	//get an ordered array of all the top level project ids ordered
	$posts_ids = mies_get_post_type_toplevel_ids( $post_type, array( 'menu_order' => 'ASC', 'date' => 'ASC' ) );

	//now we need to get the post in front of the current one
	$current_post_id = wpgrade::lang_post_id( get_the_ID() );

	//find it and get the location key
	$location = array_search( $current_post_id, $posts_ids );

	if ( false === $location ) { //not found == bail
		return false;
	}

	if ( 0 == $location ) { //it's the first, poor him
		// if it is the first post in the array then we return the last one so we can go round and round
		return end( $posts_ids );
	}

	return $posts_ids[ $location - 1 ];
}

function mies_get_next_post( $post_type = null ) {
	//if there is no post type use the one of the current post
	if ( empty( $post_type ) ) {
		$post_type = get_post_type();
	}

	if ( empty( $post_type ) ) { //bail if no post type
		return false;
	}

	//get an ordered array of all the top level project ids ordered
	$posts_ids = mies_get_post_type_toplevel_ids( $post_type, array( 'menu_order' => 'ASC', 'date' => 'ASC' ) );

	//now we need to get the post in front of the current one
	$current_post_id = wpgrade::lang_post_id( get_the_ID() );

	//find it and get the location key
	$location = array_search( $current_post_id, $posts_ids );

	if ( false === $location ) { //not found == bail
		return false;
	}

	if ( count( $posts_ids ) - 1 == $location ) { //it's the last one, poor him
		// if it is the last post in the array then we return the first one so we can go round and round
		return $posts_ids[0];
	}

	return $posts_ids[ $location + 1 ];
}

function mies_get_thumbnail_caption( $thumbnail_id ) {
	$thumbnail_image = get_posts( array( 'p' => $thumbnail_id, 'post_type' => 'attachment' ) );

	if ( $thumbnail_image && isset( $thumbnail_image[0] ) ) {
		return $thumbnail_image[0]->post_excerpt;
	}

	return '';
}