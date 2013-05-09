<?php
/*
tts-engine-get-iOS6-url.php: 	
					This file receives an ajax call from javascript with the 'POST' text.
					The text is re-POSTed to TTSEngine.com which returns the secure URL required
					for the iOS Web Audio API audiocontext.
*/
	$load = $_POST['abspath'].'wp-load.php';
	require_once( $load );
	
	// TTSEngine.com URL where POST request is made to
	$file_location = 'http://www.ttsengine.com/wordpress/wordpress-plugin-iOS6.php';
	
	// Build & execute remote POST request
	$response = wp_remote_post( $file_location, array(
		'method' => 'POST',
		'timeout' => 45,
		'redirection' => 5,
		'httpversion' => '1.0',
		'blocking' => true,
		'headers' => array(),
		'body' => array(
			'appid' => 'd666d54bd05d5191f49f8be14d3cf91d',
			'text' => $_POST['text'],
			'language' => $POST['language'],
			'siteurl' => $_POST['siteurl'],
			'linkenabled' => $_POST['linkenabled']
			),
		'cookies' => array()
		)
	);

	// Output values to pass back to AJAX call
	$secure_url;
	$error_message;
	
	// Handle POST response and/or errors
	if( is_wp_error( $response ) ) {
	
	   $error_message = "Error: ".$response->get_error_message();
	   $secure_url = '';

	} else {
		
		if ( $response['response']['code'] != 200 ) {
			$error_message = "Error: Service is temporarily unavailable";
			$secure_url = '';
		}
		else {
			$secure_url = unserialize( $response['body'] );
			$error_message = '';
		}
	}
	
	// Build the AJAX Response array
	$ajax_response = array(
			"iOS6URL" => $secure_url,
			"error" => $error_message
		);
		
	// Encode this array in JSON and return to the AJAX call
	echo json_encode( $ajax_response );
	
?>