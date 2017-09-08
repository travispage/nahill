<?php
/**
 * The template for the search form.
 *
 * @package Mies
 * @since   Mies 1.0
 */
?>
<form class="form-search" method="get" action="<?php echo home_url( '/' ); ?>" role="search">
	<input class="search-query" type="text" name="s" id="s" placeholder="<?php _e( 'Search...', 'mies_txtd' ) ?>" autocomplete="off" value="<?php the_search_query(); ?>"/>
	<button class="search-submit btn" id="searchsubmit"><?php _e('Search', 'mies_txtd') ?></button>
</form>