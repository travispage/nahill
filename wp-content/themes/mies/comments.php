<?php
/**
 * The template for displaying Comments.
 * The area of the page that contains both current comments
 * and the comment form. The actual display of comments is
 * handled by a callback to wpgrade_comment() which is
 * located in the functions.php file.
 * 
 * @package Mies
 * @since   Mies 1.0
 */

/*
 * If the current post is protected by a password and
 * the visitor has not yet entered the password we will
 * return early without loading the comments.
 */
if ( post_password_required() ) {
	return;
} ?>

	<hr/>
	<aside id="comments" class="comments-area<?php if ( ! have_comments() ) { echo '  no-comments'; } if(get_option('show_avatars')) echo '  has--avatars'; ?>">
		<div class="comments-area-title">
			<h2 class="comments-title">
				<?php
				if ( have_comments() ) :
					printf(
						_n(
							'1 Comment',
							'%1$s Comments',
							get_comments_number(),
							'mies_txtd'
						),
						number_format_i18n( get_comments_number() )
					);
				else:
					_e( 'There are no comments', 'mies_txtd' );
				endif;
				?>
			</h2>
			<?php echo '<a class="comments_add-comment" href="#reply-title">' . __( 'Add yours', 'mies_txtd' ) . '</a>'; ?>
		</div>
		<?php
		// You can start editing here -- including this comment!
		if ( have_comments() ) :
			if ( get_comment_pages_count() > 1 && get_option( 'page_comments' ) ) : // are there comments to navigate through ?>
				<nav role="navigation" id="comment-nav-above" class="comment-navigation">
					<h3 class="assistive-text"><?php _e( 'Comment navigation', 'mies_txtd' ); ?></h3>

					<div class="nav-previous"><?php previous_comments_link( __( '&larr; Older Comments', 'mies_txtd' ) ); ?></div>
					<div class="nav-next"><?php next_comments_link( __( 'Newer Comments &rarr;', 'mies_txtd' ) ); ?></div>
				</nav><!-- #comment-nav-before .site-navigation .comment-navigation -->
			<?php endif; // check for comment navigation ?>

			<ol class="commentlist">
				<?php
				/* Loop through and list the comments. Tell wp_list_comments()
				 * to use wpgrade_comment() to format the comments.
				 * If you want to overload this in a child theme then you can
				 * define wpgrade_comment() and that will be used instead.
				 * See wpgrade_comment() in inc/template-tags.php for more.
				 */
				wp_list_comments( array( 'callback' => 'wpgrade_comments', 'short_ping' => true ) ); ?>
			</ol><!-- .commentlist -->

			<?php if ( get_comment_pages_count() > 1 && get_option( 'page_comments' ) ) : // are there comments to navigate through ?>
				<nav role="navigation" id="comment-nav-below" class="comment-navigation">
					<h3 class="assistive-text"><?php _e( 'Comment navigation', 'mies_txtd' ); ?></h3>

					<div class="nav-previous"><?php previous_comments_link( __( '&larr; Older Comments', 'mies_txtd' ) ); ?></div>
					<div class="nav-next"><?php next_comments_link( __( 'Newer Comments &rarr;', 'mies_txtd' ) ); ?></div>
				</nav><!-- #comment-nav-below .site-navigation .comment-navigation -->
			<?php endif; // check for comment navigation ?>


		<?php endif; // have_comments() ?>

	</aside><!-- #comments .comments-area -->
<?php
// If comments are closed and there are comments, let's leave a little note, shall we?
if ( ! comments_open() && post_type_supports( get_post_type(), 'comments' ) && ! is_page() ) :
	?>
	<p class="nocomments"><?php _e( 'Comments are closed.', 'mies_txtd' ); ?></p>
<?php endif;

$commenter = wp_get_current_commenter();
$req       = get_option( 'require_name_email' );
$aria_req  = ( $req ? " aria-required='true'" : '' );

if ( is_user_logged_in() ) {
	$current_user  = wp_get_current_user();
	$comments_args = array(
		// change the title of send button=
		'title_reply'          => __( 'Leave a Comment', 'mies_txtd' ),
		// remove "Text or HTML to be displayed after the set of comment fields"
		'comment_notes_before' => '',
		'comment_notes_after'  => '',
		'fields'               => apply_filters( 'comment_form_default_fields', array(
			'author' => '<p class="comment-form-author"><label for="author" class="show-on-ie8">' . __( 'Name', 'mies_txtd' ) . '</label><input id="author" name="author" value="' . esc_attr( $commenter['comment_author'] ) . '" type="text" placeholder="' . __( 'Name', 'mies_txtd' ) . '..." size="30" ' . $aria_req . ' /></p>',
			'email'  => '<p class="comment-form-email"><label for="email" class="show-on-ie8">' . __( 'Email', 'mies_txtd' ) . '</label><input id="email" name="email" value="' . esc_attr(  $commenter['comment_author_email'] ) . '" size="30" type="text" placeholder="' . __( 'your@email.com', 'mies_txtd' ) . '..." ' . $aria_req . ' /></p>'
		) ),
		'id_submit'            => 'comment-submit',
		'label_submit'         => __( 'Submit', 'mies_txtd' ),
		// redefine your own textarea (the comment body)
		'comment_field'        => '<p class="comment-form-comment"><label for="comment" class="show-on-ie8">' . __( 'Comment', 'mies_txtd' ) . '</label><textarea id="comment" name="comment" cols="45" rows="8" aria-required="true" placeholder="' . __( 'Your thoughts..', 'mies_txtd' ) . '"></textarea></p>'
	);
} else {
	$comments_args = array(
		// change the title of send button
		'title_reply'          => __( 'Leave a Comment', 'mies_txtd' ),
		// remove "Text or HTML to be displayed after the set of comment fields"
		'comment_notes_before' => '',
		'comment_notes_after'  => '',
		'fields'               => apply_filters( 'comment_form_default_fields', array(
			'author' => '<p class="comment-form-author"><label for="author" class="show-on-ie8">' . __( 'Name', 'mies_txtd' ) . '</label><input id="author" name="author" value="' . esc_attr( $commenter['comment_author'] ) . '" type="text" placeholder="' . __( 'Name', 'mies_txtd' ) . '..." size="30" ' . $aria_req . ' /></p><!--',
			'email'  => '--><p class="comment-form-email"><label for="name" class="show-on-ie8">' . __( 'Email', 'mies_txtd' ) . '</label><input id="email" name="email" value="' . esc_attr(  $commenter['comment_author_email'] ) . '" size="30" type="text" placeholder="' . __( 'your@email.com', 'mies_txtd' ) . '..." ' . $aria_req . ' /></p><!--',
			'url'    => '--><p class="comment-form-url"><label for="url" class="show-on-ie8">' . __( 'Url', 'mies_txtd' ) . '</label><input id="url" name="url" value="' . esc_attr( $commenter['comment_author_url'] ) . '" size="30" placeholder="' . __( 'Website', 'mies_txtd' ) . '..." type="text"></p>'
		) ),
		'id_submit'            => 'comment-submit',
		'label_submit'         => __( 'Submit', 'mies_txtd' ),
		// redefine your own textarea (the comment body)
		'comment_field'        => '<p class="comment-form-comment"><label for="comment" class="show-on-ie8">' . __( 'Comment', 'mies_txtd' ) . '</label><textarea id="comment" name="comment" cols="45" rows="8" aria-required="true" placeholder="' . __( 'Your thoughts..', 'mies_txtd' ) . '"></textarea></p>'
	);
}

//if we have no comments than we don't a second title, one is enough
if ( ! have_comments() ) {
	$comments_args['title_reply'] = '';
}

echo '<div class="form-connected">';
comment_form( $comments_args );
echo '</div>';