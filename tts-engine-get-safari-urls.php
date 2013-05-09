<?php
/*
tts-engine-get-safari-urls.php: 	This file receives an ajax call from javascript with the 'POST' text.
									The text is re-POSTed to TTSEngine.com which returns the secure URLs
									which the mobile Safari <audio> tag can use (iOS versions < 6).
*/

	$load = $_POST['abspath'].'wp-load.php';
	require_once( $load );
	
	$ajax_response = array();
	$all_urls = array();
	$error_message;
	
	foreach( $_POST as $key => $value ) {
		if ( strpos( $key, 'post' ) !== false ) {
			$response = get_url_response( $value );
			$id = str_replace( 'post', '', $key );
			$all_urls[ $id ] = $response;
		}
	}

	$ajax_response['iOS_URLs'] = $all_urls;
	$ajax_response['error'] = $error_message;
	
	// Encode this array in JSON and return to the AJAX call
	echo json_encode( $ajax_response );
	
	
	// Build & execute remote POST request
	function get_url_response( $text ) {
		
		global $error_message;
		$response;
		$file_location = 'http://www.ttsengine.com/wordpress/wordpress-plugin.php';
		
		$response = wp_remote_post( $file_location, array(
			'method' => 'POST',
			'timeout' => 45,
			'redirection' => 5,
			'httpversion' => '1.0',
			'blocking' => true,
			'headers' => array(),
			'body' => array(
				'appid' => 'd666d54bd05d5191f49f8be14d3cf91d',
				'text' => $text,
				'language' => $_POST['language'],
				'siteurl' => $_POST['siteurl'],
				'linkenabled' => $_POST['linkenabled']
				),
			'cookies' => array()
			)
		);
		
		if( is_wp_error( $response ) ) {
		
		   $error_message = "Error: ".$response->get_error_message();
		   $response = '';

		} else {
			
			if ( $response['response']['code'] != 200 ) {
				$error_message = "Error: Service is temporarily unavailable";
				$response = '';
			}
			else {
				$response = unserialize( $response['body'] );
				$error_message = '';
			}
		}
		
		return $response;
	}
?>