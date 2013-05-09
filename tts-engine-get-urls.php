<?php
/*
tts-engine-get-urls.php: 	This file receives an ajax call from javascript with the 'POST' text.
							The text is re-POSTed to TTSEngine.com which returns an array of secure URLs
							where the webpage JPlayers can retrieve the audio from.
*/
	$load = $_POST['abspath'].'wp-load.php';
	require_once( $load );
	
	// TTSEngine.com URL where POST request is made to
	$file_location = 'http://www.ttsengine.com/wordpress/wordpress-plugin.php';
	
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
			'language' => $_POST['language'],
			'siteurl' => $_POST['siteurl'],
			'linkenabled' => $_POST['linkenabled']
			),
		'cookies' => array()
		)
	);

	// Output values to pass back to AJAX call
	$secure_urls;
	$error_message;
	
	// Handle POST response and/or errors
	if( is_wp_error( $response ) ) {
	
	   $error_message = "Error: ".$response->get_error_message();
	   $secure_urls = '';

	} else {
		
		if ( $response['response']['code'] != 200 ) {
			$error_message = "Error: Service is temporarily unavailable";
			$secure_urls = '';
		}
		else {
			$secure_urls = unserialize( $response['body'] );
			$error_message = '';
		}
	}
	
	// Build the AJAX Response array
	$ajax_response = array(
			"secureRequestURLs" => $secure_urls,
			"error" => $error_message
		);
		
	// Encode this array in JSON and return to the AJAX call
	echo json_encode( $ajax_response );
	
?>