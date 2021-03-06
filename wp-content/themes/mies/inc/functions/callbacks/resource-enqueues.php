<?php

/**
 * Invoked in wpgrade-config.php
 */
function wpgrade_callback_addthis() {

	//lets determine if we need the addthis script at all
	if ( ! ( wpgrade::option( 'project_menu_share_label' ) == '' ) &&
	     ( is_single() || ( is_page() && ( get_post_meta( get_the_ID(), wpgrade::prefix() . 'page_enabled_social_share', true ) || get_post_meta( get_the_ID(), wpgrade::prefix() . 'gmap_enabled_social_share', true ) ) ) )
	) {
		wp_enqueue_script( 'addthis-api' );

		//here we will configure the AddThis sharing globally
		get_template_part( 'templates/core/addthis-js-config' );
	}
}

/**
 * Invoked in wpgrade-config.php
 */
function wpgrade_callback_thread_comments_scripts() {
	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}

/**
 * This callback is invoked by wpgrade_callback_themesetup.
 */
function wpgrade_callback_enqueue_dynamic_css_mies() {

	if ( wpgrade::option( 'inject_custom_css' ) == 'file' ) {
		wp_enqueue_style( 'wpgrade-custom-style', get_template_directory_uri() . '/assets/css/custom.css' );
	}
}

/**
 * Enqueue the 404 page css
 */
function wpgrade_callback_enqueue_404_css() {
	if (is_404()) {
		wp_enqueue_style( wpgrade::shortname() . '-404-style', get_template_directory_uri() . '/assets/css/pages/404.css', array(), time(), 'all' );
	}
}


/**
 * Enqueue our custom css on admin panel
 */
add_action( 'redux/page/' . wpgrade::shortname() . '_options/enqueue', 'wpgrade_add_admin_custom_style', 0 );
function wpgrade_add_admin_custom_style() {

	//wp_enqueue_style( wpgrade::shortname() . '-redux-theme-custom', wpgrade::resourceuri( 'css/admin/admin-panel.css' ), array(), time(), 'all' );

	wp_enqueue_script( 'wp-ajax-response' );

	//wp_enqueue_script( wpgrade::shortname() . '-redux-theme-custom', wpgrade::resourceuri( 'js/admin/admin-panel.js' ), array(), time(), true );
}

/*
 * Enqueue some custom JS in the admin area for various small tasks
 */
add_action('admin_enqueue_scripts','wpgrade_add_admin_general_script');
function wpgrade_add_admin_general_script( $hook ){
	wp_enqueue_script(
		'wpgrade_admin_general_script', //unique handle
		get_template_directory_uri().'/assets/js/admin/admin-general.js', //location
		array('jquery')  //dependencies
	);

	wp_enqueue_style( wpgrade::shortname() . '-admin-general', wpgrade::resourceuri( 'css/admin/admin-general.css' ), array(), time(), 'all' );

	global $post_type;

	if( $post_type == wpgrade::$shortname . '_portfolio' ) {
		wp_enqueue_script(
			'wpgrade_admin_portfolio_script', //unique handle
			get_template_directory_uri().'/assets/js/admin/admin-portfolio.js', //location
			array('jquery')  //dependencies
		);
	}

	if( $post_type == 'page' ) {
		wp_enqueue_script(
			'wpgrade_admin_pages_script', //unique handle
			get_template_directory_uri().'/assets/js/admin/admin-pages.js', //location
			array('jquery')  //dependencies
		);
	}
}
