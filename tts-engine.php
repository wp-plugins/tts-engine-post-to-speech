<?php
/*
Plugin Name: TTS Engine Post to Speech
Plugin URI: http://www.ttsengine.com
Description: Free, high quality text to speech for your posts - 52 languages supported.
Version: 2.0
Author: <a href="http://www.ttsengine.com">TTSEngine.com</a>
Author URI: http://www.ttsengine.com
License: GPLv2

	Copyright 2013 www.ttsengine.com (email : support@ttsengine.com)
	
	This program is free software; you can redistribute it and/or modify
	it under the terms of the GNU General Public License, version 2, as 
	published by the Free Software Foundation.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU General Public License for more details.
	
	You should have received a copy of the GNU General Public License
	along with this program; if not, write to the Free Software
	Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/
	
	include_once( plugin_dir_path(__FILE__).'tts-engine-language-support.php' );
	define ('TTS_ENGINE_VERSION', '2.0' );
	
	// Build a static class for unique function calls
	if ( ! class_exists( 'Scream_TTS_Engine' ) )	{
			
		$tts_posts = array();	// To store information on the posts being displayed on the current page
		$languages_data;		// All supported languages data
		$language;				// Current selected language
		$language_phrases;		// Plugin text for the current selected language
			
		class Scream_TTS_Engine	{				
			
			// Calls the enqueue fucntions for both CSS and JavaScript for inclusion in the non-admin blog pages
			public static function enqueue_head_elements() {
			
				self::enqueue_styles();
				self::enqueue_scripts();
				
			}
					
			// Enqueues plugin style sheet
			static function enqueue_styles()	{
			
				wp_enqueue_style( 'core', plugins_url( '/css/core.css', __FILE__ ) );
				
			}
			
			// Enqueues plugin scripts
			static function enqueue_scripts()	{
			
				// Add native jQuery script for jPlayer
				wp_enqueue_script( 'jquery' );
				
				// Add native flash support script required for JPlayer if HTML5 fails
				wp_enqueue_script( 'swfobject' );
				
				// Add JPlayer script for audio playback
				wp_enqueue_script( 'jplayer', plugins_url( '/js/jquery.jplayer.min.js', __FILE__ ), array( 'jquery' ) );
				
				// Register the Main plugin javascript file
				wp_register_script( 'ttsengine', plugins_url( '/js/tts-engine.js', __FILE__ ), array( 'jquery', 'swfobject', 'jplayer' ) );
				
			}
			
			
			// Adds the required HTML elements to each post for the plugin functionality
			public static function add_plugin_elements( $content )	{

				// To access the post ID within the 'loop'
				global $post, $language_phrases;
				$post_id = $post->ID;
				
				// Add to tts posts if being displayed on current page
				self::add_to_tts_posts( $post );
				
				// Get the options dictating where elements are located
				$button_location_bottom = ( get_option( 'ttsengine_button_location_bottom' ) == 'checked' );
				$link_displayed = ( get_option( 'ttsengine_display_link' ) == 'checked' );
				$link_location_bottom = ( get_option( 'ttsengine_link_location_bottom' ) == 'checked' );
							
				// Create a class container to tag the body text across themes
				$content = '<div class = "tts-body-text">'.$content.'</div>';
				
				// Declare HTML for the different element combination options
				$button_and_link_html = '<div class="tts-container">
								<div class="tts-buttoncontainer">
								<a name="listenbutton" style="color:#505261; outline:0; text-decoration:none;" class="listenbuttonbase" href="javascript:void(null)" id="listenbutton'.$post_id.'" onclick="ttsengine_processTTS(this);">
								<em></em>'.$language_phrases[1].'</a></div>
								<div class="tts-imagecontainer" id="tts-imagecontainer'.$post_id.'"></div>
								<div class="tts-linkcontainer"><span style ="white-space: nowrap; font-size:12px;">Voice-over by
								<a href="http://www.ttsengine.com">TTSEngine.com</a>
								</span></div></div>';
								
				$button_html = '<div class="tts-container">
								<div class="tts-buttoncontainer">
								<a name="listenbutton" style="color:#505261; outline:0; text-decoration:none;" class="listenbuttonbase" href="javascript:void(null)" id="listenbutton'.$post_id.'" onclick="ttsengine_processTTS(this);">
								<em></em>
								'.$language_phrases[1].'</a></div>
								<div class="tts-imagecontainer" id="tts-imagecontainer'.$post_id.'"></div></div>';
				
				$link_html = 	'<div class="tts-container">
								<div class="tts-linkcontainer">
								<span style ="white-space: nowrap; font-size:12px;">Voice-over by 
								<a href = "http://www.ttsengine.com">TTSEngine.com</a>
								</span></div></div>';				
				
				// Layout the elements 
				if ( ! $button_location_bottom ) {				
					if ( $link_displayed ) {		
						if ( ! $link_location_bottom )
							$content = $button_and_link_html.$content;
						else
							$content = $button_html.$content.$link_html;
					}
					else
						$content = $button_html.$content;
				}
				else {
					if ( $link_displayed ) {
						if ( $link_location_bottom )
							$content = $content.$button_and_link_html;
						else
							$content = $link_html.$content.$button_html;
					}
					else
						$content = $content.$button_html;	
				}

				return $content;
			}
			
			// Adds a post to the '$tts_posts' object
			static function add_to_tts_posts( $post ) {
			
				global $tts_posts;
				
				if ( ! self::tts_post_added( $post->ID ) ) {
					$tts_post = array(
						'id' => $post->ID,
						'title' => self::filter_content( $post->post_title ),
						'content' => self::filter_content( $post->post_content )
					);
					array_push( $tts_posts, $tts_post );
				}
				
			}
			
			// Removes any unwanted syntax (locally) stored with the post content in the database
			static function filter_content( $content ) {
				
				// Remove any wordpress 'shortcode' from content string
				$content = strip_shortcodes( $content );
				// Remove any extraneous CSS in curly braces stored with the post content in the database by some themes/plugins
				$pattern = '/{(.*?)}/';
				$content = preg_replace( $pattern, ' ', $content );
				return $content;
				
			}
			
			
			// Verifies if a post has already been added
			static function tts_post_added( $id ) {
				
				global $tts_posts;
				$added = false;
				
				for ( $i = 0; $i < sizeof( $tts_posts ); $i++ ) {
					if ( intval( $tts_posts[ $i ]['id'] ) == intval( $id ) )
						$added = true;
				}
				
				return $added;
			}		
			
			// Localizes the main JavaScript file
			public static function localize_script() {
				
				global $tts_posts, $language, $language_phrases;

				// Enqueue the script already registered
				wp_enqueue_script('ttsengine');
				
				// Create an array of the variables to localize
				$loc_variables = array(
					'ajax' => plugins_url( 'tts-engine-get-urls.php', __FILE__ ),
					'ajax_safari' => plugins_url( 'tts-engine-get-safari-urls.php', __FILE__ ),
					'ajax_iOS6' => plugins_url( 'tts-engine-get-iOS6-url.php', __FILE__ ),
					'jplayer_swf' => plugins_url( 'Jplayer.swf', __FILE__ ),
					'site_url' => get_site_url(),
					'abs_path' => ABSPATH,
					'link_enabled' => ( ( get_option( 'ttsengine_display_link' ) == 'checked' ) ? 'true' : 'false' ),
					'tts_posts' => $tts_posts,
					'language' => $language,
					'listen_phrase' => $language_phrases[1],
					'loading_phrase' => $language_phrases[2],
					'play_phrase' => $language_phrases[3],
					'stop_phrase' => $language_phrases[4]
					);	
				
				wp_localize_script( 'ttsengine', 'vars', $loc_variables );
						
			}
			
			// Adds the plugin options page
			public static function create_admin_options() {
					
				add_options_page( 'TTS Engine Plugin Page', 'TTS Engine Menu', 'manage_options', 'ttsengine-settings', 'Scream_TTS_Engine::options_page' );
				
			}
			
			// Updates the options in the database
			static function options_update() {
			
				if ( isset( $_POST['display_link'] ) && $_POST['display_link'] == 'on' ) { $display = 'checked'; } else { $display = ''; }  
				update_option( 'ttsengine_display_link', $display );
				
				if ( isset( $_POST['button_location_bottom'] ) && $_POST['button_location_bottom'] == 'on' ) { $button_location_bottom = 'checked'; } else { $button_location_bottom = ''; }  
				update_option( 'ttsengine_button_location_bottom', $button_location_bottom );
				
				if ( isset( $_POST['link_location_bottom'] ) && $_POST['link_location_bottom'] == 'on' ) { $link_location_bottom = 'checked'; } else { $link_location_bottom = ''; }  
				update_option( 'ttsengine_link_location_bottom', $link_location_bottom );
				
				if ( isset( $_POST['language-selector'] ) ) { update_option( 'ttsengine_language', $_POST['language-selector'] ); }
				
				// Update the local language settings
				self::get_language_setting();
			}
			
			// Creates the plugin options page
			public static function options_page() {
			
				// check user can edit options
				if ( !current_user_can( 'manage_options' ) )  {
					wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
				}
				
				// Update the options if the page options form was submitted. The form is submitted to the options page itself.
				if ( isset( $_POST['update_options'] ) &&  $_POST['update_options'] == 'true' ) {
					self::options_update();
				}
				
				// Display the HTML content
				?>
				<div class="wrap">
				<h2>TTS Engine Post to Speech Options</h2>	
				<form method="post" action="">
				<input type="hidden" name="update_options" value="true" />
				<h3>Display Options</h3>
				<input type="checkbox" name="display_link" id="display_link" 
				<?php echo get_option('ttsengine_display_link'); ?>
				/> Display link to "TTSEngine.com"<br/><br/>
				<input type="checkbox" name="button_location_bottom" id="button_location_bottom" 
				<?php echo get_option('ttsengine_button_location_bottom'); ?>
				/> Locate Listen button after post body ( Default location is before post body )<br/><br/>
				<input type="checkbox" name="link_location_bottom" id="link_location_bottom" 
				<?php echo get_option('ttsengine_link_location_bottom'); ?>
				/> Locate "TTSEngine.com" Link after post body ( If Displayed. Default location is before post body )<br/>
				<h3>Language Options</h3>
				<div style="float:left; " >Select Posts Language :
				<?php echo self::display_langauge_menu(); ?>
				</div><br/>
				<p><small>*The language selected must match the post text language for correct speech synthesis.</small></p><br/>
				<div style="clear:both;"><input type="submit" value="Update Options" class="button" /></div>
				</form>
				</div>
				<?php
			}
			
			// Adds a 'Settings' link for the plugin options
			public static function create_settings_link( $links ) {
			
				$settings_link = '<a href="options-general.php?page=ttsengine-settings">Settings</a>';
				array_unshift( $links, $settings_link );
				return $links;
				
			}
			
			// Admin function to be run on plugin activation
			public static function on_activation() {
			
				// Check for at least PHP 5.2 required for 'json_encode' in AJAX call
				$php_version = explode( '.', PHP_VERSION );
				if ( ( intval( $php_version[0] ) < 5) || ( intval( $php_version[1] ) < 2 ) ) {
					die( "Sorry, 'TTS Engine Post to Speech' requires PHP 5.2 or higher on hosting server.</br>Current PHP Version: ".PHP_VERSION );
				}
				
				// register Plugin version number in database
				update_option( 'ttsengine_version', TTS_ENGINE_VERSION );

			}
			
			// Language selection menu for admin settings page
			public static function display_langauge_menu() {
				
				global $languages_data, $language, $language_phrases;	
				$select = '<select name="language-selector">';
				foreach ( $languages_data as $lang => $phrases ) {
					$selected = ( $lang === $language ) ? 'selected' : '';
					$select.= '<option value='.$lang.' '.$selected.'>'.$phrases[0].'</option>';
				}
				$select.= '</select>';
				return $select;
				
			}
			
			// Gets the users' language setting
			public static function get_language_setting() {
				
				global $languages_data, $language, $language_phrases;
				$language = get_option('ttsengine_language');
				if ( empty( $language ) )
					$language = 'usenglish';
				
				$languages_data = TTS_Engine_Utilities::get_language_data();
				$language_phrases = $languages_data[ $language ];
				
			}
			
		}
		
		// Get the language data and settings when a page loads
		Scream_TTS_Engine::get_language_setting();
		
		// Add the actions and filters to the appropriate wordpress hooks
		if ( is_admin() ) {
		
			add_action( 'admin_menu', 'Scream_TTS_Engine::create_admin_options' );
			$plugin = plugin_basename( __FILE__ );
			add_filter( "plugin_action_links_$plugin", 'Scream_TTS_Engine::create_settings_link' );
			
		}
		else {
	
			add_action( 'wp_enqueue_scripts', 'Scream_TTS_Engine::enqueue_head_elements' );
			add_filter( 'the_content', 'Scream_TTS_Engine::add_plugin_elements' );
			add_action( 'wp_footer', 'Scream_TTS_Engine::localize_script' );

		}
		
		register_activation_hook( __FILE__, array('Scream_TTS_Engine', 'on_activation') );
	}
	
?>
