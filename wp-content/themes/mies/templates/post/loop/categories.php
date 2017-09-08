<?php
/**
 * The template for the displaying the post categories.
 *
 * @package Mies
 * @since   Mies 1.0
 */

$categories = get_categories();
if ( !is_wp_error( $categories ) ) : ?>
	<ul class="archive-categories  menu  menu--inline">
		<?php
		foreach ($categories as $category):
			if ($category->category_parent == 0): ?>
			<li>
				<a href="<?php echo esc_url( get_category_link($category->term_id) ) ?>" title="<?php echo esc_attr(sprintf(__("View all posts in %s", 'mies_txtd'), $category->name)) ?>">
					<?php echo $category->cat_name; ?>
				</a>
			</li>
		<?php endif;
		endforeach; ?>
	</ul>
<?php endif;