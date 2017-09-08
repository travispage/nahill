<?php
$this_wp_version = get_bloginfo('version');
$this_wp_version = explode( '.', $this_wp_version );
$is_wp43 = false;
if ( (int) $this_wp_version[1] > 2 ) {
	$is_wp43 = true;
}

$sections = array();
$debug    = '';

if ( isset( $_GET['debug_mod'] ) && $_GET['debug_mod'] === 'true' ) {
	$debug = 'debug_on';
}

// General Options
// ------------------------------------------------------------------------

$sections[] = array(
	'icon'       => 'icon-database-1',
	'icon_class' => '',
	'title'      => __( 'General', 'mies_txtd' ),
	'desc'       => '<p class="description">' . __( 'General settings contains options that have a site-wide reach like defining your site dynamics or branding (including logo and other icons).', 'mies_txtd' ) . '</p>',
	'fields'     => array(
		array(
			'id'       => 'use_smooth_scroll',
			'type'     => 'switch',
			'title'    => __( 'Smooth Scrolling', 'mies_txtd' ),
			'subtitle' => __( 'Enable / Disable smooth scrolling.', 'mies_txtd' ),
			'default'  => true,
	),
		array(
			'id'   => 'branding-header-90821',
			'desc' => '<h3>' . __( 'Branding', 'mies_txtd' ) . '</h3>',
			'type' => 'info'
		),
		array(
			'id'       => 'main_logo_dark',
			'type'     => 'media',
			'title'    => __( 'Main Logo (Dark)', 'mies_txtd' ),
			'subtitle' => __( 'If there is no image uploaded, plain text will be used instead (generated from the site\'s name).', 'mies_txtd' ),
		),
		array(
			'id'    => 'main_logo_light',
			'type'  => 'media',
			'title' => __( 'Logo Inversed (Light)', 'mies_txtd' ),
			'subtitle' => __( 'Upload an inverted color logo.', 'mies_txtd' )
		),
		array(
			'id'       => 'use_retina_logo',
			'type'     => 'switch',
			'title'    => __( '2x Retina Logo', 'mies_txtd' ),
			'subtitle' => __( 'To be Retina-ready you need to add a 2x size logo image.', 'mies_txtd' ),
			'default'  => false,
		),
		array(
			'id'       => 'retina_main_logo_dark',
			'type'     => 'media',
			'class'    => 'js-class-hook image--small',
			'title'    => __( '[Retina] Main Logo', 'mies_txtd' ),
			'required' => array( 'use_retina_logo', 'equals', 1 )
		),
		array(
			'id'       => 'retina_main_logo_light',
			'type'     => 'media',
			'class'    => 'js-class-hook image--small',
			'title'    => __( '[Retina] Logo Inversed', 'mies_txtd' ),
			'required' => array( 'use_retina_logo', 'equals', 1 )
		),
		array(
			'id'       => 'favicon',
			'type'     => 'media',
			'class'    => 'js-class-hook image--small',
			'title'    => __( 'Favicon', 'mies_txtd' ),
			'subtitle' => __( 'Upload a 16 x 16px image that will be used as a favicon.', 'mies_txtd' ),
		),
		array(
			'id'       => 'apple_touch_icon',
			'type'     => 'media',
			'class'    => 'js-class-hook image--small',
			'title'    => __( 'Apple Touch Icon', 'mies_txtd' ),
			'subtitle' => __( 'You can customize the icon for the Apple touch shortcut to your website. The size of this icon must be 77x77px.', 'mies_txtd' )
		),
		array(
			'id'       => 'metro_icon',
			'type'     => 'media',
			'class'    => 'js-class-hook image--small',
			'title'    => __( 'Metro Icon', 'mies_txtd' ),
			'subtitle' => __( 'The size of this icon must be 144x144px.', 'mies_txtd' )
		),
	)
);

// ------------------------------------------------------------------------
// CUSTOMIZER
// ------------------------------------------------------------------------
// Legacy: for older wp versions keep the panels
if ( ! $is_wp43 ) {
	$sections[] = array(
		'icon'            => "icon-params",
		'icon_class'      => '',
		'class'           => 'has-customizer',
		'title'           => __( 'Colors', 'mies_txtd' ),
		'id'              => 'colors',
		'desc'            => '<p class="description">' . __( 'Using the color pickers you can change the colors of the most important elements. If you want to override the color of some elements you can always use Custom CSS code in Theme Options - Custom Code.', 'mies_txtd' ) . '</p>',
		'customizer_only' => true,
		'type'            => 'customizer_panel',
		'priority'        => 5,
		'fields'          => array( array('id' => 'legacy', 'title' => '', 'type' => 'info' ) )
	);
	$sections[] = array(
		'icon'            => "icon-params",
		'icon_class'      => '',
		'class'           => 'has-customizer',
		'title'           => __( 'Backgrounds', 'mies_txtd' ),
		'id'              => 'backgrounds',
		'customizer_only' => true,
		'type' => 'customizer_panel',
		'priority'        => 6,
		'fields'          => array( array('id' => 'legacy', 'title' => '', 'type' => 'info' ) )
	);
	$sections[] = array(
		'icon'            => "icon-params",
		'icon_class'      => '',
		'class'           => 'has-customizer',
		'title'           => __( 'Typography', 'mies_txtd' ),
		'id'              => 'typography',
		'customizer_only' => true,
		'type' => 'customizer_panel',
		'priority'        => 7,
		'fields'          => array( array('id' => 'legacy', 'title' => '', 'type' => 'info' ) )
	);
	$sections[] = array(
		'icon'            => "icon-params",
		'icon_class'      => '',
		'class'           => 'has-customizer',
		'title'           => __( 'Sizes and Spacing', 'mies_txtd' ),
		'id'              => 'size-and-spacing',
		'customizer_only' => true,
		'type'            => 'customizer_panel',
		'priority'        => 8,
		'fields'          => array( array('id' => 'legacy', 'title' => '', 'type' => 'info' ) )
	);
	$sections[] = array(
		'icon'            => "icon-params",
		'icon_class'      => '',
		'class'           => 'has-customizer',
		'title'           => __( 'Other Options', 'mies_txtd' ),
		'id'              => 'general-options',
		'customizer_only' => true,
		'type' => 'customizer_panel',
		'priority'        => 9,
		'fields'          => array( array('id' => 'legacy', 'title' => '', 'type' => 'info' ) )
	);
}

// The link to customizer
// ------------------------------------------------------------------------
$sections[] = array(
	'icon'            => "icon-params",
	'icon_class'      => '',
	'class'           => 'has-customizer',
	'title'           => __( 'Style', 'mies_txtd' ),
	'desc'            => '<p class="description">' . __( 'The style options control the general styling of the site, like accent color and Google Web Fonts. You can choose custom fonts for various typography elements with font weight, character set, size and/or line height. You also have a live preview for your chosen fonts.', 'mies_txtd' ) . '</p>',
	'customizer_only' => false,
	'fields'          => array(
		array(
			'id'         => 'live-customizer-button' . $debug,
			'title'      => '<a href="' . admin_url( "customize.php" ) . '" class="button button-primary" id="live-customizer-button">
							' . __( 'Access the Live Customizer', 'mies_txtd' ) . '
						</a>',
			'type'       => 'info',
		),
	)
);

// Colors
// ------------------------------------------------------------------------
$sections_panel = '';
if ( ! $is_wp43 ) {
	$sections_panel = 'colors';
}
$sections[] = array(
	'icon'            => "icon-params",
	'icon_class'      => '',
	'class'           => 'has-customizer customizer-only',
	'title'           => __( 'Colors', 'mies_txtd' ),
	'type' => 'customizer_section',
	'priority'        => 5,
	'in_panel'        => $sections_panel,
	'fields'          => array(
		array(
			'id'         => 'text_color',
			'type'       => 'color',
			'title'      => __( 'Body Text Color', 'mies_txtd' ),
			'default'    => '#171617',
			'validate'   => 'color',
			'compiler'   => true,
			'customizer' => array(
				'transport' => 'postMessage',
				'css_rules' => array(
					'color'        => array(
						'selector' => "body, .title, h1, h2, h3, h4, h5, h6, .h1, .h2, .h3, .h4, blockquote cite, .h5, .separator > *, .h6,
							a.clear, .masonry__item-meta"
					),
				)
			)
		),
		array(
			'id'         => 'text_color_light',
			'type'       => 'color',
			'title'      => __( 'Light Text Color', 'mies_txtd' ),
			'default'    => '#FFFFFF',
			'validate'   => 'color',
			'compiler'   => true,
			'customizer' => array(
				'transport' => 'postMessage',
				'css_rules' => array(
					'color'        => array(
						'selector' => ".hero--light .hero__content *, .hero--light .hero__content a.meta-list__item,
										.hero--shadowed .hero__content *, .hero--shadowed .hero__content a.meta-list__item"
					),
					'background-color'        => array(
						'selector' => ".hero--light .hero__description .btn, .hero--shadowed .hero__description .btn"
					),
				)
			)
		),
		array(
			'id'         => 'body_link_color',
			'type'       => 'color',
			'title'      => __( 'Links Color', 'mies_txtd' ),
			'default'    => '#afafaf',
			'validate'   => 'color',
			'compiler'   => true,
			'customizer' => array(
				'transport' => 'postMessage',
				'css_rules' => array(
					'color'        => array(
						'selector' => "a, .wpcf7-submit, .archive-blog .read-more, .page-numbers.prev,
										.page-numbers.next, .comments_add-comment, .comment-reply-link,
										.filter__fields a, .entry-meta a, .single-product .entry-summary .woocommerce-breadcrumb a"
					),
				)
			)
		),
		array(
			'id'         => 'headings_color',
			'type'       => 'color',
			'title'      => __( 'Headings color', 'mies_txtd' ),
			'default'    => '#171617',
			'validate'   => 'color',
			'compiler'   => true,
			'customizer' => array(
				'transport' => 'postMessage',
				'css_rules' => array(
					'color' => array(
						'selector' => "h1, h2, h3, h4, h5, h6, .entry-title, .entry-header a, .tabs__nav a.current, .tabs__nav a:hover"
					),
				)
			)
		),
	)
);

// Backgrounds
// ------------------------------------------------------------------------
$sections_panel = '';
if ( ! $is_wp43 ) {
	$sections_panel = 'backgrounds';
}
$sections[] = array(
	'icon'            => "icon-params",
	'icon_class'      => '',
	'class'           => 'has-customizer customizer-only',
	'title'           => __( 'Backgrounds', 'mies_txtd' ),
	'type'            => 'customizer_section',
	'priority'        => 6,
	'in_panel'        => $sections_panel,
	'fields'          => array(

		// Menu Background
		array(
			'id'         => 'menu_background_color',
			'type'       => 'color',
			'title'      => __( 'Menu', 'mies_txtd' ),
			'default'    => '#000000',
			'validate'   => 'color',
			'compiler'   => true,
			'customizer' => array(
				'transport' => 'postMessage',
				'css_rules' => array(
					'background-color' => array(
						'selector' => ".overlay--navigation"
					),
				)
			)
		),
		array(
			'id'               => 'menu_image_pattern',
			'type'             => 'customizer_background',
			'title'            => __( '<button></button>', 'mies_txtd' ),
			'subtitle'         => __( 'Container background with image.', 'mies_txtd' ),
			'customizer'       => array(
				'transport' => 'refresh',
			),
			'preview' => false,
			'background-color' => false,
			'default'          => array(
				'media'                 => array(
					'id'        => '',
					'height'    => '',
					'width'     => '',
					'thumbnail' => '',
				),
				'background-repeat'     => '',
				'background-size'       => '',
				'background-attachment' => '',
				'background-position'   => '',
				'background-image'      => '',
			),
			'output'           => array( '.overlay--navigation' ),
		),

		// Content Background
		array(
			'id'         => 'content_background_color',
			'type'       => 'color',
			'title'      => __( 'Content', 'mies_txtd' ),
			'default'    => '#ffffff',
			'validate'   => 'color',
			'compiler'   => true,
			'customizer' => array(
				'transport' => 'postMessage',
				'css_rules' => array(
					'background-color' => array(
						'selector' => "body, .separator__text, .separator > *"
					),
				)
			)
		),
		array(
			'id'               => 'container_image_pattern',
			'type'             => 'customizer_background',
			'title'            => __( '<button></button>', 'mies_txtd' ),
			'subtitle'         => __( 'Container background with image.', 'mies_txtd' ),
			'customizer'       => array(
				'transport' => 'refresh',
			),
			'preview_media' => false,
			'background-color' => false,
			'default'          => array(
				'background-repeat'     => '',
				'background-size'       => '',
				'background-attachment' => '',
				'background-position'   => '',
				'background-image'      => '',
				'media'                 => array(
					'id'        => '',
					'height'    => '',
					'width'     => '',
					'thumbnail' => '',
				)
			),
			'output'           => array( 'body, .separator__text, .separator > *' ),
		),

		// Footer Background
		array(
			'id'         => 'backgrounds_footer',
			'type'       => 'color',
			'title'      => __( 'Footer', 'mies_txtd' ),
			'default'    => '#171617',
			'validate'   => 'color',
			'compiler'   => true,
			'customizer' => array(
				'transport' => 'postMessage',
				'css_rules' => array(
					'background-color' => array(
						'selector' => ".footer"
					),
				)
			)
		),
		array(
			'id'               => 'footer_image_pattern',
			'type'             => 'customizer_background',
			'title'            => __( '<button></button>', 'mies_txtd' ),
			'subtitle'         => __( 'Footer background image.', 'mies_txtd' ),
			'customizer'       => array(
				'transport' => 'refresh',
			),
			'preview_media' => false,
			'background-color' => false,
			'default'          => array(
				'background-repeat'     => '',
				'background-size'       => '',
				'background-attachment' => '',
				'background-position'   => '',
				'background-image'      => '',
				'media'                 => array(
					'id'        => '',
					'height'    => '',
					'width'     => '',
					'thumbnail' => '',
				)
			),
			'output'           => array( '.footer' ),
		),
	)
);

// Typography
// ------------------------------------------------------------------------
$sections_panel = '';
if ( ! $is_wp43 ) {
	$sections_panel = 'typography';
}
$sections[] = array(
	'icon'            => "icon-params",
	'icon_class'      => '',
	'class'           => 'has-customizer customizer-only',
	'title'           => __( 'Typography', 'mies_txtd' ),
	'type'            => 'customizer_section',
	'priority'        => 7,
	'in_panel'        => $sections_panel,
	'fields'          => array(

		// Menu Font
		array(
			'id'             => 'google_menu_font',
			'type'           => 'customizer_typography',
			'color'          => false,
			'font-size'      => false,
			'font-style'     => false,
			'font-weight'    => true,
			'line-height'    => false,
			'text-transform' => true,
			'letter-spacing' => false,
			'text-align'     => false,
			'all-styles'     => true,
			'preview'        => false,
			'title'          => __( '<button></button> Menu', 'mies_txtd' ),
			'subtitle'       => __( 'Font for content and widget text.', 'mies_txtd' ),
			'compiler'       => false,
			'customizer'     => array(
				'transport' => 'refresh',
			),
			'default'        => array(
				'font-family' => 'Lato',
				'font-weight' => '900',
				'google'    => true,
			),
//			 'output'         => array( '.menu--main-menu' ),
		),
		array(
			'id'            => 'menu-font-size',
			'type'          => 'customizer_slider',
			'title'         => __( 'Font Size', 'mies_txtd' ),
			'validate'      => 'numeric',
			'default'       => '100',
			'min'           => 8,
			'step'          => 1,
			'max'           => 120,
			'display_value' => 'text',
			'customizer'    => array(
				'transport' => 'postMessage',
				'css_rules' => array(
					'font-size' => array(
						'selector' => '.menu--main-menu',
						'unit'     => 'px',
					)
				)
			),
			'compiler'      => true
		),
		array(
			'id'            => 'menu-line-height',
			'type'          => 'customizer_slider',
			'title'         => __( 'Line Height', 'mies_txtd' ),
			'validate'      => 'numeric',
			'default'       => '1.7',
			'min'           => 0,
			'max'           => 3,
			'step'          => 0.1,
			'resolution'    => 0.1,
			'display_value' => 'text',
			'customizer'    => array(
				'transport' => 'postMessage',
				'css_rules' => array(
					'line-height' => array(
						'selector' => '.menu--main-menu',
						'unit'     => '',
					)
				)
			),
			'compiler'      => true
		),

		// Headings Font
		array(
			'id'             => 'google_titles_font',
			'type'           => 'customizer_typography',
			'color'          => false,
			'font-size'      => false,
			'font-style'     => false,
			'font-weight'    => true,
			'line-height'    => false,
//			'text-transform' => false,
			'letter-spacing' => false,
			'text-align'     => false,
			'all-styles'     => true,
			'preview'        => false,
			'title'          => __( '<button></button> Headings', 'mies_txtd' ),
			'subtitle'       => __( 'Font for titles and headings.', 'mies_txtd' ),
			'compiler'       => false,
			'customizer'     => array(
				'transport' => 'refresh',
			),
			'default'        => array(
				'font-family' => 'Lato',
				'google'      => true,
			),

		),

		// Body Font
		array(
			'id'             => 'google_body_font',
			'type'           => 'customizer_typography',
			'color'          => false,
			'font-size'      => false,
			'font-style'     => false,
			'font-weight'    => false,
			'line-height'    => false,
			'text-transform' => false,
			'letter-spacing' => false,
			'text-align'     => false,
			'all-styles'     => true,
			'preview'        => false,
			'title'          => __( '<button></button> Body Text', 'mies_txtd' ),
			'subtitle'       => __( 'Font for content and widget text.', 'mies_txtd' ),
			'compiler'       => false,
			'customizer'     => array(
				'transport' => 'refreh',
			),
			'default'        => array(
				'font-family' => 'Open Sans',
				'google'    => true
			),
			// 'output'         => array( 'body' ),
		),
		array(
			'id'            => 'body-font-size',
			'type'          => 'customizer_slider',
			'title'         => __( 'Font Size', 'mies_txtd' ),
			'validate'      => 'numeric',
			'default'       => '17',
			'min'           => 8,
			'step'          => 1,
			'max'           => 72,
			'display_value' => 'text',
			'customizer'    => array(
				'transport' => 'postMessage',
				'css_rules' => array(
					'font-size' => array(
						'selector' => 'body',
						'unit'     => 'px',
					)
				)
			),
			'compiler'      => true
		),
		array(
			'id'            => 'body-line-height',
			'type'          => 'customizer_slider',
			'title'         => __( 'Line Height', 'mies_txtd' ),
			'validate'      => 'numeric',
			'default'       => '1.6',
			'min'           => 0,
			'max'           => 3,
			'step'          => .1,
			'resolution'    => 0.1,
			'display_value' => 'text',
			'customizer'    => array(
				'transport' => 'postMessage',
				'css_rules' => array(
					'line-height' => array(
						'selector' => 'body',
						'unit'     => '',
					)
				)
			),
			'compiler'      => true
		),
	)
);

// Sizes and Spacing
// ------------------------------------------------------------------------
$sections_panel = '';
if ( ! $is_wp43 ) {
	$sections_panel = 'size-and-spacing';
}
$sections[] = array(
	'icon'            => "icon-params",
	'icon_class'      => '',
	'class'           => 'has-customizer customizer-only',
	'title'           => __( 'Sizes and Spacing', 'mies_txtd' ),
	'type'            => 'customizer_section',
	'priority'        => 8,
	'in_panel'        => $sections_panel,
	'fields'          => array(

		// Header
		array(
			'id'         => 'sizes_header',
			'title'      => '<label><span class="customize-control-title sizes_section"><button></button>' . __( 'Header', 'mies_txtd' ) . '</span></label>',
			'type'       => 'customizer_info',
			'customizer' => array()
		),
		array(
			'id'            => 'header_logo_height',
			'type'          => 'customizer_slider',
			'title'         => __( 'Logo Height', 'mies_txtd' ),
			'validate'      => 'numeric',
			'default'       => '22',
			'min'           => 20,
			'step'          => 1,
			'max'           => 125,
			'display_value' => 'text',
			'class'         => 'small-text',
			'customizer'    => array(
				'transport' => 'postMessage',
				'css_rules' => array(
					'max-height' => array(
						'selector' => '.site-logo--image img',
						'unit'     => 'px',
					),
					'font-size' => array(
						'selector' => '.site-title--text',
						'unit'	   => 'px'
					)
				)
			),
			'compiler'      => false
		),
		array(
			'id'            => 'header_vertical_margins',
			'type'          => 'customizer_slider',
			'title'         => __( 'Header Vertical Margins', 'mies_txtd' ),
			'validate'      => 'numeric',
			'default'       => '60',
			'min'           => 0,
			'step'          => 1,
			'max'           => 100,
			'display_value' => 'text',
			'class'         => 'small-text',
			'customizer'    => array(
				'transport' => 'postMessage',
				'css_rules' => array(
					'top'    => array(
						'selector' => '.logo, .navigation',
						'unit'     => 'px',
						'media'    => 'screen and (min-width: 1200px)'
					)
				)
			),
			'compiler'      => false
		),

		// Content
		array(
			'id'         => 'sizes_content',
			'title'      => '<label><span class="customize-control-title sizes_section"><button></button>' . __( 'Content', 'mies_txtd' ) . '</span></label>',
			'type'       => 'customizer_info',
			'customizer' => array()
		),
		array(
			'id'            => 'content_width',
			'type'          => 'customizer_slider',
			'title'         => __( 'Site Container Width', 'mies_txtd' ),
			'subtitle'      => __( 'Set the width of the container.', 'mies_txtd' ),
			'validate'      => 'numeric',
			'default'       => '1200',
			'min'           => 600,
			'step'          => 1,
			'max'           => 2700,
			'display_value' => 'text',
			'customizer'    => array(
				'transport' => 'postMessage',
				'css_rules' => array(
					'max-width' => array(
						'selector' => '.content',
						'unit'     => 'px',
					)
				)
			),
			'compiler'      => true
		),

		// Portfolio Archive Width
		array(
			'id'            => 'portfolio_archive_width',
			'type'          => 'customizer_slider',
			'title'         => __( 'Portfolio Archive Width', 'mies_txtd' ),
			'subtitle'      => __( 'Set the width of the container.', 'mies_txtd' ),
			'validate'      => 'numeric',
			'default'       => '1500',
			'min'           => 600,
			'step'          => 1,
			'max'           => 2700,
			'display_value' => 'text',
			'customizer'    => array(
				'transport' => 'postMessage',
				'css_rules' => array(
					'max-width' => array(
						'selector' => '.content--portfolio-archive',
						'unit'     => 'px',
					)
				)
			),
			'compiler'      => true
		),

		// Blog Single Width
		array(
			'id'            => 'blog_post_width',
			'type'          => 'customizer_slider',
			'title'         => __( 'Blog Post Width', 'mies_txtd' ),
			'subtitle'      => __( 'Set the width of the blog single post container.', 'mies_txtd' ),
			'validate'      => 'numeric',
			'default'       => '700',
			'min'           => 400,
			'step'          => 1,
			'max'           => 2700,
			'display_value' => 'text',
			'customizer'    => array(
				'transport' => 'postMessage',
				'css_rules' => array(
					'max-width' => array(
						'selector' => '.content--single, .has_sidebar .content--single-post',
						'unit'     => 'px',
					)
				)
			),
			'compiler'      => true
		),

		// Sections Vertical Margins
		array(
			'id'            => 'sections_vertical_margins',
			'type'          => 'customizer_slider',
			'title'         => __( 'Sections Vertical Spacing', 'mies_txtd' ),
			'validate'      => 'numeric',
			'default'       => '100',
			'min'           => 0,
			'step'          => 5,
			'max'           => 120,
			'display_value' => 'text',
			'customizer'    => array(
				'transport' => 'postMessage',
				'css_rules' => array(
					'margin-top'    => array(
						'selector' => '.content',
						'unit'     => 'px',
						'media'    => 'only screen and (min-width: 900px)',
					),
					'margin-bottom' => array(
						'selector' => '.content',
						'unit'     => 'px',
						'media'    => 'only screen and (min-width: 900px)',
					)
				)
			),
			'compiler'      => false
		),

		// Archive Grid
		array(
			'id'         => 'grid_spacing',
			'title'      => '<label><span class="customize-control-title sizes_section"><button></button>' . __( 'Archive Grid', 'mies_txtd' ) . '</span></label>',
			'type'       => 'customizer_info',
			'customizer' => array(
				'transport' => 'postMessage',
			)
		),
		array(
			'id'            => 'archive_grid_horizontal_spacing',
			'type'          => 'customizer_slider',
			'title'         => __( 'Items Horizontal Spacing', 'mies_txtd' ),
			'validate'      => 'numeric',
			'default'       => 36,
			'min'           => 0,
			'step'          => 6,
			'max'           => 75,
			'display_value' => 'text',
			'customizer'    => array(
				'transport' => 'postMessage',
				'css_rules' => array(
					'padding-left'  => array(
						'selector' =>
							'.masonry .masonry__item',
						'unit'     => 'px'
					),

					'margin-left'  => array(
						'negative_selector'  => '.masonry',
						'unit'				 => 'px'
					),

					'margin-top'  => array(
						'negative_selector'  => '.masonry',
						'unit'				 => 'px'
					)
				)
			),
			'compiler'      => true
		),
		array(
			'id'            => 'archive_grid_vertical_spacing',
			'type'          => 'customizer_slider',
			'title'         => __( 'Items Vertical Spacing', 'mies_txtd' ),
			'validate'      => 'numeric',
			'default'       => 32,
			'min'           => 0,
			'step'          => 6,
			'max'           => 120,
			'display_value' => 'text',
			'customizer'    => array(
				'transport' => 'postMessage',
				'css_rules' => array(
					'margin-bottom'  => array(
						'selector' => '.masonry .masonry__item',
						'unit'     => 'px'
					),
					'margin-top'  => array(
						'selector' => '.masonry .masonry__item',
						'unit'     => 'px'
					),
				)
			),
			'compiler'      => true
		),
		array(
			'id'          => 'projects_grid_large_columns',
			'type'        => 'select',
			'title'       => __( 'Number of columns on big screens', 'mies_txtd' ),
			'subtitle'    => __( 'LARGE screen size', 'mies_txtd' ),
			'options'     => array(
				'1' => '1 column',
				'2' => '2 columns',
				'3' => '3 columns',
				'4' => '4 columns',
				'5' => '5 columns',
				'6' => '6 columns'
			),
			'default'     => '3',
			'customizer' => array()
		),
		array(
			'id'          => 'projects_grid_medium_columns',
			'type'        => 'select',
			'title'       => __( 'Number of columns on medium screens', 'mies_txtd' ),
			'subtitle'    => __( 'MEDIUM screen size', 'mies_txtd' ),
			'options'     => array(
				'1' => '1 column',
				'2' => '2 columns',
				'3' => '3 columns',
				'4' => '4 columns',
				'5' => '5 columns'
			),
			'default'     => '2',
			'customizer' => array()
		),
		array(
			'id'          => 'projects_grid_small_columns',
			'type'        => 'select',
			'title'       => __( 'Number of columns on small screens', 'mies_txtd' ),
			'subtitle'    => __( 'SMALL screen size', 'mies_txtd' ),
			'options'     => array(
				'1' => '1 column',
				'2' => '2 columns',
				'3' => '3 columns'
			),
			'default'     => '1',
			'customizer' => array()
		),
		array(
			'id'         => 'content_grid_spacing',
			'title'      => '<label><span class="customize-control-title sizes_section"><button></button>' . __( 'Content Grid', 'mies_txtd' ) . '</span></label>',
			'type'       => 'customizer_info',
			'customizer' => array(
				'transport' => 'postMessage',
			)
		),
		array(
			'id'            => 'content_grid_horizontal_spacing',
			'type'          => 'customizer_slider',
			'title'         => __( 'Items Horizontal Spacing', 'mies_txtd' ),
			'validate'      => 'numeric',
			'default'       => 60,
			'min'           => 0,
			'step'          => 6,
			'max'           => 120,
			'display_value' => 'text',
			'customizer'    => array(
				'transport' => 'postMessage',
				'css_rules' => array(
					'border-left-width'  => array(
						'selector' 			 => '.gallery .gallery-item.gallery-item',
						'unit'     			 => 'px',
						'media'	   			 => 'screen and (min-width: 1200px)'
					),
					'margin-left'  		 => array(
						'negative_selector'  => '.gallery.gallery, .grid',
						'unit'				 => 'px',
						'media'	   		 	 => 'screen and (min-width: 1200px)'
					),
					'margin-bottom'  	 => array(
						'selector'  		 => '.gallery.gallery, .grid',
						'unit'				 => 'px',
						'media'	   			 => 'screen and (min-width: 1200px)'
					),
					'padding-left'		 => array(
						'selector' 			 => '.grid__item',
						'unit' 				 => 'px',
						'media'	   		 	 => 'screen and (min-width: 1200px)'
					),
				)
			),
			'compiler'      => false
		),
		array(
			'id'            => 'pcontent_grid_vertical_spacing',
			'type'          => 'customizer_slider',
			'title'         => __( 'Items Vertical Spacing', 'mies_txtd' ),
			'validate'      => 'numeric',
			'default'       => 60,
			'min'           => 0,
			'step'          => 6,
			'max'           => 120,
			'display_value' => 'text',
			'customizer'    => array(
				'transport' => 'postMessage',
				'css_rules' => array(
					'border-top-width'  => array(
						'selector' => '.gallery .gallery-item',
						'unit'     => 'px'
					),
					'margin-top'  => array(
						'negative_selector'  => '.gallery',
						'unit'				 => 'px'
					)
				)
			),
			'compiler'      => false
		)
	)
);

// Other Options
// ------------------------------------------------------------------------
if ( ! $is_wp43 ) {
	$sections_panel = 'general-options';
}
$sections[] = array(
	'icon'            => "icon-params",
	'icon_class'      => '',
	'class'           => 'has-customizer customizer-only',
	'title'           => __( 'General Options', 'mies_txtd' ),
	'type'            => 'customizer_section',
	'priority'        => 9,
	'in_panel'        => $sections_panel,
	'fields'          => array(

		 // Elements
		 array(
		 	'id'              => 'options_elements',
		 	'title'           => '<label><span class="customize-control-title sizes_section"><button></button>' . __( 'Elements', 'mies_txtd' ) . '</span></label>',
		 	'type'            => 'customizer_info',
		 	'customizer'      => array()
		 ),

		array(
			'id'          => 'parallax_speed',
			'type'        => 'select',
			'title'       => __( 'Parallax Movement Speed', 'mies_txtd' ),
			'options'     => array(
				'0'     => 'Static',
				'0.25'  => 'Slow',
				'0.5'   => 'Medium',
				'0.75'  => 'Fast',
				'1'     => 'Fixed'
			),
			'default'     => '0.5',
			'customizer' => array('transport' => 'refresh')
		),

		// Navigation Bar
		array(
			'id'         => 'nav_bar',
			'title'      => '<label><span class="customize-control-title sizes_section"><button></button>' . __( 'Navigation Bar', 'mies_txtd' ) . '</span></label>',
			'type'       => 'customizer_info',
			'customizer' => array()
		),
		array(
			'id'         => 'nav_show_scroll',
			'type'       => 'checkbox',
			'title'      => __( 'Always Show on Scroll (Sticky)', 'mies_txtd' ),
			'default'    => '1',
			'customizer' => array('transport' => 'refresh')
		),

		array(
			'id'         => 'nav_menu_text',
			'type'       => 'text',
			'title'      => __( 'Menu Text', 'mies_txtd' ),
			'default'    => 'Menu',
			'required'   => array( 'nav_show_always', '=', 1 ),
			'customizer' => array('transport' => 'refresh')
		)
	)
);


// Reset Button
// ------------------------------------------------------------------------
$sections[] = array(
	'icon'            => "icon-params",
	'icon_class'      => '',
	'class'           => 'has-customizer',
	'title'           => __( 'Reset Options', 'mies_txtd' ),
	'customizer_only' => true,
	'priority'        => 99999,
	'fields'          => array(
		array(
			'id'         => 'customizer_reset_button_section',
			'title'      => '<a class="btn" id="reset-style-defaults" href="#" data-ajax_nonce="' . wp_create_nonce( "reset-style-section" ) . '">' . __( 'Reset to Defaults', 'mies_txtd' ) . '</a>',
			'type'       => 'customizer_info',
			'customizer' => array()
		)
	)
);






// Header/Footer Options
// ------------------------------------------------------------------------
$sections[] = array(
	'icon'   => 'icon-note-1',
	'title'  => __( 'Footer', 'mies_txtd' ),
	'desc'   => '<p class="description">' . __( 'Footer options allow you to control both the visual and functional aspects of the page footer area.', 'mies_txtd' ) . '</p>',
	'fields' => array(
		array(
			'id'          => 'footer_number_of_columns',
			'type'        => 'select',
			'title'       => __( 'Widget Area Number of Columns', 'mies_txtd' ),
			'subtitle'    => __( 'Select how many number of columns should the Footer widget area have.', 'mies_txtd' ),
			'options'     => array(
				'1' => '1',
				'2' => '2',
				'3' => '3',
				'4' => '4',
				'5' => '5',
				'6' => '6',
			),
			'default'     => '4',
			'placeholder' => __( 'Select the number of columns', 'mies_txtd' ),
			'select2'     => array( // here you can provide params for the select2 jquery call
				'minimumResultsForSearch' => - 1, // this way the search box will be disabled
				'allowClear'              => false // don't allow a empty select
			),
		),
		array(
			'id'          => 'footer_column_width',
			'type'        => 'select',
			'title'       => __( 'Widget Column width', 'mies_txtd' ),
			'options'     => array(
				'one-third'  => 'One third',
				'two-thirds' => 'Two thirds',
				'one-whole'  => 'Whole',
			),
			'default'     => 'one_third',
			'placeholder' => __( 'Select the widget width', 'mies_txtd' ),
			'select2'     => array( // here you can provide params for the select2 jquery call
				'minimumResultsForSearch' => - 1, // this way the search box will be disabled
				'allowClear'              => false // don't allow a empty select
			),
			'required'    => array( 'footer_number_of_columns', '=', 1 ),
		),
//		array(
//			'id'       => 'copyright_text',
//			'type'     => 'editor',
//			'title'    => __( 'Copyright Text', 'mies_txtd' ),
//			'subtitle' => sprintf( __( 'Text that will appear in bottom area (eg. Copyright 2014 %s | All Rights Reserved).', 'mies_txtd' ), wpgrade::themename() ),
//			'default'  => '2014 &copy; Handcrafted with love by <a href="http://themeforest.net/user/pixelgrade/portfolio?ref=pixelgrade">PixelGrade</a> Team',
//			'rows'     => 3,
//		)

	)
);

$sections[] = array(
	'type' => 'divide',
);

// Single Project Options
// ------------------------------------------------------------------------

$sections[] = array(
	'icon'   => 'icon-note-1',
	'title'  => __( 'Portfolio', 'mies_txtd' ),
	'desc'   => '<p class="description">' . __( 'Project options control the various aspects related to the your single project view.', 'mies_txtd' ) . '</p>',
	'fields' => array(
		array(
			'id'   => 'project-page-title',
			'desc' => '<h3>' . __( 'Project Page', 'mies_txtd' ) . '</h3>',
			'type' => 'info'
		),

		array(
			'id'   => 'project-menu-labels',
			'desc' => '<p class="redux_field_th">' . __( 'Floating Menu Labels:', 'mies_txtd' ) . '<span class="description">' . __( 'Set the labels for top–right navigation menu. Leave empty if you want to hide it.', 'mies_txtd' ) . '</span></p>',
			'type' => 'info'
		),

		array(
			'id'       => 'project_menu_archive_label',
			'type'     => 'text',
			'title'    => '',
			'subtitle' => __( 'Archive Link', 'mies_txtd' ),
			'default'  => 'Index',
		),
		array(
			'id'       => 'project_menu_prev_label',
			'type'     => 'text',
			'title'    => '',
			'subtitle' => __( 'Previous Link', 'mies_txtd' ),
			'default'  => 'Prev',
		),
		array(
			'id'       => 'project_menu_next_label',
			'type'     => 'text',
			'title'    => '',
			'subtitle' => __( 'Next Link', 'mies_txtd' ),
			'default'  => 'Next',
		),
		array(
			'id'       => 'project_menu_share_label',
			'type'     => 'text',
			'title'    => '',
			'subtitle' => __( 'Share Link', 'mies_txtd' ),
			'default'  => 'Share',
		),
		array(
			'id'   => 'project-archive-title',
			'desc' => '<h3>' . __( 'Projects Archives', 'mies_txtd' ) . '</h3>',
			'type' => 'info'
		),
		array(
			'id'       => 'portfolio_projects_per_page',
			'type'     => 'text',
			'title'    => __( 'Projects Per Page', 'mies_txtd' ),
			'subtitle' => __( 'Set the number of projects to load at once.', 'mies_txtd' ),
			'default'  => '6',
		),
		array(
			'id'       => 'portfolio_allow_filter_by_category',
			'type'     => 'checkbox',
			'title'    => __( 'Allow projects filter by category', 'mies_txtd' ),
//			'subtitle' => __( 'Show project categories under the title.', 'mies_txtd' ),
			'default'  => '1',
		),
	)
);

// Archives Options
// ------------------------------------------------------------------------

$sections[] = array(
	'icon'   => 'icon-pencil-1',
	'title'  => __( 'Blog - Archive', 'mies_txtd' ),
	'desc'   => sprintf( '<p class="description">' . __( 'Archive options control the various aspects related to displaying posts in blog archives. You can control things like excerpt length and various layout aspects.', 'mies_txtd' ) . '</p>', wpgrade::themename() ),
	'fields' => array(
		array(
			'id'       => 'blog_read_more_text',
			'type'     => 'text',
			'title'    => __( 'Read More Text', 'mies_txtd' ),
			'subtitle' => __( 'Set the read more link text.', 'mies_txtd' ),
			'default'  => 'Read more',
		),
		array(
			'id'       => 'blog_excerpt_more_text',
			'type'     => 'text',
			'title'    => __( 'Excerpt "More" Text', 'mies_txtd' ),
			'subtitle' => __( 'Change the default [...] with something else.', 'mies_txtd' ),
			'default'  => '..',
		),
		array(
			'id'       => 'blog_excerpt_length',
			'type'     => 'text',
			'title'    => __( 'Excerpt Length', 'mies_txtd' ),
			'subtitle' => __( 'Set the number of characters for posts excerpt.', 'mies_txtd' ),
			'default'  => '140',
		),
		array(
			'id'   => 'posts_meta_data-218293204',
			'desc' => '<h4>' . __( 'Posts Meta Informations', 'mies_txtd' ) . '</h4>',
			'type' => 'info'
		),
		array(
			'id'       => 'blog_show_date',
			'type'     => 'checkbox',
			'title'    => __( 'Date', 'mies_txtd' ),
			'subtitle' => __( 'Display the post publish date.', 'mies_txtd' ),
			'default'  => '1',
		)
	)
);

$sections[] = array(
	'icon'   => 'icon-pencil-1',
	'title'  => __( 'Blog - Single', 'mies_txtd' ),
	'desc'   => sprintf( '<p class="description">' . __( 'Post options control the various aspects related to the <b>single post page</b>.', 'mies_txtd' ) . '</p>', wpgrade::themename() ),
	'fields' => array(
		array(
			'id'       => 'blog_single_show_author_box',
			'type'     => 'switch',
			'title'    => __( 'Show Author Info Box', 'mies_txtd' ),
			'subtitle' => __( 'Do you want to show author info box with avatar and description bellow the post?', 'mies_txtd' ),
			'default'  => true,
		),
		array(
			'id'   => 'posts_comments-812329384',
			'desc' => '<h4>' . __( 'Comments', 'mies_txtd' ) . '</h4>',
			'type' => 'info'
		),
		array(
			'id'       => 'comments_show_avatar',
			'type'     => 'switch',
			'title'    => __( 'Show Comments Avatars', 'mies_txtd' ),
			'subtitle' => __( 'Do you want to show avatars in comments?', 'mies_txtd' ),
			'default'  => false,
		),
		array(
			'id'   => 'posts_sidebar-812329384',
			'desc' => '<h4>' . __( 'Sidebar', 'mies_txtd' ) . '</h4>',
			'type' => 'info'
		),
		array(
			'id'       => 'blog_single_show_sidebar',
			'type'     => 'switch',
			'title'    => __( 'Show Sidebar', 'mies_txtd' ),
			'subtitle' => __( 'Show the main sidebar in the single post pages.', 'mies_txtd' ),
			'default'  => false,
		),
	)
);

$sections[] = array(
	'type' => 'divide',
);

// Social and SEO options
// ------------------------------------------------------------------------

$sections[] = array(
	'icon'       => "icon-thumbs-up-1",
	'icon_class' => '',
	'title'      => __( 'Social and SEO', 'mies_txtd' ),
	'desc'       => '<p class="description">' . __( 'Social and SEO options allow you to display your social links and choose where to display them. Then you can set the social SEO related info added in the meta tags or used in various widgets.', 'mies_txtd' ) . '</p>',
	'fields'     => array(
		array(
			'id'   => 'header_layout-218293203',
			'desc' => '<h3>' . __( 'Sharing', 'mies_txtd' ) . '</h3>',
			'type' => 'info'
		),
		//		array(
		//			'id' => 'share_buttons_settings',
		//			'type' => 'select',
		//			'title' => __('Share Services', 'mies_txtd'),
		//			'subtitle' => __('Add here the share services you want to use, single comma delimited (no spaces). You can find the full list of services here: <a href="http://www.addthis.com/services/list">http://www.addthis.com/services/list</a>. Also you can use the <strong>more</strong> tag to show the plus sign and the <strong>counter</strong> tag to show a global share counter.<br/><br/>Important: If you want to allow AddThis to show your visitors personalized lists of share buttons you can use the <strong>preferred</strong> tag. More about this here: <a href="http://bit.ly/1fLP69i">http://bit.ly/1fLP69i</a>.', 'mies_txtd'),
		//			'default' => 'more,preferred,preferred,preferred,preferred',
		//			'options'  => array(
		//				'more' => 'More Button',
		//				'preferred' => 'Preferred',
		//				'facebook' => 'Facebook',
		//				'twitter' => 'Twitter',
		//				'google_plusone_share' => 'Google+',
		//				'google' => 'Google Bookmarks',
		//				'pinterest_share' => 'Pinterest',
		//				'linkedin' => 'LinkedIn',
		//				'sinaweibo' => 'Sina Weibo',
		//				'baidu' => 'Baidu',
		//				'chimein' => 'Chime.In',
		//				'classicalplace' => 'ClassicalPlace',
		//				'cndig' => 'Cndig',
		//				'technerd' => 'TechNerd',
		//				'delicious' => 'Delicious',
		//				'digg' => 'Digg',
		//				'diigo' => 'Diigo',
		//				'dosti' => 'Dosti',
		//				'douban' => 'Douban',
		//				'draugiem' => 'Draugiem.lv',
		//				'dudu' => 'dudu',
		//				'dzone' => 'dzone',
		//				'efactor' => 'EFactor',
		//				'ekudos' => 'eKudos',
		//				'elefantapl' => 'elefanta.pl',
		//				'email' => 'Email',
		//				'mailto' => 'Email App',
		//				'embarkons' => 'Embarkons',
		//				'evernote' => 'Evernote',
		//				'extraplay' => 'extraplay',
		//				'fabulously40' => 'Fabulously40',
		//				'farkinda' => 'Farkinda',
		//				'favable' => 'FAVable',
		//				'faves' => 'Fave',
		//				'favlogde' => 'favlog',
		//				'favoritende' => 'Favoriten.de',
		//				'favorites' => 'Favorites',
		//				'favoritus' => 'Favoritus',
		//				'financialjuice' => 'financialjuice',
		//				'flaker' => 'Flaker',
		//				'folkd' => 'Folkd',
		//				'formspring' => 'Formspring',
		//				'fresqui' => 'Fresqui',
		//				'friendfeed' => 'FriendFeed',
		//				'funp' => 'funP',
		//				'fwisp' => 'fwisp',
		//				'gabbr' => 'Gabbr',
		//				'gamekicker' => 'Gamekicker',
		//				'gg' => 'GG',
		//				'givealink' => 'GiveALink',
		//				'gmail' => 'Gmail',
		//				'govn' => 'Go.vn',
		//				'goodnoows' => 'Good Noows',
		//				'greaterdebater' => 'GreaterDebater',
		//				'hackernews' => 'Hacker News',
		//				'gluvsnap' => 'Healthimize',
		//				'hedgehogs' => 'Hedgehogs.net',
		//				'historious' => 'Historious',
		//				'hotklix' => 'Hotklix',
		//				'hotmail' => 'Hotmail',
		//				'identica' => 'Identica',
		//				'ihavegot' => 'ihavegot',
		//				'index4' => 'Index4',
		//				'instapaper' => 'Instapaper',
		//				'iorbix' => 'iOrbix',
		//				'irepeater' => 'IRepeater.Share',
		//				'isociety' => 'iSociety',
		//				'iwiw' => 'iWiW',
		//				'jamespot' => 'Jamespot',
		//				'jappy' => 'Jappy Ticker',
		//				'jolly' => 'Jolly',
		//				'jumptags' => 'Jumptags',
		//				'kaevur' => 'Kaevur',
		//				'kaixin' => 'Kaixin Repaste',
		//				'ketnooi' => 'Ketnooi',
		//				'kledy' => 'Kledy',
		//				'kommenting' => 'Kommenting',
		//				'latafaneracat' => 'La tafanera',
		//				'librerio' => 'Librerio',
		//				'lidar' => 'LiDAR Online',
		//				'linksgutter' => 'Links Gutter',
		//				'linkshares' => 'LinkShares',
		//				'linkuj' => 'Linkuj.cz',
		//				'lockerblogger' => 'LockerBlogger',
		//				'logger24' => 'Logger24.com',
		//				'mymailru' => 'Mail.ru',
		//				'margarin' => 'mar.gar.in',
		//				'markme' => 'Markme',
		//				'mashant' => 'Mashant',
		//				'mashbord' => 'Mashbord',
		//				'me2day' => 'me2day',
		//				'meinvz' => 'meinVZ',
		//				'mekusharim' => 'Mekusharim',
		//				'memori' => 'Memori.ru',
		//				'meneame' => 'Menéame',
		//				'live' => 'Messenger',
		//				'misterwong' => 'Mister Wong',
		//				'misterwong_de' => 'Mister Wong DE',
		//				'mixi' => 'Mixi',
		//				'moemesto' => 'Moemesto.ru',
		//				'moikrug' => 'Moikrug',
		//				'mrcnetworkit' => 'mRcNEtwORK',
		//				'myspace' => 'Myspace',
		//				'myvidster' => 'myVidster',
		//				'n4g' => 'N4G',
		//				'naszaklasa' => 'Nasza-klasa',
		//				'netlog' => 'NetLog',
		//				'netvibes' => 'Netvibes',
		//				'netvouz' => 'Netvouz',
		//				'newsmeback' => 'NewsMeBack',
		//				'newstrust' => 'NewsTrust',
		//				'newsvine' => 'Newsvine',
		//				'nujij' => 'Nujij',
		//				'odnoklassniki_ru' => 'Odnoklassniki',
		//				'oknotizie' => 'OKNOtizie',
		//				'openthedoor' => 'OpenTheDoor',
		//				'orkut' => 'orkut',
		//				'oyyla' => 'Oyyla',
		//				'packg' => 'Packg',
		//				'pafnetde' => 'pafnet.de',
		//				'phonefavs' => 'PhoneFavs',
		//				'plaxo' => 'Plaxo',
		//				'plurk' => 'Plurk',
		//				'pocket' => 'Pocket',
		//				'posteezy' => 'Posteezy',
		//				'posterous' => 'Posterous',
		//				'print' => 'Print',
		//				'printfriendly' => 'PrintFriendly',
		//				'pusha' => 'Pusha',
		//				'qrfin' => 'QRF.in',
		//				'qrsrc' => 'QRSrc.com',
		//				'qzone' => 'Qzone',
		//				'reddit' => 'Reddit',
		//				'rediff' => 'Rediff MyPage',
		//				'redkum' => 'RedKum',
		//				'researchgate' => 'ResearchGate',
		//				'scoopat' => 'Scoop.at',
		//				'scoopit' => 'Scoop.it',
		//				'sekoman' => 'Sekoman',
		//				'select2gether' => 'Select2Gether',
		//				'shaveh' => 'Shaveh',
		//				'shetoldme' => 'SheToldMe',
		//				'smiru' => 'SMI',
		//				'sonico' => 'Sonico',
		//				'spinsnap' => 'SpinSnap',
		//				'yiid' => 'Spread.ly',
		//				'springpad' => 'springpad',
		//				'startaid' => 'Startaid',
		//				'startlap' => 'Startlap',
		//				'storyfollower' => 'Story Follower',
		//				'studivz' => 'studiVZ',
		//				'stumbleupon' => 'StumbleUpon',
		//				'sulia' => 'Sulia',
		//				'sunlize' => 'Sunlize',
		//				'surfingbird' => 'Surfingbird',
		//				'svejo' => 'Svejo',
		//				'taaza' => 'Taaza',
		//				'tagza' => 'Tagza',
		//				'taringa' => 'Taringa!',
		//				'textme' => 'Textme SMS',
		//				'thewebblend' => 'The Web Blend',
		//				'thinkfinity' => 'Thinkfinity',
		//				'topsitelernet' => 'TopSiteler',
		//				'tuenti' => 'Tuenti',
		//				'tulinq' => 'Tulinq',
		//				'tumblr' => 'Tumblr',
		//				'tvinx' => 'Tvinx',
		//				'typepad' => 'Typepad',
		//				'upnews' => 'Upnews.it',
		//				'urlaubswerkde' => 'Urlaubswerk',
		//				'visitezmonsite' => 'Visitez Mon Site',
		//				'vk' => 'Vkontakte',
		//				'vkrugudruzei' => 'vKruguDruzei',
		//				'vybralisme' => 'vybrali SME',
		//				'wanelo' => 'Wanelo',
		//				'sharer' => 'WebMoney.Events',
		//				'webnews' => 'Webnews',
		//				'webshare' => 'WebShare',
		//				'werkenntwen' => 'Wer Kennt Wen',
		//				'wirefan' => 'WireFan',
		//				'wowbored' => 'WowBored',
		//				'wykop' => 'Wykop',
		//				'xanga' => 'Xanga',
		//				'xing' => 'Xing',
		//				'yahoobkm' => 'Y! Bookmarks',
		//				'yahoomail' => 'Y! Mail',
		//				'yammer' => 'Yammer',
		//				'yardbarker' => 'Yardbarker',
		//				'yigg' => 'Yigg',
		//				'yookos' => 'Yookos',
		//				'yoolink' => 'Yoolink',
		//				'yorumcuyum' => 'Yorumcuyum',
		//				'youmob' => 'YouMob',
		//				'yuuby' => 'Yuuby',
		//				'zakladoknet' => 'Zakladok.net',
		//				'ziczac' => 'ZicZac',
		//				'zingme' => 'ZingMe',
		//
		//
		//			),
		////			'sortable' => true,
		//			'multi' => true,
		//			'select2' => array( // here you can provide params for the select2 jquery call
		//				'minimumResultsForSearch' => 1,
		//				'allowClear' => true, // don't allow a empty select
		//				//'separator' => ','
		//			)
		//		),
		array(
			'id'       => 'share_buttons_settings',
			'type'     => 'text',
			'title'    => __( 'Share Services', 'mies_txtd' ),
			'subtitle' => __( 'Add here the share services you want to use, single comma delimited (no spaces). You can find the full list of services here: <a href="http://www.addthis.com/services/list">http://www.addthis.com/services/list</a>. Also you can use the <strong>more</strong> tag to show the plus sign and the <strong>counter</strong> tag to show a global share counter.<br/><br/>Important: If you want to allow AddThis to show your visitors personalized lists of share buttons you can use the <strong>preferred</strong> tag. More about this here: <a href="http://bit.ly/1fLP69i">http://bit.ly/1fLP69i</a>.', 'mies_txtd' ),
			'default'  => 'more,preferred,preferred,preferred,preferred',
		),
		array(
			'id'       => 'share_buttons_enable_tracking',
			'type'     => 'switch',
			'title'    => __( 'Sharing Analytics', 'mies_txtd' ),
			'subtitle' => __( 'Do you want to get analytics for your social shares?', 'mies_txtd' ),
			'default'  => false,
		),
		array(
			'id'       => 'share_buttons_enable_addthis_tracking',
			'type'     => 'switch',
			'title'    => __( 'AddThis Tracking', 'mies_txtd' ),
			'subtitle' => __( 'Do you want to enable AddThis tracking? This will all you to see sharing analytics in your AddThis account (see more here: <a href="http://bit.ly/1oe5zad">bit.ly/1oe5zad</a>)', 'mies_txtd' ),
			'default'  => false,
			'required' => array( 'share_buttons_enable_tracking', '=', 1 ),
		),
		array(
			'id'       => 'share_buttons_addthis_username',
			'type'     => 'text',
			'title'    => __( 'AddThis Username', 'mies_txtd' ),
			'subtitle' => __( 'Enter here your AddThis username so you will receive analytics data.', 'mies_txtd' ),
			'default'  => '',
			'required' => array( 'share_buttons_enable_addthis_tracking', '=', 1 ),
		),
		array(
			'id'       => 'share_buttons_enable_ga_tracking',
			'type'     => 'switch',
			'title'    => __( 'Google Analytics Tracking', 'mies_txtd' ),
			'subtitle' => __( 'Do you want to enable the AddThis - Google Analytics tracking integration? See more about this here: <a href="http://bit.ly/1kxPg7K">bit.ly/1kxPg7K</a>', 'mies_txtd' ),
			'default'  => false,
			'required' => array( 'share_buttons_enable_tracking', '=', 1 ),
		),
		array(
			'id'       => 'share_buttons_ga_id',
			'type'     => 'text',
			'title'    => __( 'GA Property ID', 'mies_txtd' ),
			'subtitle' => __( 'Enter here your GA property ID (generally a serial number of the form UA-xxxxxx-x).', 'mies_txtd' ),
			'default'  => '',
			'required' => array( 'share_buttons_enable_ga_tracking', '=', 1 ),
		),
		array(
			'id'       => 'share_buttons_enable_ga_social_tracking',
			'type'     => 'switch',
			'title'    => __( 'GA Social Tracking', 'mies_txtd' ),
			'subtitle' => __( 'If you are using the latest version of GA code, you can take advantage of Google\'s new <a href="http://bit.ly/1iVvkbk">social interaction analytics</a>.', 'mies_txtd' ),
			'default'  => false,
			'required' => array( 'share_buttons_enable_ga_tracking', '=', 1 ),
		),
		array(
			'id'   => 'header_layout-218293203',
			'desc' => '<h3>' . __( 'Social Metas', 'mies_txtd' ) . '</h3>',
			'type' => 'info'
		),
		array(
			'id'       => 'prepare_for_social_share',
			'type'     => 'switch',
			'title'    => __( 'Add Social Meta Tags', 'mies_txtd' ),
			'subtitle' => __( 'Let us properly prepare your theme for the social sharing and discovery by adding the needed metatags in the <head> section. These include Open Graph (Facebook), Google+ and Twitter metas.', 'mies_txtd' ),
			'default'  => true,
		),
		array(
			'id'       => 'facebook_id_app',
			'type'     => 'text',
			'title'    => __( 'Facebook Application ID', 'mies_txtd' ),
			'subtitle' => __( 'Enter the Facebook Application ID of the Fan Page which is associated with this website. You can create one <a href="https://developers.facebook.com/apps">here</a>.', 'mies_txtd' ),
			'required' => array( 'prepare_for_social_share', '=', 1 )
		),
		array(
			'id'       => 'facebook_admin_id',
			'type'     => 'text',
			'title'    => __( 'Facebook Admin ID', 'mies_txtd' ),
			'subtitle' => __( 'The id of the user that has administrative privileges to your Facebook App so you can access the <a href="https://www.facebook.com/insights/">Facebook Insights</a>.', 'mies_txtd' ),
			'required' => array( 'prepare_for_social_share', '=', 1 )
		),
		array(
			'id'       => 'google_page_url',
			'type'     => 'text',
			'title'    => __( 'Google+ Publisher', 'mies_txtd' ),
			'subtitle' => __( 'Enter your Google Plus page ID (example: https://plus.google.com/<b>105345678532237339285</b>) here if you have set up a "Google+ Page".', 'mies_txtd' ),
			'required' => array( 'prepare_for_social_share', '=', 1 )
		),
		array(
			'id'                => 'twitter_card_site',
			'type'              => 'text',
			'title'             => __( 'Twitter Site Username', 'mies_txtd' ),
			'subtitle'          => __( 'The Twitter username of the entire site. The username for the author will be taken from the author\'s profile', 'mies_txtd' ),
			'required'          => array( 'prepare_for_social_share', '=', 1 ),
			'validate_callback' => 'wpgrade_trim_twitter_username'
		),
		array(
			'id'    => 'social_share_default_image',
			'type'  => 'media',
			'title' => __( 'Default Social Share Image', 'mies_txtd' ),
			'desc'  => __( 'If an image is uploaded, this will be used for content sharing if you don\'t upload a custom image with your content (at least 200px wide recommended).', 'mies_txtd' ),
		),
		array(
			'id'       => 'remove_parameters_from_static_res',
			'type'     => 'switch',
			'title'    => __( 'Clean Static Files URL', 'mies_txtd' ),
			'subtitle' => __( 'Do you want us to remove the version parameters from static resources so they can be cached better?', 'mies_txtd' ),
			'default'  => false,
		),
	)
);

// Custom Code
// ------------------------------------------------------------------------

$sections[] = array(
	'icon'       => "icon-database-1",
	'icon_class' => '',
	'title'      => __( 'Custom Code', 'mies_txtd' ),
	'desc'       => '<p class="description">' . __( 'You can change the site style and behaviour by adding custom scripts to all pages within your site using the custom code areas below.', 'mies_txtd' ) . '</p>',
	'fields'     => array(
		array(
			'id'       => 'custom_css',
			'type'     => 'ace_editor',
			'title'    => __( 'Custom CSS', 'mies_txtd' ),
			'subtitle' => __( 'Enter your custom CSS code. It will be included in the head section of the page and will overwrite the main CSS styling.', 'mies_txtd' ),
//			'desc'     => __( '', 'mies_txtd' ),
			'mode'     => 'css',
			'theme'    => 'chrome',
			//'validate' => 'html',
			'compiler' => true
		),
		array(
			'id'       => 'inject_custom_css',
			'type'     => 'select',
			'title'    => __( 'Apply Custom CSS', 'mies_txtd' ),
			'subtitle' => sprintf( __( 'Select how to insert the custom CSS into your pages.', 'mies_txtd' ), wpgrade::themename() ),
			'default'  => 'inline',
			'options'  => array(
				'inline' => __( 'Inline <em>(recommended)</em>', 'mies_txtd' ),
				'file'   => __( 'Write To File (might require file permissions)', 'mies_txtd' )
			),
			'select2'  => array( // here you can provide params for the select2 jquery call
				'minimumResultsForSearch' => - 1, // this way the search box will be disabled
				'allowClear'              => false // don't allow a empty select
			),
			'compiler' => true
		),
		array(
			'id'       => 'custom_js',
			'type'     => 'ace_editor',
			'title'    => __( 'Custom JavaScript (header)', 'mies_txtd' ),
			'subtitle' => __( 'Enter your custom Javascript code. This code will be loaded in the head section of your pages.', 'mies_txtd' ),
			'mode'     => 'text',
			'theme'    => 'chrome'
		),
		array(
			'id'       => 'custom_js_footer',
			'type'     => 'ace_editor',
			'title'    => __( 'Custom JavaScript (footer)', 'mies_txtd' ),
			'subtitle' => __( 'This javascript code will be loaded in the footer. You can paste here your <strong>Google Analytics tracking code</strong> (or for what matters any tracking code) and we will put it on every page.', 'mies_txtd' ),
			'mode'     => 'text',
			'theme'    => 'chrome'
		),
	)
);

// Utilities - Theme Auto Update + Import Demo Data
// ------------------------------------------------------------------------

$sections[] = array(
	'icon'       => "icon-truck",
	'icon_class' => '',
	'title'      => __( 'Utilities', 'mies_txtd' ),
	'desc'       => '<p class="description">' . __( 'Utilities help you keep up-to-date with new versions of the theme. Also you can import the demo data from here.', 'mies_txtd' ) . '</p>',
	'fields'     => array(
		array(
			'id'   => 'theme-one-click-update-info',
			'desc' => __( '<h3>Theme One-Click Update</h3>
				<p class="description">' . __( 'Let us notify you when new versions of this theme are live on ThemeForest! Update with just one button click and forget about manual updates!</p><p> If you have any troubles with this system please refer to <a href="http://bit.ly/backend-update">Updating a theme</a> article.', 'mies_txtd' ) . '</p>', 'mies_txtd' ),
			'type' => 'info'
		),
		array(
			'id'       => 'themeforest_upgrade',
			'type'     => 'switch',
			'title'    => __( 'One-Click Update', 'mies_txtd' ),
			'subtitle' => __( 'Activate this to enter the info needed for the theme\'s one-click update to work.', 'mies_txtd' ),
			'default'  => true,
		),
		array(
			'id'       => 'marketplace_username',
			'type'     => 'text',
			'title'    => __( 'ThemeForest Username', 'mies_txtd' ),
			'subtitle' => __( 'Enter here your ThemeForest (or Envato) username account (i.e. pixelgrade).', 'mies_txtd' ),
			'required' => array( 'themeforest_upgrade', '=', 1 )
		),
		array(
			'id'       => 'marketplace_api_key',
			'type'     => 'text',
			'title'    => __( 'ThemeForest Secret API Key', 'mies_txtd' ),
			'subtitle' => __( 'Enter here the secret api key you\'ve created on ThemeForest. You can create a new one in the Settings > API Keys section of your profile.', 'mies_txtd' ),
			'required' => array( 'themeforest_upgrade', '=', 1 )
		),
		array(
			'id'       => 'themeforest_upgrade_backup',
			'type'     => 'switch',
			'title'    => __( 'Backup Theme Before Upgrade?', 'mies_txtd' ),
			'subtitle' => __( 'Check this if you want us to automatically save your theme as a ZIP archive before an upgrade. The directory those backups get saved to is <code>wp-content/envato-backups</code>. However, if you\'re experiencing problems while attempting to upgrade, it\'s likely to be a permissions issue and you may want to manually backup your theme before upgrading. Alternatively, if you don\'t want to backup your theme you can disable this.', 'mies_txtd' ),
			'default'  => false,
			'required' => array( 'themeforest_upgrade', '=', 1 )
		),
		array(
			'id'   => 'import-demo-data-info',
			'desc' => __( '<h3>Import Demo Data</h3>
				<p class="description">' . __( 'Here you can import the demo data and get on your way of setting up the site like the theme demo (images not included due to copyright).', 'mies_txtd' ) . '</p>', 'mies_txtd' ),
			'type' => 'info'
		),
		array(
			'id'   => 'wpGrade_import_demodata_button',
			'type' => 'info',
			'desc' => '
                    <input type="hidden" name="wpGrade-nonce-import-posts-pages" value="' . wp_create_nonce( 'wpGrade_nonce_import_demo_posts_pages' ) . '" />
						<input type="hidden" name="wpGrade-nonce-import-theme-options" value="' . wp_create_nonce( 'wpGrade_nonce_import_demo_theme_options' ) . '" />
						<input type="hidden" name="wpGrade-nonce-import-widgets" value="' . wp_create_nonce( 'wpGrade_nonce_import_demo_widgets' ) . '" />
						<input type="hidden" name="wpGrade_import_ajax_url" value="' . admin_url( "admin-ajax.php" ) . '" />

						<a href="#" class="button button-primary" id="wpGrade_import_demodata_button">
							' . __( 'Import demo data', 'mies_txtd' ) . '
						</a>

						<div class="wpGrade-loading-wrap hidden">
							<span class="wpGrade-loading wpGrade-import-loading"></span>
							<div class="wpGrade-import-wait">
								' . __( 'Please wait a few minutes (between 1 and 3 minutes usually, but depending on your hosting it can take longer) and <strong>don\'t reload the page</strong>. You will be notified as soon as the import has finished!', 'mies_txtd' ) . '
							</div>
						</div>

						<div class="wpGrade-import-results hidden"></div>
						<div class="hr"><div class="inner"><span>&nbsp;</span></div></div>
					',
		),
		array(
			'id'   => 'other_utilities-info',
			'desc' => __( '<h3>Other</h3>', 'mies_txtd' ),
			'type' => 'info'
		),
		array(
			'id'       => 'admin_panel_options',
			'type'     => 'switch',
			'title'    => __( 'Admin Panel Options', 'mies_txtd' ),
			'subtitle' => __( 'Here you can copy/download your current admin option settings. Keep this safe as you can use it as a backup should anything go wrong, or you can use it to restore your settings on this site (or any other site).', 'mies_txtd' ),
			'default'  => false,
		),
		array(
			'id'       => 'theme_options_import',
			'type'     => 'import_export',
			'required' => array( 'admin_panel_options', '=', 1 )
		)
	)
);

/**
 * Check if WooCommerce is active
 **/
if ( in_array( 'woocommerce/woocommerce.php', apply_filters( 'active_plugins', get_option( 'active_plugins' ) ) ) ) {

	// WooCommerce
	// ------------------------------------------------------------------------
	$sections[] = array(
		'icon'       => "icon-money",
		'icon_class' => '',
		'title'      => __( 'WooCommerce', 'mies_txtd' ),
		'desc'       => '<p class="description">' . __( 'WooCommerce options!', 'mies_txtd' ) . '</p>',
		'fields'     => array(
			array(
				'id'       => 'enable_woocommerce_support',
				'type'     => 'switch',
				'title'    => __( 'Enable WooCommerce Support', 'mies_txtd' ),
				'subtitle' => __( 'Turn this off to avoid loading the WooCommerce assets (CSS and JS).', 'mies_txtd' ),
				'default'  => '1',
			),
		)
	);
}

// Help and Support
// ------------------------------------------------------------------------

$sections[] = array(
	'icon'       => "icon-cd-1",
	'icon_class' => '',
	'title'      => __( 'Help and Support', 'mies_txtd' ),
	'desc'       => '<p class="description">' . __( 'If you had anything less than a great experience with this theme please contact us now. You can also find answers in our community site, or official articles and tutorials in our knowledge base.', 'mies_txtd' ) . '</p>
		<ul class="help-and-support">
			<li>
				<a href="http://pxg.to/mies-forum">
					<span class="community-img"></span>
					<h4>Community Answers</h4>
					<span class="description">Get Help from other people that are using this theme.</span>
				</a>
			</li>
			<li>
				<a href="http://pxg.to/mies-help">
					<span class="knowledge-img"></span>
					<h4>Knowledge Base</h4>
					<span class="description">Getting started guides and useful articles to better help you with this theme.</span>
				</a>
			</li>
			<li>
				<a href="http://pxg.to/mies-new-ticket">
					<span class="community-img"></span>
					<h4>Submit a Ticket</h4>
					<span class="description">File a ticket for a personal response from our support team.</span>
				</a>
			</li>
		</ul>
	',
	'fields'     => array()
);

return $sections;
