<?php
/**
 * Show options for ordering
 *
 * @author 		WooThemes
 * @package 	WooCommerce/Templates
 * @version     2.2.0
 */

global $wp_query;

// get all product categories
$terms = get_terms('product_cat');

// if there is a category queried cache it
$current_term =	get_queried_object();

if ( !empty($terms ) /*&& wpgrade::option('display_product_filters', '0')*/ ) {
	// create a link which should link to the shop
	$all_link = get_post_type_archive_link('product');

	echo '<ul class="menu  menu--inline  filter__tags filter__tags-container  current">';
	// display the shop link first if there is one
	if ( !empty($all_link) ) {
		// also if the current_term doesn't have a term_id it means we are quering the shop and the "all categories" should be active
		echo '<li><a href="', $all_link ,'"', ( !isset( $current_term->term_id ) ) ? ' class="btn-link  selected"' : ' class="btn-link  inactive"' ,'>', __('All Products', wpgrade::textdomain() ) , '</a></li>';
	}

	// display a link for each product category
	foreach ($terms as $key => $term ) {
		$link  = get_term_link( $term, 'product_cat' );
		if ( !is_wp_error($link) ) {

			// if the current category is queried add the "active class" to the link
			$class_string = 'class="btn-link  ';
			if ( !empty($current_term->name) && $current_term->name === $term->name ) {
				$class_string .= 'selected"';
			} else $class_string .= 'inactive"';

			echo '<li><a href="', $link, '"', $class_string,'>', $term->name ,'</a></li>';
		}
	}
	echo '</ul><br/>';
} // close if !empty($terms)

// for the moment we do not need an order selector
return;