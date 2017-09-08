<?php
/**
 * The template for the portfolio filter links
 *
 * @package Mies
 * @since   Mies 1.0
 */

global $pixfields_plugin, $post;

$portfolio_categories = get_terms( wpgrade::$shortname . '_portfolio_categories' );
$post_type = wpgrade::$shortname . '_portfolio';
$pixfields_keys = array();
$pixfields_values = array();

if ( function_exists('pixfields_get_filterable_metakeys') ) {
	$pixfields_keys = pixfields_get_filterable_metakeys( wpgrade::$shortname . '_portfolio' );
}

if ( ! empty( $pixfields_keys ) || ! empty( $portfolio_categories ) ): ?>

	<div class="pixcode--tabs">

		<div class="filter  align-center">
			<span class="filter__label  h3"><?php _e( 'Filter by', 'mies_txtd' ); ?></span>
			<ul class="filter__fields  tabs__nav  archive-categories  menu  menu--inline  inline-block  mt0">
				<?php

				$currentClass = 'current';

				if ( wpgrade::option( 'portfolio_allow_filter_by_category' ) && ! empty( $portfolio_categories ) ) { ?>
					<li>
						<a class="<?php echo esc_attr( $currentClass ); ?>" href="#pixfield-category" data-toggle="tab">
							<?php _e('Category', 'mies_txtd' ); ?>
						</a>
					</li>
					<?php
					$currentClass = '';
				}

				if ( ! empty( $pixfields_keys ) ){
					foreach ( $pixfields_keys as $key => $label ) {

						// get all the distinct values for this keys
						$values = $pixfields_plugin->get_meta_values( 'pixfield_' . $key, $post_type );

						// do not display an empty field
						if ( ! $values ) continue;

						$values = array_values( $values );
						// store the values in a global array
						$pixfields_values[$key] = $values; ?>
						<li>
							<a class="<?php echo esc_attr( $currentClass ); ?>" href="<?php mies::display_pixfield_string($key, $prepend = '#pixfield-'); ?>" data-toggle="tab"><?php echo $label; ?></a>
						</li>
						<?php
						$currentClass = '';
					}
				} ?>
			</ul><!-- .filter__fields -->
		</div><!-- .filter -->

		<div class="filter__tags-container  align-center  relative">
			<div class="tabs__content  mb" id="filters">
				<?php
				$currentClass = 'current';

				if ( wpgrade::option( 'portfolio_allow_filter_by_category' )  && ! empty( $portfolio_categories ) ) { ?>
					<ul id="pixfield-category" class="filter__tags <?php echo esc_attr( $currentClass ); ?> menu  menu--inline category">
						<li><button class="btn-link" data-filter="*"><?php _e( 'All', 'mies_txtd' );?></button></li>
						<?php foreach ( $portfolio_categories as $cat) { ?>
							<li><button class="btn-link" data-filter="<?php mies::display_pixfield_string($cat->slug, '.cat-'); // echo esc_attr( '.cat-' . $cat->slug ) ?>"><?php echo $cat->name; ?></button></li>
						<?php } ?>
					</ul>
					<?php
					$currentClass = '';
				}

				if ( ! empty( $pixfields_values ) ) {
					foreach ( $pixfields_values as $pixfield => $values ) {
						if ( empty( $values ) ) {
							continue;
						} ?>
						<ul id="<?php echo esc_attr( 'pixfield-' . $pixfield ) ?>" class="filter__tags <?php echo esc_attr( $currentClass ) ?> menu  menu--inline <?php echo esc_attr( $pixfield ) ?>">
							<li><button class="btn-link" data-filter="*"><?php _e( 'All', 'mies_txtd' );?></button></li>
							<?php foreach ( $values as $value) { ?>
								<li><button class="btn-link" data-filter=".<?php mies::display_pixfield_string( $value, 'pixfield_value-' . $pixfield . '-' ); ?>"><?php echo $value; ?></button></li>
							<?php } ?>
						</ul><!-- .filter__tags -->
						<?php
						$currentClass = '';
					}
				} ?>
			</div><!-- .tabs__content #filter -->
		</div><!-- .filter__tags-container -->

	</div><!-- .pixcode--tabs -->
<?php endif;