<?php

// create id attribute
$id = ! empty( $id ) ? 'id="' . esc_attr( $id ) . '"' : '';

// get needed classes
$classes = 'pixcode  pixcode--btn  btn';
$classes .= ! empty( $size ) ? '  btn--' . $size : '';
$classes .= ! empty( $type ) ? '  btn--' . $type : '';
$classes .= ! empty( $class ) ? '  ' . $class : '';
// create class attribute
$classes = $classes !== '' ? 'class="' . esc_attr( $classes ) . '"' : '';

// create href attribute
$href = ! empty( $link ) ? 'href="' . esc_attr( $link ) . '"' : '';

// get content
$content = ! empty( $content ) ? $this->get_clean_content( $content ) : '';

// get target
$target = ! empty( $newtab ) ? 'target="_blank"' : '';

echo '<a ' . $id . ' ' . $classes . ' ' . $href . ' ' . $target . '>' . $content . '</a>';