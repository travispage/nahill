<?php
/**
 * Custom functions that act independently of the theme templates.
 *
 * Eventually, some of the functionality here could be replaced by core features.
 *
 * @package Kunst
 */

if ( ! function_exists( 'mies_get_option' ) ) {
	/**
	 * Get option from the database
	 *
	 * @param string
	 *
	 * @return mixed
	 */
	function mies_get_option( $option, $default = null ) {
		global $pixcustomify_plugin;

		// if there is set an key in url force that value
		if ( isset( $_GET[ $option ] ) && ! empty( $option ) ) {

			return $_GET[ $option ];

		} elseif ( $pixcustomify_plugin !== null ) {

			$customify_value = $pixcustomify_plugin->get_option( $option, $default );

			return $customify_value;
		}

		return $default;
	} //end function
} // end if mies_get_option exists
