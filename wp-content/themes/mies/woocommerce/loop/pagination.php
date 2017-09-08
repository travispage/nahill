<?php
/**
 * Pagination - Show numbered pagination for catalog pages.
 *
 * @author        WooThemes
 * @package    WooCommerce/Templates
 * @version     2.2.2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

global $wp_query;

if ( $wp_query->max_num_pages <= 1 ) {
	return;
}
?>
<nav class="product-archive-pagination">
	<?php echo wpgrade::pagination( $wp_query ); ?>
</nav>
