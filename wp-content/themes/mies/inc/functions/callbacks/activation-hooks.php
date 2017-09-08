<?php
/**
 * Theme activation hook
 */
function wpgrade_callback_geting_active() {

	/**
	 * Get the config from /config/activation.php
	 */
	$activation_settings = array();
	if ( file_exists( wpgrade::themepath() . 'config/activation' . EXT ) ) {
		$activation_settings = include wpgrade::themepath() . 'config/activation' . EXT;
	}

	/**
	 * Make sure pixlikes has the right settings
	 */
	$current_pixlikes_settings = get_option( 'pixlikes_settings');
	if ( isset( $activation_settings['pixlikes-settings'] ) && ! isset( $current_pixlikes_settings['first_activation'] ) ) {
		$pixlikes_settings = $activation_settings['pixlikes-settings'];
		update_option( 'pixlikes_settings', $pixlikes_settings );
	}

	/**
	 * Init pixfields with the right settings
	 */
	$current_pixfields_settings = get_option( 'pixfields_settings');
	if ( isset( $activation_settings['pixfields-settings'] ) && ! isset( $current_pixfields_settings['first_activation'] ) ) {
		$pixfields_settings = $activation_settings['pixfields-settings'];
		update_option( 'pixfields_settings', $pixfields_settings );

		$current_pixfields = get_option( 'pixfields_list');
		if ( isset( $activation_settings['pixfields-list'] ) && empty( $current_pixfields ) ) {
			update_option( 'pixfields_list', $activation_settings['pixfields-list'] );
		}
	}

	/**
	 * Init the Portfolio Thumbnail sizes
	 * 400px wide, no crop
	 */
	if ( false === get_option('portfolio_thumbnail_size_w') ) {
		update_option('portfolio_thumbnail_size_w', 400);
	}

	if ( false === get_option('portfolio_thumbnail_crop') ) {
		update_option('portfolio_thumbnail_crop', '');
	}

	/**
	 * Create custom post types, taxonomies and metaboxes
	 * These will be taken by pixtypes plugin and converted in their own options
	 */
	if ( isset( $activation_settings['pixtypes-settings'] ) ) {

		$pixtypes_conf_settings = $activation_settings['pixtypes-settings'];

		$types_options = get_option( 'pixtypes_themes_settings' );
		if ( empty( $types_options ) ) {
			$types_options = array();
		}

		$theme_key                   = wpgrade::shortname() . '_pixtypes_theme';
		$types_options[ $theme_key ] = $pixtypes_conf_settings;

		update_option( 'pixtypes_themes_settings', $types_options );
	}

	/**
	 * http://wordpress.stackexchange.com/questions/36152/flush-rewrite-rules-not-working-on-plugin-deactivation-invalid-urls-not-showing
	 */
	delete_option( 'rewrite_rules' );
}

add_action( 'after_switch_theme', 'wpgrade_callback_geting_active' );
