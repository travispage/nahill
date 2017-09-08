<?php
/**
 * Product Loop Start
 *
 * @author 		WooThemes
 * @package 	WooCommerce/Templates
 * @version     2.0.0
 */

$large_no               = wpgrade::option('projects_grid_large_columns');
$medium_no              = wpgrade::option('projects_grid_medium_columns');
$small_no               = wpgrade::option('projects_grid_small_columns');
$products_columns_class     = 'masonry-large-col-' . $large_no . ' masonry-medium-col-' . $medium_no . ' masonry-small-col-' . $small_no;

?>
<div class="masonry  masonry--shop  <?php echo $products_columns_class; ?>">