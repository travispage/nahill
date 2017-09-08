<?php
/*
 * Register Widgets areas.
 */

function wpgrade_register_sidebars() {

	register_sidebar( array(
		'id'            => 'sidebar-footer',
		'name'          => __( 'Footer Area', 'mies_txtd' ),
		'description'   => __( 'Widgets that appear in footer area.', 'mies_txtd' ),
		'before_title'  => '<h3 class="widget__title widget--menu__title">',
		'after_title'   => '</h3>',
		'before_widget' => '<div id="%1$s" class="widget grid__item %2$s">',
		'after_widget'  => '</div>',
	) );

	register_sidebar( array(
		'id'            => 'sidebar-single-post',
		'name'          => __( 'Single Post Sidebar', 'mies_txtd' ),
		'description'   => __( 'Widgets that appear in blog single post sidebar.', 'mies_txtd' ),
		'before_title'  => '<h4 class="widget__title widget--sidebar-blog__title">',
		'after_title'   => '</h4>',
		'before_widget' => '<div id="%1$s" class="widget widget--sidebar-blog %2$s">',
		'after_widget'  => '</div>',
	) );

	register_sidebar( array(
		'id'            => 'sidebar-before-overlay',
		'name'          => __( 'Overlay – Before Menu', 'mies_txtd' ),
		'description'   => __( 'Widgets shown above the menu in the main menu overlay.', 'mies_txtd' ),
		'before_title'  => '<h3 class="widget__title widget--menu__title">',
		'after_title'   => '</h3>',
		'before_widget' => '<div id="%1$s" class="widget %2$s">',
		'after_widget'  => '</div>',
	) );

	register_sidebar( array(
		'id'            => 'sidebar-after-overlay',
		'name'          => __( 'Overlay – After Menu', 'mies_txtd' ),
		'description'   => __( 'Widgets shown bellow the menu in the main menu overlay.', 'mies_txtd' ),
		'before_title'  => '<h3 class="widget__title widget--menu__title">',
		'after_title'   => '</h3>',
		'before_widget' => '<div id="%1$s" class="widget %2$s">',
		'after_widget'  => '</div>',
	) );

	//allow the Text Widgets to handle shortcodes
	add_filter( 'widget_text', 'shortcode_unautop');
	add_filter('widget_text', 'do_shortcode');
}

add_action( 'widgets_init', 'wpgrade_register_sidebars' );

add_action( 'customize_register', 'wpgrade_remove_widgets_area_from_customizer' );
function wpgrade_remove_widgets_area_from_customizer () {

	global $wp_customize;
	// remove these widgets areas from customizer
	$wp_customize->remove_section('sidebar-widgets-sidebar-main');
	$wp_customize->remove_section('sidebar-widgets-sidebar-single-post');
	$wp_customize->remove_section('sidebar-widgets-sidebar-footer');
	$wp_customize->remove_section('sidebar-widgets-sidebar-before-overlay');
	$wp_customize->remove_section('sidebar-widgets-sidebar-after-overlay');

}