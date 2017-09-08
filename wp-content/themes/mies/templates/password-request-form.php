<?php
/**
 * The template for the password form when things are protected
 *
 * @package Mies
 * @since   Mies 1.0
 */

global $wpgrade_private_post; ?>

<div class="content  content--single">
	<h1 class="entry-title  text--center"><?php the_title(); ?></h1>

	<div class="form-password  form-container">
		<div class="lock-icon">
			<i class="icon-lock"></i>
		</div>
		<div class="protected-area-text">
			<?php
			_e( 'This is a protected area.', 'mies_txtd' );

			if ( $wpgrade_private_post['error'] ) {
				echo $wpgrade_private_post['error']; ?>
				<span class="gray"><?php _e( 'Please enter your password again.', 'mies_txtd' ); ?></span>
			<?php } else { ?>
				<span class="gray"><?php _e( 'Please enter your password to continue.', 'mies_txtd' ); ?></span>
			<?php } ?>
		</div>
		<form class="auth-form" method="post" action="<?php echo wp_login_url() . '?action=postpass'; // just keep this action path ... wordpress will refear for us?>">
			<div class="protected-form-container">
				<div class="protected-password-field">
					<?php wp_nonce_field( 'password_protection', 'submit_password_nonce' ); ?>
					<input type="hidden" name="submit_password" value="1"/>
					<input type="password" name="post_password" id="auth_password" class="auth__pass" placeholder="<?php _e( "Password", 'mies_txtd' ) ?>"/>
				</div>
				<div class="protected-submit-button">
					<input type="submit" name="Submit" id="auth_submit" class="auth__submit  btn" value="<?php _e( "Authenticate", 'mies_txtd' ) ?>"/>
				</div>
			</div>
		</form>
	</div>
	<!-- .form-password -->
</div><!-- .content -->