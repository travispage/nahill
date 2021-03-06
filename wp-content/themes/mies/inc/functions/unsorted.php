<?php
/**
 * Cutting the titles and adding '...' after
 *
 * @param  [string] $text       [description]
 * @param  [int] $cut_length [description]
 * @param  [int] $limit      [description]
 *
 * @return [type]             [description]
 */
function short_text( $text, $cut_length, $limit, $echo = true ) {
	$char_count = mb_strlen( $text );
	$text       = ( $char_count > $limit ) ? mb_substr( $text, 0, $cut_length ) . wpgrade::option( 'blog_excerpt_more_text' ) : $text;
	if ( $echo ) {
		echo $text;
	} else {
		return $text;
	}
}

/**
 * Borrowed from CakePHP
 * Truncates text.
 * Cuts a string to the length of $length and replaces the last characters
 * with the ending if the text is longer than length.
 * ### Options:
 * - `ending` Will be used as Ending and appended to the trimmed string
 * - `exact` If false, $text will not be cut mid-word
 * - `html` If true, HTML tags would be handled correctly
 *
 * @param string  $text    String to truncate.
 * @param integer $length  Length of returned string, including ellipsis.
 * @param array   $options An array of html attributes and options.
 *
 * @return string Trimmed string.
 * @access public
 * @link   http://book.cakephp.org/view/1469/Text#truncate-1625
 */

function truncate( $text, $length = 100, $options = array() ) {
	$default = array(
		'ending' => '...',
		'exact'  => true,
		'html'   => false
	);
	$options = array_merge( $default, $options );
	extract( $options );

	if ( $html ) {
		if ( mb_strlen( preg_replace( '/<.*?>/', '', $text ) ) <= $length ) {
			return $text;
		}
		$totalLength = mb_strlen( strip_tags( $ending ) );
		$openTags    = array();
		$truncate    = '';

		preg_match_all( '/(<\/?([\w+]+)[^>]*>)?([^<>]*)/', $text, $tags, PREG_SET_ORDER );
		foreach ( $tags as $tag ) {
			if ( ! preg_match( '/img|br|input|hr|area|base|basefont|col|frame|isindex|link|meta|param/s', $tag[2] ) ) {
				if ( preg_match( '/<[\w]+[^>]*>/s', $tag[0] ) ) {
					array_unshift( $openTags, $tag[2] );
				} else if ( preg_match( '/<\/([\w]+)[^>]*>/s', $tag[0], $closeTag ) ) {
					$pos = array_search( $closeTag[1], $openTags );
					if ( $pos !== false ) {
						array_splice( $openTags, $pos, 1 );
					}
				}
			}
			$truncate .= $tag[1];

			$contentLength = mb_strlen( preg_replace( '/&[0-9a-z]{2,8};|&#[0-9]{1,7};|&#x[0-9a-f]{1,6};/i', ' ', $tag[3] ) );
			if ( $contentLength + $totalLength > $length ) {
				$left           = $length - $totalLength;
				$entitiesLength = 0;
				if ( preg_match_all( '/&[0-9a-z]{2,8};|&#[0-9]{1,7};|&#x[0-9a-f]{1,6};/i', $tag[3], $entities, PREG_OFFSET_CAPTURE ) ) {
					foreach ( $entities[0] as $entity ) {
						if ( $entity[1] + 1 - $entitiesLength <= $left ) {
							$left --;
							$entitiesLength += mb_strlen( $entity[0] );
						} else {
							break;
						}
					}
				}

				$truncate .= mb_substr( $tag[3], 0, $left + $entitiesLength );
				break;
			} else {
				$truncate .= $tag[3];
				$totalLength += $contentLength;
			}
			if ( $totalLength >= $length ) {
				break;
			}
		}
	} else {
		if ( mb_strlen( $text ) <= $length ) {
			return $text;
		} else {
			$truncate = mb_substr( $text, 0, $length - mb_strlen( $ending ) );
		}
	}
	if ( ! $exact ) {
		$spacepos = mb_strrpos( $truncate, ' ' );
		if ( isset( $spacepos ) ) {
			if ( $html ) {
				$bits = mb_substr( $truncate, $spacepos );
				preg_match_all( '/<\/([a-z]+)>/', $bits, $droppedTags, PREG_SET_ORDER );
				if ( ! empty( $droppedTags ) ) {
					foreach ( $droppedTags as $closingTag ) {
						if ( ! in_array( $closingTag[1], $openTags ) ) {
							array_unshift( $openTags, $closingTag[1] );
						}
					}
				}
			}
			$truncate = mb_substr( $truncate, 0, $spacepos );
		}
	}
	$truncate .= $ending;

	if ( $html ) {
		foreach ( $openTags as $tag ) {
			$truncate .= '</' . $tag . '>';
		}
	}

	return $truncate;
}

//@todo CLEANUP refactor function
function wpgrade_better_excerpt( $text = '' ) {
	global $post;
	$raw_excerpt = '';

	// For the case in which a search is executed and
	// returns a mixed content of pages, projects and
	// single posts;
	// Return a stripped excerpt for any other post
	// other than a single post - a page or a project
	if( ! is_single() ) return wp_strip_all_tags( get_the_excerpt() );

	//if the post has a manual excerpt ignore the content given
	if ( $text == '' && function_exists( 'has_excerpt' ) && has_excerpt() ) {
		$text        = get_the_excerpt();
		$raw_excerpt = $text;

		$text = strip_shortcodes( $text );
		$text = apply_filters( 'the_content', $text );
		$text = str_replace( ']]>', ']]&gt;', $text );

		// Removes any JavaScript in posts (between <script> and </script> tags)
		$text = preg_replace( '@<script[^>]*?>.*?</script>@si', '', $text );

		// Enable formatting in excerpts - Add HTML tags that you want to be parsed in excerpts
		$allowed_tags = '<p><a><strong><i><br><h1><h2><h3><h4><h5><h6><blockquote><ul><li><ol>';
		$text         = strip_tags( $text, $allowed_tags );
		//		$excerpt_more = apply_filters('excerpt_more', ' ' . '[...]');
		//		$text .= $excerpt_more;

	} else {

		if ( empty( $text ) ) {
			//need to grab the content
			$text = get_the_content();
		}

		$raw_excerpt = $text;
		$text        = strip_shortcodes( $text );
		$text        = apply_filters( 'the_content', $text );
		$text        = str_replace( ']]>', ']]&gt;', $text );

		// Removes any JavaScript in posts (between <script> and </script> tags)
		$text = preg_replace('@<script[^>]*?>.*?</script>@si', '', $text);

		// Enable formatting in excerpts - Add HTML tags that you want to be parsed in excerpts
		$allowed_tags = '<p><a><em><strong><i><br><h1><h2><h3><h4><h5><h6><blockquote><ul><li><ol><iframe><embed><object><script>';
		$text         = strip_tags( $text, $allowed_tags );

		// Set custom excerpt length - number of characters to be shown in excerpts
		if ( wpgrade::option( 'blog_excerpt_length' ) ) {
			$excerpt_length = absint( wpgrade::option( 'blog_excerpt_length' ) );
		} else {
			$excerpt_length = 180;
		}

		$excerpt_more = apply_filters( 'excerpt_more', ' ' . '[...]' );

		$options = array(
			'ending' => $excerpt_more,
			'exact'  => false,
			'html'   => true
		);
		$text    = truncate( $text, $excerpt_length, $options );

	}

	// IMPORTANT! Prevents tags cutoff by excerpt (i.e. unclosed tags) from breaking formatting
	$text = force_balance_tags( $text );

	return apply_filters( 'wp_trim_excerpt', $text, $raw_excerpt );
}

/*
 * COMMENT LAYOUT
 */
function wpgrade_comments( $comment, $args, $depth ) {

	$GLOBALS['comment'] = $comment; ?>
<li <?php comment_class(); ?>>
	<article id="comment-<?php echo $comment->comment_ID; ?>" class="comment-article  media">
		<?php if ( get_comment_type( $comment->comment_ID ) == 'comment' ): ?>
			<aside class="comment__avatar  media__img">
				<?php echo get_avatar( $comment, 60 ) ?>
			</aside>
		<?php endif; ?>
		<div class="media__body">
			<header class="comment__meta comment-author">
				<?php printf( '<span class="comment__author-name">%s</span>', get_comment_author_link() ) ?>
				<time class="comment__time" datetime="<?php comment_time( 'c' ); ?>">
					<a href="<?php echo esc_url( get_comment_link( $comment->comment_ID, $args ) ) ?>" class="comment__timestamp"><?php printf( __( 'on %s at %s', 'mies_txtd' ), get_comment_date(), get_comment_time() ); ?> </a>
				</time>
				<div class="comment__links">
					<?php
					edit_comment_link( __( 'Edit', 'mies_txtd' ), '  ', '' );
					comment_reply_link( array_merge( $args, array( 'depth'     => $depth,
					                                               'max_depth' => $args['max_depth']
							) ) );
					?>
				</div>
			</header><!-- .comment-meta -->
			<?php if ( $comment->comment_approved == '0' ) : ?>
				<div class="alert info">
					<p><?php _e( 'Your comment is awaiting moderation.', 'mies_txtd' ) ?></p>
				</div>
			<?php endif; ?>
			<section class="comment__content comment">
				<?php comment_text() ?>
			</section>
		</div>
	</article>
	<!-- </li> is added by WordPress automatically -->
<?php
} // don't remove this bracket!

/**
 * Replace the [...] wordpress puts in when using the the_excerpt() method.
 */
function new_excerpt_more( $excerpt ) {
	return wpgrade::option( 'blog_excerpt_more_text' );
}

add_filter( 'excerpt_more', 'new_excerpt_more' );

function remove_more_link_scroll( $link ) {
	$link = preg_replace( '|#more-[0-9]+|', '', $link );

	return $link;
}

add_filter( 'the_content_more_link', 'remove_more_link_scroll' );

//fix the canonical url of YOAST because on the front page it ignores the pagination
add_filter( 'wpseo_canonical', 'wpgrade_get_current_canonical_url' );
//fix the canonical url of AIOSEOP because on the front page it breaks the pagination
add_filter( 'aioseop_canonical_url', 'wpgrade_get_current_canonical_url' );

/**
 * Filter the page title so that plugins can unhook this

 */
function wpgrade_wp_title( $title, $sep ) {

	global $paged, $page;

	if ( is_feed() )
		return $title;

	// Add the site name.
	$title .= get_bloginfo( 'name' );

	// Add the site description for the home/front page.
	$site_description = get_bloginfo( 'description', 'display' );
	if ( $site_description && ( is_home() || is_front_page() ) )
		$title = "$title $sep $site_description";

	// Add a page number if necessary.
	if ( $paged >= 2 || $page >= 2 )
		$title = "$title $sep " . sprintf( __( 'Page %s', 'mies_txtd' ), max( $paged, $page ) );

	return $title;
}

add_filter( 'wp_title', 'wpgrade_wp_title', 10, 2 );

function wpgrade_fix_yoast_page_number( $title ) {

	global $paged, $page, $sep;

	if ( is_home() || is_front_page() ) {
		// Add a page number if necessary.
		if ( $paged >= 2 || $page >= 2 )
			$title = "$title $sep " . sprintf( __( 'Page %s', 'mies_txtd' ), max( $paged, $page ) );
	}

	return $title;
}

//filter the YOAST title so we can correct the page number missing on frontpage
add_filter( 'wpseo_title', 'wpgrade_fix_yoast_page_number' );

//get the first image in a gallery or portfolio
function wpgrade_get_first_gallery_image_src( $post_ID, $image_size ) {

	$gallery_ids = array();

	if ( ! empty( $gallery_ids[0] ) ) {
		return wp_get_attachment_image_src( $gallery_ids[0], $image_size );
	} else {
		return null;
	}
}

//fix the sticky posts logic by preventing them to appear again
function wpgrade_pre_get_posts_sticky_posts( $query ) {

	// Do nothing if not home or not main query.
	if ( ! $query->is_home() || ! $query->is_main_query() ) {
		return;
	}

	$page_on_front = get_option( 'page_on_front' );

	// Do nothing if the blog page is not the front page
	if ( ! empty( $page_on_front ) ) {
		return;
	}

	$sticky = get_option( 'sticky_posts' );

	// Do nothing if no sticky posts
	if ( empty( $sticky ) ) {
		return;
	}

	// We need to respect post ids already in the blacklist of hell
	$post__not_in = $query->get( 'post__not_in' );

	if ( ! empty( $post__not_in ) ) {
		$sticky = array_merge( (array) $post__not_in, $sticky );
		$sticky = array_unique( $sticky );
	}

	$query->set( 'post__not_in', $sticky );

}

add_action( 'pre_get_posts', 'wpgrade_pre_get_posts_sticky_posts' );

/**
 * Extend the default WordPress post classes.
 *
 * @since Mies 1.5.6
 *
 * @param array $classes A list of existing post class values.
 * @return array The filtered post class list.
 */
function mies_post_classes( $classes ) {
	//only add this class for regular pages
	if ( get_page_template_slug( get_the_ID() ) == '' || is_singular( wpgrade::$shortname . '_portfolio' ) ) {
		$subtitle = trim( get_post_meta( wpgrade::lang_post_id( get_the_ID() ), wpgrade::prefix() . 'header_cover_subtitle', true ) );
		$title = get_post_meta( wpgrade::lang_post_id( get_the_ID() ), wpgrade::prefix() . 'header_cover_title', true );
		$description = get_post_meta( wpgrade::lang_post_id( get_the_ID() ), wpgrade::prefix() . 'header_cover_description', true );

		if ( ! ( has_post_thumbnail() || ! empty( $subtitle ) || $title !== ' ' || ! empty( $description ) ) ) {
			$classes[] = 'no-page-header';
		}
	}

	return $classes;
}
add_filter( 'post_class', 'mies_post_classes' );



/**
 * Subpages edit links in the admin area
 *
 * @TODO move this inside a plugin
 */
function mies_subpages_admin_menu_edit_links( $wp_admin_bar ) {
	global $post, $pagenow;

	$is_edit_page = in_array( $pagenow, array( 'post.php',  ) );

	if ( ! $is_edit_page ) //check for new post page
		$is_edit_page = in_array( $pagenow, array( 'post-new.php' ) );
	elseif ( ! $is_edit_page )  //check for either new or edit
		$is_edit_page = in_array( $pagenow, array( 'post.php', 'post-new.php' ) );


	if ( $is_edit_page && isset( $post->post_parent ) && ! empty( $post->post_parent ) ) {


		$wp_admin_bar->add_node( array(
			'id'    => 'edit_parent',
			'title' => __( 'Edit Parent', 'mies_txtd' ),
			'href'  => get_edit_post_link( $post->post_parent ),
			'meta'  => array( 'class' => 'edit_parent_button' )
		) );

		$siblings = get_children(
			array(
				'post_parent' => $post->post_parent,
				'child_of'     => wpgrade::lang_post_id( $post->post_parent ),
				'parent'       => wpgrade::lang_post_id( $post->post_parent ),
				'orderby' => 'menu_order title', //this is the exact ordering used on the All Pages page - order included
				'order' => 'ASC',
				'post_type' => 'page',
			)
		);

		$siblings = array_values($siblings);
		$current_pos = 0;
		foreach ( $siblings as $key => $sibling ) {

			if ( $sibling->ID == $post->ID ) {
				$current_pos = $key;
			}
		}

		if ( isset($siblings[ $current_pos - 1 ] ) ){

			$prev_post = $siblings[ $current_pos - 1 ];

			$wp_admin_bar->add_node( array(
				'id'    => 'edit_prev_child',
				'title' => __( 'Edit Prev Child', 'mies_txtd' ),
				'href'  => get_edit_post_link( $prev_post->ID ),
				'meta'  => array( 'class' => 'edit_prev_child_button' )
			) );
		}

		if ( isset($siblings[ $current_pos + 1 ] ) ) {

			$next_post =  $siblings[ $current_pos + 1 ];

			$wp_admin_bar->add_node( array(
				'id'    => 'edit_next_child',
				'title' => __( 'Edit Next Child', 'mies_txtd' ),
				'href'  => get_edit_post_link( $next_post->ID ),
				'meta'  => array( 'class' => 'edit_next_child_button' )
			) );
		}

	} elseif ( $is_edit_page ) {


		$kids = get_children(
			array(
				'post_parent' => $post->ID,
				'child_of'     => wpgrade::lang_post_id( $post->ID ),
				'parent'       => wpgrade::lang_post_id( $post->ID ),
				'orderby' => 'menu_order title', //this is the exact ordering used on the All Pages page - order included
				'order' => 'ASC',
				'post_type' => 'page',
			)
		);

		if ( !empty($kids) ) {

			$args = array(
				'id'    => 'edit_children',
				'title' => __( 'Edit Children', 'mies_txtd' ),
				'href'  => '#',
				'meta'  => array( 'class' => 'edit_children_button' )
			);

			$wp_admin_bar->add_node( $args );

			foreach ( $kids as $kid ) {
				$kid_args = array(
					'parent' => 'edit_children',
					'id'    => 'edit_child_' . $kid->post_name,
					'title' => __( 'Edit', 'mies_txtd' ) . ': ' . $kid->post_title,
					'href'  => get_edit_post_link( $kid->ID ),
					'meta'  => array( 'class' => 'edit_child_button' )
				);
				$wp_admin_bar->add_node( $kid_args );
			}
		}
	}
}

add_action( 'admin_bar_menu', 'mies_subpages_admin_menu_edit_links', 999 );