<?php
/**
 * Template used to display the pixfields box
 * Available vars:
 * array        $pixfields          An array with all pixfields keys and their labels
 *
 * @package Mies
 * @since   Mies 1.0
 */

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

		if ( is_array( $pixfield ) && isset( $pixfield['value'] ) &&  empty( $pixfield['value'] ) ) {
			continue;
		}
		$showPixFiels = true;
		break;
	}
}
if ( $showPixFiels ): ?>
	<div class="content">
		<div class="project-meta">
			<?php foreach ( $pixfields as $id => $pixfield ) {
				if ( empty( $pixfield ) ) {
					continue;
				}

				$label = $id;
				$value = $pixfield;
				if ( is_array( $pixfield ) ) {
					if ( isset( $pixfield['label'] ) ) {
						$label = $pixfield['label'];
					}

					if ( isset( $pixfield['value'] ) ) {
						$value = $pixfield['value'];

						if ( empty( $value ) ) {
							continue;
						}
					}
				} ?>
				<div class="project-meta__field  <?php echo esc_attr( $class ) ?>">
				<h5 class="project-meta__label  mb0"><?php echo $label; ?></h5>
				<span class="project-meta__value"><?php echo $value; ?></span>
				</div><?php } ?>
		</div>
		<!-- .project-meta -->
	</div><!-- .content -->
<?php endif; ?>