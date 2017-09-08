<?php
/**
 * Content wrappers
 *
 * @author 		WooThemes
 * @package 	WooCommerce/Templates
 * @version     1.6.4
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

if ( is_shop() || is_product_category() || is_cart() || is_checkout() || is_checkout_pay_page() || is_account_page() || is_order_received_page() ) {

	$shop_page_id = wc_get_page_id( 'shop' );

	if ( ! empty( $shop_page_id ) && $shop_page_id != 0 ) {
		global $post;
		$post = get_post( $shop_page_id );

		setup_postdata( $post );

	}

	get_template_part('templates/hero');

	wp_reset_postdata();
}
?>
	<div class="content  content--portfolio-archive">