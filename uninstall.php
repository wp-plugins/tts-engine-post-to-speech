<?php

	//if uninstall not called from WordPress exit
	if ( !defined( 'WP_UNINSTALL_PLUGIN' ) )
	exit ();

	// Remove TTSEngine options from database
	delete_option('ttsengine_display_link');
	delete_option('ttsengine_button_location_bottom');
	delete_option('ttsengine_link_location_bottom');
	delete_option('ttsengine_language');
	delete_option('ttsengine_version');
	
?>