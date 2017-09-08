<?php
/**
 * This file holds the general configuration of the theme
 * @package Mies
 * @since   Mies 1.0
 */

return array(
	# Commented values are optional properties. Many properties are
	# automatically deduced from others (eg. textdomain is deduced from
	# name, unless a custom value is provided)
	# ---------------------------------------------------------------------

	'name'                         => 'Mies',
	'shortname'                    => 'mies',
	'prefix'                       => '_mies_',
	'textdomain'                   => 'mies_txtd',
	'language-path'                => 'languages',
	'update-notifier'              => array(
		'xml-source'       => REQUEST_PROTOCOL . '//pixelgrade.com/updates/',
		//		'xml-file' => 'mies.xml',
		'cache-interval'   => 10800, # 3 hours
		'update-page-name' => 'theme-update-notifier',
	),
	'theme-adminpanel-path'        => 'config/admin-panel',
	// additional file includes (classes, functions, etc), files are loaded
	// via wpgrade::require_all and entries should be directories; if the
	// path does not exist it is automatically ignored
	'include-paths'                => array(
		'inc/classes',
		'inc/functions',
	),
	// same as include-paths only instead of files you specify files, to be
	// used with vendor dependencies to avoid multiple include/requires
	// happening due to the files in question adding subfiles relative to
	// their directory (also avoids problems with php configuration files)
	'include-files'                => array(
		'config/customify.php',
		// main theme class
		'inc/required-plugins/required-plugins.php',
	),
	// the path where overwrites on the core partials are stored, any files
	// placed in the partial overwrites will be loaded instead of the core
	// equivalent view files
	'core-partials-overwrite-path' => 'templates/core',
	// the directory where css and other media files are located; used by
	// wpgrade::resourceuri; utility allows for easy migration of files to
	// new structures
	'resource-path'                => '/assets',
	// use theme-options to add any non-customizable options with out going
	// though any of the backend code; all options added here are available
	// though the WPGradeOptions driver manager. ie. the  wpgrade::option
	// shorthand. Support for backend customization may be added at any
	// time later with out requiring any alterations; the options you add
	// here will have the lowest priority
	'theme-options'                => array( // empty
	),
	// Usage: body_class(wpgrade::body_class()) in header-classic.php
	// Syntax: class => callback or boolean; eg. 'myclass' => true,
	// 'myclass' => false, 'myclass' => 'class_check_function'. All
	// callbacks are executed once if more classes refer the same callback.
	'body-classes'                 => array( // empty
	),
	// overwrites the inline css class to allow for full control; you may
	// also leave this null, which will invoke an internal handler and work
	// with the core partial inline-custom-css
	'custom-css-handler'           => null,
	// filter functions will recieve content as a parameter and must return
	// content; all functions are ordered by priority and executed from
	// lowest to highest. If a filter is assigned false as a priority it
	// will be ignored in processing
	'content-filters'              => array(
		'default' => array(
			'wpgrade_callback_theme_general_filters' => 100,
			'wpgrade_callback_shortcode_filters'     => 200,
			'wpgrade_callback_attachment_filters'    => 300,
			'wpgrade_callback_paragraph_filters'     => 400,
		),
	),
	'post-formats'                 => array( // empty - see functions.php
	),
	'shortcodes'                   => array(
		'Columns',
		'Button',
		'Icon',
		'Tabs',
		'Separator',
		'Slider',
		'PixFields',
//		'Heading',
	),
	// importer
	'import_homepage_name' => 'Frontpage',
	'import_blogpage_name' => 'Journal',

	// decide which menus should be imported
	'import_nav_menu'              => array(
		'main_menu'            => 'Main Menu',
		'main_horizontal_menu' => 'Main Horizontal Menu'
	),
	'resources'                    => array(
		// script declarations; scripts must be enqueue'ed to appear
		'register'                => array(
			'head-scripts'   => array(
				'modernizr'      => array(
					'path'    => get_template_directory_uri() . '/assets/js/modernizr.min.js',
					'require' => array(
						'jquery'
					),
				),
				'picturefill'      => array(
					'path'    => get_template_directory_uri() . '/assets/js/picturefill.min.js',
					'require' => array(
					),
				),
			),
			'footer-scripts' => array(
				'mies-vendor-scripts-1' => array(
					'path'    => REQUEST_PROTOCOL . '//pxgcdn.com/js/rs/9.5.7/index.js',
					'require' => array(
						'jquery'
					),
				),
				'mies-vendor-scripts-2' => array(
					'path'    => REQUEST_PROTOCOL . '//cdnjs.cloudflare.com/ajax/libs/gsap/1.18.5/jquery.gsap.min.js',
					'require' => array(
						'jquery'
					),
				),
				'mies-vendor-scripts-3' => array(
					'path'    => REQUEST_PROTOCOL . '//cdnjs.cloudflare.com/ajax/libs/gsap/1.18.5/TweenMax.min.js',
					'require' => array(
						'jquery'
					),
				),
				'mies-vendor-scripts-4' => array(
					'path'    => REQUEST_PROTOCOL . '//cdnjs.cloudflare.com/ajax/libs/gsap/1.18.5/plugins/ScrollToPlugin.min.js',
					'require' => array(
						'jquery'
					),
				),
				'wpgrade-main-scripts' => array(
					'path'    => get_template_directory_uri() . '/assets/js/main.js',
					'require' => array(
						'jquery',
						'mies-vendor-scripts-1',
						'mies-vendor-scripts-2',
						'mies-vendor-scripts-3',
						'mies-vendor-scripts-4',
					),
					'cache_bust' => '1.7.5',
				),
				'addthis-api'          => array(
					'path'    => REQUEST_PROTOCOL . '//s7.addthis.com/js/250/addthis_widget.js#async=1',
					'require' => array(
						'jquery'
					),
				),
				'google-maps-api'      => array(
					'path'    => REQUEST_PROTOCOL . '//maps.google.com/maps/api/js?sensor=false&amp;language=en',
					'require' => array(
						'jquery'
					),
				),
			),
			'styles'         => array(
				'google-webfonts'    => array(
					'path' => REQUEST_PROTOCOL . '//fonts.googleapis.com/css?family=Open+Sans:,300,400,600,700,800|Lato:400,700,900',
				),
				'wpgrade-main-style' => array(
					'path'       => get_template_directory_uri() . '/style.css',
					'cache_bust' => '1.7.5',
				),
			)

		), # end register

		// auto invoke scripts previously registered on theme setup
		'auto-enqueue-scripts'    => array(
			'wpgrade-main-scripts',
		),
		// enqueue's script and localizes
		'auto-localize-scripts'   => array(
			'wpgrade-main-scripts' => array(
				'ajaxurl'    => admin_url( 'admin-ajax.php' ),
				'objectl10n' => array(
					'tPrev'             => __( 'Previous (Left arrow key)', 'mies_txtd' ),
					'tNext'             => __( 'Next (Right arrow key)', 'mies_txtd' ),
					'tCounter'          => __( 'of', 'mies_txtd' ),
					'infscrLoadingText' => "",
					'infscrReachedEnd'  => "",
				),
			),
		),
		// calls function to perform extra enqueue's on theme setup
		// handlers should be placed in theme's functions.php
		'script-enqueue-handlers' => array(
			'thread-comments'  => 'wpgrade_callback_thread_comments_scripts',
			'addthis'          => 'wpgrade_callback_addthis',
		),
		// auto invoke styles previously registered on theme setup
		'auto-enqueue-styles'     => array(
			'wpgrade-main-style',
		),
		// calls function to perform extra enqueue's on theme setup
		// handlers should be placed in theme's functions.php
		'style-enqueue-handlers'  => array(
			'dynamic-css' => array(
				'handler'  => 'wpgrade_callback_enqueue_dynamic_css_mies',
				'priority' => 9999,
			),
//			'rtl-support' => 'wpgrade_callback_enqueue_rtl_support',
			'404-page'    => 'wpgrade_callback_enqueue_404_css',
		),

	), # end resource

	// defaults for pagination; you may customize the values at any time
	// when invoking a pagination formatter, the following defaults will be
	// in effect if not overwritten
	'pagination'                   => array(
		// formatter to process the links; null if none needed
		// the formatter should return a string and accept links and
		// the resulting configuration
		'formatter'     => 'wpgrade_callback_pagination_formatter',
		// show prev/next links?
		'prev_next'     => true,
		// pagination text
		'prev_text'     => __( 'Prev', 'mies_txtd' ),
		'next_text'     => __( 'Next', 'mies_txtd' ),
		// are the terms used for paging relative to the sort order?
		// ie. older/newer instead of sorting agnostic previous/next
		'sorted_paging' => false,
		// the order of the posts (asc or desc); if asc is passed and
		// sorted_paging is true the values of prev_text and next_text
		// will be flipped
		'order'         => 'desc',
		// show all pages? (ie. no cutoffs)
		'show_all'      => false,
		// how many numbers on either the start and the end list edges
		'end_size'      => 1,
		// how many numbers to either side of current page
		// not including current page
		'mid_size'      => 2,
		// an array of query args to add
		'add_args'      => false,
		// a string to append to each link
		'add_fragment'  => null,
	),
	// allows you to create special pagination instances by providing a key
	// to wpgrade::pagination; the settings defined in the key will be used
	// to overwrite the defaults defined in pagination above; if the key
	// is not avilable the pagination system will ignore the request so you
	// can use the template names while developing and customize at any
	// time later
	'pagination-targets'           => array(
		// the following is an example
		//				'gallery' => array
		//					(
		//						'formatter' => null,
		//						'prev_text' => __('Prev Images', 'mies_txtd'),
		//						'next_text' => __('Next Images', 'mies_txtd'),
		//					)
	),

	// setup here your thumbnails sizes
	'thumbnails_sizes'             => array(

		/**
		 * MAXIMUM SIZE
		 * Maximum Full Image Size
		 * - Sliders
		 * - Lightbox
		 */
		'full-size' => array(
			'width' => 2048
		),
		/**
		 * LARGE SIZE
		 * - Single post without sidebar
		 */
		'large-size'     => array(
			'width' => 1200
		),
		/**
		 * MEDIUM SIZE
		 * - Tablet Sliders
		 * - Archive Featured Image
		 * - Single Featured Image
		 */
		'medium-size'    => array(
			'width' => 800,
		),
		/**
		 * SMALL SIZE
		 * - Masonry Grid
		 * - Mobile Sliders
		 */
		'small-size'     => array(
			'width' => 385,
		),
		/**
		 * SMALL SIZE HARD CROPPED
		 * - 3 and 4 columns galleries
		 */
		'small-size-hard'     => array(
			'width' => 385,
			'height' => 385,
			'hard_crop' => true
		),

	),
	// old
	'google_fonts_keys' => array(
		'google_titles_font',
		'google_menu_font',
		'google_body_font'
	),

); # end theme configuration