<?php

if ( function_exists( 'get_pixfields' ) ) {

	global $pixfields_plugin;

	if ( isset( $pixfields_plugin->plugin_settings['display_place'] ) ) { // && $pixfields_plugin::$plugin_settings['display_place'] == 'shortcode' ) {

		$pixfields = get_pixfields();

		$class = '';
		if ( ! isset( $pixfields ) || empty( $pixfields ) ) {
			return;
		}
		if ( 6 > count( $pixfields ) ) {
			$class = 'field--' . count( $pixfields ) . '-in-row';
		} else {
			$class = 'field--6-in-row';
		}

		$showPixFiels = false;
		foreach ( $pixfields as $label => $pixfield ) {
			if ( ! empty( $pixfield ) ) {
				$showPixFiels = true;
				break;
			}
		}

		if ( $showPixFiels ) { ?>
			<div class="project-meta">
				<?php
				foreach ( $pixfields as $id => $pixfield ) {
					if ( empty( $pixfield ) ) {
						continue;
					}

					$label = $id;
					$value = $pixfield;
					if ( is_array( $pixfield  ) ) {
						if ( isset( $pixfield['label'] ) ) {
							$label = $pixfield['label'];
						}

						if ( isset( $pixfield['value'] ) ) {
							$value = $pixfield['value'];
						}
					}

					?>
					<div class="project-meta__field  <?php echo esc_attr( $class ) ?>">
						<h5 class="project-meta__label  mb0"><?php echo $label; ?></h5>
						<span class="project-meta__value"><?php echo $value; ?></span>
					</div>
				<?php } ?>
			</div>
			<!-- .project-meta -->
		<?php }
	}
}