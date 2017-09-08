<?php
/**
 * Special features used by the theme
 *
 * @package Mies
 * @since   Mies 1.0
 */

/**
 * Invoked by wpgrade_callback_themesetup
 */
function wpgrade_callback_custom_theme_features() {

	/*
	 * Add editor custom style to make it look more like the frontend
	 */
	add_editor_style( array( 'editor-style.css' ) );
}

//use different image sizes depending on the number of columns
add_filter( 'shortcode_atts_gallery', 'wpgrade_overwrite_gallery_atts', 10, 3 );

function wpgrade_overwrite_gallery_atts( $out, $pairs, $atts ) {
	//if we need to make a slideshow then output full size images
	if ( isset( $atts['mkslideshow'] ) && $atts['mkslideshow'] == true ) {
		$out['size'] = 'full-size';
	} elseif ( isset( $atts['columns'] ) ) { //else image sizes depending on no. of columns
		switch ( $atts['columns'] ) {
			case '1':
				$out['size'] = 'large-size';
				break;
			case '2':
				$out['size'] = 'medium-size';
				break;
			case '3':
				$out['size'] = 'small-size-hard';
				break;
			case '4':
				$out['size'] = 'small-size-hard';
				break;
		}

	} else { //no number of columns defined - defaults to 3 columns - so set the appropriate image size

		$out['size'] = 'small-size-hard';
	}

	return $out;
}

/*
 * Add custom filter for gallery shortcode output
 */
add_filter( 'post_gallery', 'wpgrade_custom_post_gallery', 10, 2 );

function wpgrade_custom_post_gallery( $output, $attr ) {
	global $post, $wp_locale;
	static $instance = 0;

	// We're trusting author input, so let's at least make sure it looks like a valid orderby statement
	if ( isset( $attr['orderby'] ) ) {
		$attr['orderby'] = sanitize_sql_orderby( $attr['orderby'] );
		if ( ! $attr['orderby'] ) {
			unset( $attr['orderby'] );
		}
	}

	$html5 = current_theme_supports( 'html5', 'gallery' );
	extract( shortcode_atts( array(
		'order'       => 'ASC',
		'orderby'     => 'menu_order ID',
		'id'          => $post ? $post->ID : 0,
		'itemtag'     => $html5 ? 'figure' : 'dl',
		'icontag'     => $html5 ? 'div' : 'dt',
		'captiontag'  => $html5 ? 'figcaption' : 'dd',
		'columns'     => 3,
		'size'        => 'thumbnail',
		'include'     => '',
		'exclude'     => '',
		'link'        => '',
		'mkslideshow' => false,
	), $attr, 'gallery' ) );

	$id = intval( $id );
	if ( 'RAND' == $order ) {
		$orderby = 'none';
	}

	if ( ! empty( $include ) ) {
		$_attachments = get_posts( array(
			'include'        => $include,
			'post_status'    => 'inherit',
			'post_type'      => 'attachment',
			'post_mime_type' => 'image',
			'order'          => $order,
			'orderby'        => $orderby
		) );

		$attachments = array();
		foreach ( $_attachments as $key => $val ) {
			$attachments[ $val->ID ] = $_attachments[ $key ];
		}
	} elseif ( ! empty( $exclude ) ) {
		$attachments = get_children( array(
			'post_parent'    => $id,
			'exclude'        => $exclude,
			'post_status'    => 'inherit',
			'post_type'      => 'attachment',
			'post_mime_type' => 'image',
			'order'          => $order,
			'orderby'        => $orderby
		) );
	} else {
		$attachments = get_children( array(
			'post_parent'    => $id,
			'post_status'    => 'inherit',
			'post_type'      => 'attachment',
			'post_mime_type' => 'image',
			'order'          => $order,
			'orderby'        => $orderby
		) );
	}

	if ( empty( $attachments ) ) {
		return '';
	}

	if ( is_feed() ) {
		$output = "\n";
		foreach ( $attachments as $att_id => $attachment ) {
			$output .= wp_get_attachment_link( $att_id, $size, true ) . "\n";
		}

		return $output;
	}

	//If we need to make a slideshow out of this gallery

	if ( "true" === $mkslideshow ) {

		$output .= '
			<div class="content--gallery-slideshow">
				<div class="pixslider  pixslider--gallery-slideshow  js-pixslider"
				     data-arrows
				     data-imagescale="none"
				     data-slidertransition="fade"
				     data-autoheight
				     >';
		foreach ( $attachments as $id => $attachment ) :

			$full_img          = wp_get_attachment_image_src( $attachment->ID, 'full-size' );
			$attachment_fields = get_post_custom( $attachment->ID );

			// prepare the video url if there is one
			$video_url = ( isset( $attachment_fields['_custom_video_url'][0] ) && ! empty( $attachment_fields['_custom_video_url'][0] ) ) ? esc_url( $attachment_fields['_custom_video_url'][0] ) : '';

			// should the video auto play?
			$video_autoplay = ( isset( $attachment_fields['_video_autoplay'][0] ) && ! empty( $attachment_fields['_video_autoplay'][0] ) && $attachment_fields['_video_autoplay'][0] === 'on' ) ? $attachment_fields['_video_autoplay'][0] : '';

			$output .= '<div class="gallery-item' . ( ! empty( $video_url ) ? ' video' : '' ) . ( ( $video_autoplay == 'on' ) ? ' video_autoplay' : '' ) . '" itemscope
						     itemtype="http://schema.org/ImageObject"
						     data-caption="' . htmlspecialchars( $attachment->post_excerpt ) . '"
						     data-description="' . htmlspecialchars( $attachment->post_content ) . '"' . ( ( ! empty( $video_autoplay ) ) ? 'data-video_autoplay="' . $video_autoplay . '"' : '' ) . '>
							<img src="' . esc_url( $full_img[0] ) . '" class="attachment-blog-big rsImg"
							     alt="' . esc_attr( $attachment->post_excerpt ) . '"
							     itemprop="contentURL" ' . ( ( ! empty( $video_url ) ) ? ' data-rsVideo="' . esc_attr( $video_url ) . '"' : '' ) . ' />
						</div>';
		endforeach;
		$output .= '</div>
		</div><!-- .content .content--gallery-slideshow -->';

	} else { //just a normal grid gallery

		$itemtag    = tag_escape( $itemtag );
		$captiontag = tag_escape( $captiontag );
		$icontag    = tag_escape( $icontag );
		$valid_tags = wp_kses_allowed_html( 'post' );
		if ( ! isset( $valid_tags[ $itemtag ] ) ) {
			$itemtag = 'dl';
		}
		if ( ! isset( $valid_tags[ $captiontag ] ) ) {
			$captiontag = 'dd';
		}
		if ( ! isset( $valid_tags[ $icontag ] ) ) {
			$icontag = 'dt';
		}

		$columns   = intval( $columns );
		$itemwidth = $columns > 0 ? floor( 100 / $columns ) : 100;
		$float     = is_rtl() ? 'right' : 'left';

		$selector = "gallery-{$instance}";

		$gallery_style = $gallery_div = '';

		/**
		 * Filter whether to print default gallery styles.
		 *
		 * @since 3.1.0
		 *
		 * @param bool $print Whether to print default gallery styles.
		 *                    Defaults to false if the theme supports HTML5 galleries.
		 *                    Otherwise, defaults to true.
		 */
		if ( apply_filters( 'use_default_gallery_style', true ) ) {
			$gallery_style = "
		<style type='text/css'>
			#{$selector} {
				margin: auto;
			}
			#{$selector} .gallery-item {
				float: {$float};
				text-align: center;
				width: {$itemwidth}%;
			}
			/* see gallery_shortcode() in wp-includes/media.php */
		</style>\n\t\t";
		}

		$size_class  = sanitize_html_class( $size );
		$gallery_div = "<div id='$selector' class='gallery galleryid-{$id} gallery-columns-{$columns} gallery-size-{$size_class}'>";

		/**
		 * Filter the default gallery shortcode CSS styles.
		 *
		 * @since 2.5.0
		 *
		 * @param string $gallery_style Default gallery shortcode CSS styles.
		 * @param string $gallery_div Opening HTML div container for the gallery shortcode output.
		 */
		$output = apply_filters( 'gallery_style', $gallery_style . $gallery_div );

		$i = 0;
		foreach ( $attachments as $id => $attachment ) {
			if ( ! empty( $link ) && 'file' === $link ) {
				$image_output = wp_get_attachment_link( $id, $size, false, false );
			} elseif ( ! empty( $link ) && 'none' === $link ) {
				$image_output = wp_get_attachment_image( $id, $size, false );
			} else {
				$image_output = wp_get_attachment_link( $id, $size, true, false );
			}

			$image_meta = wp_get_attachment_metadata( $id );

			$orientation = '';
			if ( isset( $image_meta['height'], $image_meta['width'] ) ) {
				$orientation = ( $image_meta['height'] > $image_meta['width'] ) ? 'portrait' : 'landscape';
			}

			$output .= "<{$itemtag} class='gallery-item'>";
			$output .= "
			<{$icontag} class='gallery-icon {$orientation}'>
				$image_output
			</{$icontag}>";
			if ( $captiontag && trim( $attachment->post_excerpt ) ) {
				$output .= "
				<{$captiontag} class='wp-caption-text gallery-caption'>
				" . wptexturize( $attachment->post_excerpt ) . "
				</{$captiontag}>";
			}
			$output .= "</{$itemtag}>";
			if ( ! $html5 && $columns > 0 && ++$i % $columns == 0 ) {
				$output .= '<br style="clear: both" />';
			}
		}

		if ( ! $html5 && $columns > 0 && $i % $columns !== 0 ) {
			$output .= "
			<br style='clear: both' />";
		}

		$output .= "
		</div>\n";
	}

	return $output;
}

function mies_add_custom_image_url_to_galleries ( $out, $post_id ) {

	$_post = get_post( $post_id );

	if ( empty( $_post ) || ( 'attachment' != $_post->post_type ) || ! $url = wp_get_attachment_url( $_post->ID ) )
		return __( 'Missing Attachment' );

	$data = get_post_custom( $post_id );

	if ( isset( $data['_custom_image_url' ] ) && ! empty( $data['_custom_image_url' ] ) ) {
		return esc_url( $data['_custom_image_url' ][0] );
	}

	return $out;
}

add_filter('attachment_link', 'mies_add_custom_image_url_to_galleries', 10, 2 );

// Hook into the 'after_setup_theme' action
//add_action( 'after_setup_theme', 'wpgrade_custom_backgrounds_support' );

function wpgrade_custom_backgrounds_support() {

	$background_args = array(
		'default-color'          => '1a1717',
		'default-image'          => '',
		'wp-head-callback'       => '_custom_background_cb',
		'admin-head-callback'    => '',
		'admin-preview-callback' => '',
	);

	add_theme_support( 'custom-background', $background_args );
}

add_action( 'wp_head', 'wpgrade_add_desktop_icons' );

function wpgrade_add_desktop_icons() {

	if ( wpgrade::image_src( 'favicon' ) ) {
		echo "<link rel='icon' href=\"" . wpgrade::image_src( 'favicon' ) . "\" >\n";
	}

	if ( wpgrade::image_src( 'apple_touch_icon' ) ) {
		echo "<link rel=\"apple-touch-icon\" href=\"" . esc_url( wpgrade::image_src( 'apple_touch_icon' ) ) . "\" >\n";
	}

	if ( wpgrade::image_src( 'metro_icon' ) ) {
		echo "<meta name=\"msapplication-TileColor\" content=\"#f01d4f\">\n";
		echo "<meta name=\"msapplication-TileImage\" content=\"" . wpgrade::image_src( 'metro_icon' ) . "\" >\n";
	}

}

add_action('admin_head', 'wpgrade_add_admin_favicon');
function wpgrade_add_admin_favicon() {
	if ( wpgrade::image_src( 'favicon' ) ) {
		echo "<link rel='icon' href=\"" . esc_url( wpgrade::image_src( 'favicon' ) ) . "\" >\n";
	}
}

add_action( 'wp', 'wpgrade_prepare_password_for_custom_post_types' );

function wpgrade_prepare_password_for_custom_post_types() {

	global $wpgrade_private_post;
	$wpgrade_private_post = mies::is_password_protected();

}

add_filter( 'mce_buttons', 'add_next_page_button' );
// Add "Next page" button to TinyMCE
function add_next_page_button( $mce_buttons ) {
	$pos = array_search( 'wp_more', $mce_buttons, true );
	if ( $pos !== false ) {
		$tmp_buttons   = array_slice( $mce_buttons, 0, $pos + 1 );
		$tmp_buttons[] = 'wp_page';
		$mce_buttons   = array_merge( $tmp_buttons, array_slice( $mce_buttons, $pos + 1 ) );
	}

	return $mce_buttons;
}

/**
 * Add "Styles" drop-down
 */
add_filter( 'mce_buttons_2', 'wpgrade_mce_editor_buttons' );
function wpgrade_mce_editor_buttons( $buttons ) {
	array_unshift($buttons, 'styleselect' );
	return $buttons;
}

/**
 * Add styles/classes to the "Styles" drop-down
 */
add_filter( 'tiny_mce_before_init', 'wpgrade_mce_before_init' );
function wpgrade_mce_before_init( $settings ) {

	$style_formats =array(
		array( 'title' => __( 'Separator', 'mies_txtd' ), 'block' => 'div', 'classes' => 'separator', 'wrapper' => true ),
		array( 'title' => __( 'Two Columns', 'mies_txtd' ), 'block' => 'div', 'classes' => 'twocolumn', 'wrapper' => true ),
		array( 'title' => __( 'Intro Text', 'mies_txtd' ), 'selector' => 'p', 'classes' => 'intro narrow not-big'),
		array( 'title' => __( 'Smaller Text', 'mies_txtd' ), 'selector' => 'p', 'classes' => 'small'),
		array( 'title' => __( 'Huge Title', 'mies_txtd' ), 'block' => 'h1', 'classes' => 'huge' )

	);

	$settings['style_formats'] = json_encode( $style_formats );

	return $settings;
}


add_filter( 'wp_link_pages_args', 'add_next_and_number' );
// Customize the "wp_link_pages()" to be able to display both numbers and prev/next links
function add_next_and_number( $args ) {
	if ( $args['next_or_number'] == 'next_and_number' ) {
		global $page, $numpages, $multipage, $more, $pagenow;
		$args['next_or_number'] = 'number';
		$prev                   = '';
		$next                   = '';
		if ( $multipage and $more ) {
			$i = $page - 1;
			if ( $i and $more ) {
				$prev .= _wp_link_page( $i );
				$prev .= $args['link_before'] . $args['previouspagelink'] . $args['link_after'] . '</a>';
				$prev = apply_filters( 'wp_link_pages_link', $prev, 'prev' );
			}
			$i = $page + 1;
			if ( $i <= $numpages and $more ) {
				$next .= _wp_link_page( $i );
				$next .= $args['link_before'] . $args['nextpagelink'] . $args['link_after'] . '</a>';
				$next = apply_filters( 'wp_link_pages_link', $next, 'next' );
			}
		}
		$args['before'] = $args['before'] . $prev;
		$args['after']  = $next . $args['after'];
	}

	return $args;
}

/*
 * Add custom fields to attachments
 */
add_action( 'init', 'wpgrade_register_attachments_custom_fields' );

function wpgrade_register_attachments_custom_fields() {

	//add video support for attachments
	if ( ! function_exists( 'add_video_url_field_to_attachments' ) ) {

		function add_video_url_field_to_attachments( $form_fields, $post ) {
			if ( ! isset( $form_fields["custom_video_url"] ) ) {
				$form_fields["custom_video_url"] = array(
					"label" => __( "Custom Video URL", 'mies_txtd' ),
					"input" => "text", // this is default if "input" is omitted
					"value" => esc_url( get_post_meta( $post->ID, "_custom_video_url", true ) ),
					"helps" => __( "<p class='desc'>Attach a video to this image <span class='small'>(YouTube or Vimeo)</span>.</p>", 'mies_txtd' ),
				);
			}

			if ( ! isset( $form_fields["video_autoplay"] ) ) {

				$meta = get_post_meta( $post->ID, "_video_autoplay", true );
				// Set the checkbox checked or not
				if ( $meta == 'on' ) {
					$checked = ' checked="checked"';
				} else {
					$checked = '';
				}

				$form_fields["video_autoplay"] = array(
					"label" => __( "Video Autoplay", 'mies_txtd' ),
					"input" => "html",
					"html"  => '<input' . $checked . ' type="checkbox" name="attachments[' . $post->ID . '][video_autoplay]" id="attachments[' . $post->ID . '][video_autoplay]" /><label for="attachments[' . $post->ID . '][video_autoplay]">' . __( 'Enable Video Autoplay?', 'mies_txtd' ) . '</label>'
				);
			}

			if ( ! isset( $form_fields["custom_image_url"] ) ) {
				$form_fields["custom_image_url"] = array(
					"label" => __( "Custom Image URL", 'mies_txtd' ),
					"input" => "text", // this is default if "input" is omitted
					"value" => esc_url( get_post_meta( $post->ID, "_custom_image_url", true ) ),
					"helps" => __( "<p class='desc'>Link this image to a custom url.</p>", 'mies_txtd' ),
				);
			}

//			if ( ! isset( $form_fields["external_url"] ) && !empty( $link_media_to_value ) && $link_media_to_value == 'external' ) {
//				$form_fields["external_url"] = array(
//					"label" => __( "External URL", 'mies_txtd' ),
//					"input" => "text",
//					"value" => esc_url( get_post_meta( $post->ID, "_external_url", true ) ),
//					"helps" => __( "<p class='desc'>Set this image to link to an external website.</p>", 'mies_txtd' ),
//				);
//			}

			return $form_fields;
		}

		add_filter( "attachment_fields_to_edit", "add_video_url_field_to_attachments", 99999, 2 );
	}

	/**
	 * Save custom media metadata fields
	 * Be sure to validate your data before saving it
	 * http://codex.wordpress.org/Data_Validation
	 *
	 * @param $post       The $post data for the attachment
	 * @param $attachment The $attachment part of the form $_POST ($_POST[attachments][postID])
	 *
	 * @return $post
	 */

	if ( ! function_exists( 'add_image_attachment_fields_to_save' ) ) {

		function add_image_attachment_fields_to_save( $post, $attachment ) {

			if ( isset( $attachment['custom_image_url'] ) ) {
				update_post_meta( $post['ID'], '_custom_image_url', esc_url( $attachment['custom_image_url'] ) );
			}

			if ( isset( $attachment['custom_video_url'] ) ) {
				update_post_meta( $post['ID'], '_custom_video_url', esc_url( $attachment['custom_video_url'] ) );
			}

			if ( isset( $attachment['video_autoplay'] ) ) {
				update_post_meta( $post['ID'], '_video_autoplay', 'on' );
			} else {
				update_post_meta( $post['ID'], '_video_autoplay', 'off' );
			}

//			if ( isset( $attachment['external_url'] ) ) {
//				update_post_meta( $post['ID'], '_external_url', esc_url( $attachment['external_url'] ) );
//			}

			return $post;
		}

		add_filter( "attachment_fields_to_save", "add_image_attachment_fields_to_save", 9999, 2 );

	}
}

/*
 * Add custom styling for the media popup
 */
add_action( 'print_media_templates', 'wpgrade_custom_style_for_mediabox' );

function wpgrade_custom_style_for_mediabox() {
	?>
	<style>
		.media-sidebar {
			width: 400px;
		}

		.media-sidebar .field p.desc {
			color: #666;
			font-size: 11px;
			margin-top: 3px;
		}

		.media-sidebar .field p.help {
			display: none;
		}

		/*
		 * Options Specific Rules
		 */
		.media-sidebar .setting[data-setting="description"] textarea {
			min-height: 100px;
		}

		.media-sidebar table.compat-attachment-fields input[type=checkbox], .media-sidebar table.compat-attachment-fields input[type=checkbox] {
			margin: 0 6px 0 0;
		}

		table.compat-attachment-fields {
			margin-top: 12px;
		}

		.media-sidebar tr.compat-field-video_autoplay {
			margin: -12px 0 0 0;
		}

		.media-sidebar tr.compat-field-video_autoplay th.label {
			opacity: 0;
		}

		.media-sidebar tr.compat-field-external_url {

		}

		.attachments-browser .attachments, .attachments-browser .uploader-inline,
		.attachments-browser .media-toolbar {
			right: 433px;
		}

		.compat-item .field {
			width: 65%;
		}
	</style>
<?php
}

/*
 * Add custom settings to the gallery popup interface
 */
add_action( 'print_media_templates', 'wpgrade_custom_gallery_settings' );

function wpgrade_custom_gallery_settings() {

	// define your backbone template;
	// the "tmpl-" prefix is required,
	// and your input field should have a data-setting attribute
	// matching the shortcode name
	?>
	<script type="text/html" id="tmpl-mkslideshow">
		<label class="setting">
			<span><?php _e( 'Make this gallery a slideshow', 'mies_txtd' ) ?></span>
			<input type="checkbox" data-setting="mkslideshow">
		</label>
	</script>

	<script>

		jQuery(document).ready(function () {

			// add your shortcode attribute and its default value to the
			// gallery settings list; $.extend should work as well...
			_.extend(wp.media.gallery.defaults, {
				mkslideshow: false
			});

			// merge default gallery settings template with yours
			wp.media.view.Settings.Gallery = wp.media.view.Settings.Gallery.extend({
				template: function (view) {
					return wp.media.template('gallery-settings')(view)
					+ wp.media.template('mkslideshow')(view);
				}
			});

		});

	</script>
<?php

}

// No default style for galleries - we will handle that
add_filter( 'use_default_gallery_style', '__return_false' );

// Deactivate the Featured Image box for Pages as we have our own Hero with more bells and whistles
function remove_page_featured_image_field() {
	remove_meta_box( 'postimagediv', 'page' , 'side' );
}
add_action( 'add_meta_boxes' , 'remove_page_featured_image_field' );

// Change the title of the Featured Image meta box for projects
function mies_change_project_featured_image_box_title()
{
	remove_meta_box( 'postimagediv', wpgrade::$shortname . '_portfolio', 'side' );
	add_meta_box(
		'postimagediv',
		__( 'Archive Image', 'mies_txtd' ) . '<a class="tooltip" title="' . __( 'In case you define an image here we will use it as the project image on portfolio archive templates. <p>If you leave it empty we will use the first image in the Hero Area above.</p>', 'mies_txtd' ) . '"></a>', 'post_thumbnail_meta_box',
		wpgrade::$shortname . '_portfolio',
		'side',
		'low'
	);
}
add_action('add_meta_boxes', 'mies_change_project_featured_image_box_title');

// Change the wording for projects, of the Featured Image box
function mies_custom_admin_post_thumbnail_html( $content ) {
	$screen = get_current_screen();

	if ( isset($screen) && $screen->id == wpgrade::$shortname . '_portfolio' ) {
		//next replace the link text
		$content = str_replace( __( 'Set featured image', 'mies_txtd' ), __( 'Set archive image (optional)', 'mies_txtd' ), $content );
	}

	return $content;
}

add_filter( 'admin_post_thumbnail_html', 'mies_custom_admin_post_thumbnail_html' );


/* ------------------------------------------------------------------------ *
 * Setting Registration
 * ------------------------------------------------------------------------ */

/**
 * Initializes the theme options page by registering the Sections,
 * Fields, and Settings.
 *
 * This function is registered with the 'admin_init' hook.
 */
add_action('admin_init', 'sandbox_initialize_theme_options');
function sandbox_initialize_theme_options() {

	// Next, we will introduce the fields for toggling the visibility of content elements.
	add_settings_field(
		'portfolio_archive_thumbnail',                      // ID used to identify the field throughout the theme
		__( 'Portfolio Thumbnail', 'mies_txtd' ),                           // The label to the left of the option interface element
		'portfolio_archive_thumbnail_callback',   // The name of the function responsible for rendering the option interface
		'media',                          // The page on which this option will be displayed
		'default',         // The name of the section to which this field belongs
		array(                              // The array of arguments to pass to the callback.

		)
	);

	// Finally, we register the fields with WordPress
	register_setting(
		'media',
		'portfolio_thumbnail_size_w',
		'sanitize_callback_portfolio_thumbnail_dimension'
	);

	register_setting(
		'media',
		'portfolio_thumbnail_size_h',
		'sanitize_callback_portfolio_thumbnail_dimension'
	);

	register_setting(
		'media',
		'portfolio_thumbnail_crop',
		'sanitize_callback_portfolio_thumbnail_crop'
	);

} // end sandbox_initialize_theme_options

/* ------------------------------------------------------------------------ *
 * Field Callbacks
 * ------------------------------------------------------------------------ */

/**
 * This function renders the interface elements for toggling the visibility of the header element.
 *
 * It accepts an array of arguments and expects the first element in the array to be the description
 * to be displayed next to the checkbox.
 */
function portfolio_archive_thumbnail_callback($args) {

	$html = '<label for="portfolio_thumbnail_size_w">' . __( 'Max Width', 'mies_txtd' ) . '</label>
<input name="portfolio_thumbnail_size_w" type="number" step="1" min="0" id="portfolio_thumbnail_size_w" value="' . esc_attr( get_option('portfolio_thumbnail_size_w') ) . '" class="small-text" />
<label for="portfolio_thumbnail_size_h">' . __( 'Max Height', 'mies_txtd' ) . '</label>
<input name="portfolio_thumbnail_size_h" type="number" step="1" min="0" id="thumbnail_size_h" value="' . esc_attr( get_option('portfolio_thumbnail_size_h') ) . '" class="small-text" /><br />
<input name="portfolio_thumbnail_crop" type="checkbox" id="portfolio_thumbnail_crop" value="1" '. checked('1', get_option('portfolio_thumbnail_crop'), false ) . '/>
<label for="portfolio_thumbnail_crop">' . __( 'Crop thumbnail to exact dimensions (normally thumbnails are proportional)', 'mies_txtd' ) . '<br/><br/>' . __('After you change these settings you will need to <a href="http://bit.ly/1wfbO1f" target="_blank">regenerate the thumbnails</a> to apply them to existing media files.', 'mies_txtd' ) . '</label>';

//	// Note the ID and the name attribute of the element match that of the ID in the call to add_settings_field
//	$html = '<input type="checkbox" id="show_header" name="show_header" value="1" ' . checked(1, get_option('show_header'), false) . '/>';

//	// Here, we will take the first argument of the array and add it to a label next to the checkbox
//	$html .= '<label for="show_header"> '  . $args[0] . '</label>';

	echo $html;

} // end sandbox_toggle_header_callback

function sanitize_callback_portfolio_thumbnail_dimension ( $input ) {
	return absint( $input );
}

function sanitize_callback_portfolio_thumbnail_crop ( $input ) { //just a callback that does nothing right now
	return $input ;
}

function portfolio_archive_thumbnail_whitelist_options( $whitelist_options ) {
	array_push( $whitelist_options['media'], array('portfolio_thumbnail_size_w', 'portfolio_thumbnail_size_h', 'portfolio_thumbnail_crop') );
	return $whitelist_options;
}
add_filter('whitelist_options', 'portfolio_archive_thumbnail_whitelist_options');

/**
 * Adds custom classes to the array of body classes.
 *
 * @param array $classes Classes for the body element.
 *
 * @return array
 */
function mies_body_classes( $classes ) {
	if ( is_single() && 'post' == get_post_type() && is_active_sidebar( 'sidebar-single-post' ) &&  wpgrade::option( 'blog_single_show_sidebar' )) {
		$classes[ ] = 'has_sidebar';
	}

	return $classes;
}

add_filter( 'body_class', 'mies_body_classes' );