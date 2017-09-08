<?php
/**
 * ACTIVATION SETTINGS
 * These settings will be needed when the theme will get active
 * Careful with the first setup, most of them will go in the clients database and they will be stored there
 * This file will be included in inc/functions/callbacks/activation-hooks.php
 * @package Mies
 * @since   Mies 1.0
 */

return array(
	'pixlikes-settings' => array(
		'first_activation'     => true,
		'show_on_post'         => false,
		'show_on_page'         => false,
		'show_on_hompage'      => false,
		'show_on_archive'      => false,
		'like_action'          => 'click',
		'hover_time'           => 1000,
		'free_votes'           => false,
		'load_likes_with_ajax' => false,
	),
	'pixfields-settings' => array(
		'display_on_post_types' => array(
			'mies_portfolio' => 'on'
		),
		'allow_edit_on_post_page' => 1,
		'display_place' => 'template_function'
	),
	'pixfields-list' => array(
		'mies_portfolio' => array(
			array (
				'label' => 'Client',
				'meta_key' => 'client'
			),
			array (
				'label' => 'Architects',
				'meta_key' => 'architects'
			),
			array (
				'label' => 'Year',
				'filter' => 'on',
				'meta_key' => 'year'
			),
			array (
				'label' => 'Program',
				'filter' => 'on',
				'meta_key' => 'program'
			),
			array (
				'label' => 'Status',
				'filter' => 'on',
				'meta_key' => 'status'
			),
			array (
				'label' => 'Scale',
				'meta_key' => 'scale'
			)
		)
	),
	'pixtypes-settings' => array(
		'first_activation' => true,
		'post_types' => array(
			wpgrade::shortname() . '_portfolio' => array(
				'labels'        => array(
					'name'               => __( 'Project', 'mies_txtd' ),
					'singular_name'      => __( 'Project', 'mies_txtd' ),
					'add_new'            => __( 'Add New', 'mies_txtd' ),
					'add_new_item'       => __( 'Add New Project', 'mies_txtd' ),
					'edit_item'          => __( 'Edit Project', 'mies_txtd' ),
					'new_item'           => __( 'New Project', 'mies_txtd' ),
					'all_items'          => __( 'All Projects', 'mies_txtd' ),
					'view_item'          => __( 'View Project', 'mies_txtd' ),
					'search_items'       => __( 'Search Projects', 'mies_txtd' ),
					'not_found'          => __( 'No Project found', 'mies_txtd' ),
					'not_found_in_trash' => __( 'No Project found in Trash', 'mies_txtd' ),
					'menu_name'          => __( 'Projects', 'mies_txtd' ),
				),
				'public'        => true,
				'rewrite'       => array(
					'slug'       => wpgrade::shortname() . '_portfolio',
					'with_front' => false,
				),
				'has_archive'   => 'portfolio-archive',
				'menu_icon'     => 'report.png',
				'menu_position' => null,
				'hierarchical' => true,
				'supports'      => array(
					'title',
					'editor',
					'page-attributes',
					'thumbnail',
					'revisions'
				),
//				'yarpp_support' => true,
			)
		),
		'taxonomies' => array(
			wpgrade::shortname() . '_portfolio_categories' => array(
				'hierarchical'      => true,
				'labels'            => array(
					'name'              => __( 'Project Categories', 'mies_txtd' ),
					'singular_name'     => __( 'Project Category', 'mies_txtd' ),
					'search_items'      => __( 'Search Project Categories', 'mies_txtd' ),
					'all_items'         => __( 'All Project Categories', 'mies_txtd' ),
					'parent_item'       => __( 'Parent Project Category', 'mies_txtd' ),
					'parent_item_colon' => __( 'Parent Project Category: ', 'mies_txtd' ),
					'edit_item'         => __( 'Edit Project Category', 'mies_txtd' ),
					'update_item'       => __( 'Update Project Category', 'mies_txtd' ),
					'add_new_item'      => __( 'Add New Project Category', 'mies_txtd' ),
					'new_item_name'     => __( 'New Project Category Name', 'mies_txtd' ),
					'menu_name'         => __( 'Portfolio Categories', 'mies_txtd' ),
				),
				'show_admin_column' => true,
				'rewrite'           => array( 'slug' => 'portfolio-category', 'with_front' => false ),
				'sort'              => true,
				'post_types'        => array( wpgrade::shortname() . '_portfolio' )
			),
		),
		'metaboxes' => array(
			// Project and Page Hero Settings
			wpgrade::shortname() . '_header_area_settings' => array(
				'id'         => wpgrade::shortname() . '_header_area_settings',
				'title'      => __( 'Hero Area Settings', 'mies_txtd' ),
				'pages'      => array( wpgrade::shortname() . '_portfolio', 'page' ), // Post type
				'context'    => 'normal',
				'priority'   => 'high',
				'hidden'     => true,
				'show_on'    => array(
					'key' => 'page-template',
					'value' => array( 'page-templates/contact.php' ),
					'hide' => true, // make this true if you want to hide it
				),
				'show_names' => true, // Show field names on the left
				'fields'     => array(
					array(
						'name'    => __( 'Height', 'mies_txtd' ),
						'desc'    => '<p class="cmb_metabox_description">' . __( 'Select the height of the header area in relation to the browser window.', 'mies_txtd' ) . '</p>',
						'id'      => wpgrade::prefix() . 'header_height',
						'type'    => 'select',
						'options' => array(
							array(
								'name'  => __( '&#9673;&#9673;&#9673; &nbsp;Full', 'mies_txtd' ),
								'value' => 'full-height',
							),
							array(
								'name'  => __( '&#9673;&#9673;&#9711; &nbsp;Two Thirds', 'mies_txtd' ),
								'value' => 'two-thirds-height',
							),
							array(
								'name'  => __( '&nbsp; &#9673;&#9711; &nbsp;&nbsp;Half', 'mies_txtd' ),
								'value' => 'half-height',
							),
							array(
								'name'  => __( 'Auto (content based)', 'mies_txtd' ),
								'value' => 'auto-height',
							),
						),
						'std'     => 'full-height',
					),
					array(
						'name' => __( 'Subtitle', 'mies_txtd' ),
						// 'desc' => __( "This is optional. Leave empty to remove the subtitle.", 'mies_txtd' ),
						'id'   => wpgrade::prefix() . 'header_cover_subtitle',
						'type' => 'text',
					),
					array(
						'name' => __( 'Title', 'mies_txtd' ),
						'desc' => __( "If left empty we will use the page title. Tip: put a space if you don't want any cover text.", 'mies_txtd' ),
						'id'   => wpgrade::prefix() . 'header_cover_title',
						'type' => 'text',
					),
					array(
						'name'    => __( 'Description', 'mies_txtd' ),
						'desc'    => __( "You can use shortcodes (like the Separator) or even images to further embellish this.", 'mies_txtd' ),
						'id'      => wpgrade::prefix() . 'header_cover_description',
						'type'    => 'wysiwyg',
						'options' => array(
							'media_buttons' => true,
							'textarea_rows' => 3,
							'teeny'         => false,
							'tinymce'       => true,
							'quicktags'     => true,
						),
					),
					array(
						'name'      => __( 'Inner Content Style <a class="tooltip" title="
							<p><strong>Light</strong> style uses white text for dark background colors.</p>
							<p><strong>Shadowed</strong> style add a transparent shadow behind the light text.</p>
							<p><strong>Dark</strong> style uses black text for light background colors.</p>
							"></a>', 'mies_txtd' ),
						'desc'      => __( 'Select the style of the elements inside the hero area', 'mies_txtd' ),
						'id'        => wpgrade::prefix() . 'header_content_style',
						'type'      => 'select',
						'options'   => array(
							array(
								'name'  => __( 'Light', 'mies_txtd' ),
								'value' => 'hero--light'
							),
							array(
								'name'  => __( 'Shadowed', 'mies_txtd' ),
								'value' => 'hero--shadowed'
							),
							array(
								'name' => __('Dark', 'mies_txtd'),
								'value' => 'hero--dark'
							),
						),
						'std'       => 'hero--shadowed'
					),
//					array(
//						'name' => __( 'Make Menu Bar Transparent', 'mies_txtd' ),
//						'desc' => __( "This will remove the background from the menu and logo top bar.", 'mies_txtd' ),
//						'id'   => 'header_transparent_menu_bar',
//						'type' => 'checkbox',
//						'std'  => 'on',
//					),
					array(
						'name'    => __( 'Social Share', 'mies_txtd' ),
						'id'      => wpgrade::prefix() . 'page_enabled_social_share',
						'type'    => 'select',
						'options' => array(
							array(
								'name'  => __( 'Enabled', 'mies_txtd' ),
								'value' => true
							),
							array(
								'name'  => __( 'Disabled', 'mies_txtd' ),
								'value' => false
							)
						),
						'std'     => false
					),
//					array(
//						'name' => __( 'Inverse The Colors', 'mies_txtd' ),
//						'desc' => __( "This will make the content background black and the text white.", 'mies_txtd' ),
//						'id'   => wpgrade::prefix() . 'inverse_section_colors',
//						'type' => 'checkbox',
//					),
					array(
						'name'    => __( 'Slideshow Options:', 'mies_txtd' ),
						'id'      => wpgrade::prefix() . 'hero_slider_options',
						'type'    => 'title',
					),
					array(
						'name'    => __( 'Image Scaling <a class="tooltip" title="<p><strong>Fill</strong> scales image to completely fill slider container (recommended for landscape images)</p>
										<p><strong>Fit</strong> scales image to fit the container (recommended for portrait images)</p>
										<p><strong>Fit if Smaller</strong> scales image to fit only if size of slider container is less than size of image.</p>
										<p><strong>Auto Height</strong> scales the container to fit the full size image.</p>"></a>', 'mies_txtd' ),
						'desc'    => __( '<a target="_blank" href="http://bit.ly/slider-image-scaling" style="font-size: 80%;">Visual explanation</a></p>', 'mies_txtd' ),
						'id'      => wpgrade::prefix() . 'hero_slider_image_scale_mode',
						'type'    => 'select',
						'options' => array(
							array(
								'name'  => __( 'Fill', 'mies_txtd' ),
								'value' => 'fill'
							),
							array(
								'name'  => __( 'Fit', 'mies_txtd' ),
								'value' => 'fit'
							),
							array(
								'name' => __('Fit if Smaller', 'mies_txtd'),
								'value' => 'fit-if-smaller'
							),
							array(
								'name'  => __( 'Auto Height', 'mies_txtd' ),
								'value' => 'auto'
							),
						),
						'std'     => 'fill'
					),
					array(
						'name'    => __( 'Slider Autoplay', 'mies_txtd' ),
						'id'      => wpgrade::prefix() . 'hero_slider_autoplay',
						'type'    => 'select',
						'options' => array(
							array(
								'name'  => __( 'Enabled', 'mies_txtd' ),
								'value' => true
							),
							array(
								'name'  => __( 'Disabled', 'mies_txtd' ),
								'value' => false
							)
						),
						'std'     => false
					),
					array(
						'name'       => __( 'Autoplay delay between slides (in milliseconds)', 'mies_txtd' ),
						'id'         => wpgrade::prefix() . 'hero_slider_delay',
						'type'       => 'text_small',
						'std'        => '1000',
						'display_on' => array(
							'display' => true,
							'on'      => array(
								'field' => wpgrade::prefix() . 'hero_slider_autoplay',
								'value' => true
							)
						),
					),

				),
			),

			//for the Contact Page template
			'_gmap_settings' => array(
				'id'         => '_gmap_settings',
				'title'      => __( 'Map Coordinates & Display Options', 'mies_txtd' ),
				'pages'      => array( 'page' ), // Post type
				'context'    => 'normal',
				'priority'   => 'high',
				'hidden'     => true,
				'show_on'    => array(
					'key' => 'page-template',
					'value' => array( 'page-templates/contact.php' ),
//					'hide' => true, // make this true if you want to hide it
				),
				'show_names' => true, // Show field names on the left
				'fields'     => array(
					array(
						'name' => __( 'Map Height', 'mies_txtd' ),
						'desc' => __( '<p class="cmb_metabox_description">Select the height of the Google Map area in relation to the browser window.</p>', 'mies_txtd' ),
						'id'   => wpgrade::prefix() . 'page_gmap_height',
						'type'    => 'select',
						'options' => array(
							array(
								'name'  => __( '&nbsp; &#9673;&#9711; &nbsp;Half', 'mies_txtd' ),
								'value' => 'half-height',
							),
							array(
								'name'  => __( '&#9673;&#9673;&#9711; Two Thirds', 'mies_txtd' ),
								'value' => 'two-thirds-height',
							),
							array(
								'name'  => __( '&#9673;&#9673;&#9673; Full Height', 'mies_txtd' ),
								'value' => 'full-height',
							)
						),
						'std'     => 'two-thirds-height',
					),
					array(
						'name' => __( 'Google Maps Pins', 'mies_txtd' ),
						'desc' => __( 'Paste here the Share URL you have taken from <a href="http://www.google.com/maps" target="_blank">Google Maps</a>.', 'mies_txtd' ),
						'id'   => 'gmap_urls',
						'type' => 'gmap_pins',
						'std' => array(
								1 => array(
									'location_url' => "https://www.google.ro/maps/@51.5075586,-0.1284425,18z",
									'name' => __('London', 'mies_txtd')
								)
							)
					),
					array(
						'name' => __( 'Custom Colors', 'mies_txtd' ),
						'desc' => __( 'Allow us to change the map colors to better match your website.', 'mies_txtd' ),
						'id'   => wpgrade::prefix() . 'gmap_custom_style',
						'type' => 'checkbox',
						'std'  => 'on',
					),
					array(
						'name'    => __( 'Social Share', 'mies_txtd' ),
						'id'      => wpgrade::prefix() . 'gmap_enabled_social_share',
						'type'    => 'select',
						'options' => array(
							array(
								'name'  => __( 'Enabled', 'mies_txtd' ),
								'value' => true
							),
							array(
								'name'  => __( 'Disabled', 'mies_txtd' ),
								'value' => false
							)
						),
						'std'     => false
					),
				),
			),
			// Hero Area in the right sidebar
			'_post_aside'              => array(
				'id'         => '_post_aside',
				'title'      => __( 'Hero Area <a class="tooltip" title="This image will be used for the top area.<p>Tip: Uploading <strong>multiple images</strong>, will transform them in a <strong>slider</strong>.</p>"></a>', 'mies_txtd' ),
				'pages'      => array( wpgrade::shortname() . '_portfolio', 'page' ), // Post type
				'context'    => 'side',
				'priority'   => 'low',
				'show_names' => true, // Show field names on the left
				'fields'     => array(
					array(
						'name' => __( 'Hero Image', 'mies_txtd' ),
						'id'   => wpgrade::prefix() . 'second_image',
						'type' => 'gallery',
					),
				)
			),

			//for the Projects Selection
			'_projects_list_template'     => array(
				'id'         => '_projects_list_template',
				'title'      => __( 'Projects List', 'mies_txtd' ),
				'pages'      => array( 'page' ), // Post type
				'context'    => 'normal',
				'priority'   => 'high',
				'hidden'     => true,
				'show_on'    => array(
					'key'   => 'page-template',
					'value' => array('page-templates/projects-list.php' ),
				),
				'show_names' => true, // Show field names on the left
				'fields'     => array(
					array(
						'name'    => __( 'Layout', 'mies_txtd' ),
						'desc'    => '<p class="cmb_metabox_description">' . __( 'Select the project layout.', 'mies_txtd' ) . '</p>',
						'id'      => 'projects_layout',
						'type'    => 'select',
						'options' => array(
							array(
								'name'  => __( 'Grid', 'mies_txtd' ),
								'value' => 'grid',
							),
							array(
								'name'  => __( 'Slider', 'mies_txtd' ),
								'value' => 'slider',
							)
						),
						'std'     => 'grid',
					),
					array(
						'name'    => __( 'Source', 'mies_txtd' ),
						'desc'    => '<p class="cmb_metabox_description">' . __( 'Select the project layout.', 'mies_txtd' ) . '</p>',
						'id'      => 'projects_source',
						'type'    => 'select',
						'options' => array(
							array(
								'name'  => __( 'Latest Projects', 'mies_txtd' ),
								'value' => 'latest',
							),
							array(
								'name'  => __( 'By Category', 'mies_txtd' ),
								'value' => 'category',
							),
							array(
								'name'  => __( 'Selected', 'mies_txtd' ),
								'value' => 'selected',
							)
						),
						'std'     => 'latest',
					),
					array(
						'name'       => __( 'Select a portfolio category', wpgrade::textdomain() ),
						'desc'       => __( 'Select a portfolio category and we will show it on your homepage.', wpgrade::textdomain() ),
						'id'         => 'selected_portfolio_category',
						'type'       => 'select_cpt_term',
						'taxonomy'   => wpgrade::shortname() . '_portfolio_categories',
//						'options'    => array(),
						'display_on' => array(
							'display' => true,
							'on'      => array(
								'field' => 'projects_source',
								'value' => 'category'
							)
						),
					),
					array(
						'name'    => __( 'Select projects', 'mies_txtd' ),
						'id'      => 'selected_projects',
						'desc'    => __( 'Choose your projects. Drag and drop to reorder them to your liking. These projects will be excluded from the main projects list.', 'mies_txtd' ),
						'type'    => 'pw_multiselect_cpt',
						'options' => array(
							'args' => array(
								'post_type' => wpgrade::shortname() . '_portfolio',
								'post_status' => 'publish'
							),
						),
						'sanitization_cb' => 'pw_select2_sanitise',
						'display_on' => array(
							'display' => true,
							'on'      => array(
								'field' => 'projects_source',
								'value' => 'selected'
							)
						),
					),
					array(
						'name'       => __( 'Number of Projects', 'mies_txtd' ),
						'id'         => 'number_of_projects',
						'type'       => 'text_small',
						'std'        => '6',
						'display_on' => array(
							'display' => true,
							'on'      => array(
								'field' => 'projects_source',
								'value' => array('latest', 'category')
							)
						),
					),
					array(
						'name'       => __( 'View more link label', 'mies_txtd' ),
						'id'         => 'view_more_link_label',
						'type'       => 'text_small',
						'std'        => 'View more',
						'display_on' => array(
							'display' => true,
							'on'      => array(
								'field' => 'projects_layout',
								'value' => 'grid'
							)
						),
					),
//					array(
//						'name'    => __( 'Exclude From List', 'mies_txtd' ),
//						'id'      => 'portfolio_exclude_featured',
//						'desc'    => __( 'Enable this so your featured projects will not show in the main project list. If you want them there also, leave this disabled.', 'mies_txtd' ),
//						'type'    => 'select',
//						'options' => array(
//							array(
//								'name'  => __( 'Enabled', 'mies_txtd' ),
//								'value' => true,
//							),
//							array(
//								'name'  => __( 'Disabled', 'mies_txtd' ),
//								'value' => false,
//							),
//						),
//						'std'     => true,
//					),
				),
			),

		),
	),
);