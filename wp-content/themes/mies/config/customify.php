<?php


if ( ! function_exists('add_customify_mies_options') ) {

	function add_customify_mies_options( $config ) {

		$config['opt-name'] = 'mies_options';

		$config['sections'] = array(
			'general'     => array(
				'title'   => esc_html__( 'General', 'mies' ),
				'options' => array(
					'google_maps_api_key' => array(
						'type'    => 'text',
						'label'   => esc_html__( 'Google Maps API key', 'mies' ),
						'default' => '',
						'desc'    => sprintf(
							'<p>%s </p> <a href="//developers.google.com/maps/documentation/javascript/get-api-key#get-an-api-key" target="_blank">%s</a>',
							esc_html__( 'To use the Google Maps library you must authenticate your application with an API key.', 'mies' ),
							esc_html__( 'Get a Key', 'mies' )
						)
					)
				)
			),
			'colors_section' => array(
				'title'    => __( 'Colors', 'mies_txtd' ),
				'priority' => 1,
				'description'            => __( 'Using the color pickers you can change the colors of the most important elements. If you want to override the color of some elements you can always use the CSS Editor panel.', 'mies_txtd' ),
				'options' => array(
					'text_color'   => array(
						'type'      => 'color',
						'label'     => __( 'Body Text Color', 'mies_txtd' ),
						//'desc'   => __( 'Use the color picker to change the main color of the site to match your brand color.', 'mies_txtd' ),
						'live' => true,
						'default'   => '#171617',
						'css'  => array(
							array(
								'property'     => 'color',
								'selector' => 'body, .title, h1, h2, h3, h4, h5, h6, .h1, .h2, .h3, .h4, blockquote cite, .h5, .separator > *, .h6,
									a.clear, .masonry__item-meta',
							)
						)
					),
					'text_color_light' => array(
						'type'      => 'color',
						'label'     => __( 'Light Text Color', 'mies_txtd' ),
						'live' => true,
						'default'   => '#FFFFFF',
						'css'  => array(
							array(
								'property'     => 'color',
								'selector' => '.hero--light .hero__content *, .hero--light .hero__content a.meta-list__item,
									.hero--shadowed .hero__content *, .hero--shadowed .hero__content a.meta-list__item'
							),
							array(
								'property'     => 'background-color',
								'selector' => '.hero--light .hero__description .btn, .hero--shadowed .hero__description .btn'
							)
						)
					),
					'body_link_color'     => array(
						'type'      => 'color',
						'label'     => __( 'Links Color', 'mies_txtd' ),
						'live' => true,
						'default'   => '#afafaf',
						'css'  => array(
							array(
								'property'     => 'color',
								'selector' => 'a, .wpcf7-submit, .archive-blog .read-more, .page-numbers.prev,
									.page-numbers.next, .comments_add-comment, .comment-reply-link,
									.filter__fields a, .entry-meta a, .single-product .entry-summary .woocommerce-breadcrumb a',
							)
						)
					),
					'headings_color'     => array(
						'type'      => 'color',
						'label'     => __( 'Headings Color', 'mies_txtd' ),
						'live' => true,
						'default'   => '#171617',
						'css'  => array(
							array(
								'property'     => 'color',
								'selector' => 'h1, h2, h3, h4, h5, h6, .entry-title, .entry-header a, .tabs__nav a.current, .tabs__nav a:hover',
							)
						)
					),
				)
			),
		);

		$config['panels'] = array(

			'layouts_panel' => array(
				'title'    => __( 'Layout Elements', 'mies_txtd' ),
				'sections' => array(
					'header_layouts_section' => array(
						'title'    => __( 'Header', 'mies_txtd' ),
						'options' => array(
							'nav_show_scroll' => array(
								'type'       => 'checkbox',
								'label'      => __( 'Always Show on Scroll (Sticky)', 'mies_txtd' ),
								'default'    => '1'
							),
							'header_logo_height' => array(
								'type' => 'range',
								'label'         => __( 'Logo Height', 'mies_txtd' ),
								'default'       => 22,
								'live' => true,
								'input_attrs' => array(
									'min'   => 20,
									'max'   => 125,
									'step'  => 1,
									'data-preview' => true
								),
								'css' => array(
									array(
										'property' => 'max-height',
										'selector' => '.site-logo--image img',
										'unit' => 'px'
									),
									array(
										'property' => 'font-size',
										'selector' => '.site-title--text',
										'unit' => 'px'
									),
								)
							),
							'header_vertical_margins' => array(
								'type' => 'range',
								'label'         => __( 'Header Vertical Margins', 'mies_txtd' ),
								'default'       => 60,
								'live' => true,
								'input_attrs' => array(
									'min'   => 0,
									'max'   => 100,
									'step'  => 1,
									'data-preview' => true
								),
								'css' => array(
									array(
										'property' => 'top',
										'selector' => '.logo, .navigation',
										'unit' => 'px',
										'media'    => ' screen and (min-width: 1200px)'
									),
									array(
										'property' => 'top',
										'selector' => '.admin-bar .logo, .admin-bar .navigation',
										'unit' => 'px',
										'media'    => 'screen and (min-width: 1200px)',
										'callback_filter' => 'mies_add_admin_bar_value'
									)
								)
							),

							'nav_menu_text' => array(
								'type'       => 'text',
								'label'      => __( 'Menu Text', 'mies_txtd' ),
								'default'    => 'Menu',
								'live' => array( '.navigation__menu-label .label--open' )
							),

							'menu_background_color'   => array(
								'type'      => 'color',
								'label'     => __( 'Menu Background', 'mies_txtd' ),
								'live' => true,
								'default'   => '#000000',
								'css'  => array(
									array(
										'property'     => 'background-color',
										'selector' => '.overlay--navigation',
									)
								)
							),
							'menu_image_pattern'   => array(
								'type'      => 'custom_background',
								'label'     => __( 'Header Background', 'mies_txtd' ),
								'desc'         => __( 'Container background with image.', 'mies_txtd' ),
								//'output'           => array( '.overlay--navigation' ),
							),
                            'navigation_links_color'   => array(
                                'type'      => 'color',
                                'label'     => __( 'Links Color', 'mies_txtd' ),
                                'live' => true,
                                'default'   => '#ffffff',
                                'css'  => array(
                                    array(
                                        'property'     => 'color',
                                        'selector' => '.header.header--inverse a, .header--inverse .navigation__menu-label',
                                    ),
                                    array(
                                        'property'     => 'background-color',
                                        'selector' => '.header--inverse .trigger',
                                    )
                                )
                            ),
                            'navigation_links_active_color'   => array(
                                'type'      => 'color',
                                'label'     => __( 'Links Active Color', 'mies_txtd' ),
                                'live' => true,
                                'default'   => '#000000',
                                'css'  => array(
                                    array(
                                        'property'     => 'color',
                                        'selector' => '.header.header--inverse a:hover',
                                    )
                                )
                            ),
                            'overlay_links_color'   => array(
                                'type'      => 'color',
                                'label'     => __( 'Overlay Links Color', 'mies_txtd' ),
                                'live' => true,
                                'default'   => '#ffffff',
                                'css'  => array(
                                    array(
                                        'property'     => 'color',
                                        'selector' => '.overlay a, .header--inverse-important .navigation__menu-label, .overlay .menu--main-menu li[class*="current-menu"]:hover a, 
                                        .menu--main-menu li.menu-item-has-children[class*="current-menu"]:hover > .sub-menu a, .overlay .page_item, .overlay .menu-item, 
                                        .overlay__sidebar .widget_pages li, .overlay__sidebar .widget_categories li, .overlay__sidebar .widget_meta li, .overlay__sidebar .widget_recent_entries li, 
                                        .overlay__sidebar .widget_archive li, .overlay__sidebar .widget_nav_menu li',
                                    ),
                                    array(
                                        'property'     => 'background-color',
                                        'selector' => '.menu__item--current:after, .header--inverse-important .trigger',
                                    )
                                )
                            ),
                            'overlay_links_active_color'   => array(
                                'type'      => 'color',
                                'label'     => __( 'Overlay Links Active Color', 'mies_txtd' ),
                                'live' => true,
                                'default'   => '#000000',
                                'css'  => array(
                                    array(
                                        'property'     => 'color',
                                        'selector' => '.overlay a:hover, .overlay li:hover a, .overlay .menu--main-menu li.menu-item-has-children[class*="current-menu"]:hover > .sub-menu a:hover',
                                    )
                                )
                            ),
						)
					),

					'content_layouts_section' => array(
						'title'    => __( 'Content', 'mies_txtd' ),
						'options' => array(

							'parallax_speed' => array(
								'type'          => 'select',
								'label'         => __( 'Parallax Movement Speed', 'mies_txtd' ),
								'choices'       => array(
									'0'     => 'Static',
									'0.25'  => 'Slow',
									'0.5'   => 'Medium',
									'0.75'  => 'Fast',
									'1'     => 'Fixed'
								),
								'default'       => '0.5',
							),

							'content_width' => array(
								'type' => 'range',
								'label' => __( 'Container Width', 'mies_txtd' ),
								'desc'      => __( 'Set the width of the container.', 'mies_txtd' ),
								'live' => true,
								'default'       => 1200,
								'input_attrs' => array(
									'min'   => 600,
									'max'   => 2700,
									'step'  => 1,
									'data-preview' => true
								),
								'css' => array(
									array(
										'property' => 'max-width',
										'selector' => '.content',
										'unit' => 'px',
									)
								)
							),
							'sections_vertical_margins' => array(
								'type' => 'range',
								'label' => __( 'Sections Vertical Margins', 'mies_txtd' ),
								'live' => true,
								'default'       => 100,
								'input_attrs' => array(
									'min'   => 0,
									'max'   => 120,
									'step'  => 5,
									'data-preview' => true
								),
								'css' => array(
									array(
										'property' => 'margin-top',
										'selector' => '.content',
										'unit' => 'px',
										'media'    => 'only screen and (min-width: 900px)',
									),
									array(
										'property' => 'margin-bottom',
										'selector' => '.content',
										'unit' => 'px',
										'media'    => ' only screen and (min-width: 900px)',
									),
								)
							),

							'blog_post_width' => array(
								'type' => 'range',
								'label' => __( 'Post Width', 'mies_txtd' ),
								'desc' => __( 'Set the width of the blog single post container.', 'mies_txtd' ),
								'live' => true,
								'default'       => 700,
								'input_attrs' => array(
									'min'   => 400,
									'max'   => 2700,
									'step'  => 1,
									'data-preview' => true
								),
								'css' => array(
									array(
										'property' => 'max-width',
										'selector' => '.content--single, .has_sidebar .content--single-post',
										'unit' => 'px',
									),
								)
							),

							'this_divider_122812312' => array(
								'type' => 'html',
								'html' => '<span class="separator" style="border:1px solid #ccc; display: block; width: 100%; height: 0; margin:25px 0 5px 0; padding: 0; "></span><h3 style="font-size: 19px; font-weight: bold;">' . __( 'Content Grid', 'mies_txtd' ) . '</h3>'
							),

							'content_grid_horizontal_spacing' => array(
								'type' => 'range',
								'label' => __( 'Items Horizontal Spacing', 'mies_txtd' ),
								'live' => false,
								'default'       => 60,
								'input_attrs' => array(
									'min'   => 0,
									'max'   => 120,
									'step'  => 6,
									'data-preview' => true
								),
								'css' => array(
									array(
										'property' => 'border-left-width',
										'selector' => '.gallery .gallery-item.gallery-item',
										'unit' => 'px',
										'media' => 'screen and (min-width: 1200px)',
									),
									array(
										'property' => 'margin-left',
										'selector' => '.gallery.gallery, .grid',
										'callback_filter' => 'mies_range_negative_value',
										'unit' => 'px',
										'media' => ' screen and (min-width: 1200px)'
									),
									array(
										'property' => 'margin-bottom',
										'selector' => '.gallery.gallery, .grid',
										'unit' => 'px',
										'media' => 'screen and (min-width: 1200px) '
									),
									array(
										'property' => 'padding-left',
										'selector' => '.grid__item',
										'unit' => 'px',
										'media' => ' screen and (min-width: 1200px) '
									),
								)
							),

							'pcontent_grid_vertical_spacing' => array(
								'type' => 'range',
								'label' => __( 'Items Vertical Spacing', 'mies_txtd' ),
								'live' => false,
								'default'       => 60,
								'input_attrs' => array(
									'min'   => 0,
									'max'   => 120,
									'step'  => 6,
									'data-preview' => true
								),
								'css' => array(
									array(
										'property' => 'border-left-width',
										'selector' => '.gallery .gallery-item',
										'unit' => 'px',
									),
									array(
										'property' => 'margin-top',
										'selector' => '.gallery',
										'unit' => 'px',
										'callback_filter' => 'mies_range_negative_value'
									),
								)
							),

							'content_background_color'   => array(
								'type'      => 'color',
								'label'     => __( 'Content Background', 'mies_txtd' ),
								'live' => true,
								'default'   => '#ffffff',
								'css'  => array(
									array(
										'property'     => 'background-color',
										'selector' => 'body, .separator__text, .separator > *',
									)
								)
							),

							'container_image_pattern'   => array(
								'type'      => 'custom_background',
								'label'     => __( 'Header Background', 'mies_txtd' ),
								'desc'         => __( 'Container background with image.', 'mies_txtd' ),
								'output'           => array( 'body, .separator__text, .separator > *' ),
							),
						),
					),

					'archives_layouts_section' => array(
						'title'    => __( 'Archives', 'mies_txtd' ),
						'options' => array(

							'portfolio_archive_width' => array(
								'type' => 'range',
								'label' => __( 'Portfolio Archive Width', 'mies_txtd' ),
								'desc' => __( 'Set the width of the container.', 'mies_txtd' ),
								'live' => true,
								'default'       => 1500,
								'input_attrs' => array(
									'min'   => 600,
									'max'   => 2700,
									'step'  => 1,
									'data-preview' => true
								),
								'css' => array(
									array(
										'property' => 'max-width',
										'selector' => '.content.content--portfolio-archive',
										'unit' => 'px',
									),
								)
							),

							'archive_grid_horizontal_spacing' => array(
								'type' => 'range',
								'label' => __( 'Items Horizontal Spacing', 'mies_txtd' ),
								'live' => false,
								'default'       => 36,
								'input_attrs' => array(
									'min'   => 0,
									'max'   => 75,
									'step'  => 6,
									'data-preview' => true
								),
								'css' => array(
									array(
										'property' => 'padding-left',
										'selector' => '.masonry .masonry__item',
										'unit' => 'px',
									),
									array(
										'property' => 'margin-left',
										'selector' => '.masonry',
										'unit' => 'px',
										'callback_filter' => 'mies_range_negative_value',
									),
									array(
										'property' => 'margin-top',
										'selector' => '.masonry',
										'unit' => 'px',
										'callback_filter' => 'mies_range_negative_value',
									),
								)
							),

							'archive_grid_vertical_spacing' => array(
								'type' => 'range',
								'label' => __( 'Items Vertical Spacing', 'mies_txtd' ),
								'live' => true,
								'default'       => 32,
								'input_attrs' => array(
									'min'   => 0,
									'max'   => 120,
									'step'  => 6,
									'data-preview' => true
								),
								'css' => array(
									array(
										'property' => 'margin-bottom',
										'selector' => '.masonry .masonry__item',
										'unit' => 'px',
									),
									array(
										'property' => 'margin-top',
										'selector' => '.masonry',
										'unit' => 'px',
									),
								)
							),


							'projects_grid_large_columns' => array(
								'type' => 'select',
								'label'         => __( 'Number of columns on big screens', 'mies_txtd' ),
								'dec'         => __( 'LARGE screen size', 'mies_txtd' ),
								'choices'       => array(
									'1' => '1 column',
									'2' => '2 columns',
									'3' => '3 columns',
									'4' => '4 columns',
									'5' => '5 columns',
									'6' => '6 columns',
								),
								'default'       => '3',
							),

							'projects_grid_medium_columns' => array(
								'type' => 'select',
								'label'         => __( 'Number of columns on medium screens', 'mies_txtd' ),
								'dec'         => __( 'MEDIUM screen size', 'mies_txtd' ),
								'choices'       => array(
									'1' => '1 column',
									'2' => '2 columns',
									'3' => '3 columns',
									'4' => '4 columns',
									'5' => '5 columns',
								),
								'default'       => '2',
							),

							'projects_grid_small_columns' => array(
								'type' => 'select',
								'label'         => __( 'Number of columns on small screens', 'mies_txtd' ),
								'dec'         => __( 'SMALL screen size', 'mies_txtd' ),
								'choices'       => array(
									'1' => '1 column',
									'2' => '2 columns',
									'3' => '3 columns',
								),
								'default'       => '1',
							),

						)
					),

					'footer_backgrounds_section' => array(
						'title'    => __( 'Footer', 'mies_txtd' ),
						'options' => array(

							'backgrounds_footer'   => array(
								'type'      => 'color',
								'label'     => __( 'Footer Background', 'mies_txtd' ),
								'live' => true,
								'default'   => '#171617',
								'css'  => array(
									array(
										'property'     => 'background-color',
										'selector' => '.footer',
									)
								)
							),

							'footer_image_pattern'   => array(
								'type'      => 'custom_background',
								'label'     => __( 'Footer Background', 'mies_txtd' ),
								'desc'         => __( 'Footer background image.', 'mies_txtd' ),
								'output'           => array( '.footer' ),
							),
						)
					),
				)
			),

			/**
			 * FONTS - This section will handle different elements fonts (eg. headings, body)
			 */
			'typography_panel' => array(
				'title'    => __( 'Typography', 'mies_txtd' ),
				'sections' => array(

					'headers_typography_section' => array(
						'title'    => __( 'Headings', 'mies_txtd' ),
						'options' => array(
							'google_titles_font' => array(
								'type'     => 'typography',
								'label'    => __( 'Headings', 'mies_txtd' ),
								'desc'       => __( 'Font for titles and headings.', 'mies_txtd' ),
								'recommended' => array(
									'Lato',
								),
								'load_all_weights' => true,
								'selector' => 'h1, h2, h3, h4, h5, h6, hgroup,
									h1 a, h2 a, h3 a, h4 a, h5 a, h6 a,
									.separator > *, blockquote cite'
							),
//							'this_divider_5349' => array(
//								'type' => 'html',
//								'html' => '<span class="separator" style="border:1px solid #ccc; display: block; width: 100%; height: 0; margin:25px 0 -20px 0; padding: 0; "></span>'
//							),
						)
					),

					'nav_typography_section' => array(
						'title'    => __( 'Navigation', 'mies_txtd' ),
						'options' => array(
							'google_menu_font'     => array(
								'type'    => 'typography',
								'label'   => __( 'Menu', 'mies_txtd' ),
								'desc'       => __( 'Font for the navigation menu.', 'mies_txtd' ),
								'load_all_weights' => true,
								'recommended' => array(
									'Lato',
								),
								'selector' => '.menu--main-menu, .widget_nav_menu, .menu--horizontal, .menu--main-menu .sub-menu'
							),
							'menu-font-size' => array(
								'type' => 'range',
								'label'         => __( 'Font Size', 'mies_txtd' ),
								'live' => true,
								'default'       => 100,
								'input_attrs' => array(
									'min'   => 8,
									'max'   => 120,
									'step'  => 1,
									'data-preview' => true
								),
								'css' => array(
									array(
										'property' => 'font-size',
										'selector' => '.menu--main-menu',
										'unit' => 'px',
									)
								)
							),
							'menu-line-height' => array(
								'type' => 'range',
								'label'         => __( 'Line Height', 'mies_txtd' ),
								'live' => true,
								'default'       => '1.7',
								'input_attrs' => array(
									'min'   => 0,
									'max'   => 3,
									'step'  => .1,
									'data-preview' => true
								),
								'css' => array(
									array(
										'property' => 'line-height',
										'selector' => '.menu--main-menu',
										'unit' => '',
									)
								)
							),
							'nav_text-transform' => array(
								'type'          => 'select',
								'label'         => __( 'Text Transform', 'mies_txtd' ),
								'choices'       => array(
									'none'       => 'None',
									'capitalize' => 'Capitalize',
									'uppercase'  => 'Uppercase',
									'lowercase'  => 'Lowercase',
								),
								'default'       => 'uppercase',
								'css' => array(
									array(
										'property' => 'text-transform',
										'selector' => '.menu--main-menu, .widget_nav_menu, .menu--horizontal, .menu--main-menu .sub-menu',
									)
								)
							),
							'nav_text-decoration' => array(
								'type'          => 'select',
								'label'         => __( 'Text Decoration', 'mies_txtd' ),
								'choices'       => array(
									'none'      => 'None',
									'underline' => 'Underline',
									'overline'  => 'Overline',
								),
								'default'       => 'none',
								'css' => array(
									array(
										'property' => 'text-decoration',
										'selector' => '.menu--main-menu > li > a, .widget_nav_menu a',
									)
								)
							),
						)
					),

					'content_typography_section' => array(
						'title'    => __( 'Body', 'mies_txtd' ),
						'options' => array(
							'google_body_font'     => array(
								'type'    => 'typography',
								'label'   => __( 'Body', 'mies_txtd' ),
								'desc'       => __( 'Font for content and widget text.', 'mies_txtd' ),
								'recommended' => array(
									'Open Sans',
								),
								'selector' => 'body, .menu--main-menu .sub-menu, .header .menu--horizontal, .h1, .h2, .h3, .h4, .archive-categories a,
									body a.btn, .btn, body #comment-submit, .navigation__text, .gmap__marker__btn',
								'load_all_weights' => true,
							),
							'body-font-size' => array(
								'type' => 'range',
								'label'         => __( 'Font Size', 'mies_txtd' ),
								'live' => true,
								'default'       => 17,
								'input_attrs' => array(
									'min'   => 8,
									'max'   => 72,
									'step'  => 1,
									'data-preview' => true
								),
								'css' => array(
									array(
										'property' => 'font-size',
										'selector' => 'body',
										'unit' => 'px',
									)
								)
							),
							'body-line-height' => array(
								'type' => 'range',
								'label'         => __( 'Line Height', 'mies_txtd' ),
								'live' => true,
								'default'       => '1.6',
								'input_attrs' => array(
									'min'   => 0,
									'max'   => 3,
									'step'  => 0.1,
									'data-preview' => true
								),
								'css' => array(
									array(
										'property' => 'line-height',
										'selector' => 'body',
									)
								)
							),
						)
					),
				)
			),
		);

		return $config;
	}
}
add_filter( 'customify_filter_fields', 'add_customify_mies_options', 11 );

function mies_range_negative_value( $value, $selector, $property, $unit ) {

	$output = $selector .'{
		' . $property . ': -' . $value . '' . $unit . ";\n" .
	          "}\n";

	return $output;
}

function mies_add_admin_bar_value( $value, $selector, $property, $unit ) {
	$new_value = (int)$value + 32;
	$output = $selector .'{ ' . $property . ': ' . $new_value . '' . $unit . "; }\n";

	return $output;
}

/**
 * With the new wp 43 version we've made some big changes in customizer, so we really need a first time save
 * for the old options to work in the new customizer
 */
function convert_mies_for_wp_43_once (){
	if ( ! is_admin() || ! function_exists( 'is_plugin_active' ) || ! is_plugin_active('customify/customify.php') || ( defined( 'DOING_AJAX' ) && DOING_AJAX ) ) {
		return;
	}

	$is_not_old = get_option('wpgrade_converted_to_43');

	$this_wp_version = get_bloginfo('version');
	$this_wp_version = explode( '.', $this_wp_version );
	$is_wp43 = false;
	if ( ! $is_not_old && (int) $this_wp_version[0] >= 4 && (int) $this_wp_version[1] >= 3 ) {
		$is_wp43 = true;
		update_option('wpgrade_converted_to_43', true);
		header( 'Location: '.admin_url().'customize.php?save_customizer_once=true');
		die();
	}
}

add_action('admin_init', 'convert_mies_for_wp_43_once');