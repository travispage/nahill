<?php
$return_string = '<div class="pixcode-slider  pixslider  js-pixslider" ' . esc_attr( $navigation_style ) . ' data-slidertransition="' . esc_attr( $custom_slider_transition ) . '">';

$return_string .= do_shortcode( $content );

$return_string .= '</div>';
echo $return_string;