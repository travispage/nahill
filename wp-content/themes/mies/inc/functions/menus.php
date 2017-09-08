<?php

/*
 * Register custom menus.
 * This works on 3.1+
 */
function wpgrade_register_custom_menus() {

	add_theme_support( 'menus' );
	$menus = wpgrade::confoption( 'import_nav_menu' );
	foreach ( $menus as $key => $value ) {
		register_nav_menu( $key, $value );
	}
}

add_action( "after_setup_theme", "wpgrade_register_custom_menus" );


/*
 * Function for displaying The Main Header Menu
 */
function wpgrade_main_nav() {
	// test if there are menu locations to prevent errors
	$theme_locations = get_nav_menu_locations();

	$args = array(
		'theme_location' => 'main_menu',
		'menu'           => '',
		'container'      => '',
		'container_id'   => '',
		'menu_class'     => 'menu  menu--main-menu  js-main-menu',
		'menu_id'        => '',
		'fallback_cb'    => false,
		'items_wrap'     => '<ul id="%1$s" class="%2$s">%3$s</ul>',
	);

	wp_nav_menu( $args );
	//        }
}


/*
 * Function for displaying The Main Horizontal Header Menu
 */
function wpgrade_main_horizontal_nav() {
	// test if there are menu locations to prevent errors
	$theme_locations = get_nav_menu_locations();

	$args = array(
		'theme_location' => 'main_horizontal_menu',
		'menu'           => '',
		'container'      => '',
		'container_id'   => '',
		'menu_class'     => 'menu  menu--horizontal  js-horizontal-menu',
		'menu_id'        => '',
		'fallback_cb'    => false,
		'items_wrap'     => '<ul id="%1$s" class="%2$s">%3$s</ul>',
	);

	wp_nav_menu( $args );
}

/*
 * Function for displaying The Main Horizontal Header Menu
 */
function wpgrade_main_horizontal_nav_in_overlay() {
	// test if there are menu locations to prevent errors
	$theme_locations = get_nav_menu_locations();

	$args = array(
		'theme_location' => 'main_horizontal_menu',
		'menu'           => '',
		'container'      => '',
		'container_id'   => '',
		'menu_class'     => 'menu  menu--main-menu  is--horizontal-menu-in-overlay  js-main-menu',
		'menu_id'        => '',
		'fallback_cb'    => false,
		'items_wrap'     => '<ul id="%1$s" class="%2$s">%3$s</ul>',
	);

	wp_nav_menu( $args );
}

function wpgrade_please_select_a_menu() {
	echo '
		<ul class="menu  menu--main-menu  js-main-menu">
			<li class="placeholder"><a href="' . admin_url( 'nav-menus.php?action=locations' ) . '">' . __( 'Please select a menu in this location', 'mies_txtd' ) . '</a></li>
		</ul>';
}

function wpgrade_remove_parent_classes($class) {
	// check for current page classes, return false if they exist.
	return ($class == 'current_page_item' || $class == 'current_page_parent' || $class == 'current_page_ancestor'  || $class == 'current-menu-item') ? FALSE : TRUE;
}

function wpgrade_callback_add_current_nav_class_for_portfolio($classes, $item ) {
	// Necessary, otherwise we can't get current post ID
	global $post;

	//get the Portfolio url just to know when the menu item is the same
	$portfolio_url = mies_get_portfolio_page_link();

	//test if the current post is of type portfolio and that the menu item has the link to the portfolio archive
	if (isset($post->post_type) && $post->post_type == wpgrade::$shortname . '_portfolio') {
		$classes = array_filter($classes, "wpgrade_remove_parent_classes");
		if ($item->url == $portfolio_url) {
			$classes[] = 'current_page_parent current-menu-item';
		}
		else if ($item->url == get_permalink ($post->id)) {
			$classes[] = 'current-menu-item';
		}
	}

	// return the corrected set of classes to be added to the menu item
	return $classes;
}

// make sure that the portfolio menu items have the correct classes when on single projects
add_action('nav_menu_css_class', 'wpgrade_callback_add_current_nav_class_for_portfolio', 10, 2);

function wpgrade_callback_add_current_nav_class_for_blog($classes, $item ) {
	// Necessary, otherwise we can't get current post ID
	global $post;

	//get the Portfolio url just to know when the menu item is the same
	$blog_url = mies_get_blog_page_link();

	//test if the current post is of type post and that the menu item has the link to the blog archive
	if (isset($post->post_type) && $post->post_type == 'post' ) {
		$classes = array_filter($classes, "wpgrade_remove_parent_classes");
		if ($item->url == $blog_url) {
			$classes[] = 'current_page_parent current-menu-item';
		}
		else if ($item->url == get_permalink ($post->id)) {
			$classes[] = 'current-menu-item';
		}
	}

	// return the corrected set of classes to be added to the menu item
	return $classes;
}

// make sure that the portfolio menu items have the correct classes when on single projects
add_action('nav_menu_css_class', 'wpgrade_callback_add_current_nav_class_for_blog', 10, 2);