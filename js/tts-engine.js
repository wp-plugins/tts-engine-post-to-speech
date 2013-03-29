	/*
	Two instances of JPlayer are used so that the audio for a post's paragraph is requested from the
	TTSEngine.com API and loaded into an instance of JPlayer while the previous paragraph's audio is being
	played by the other JPlayer instance.
	*/
	
	jQuery.noConflict();
	
	var ttsengine_jPlayersInitialized = false;
	var ttsengine_inProcess = false;
	var ttsengine_currentPostId;
	var ttsengine_isMSIE;		// Identify Internet Explorer Browser
	var ttsengine_jPlayer_1; 	// 1st JPlayer instance
	var ttsengine_jPlayer_2; 	// 2nd JPlayer instance
	var ttsengine_sectionURLs;
	var ttsengine_currentSectionID;
	

	// Call 'ttsengine_onPageLoad()' when the page finishes loading
	ttsengine_addLoadEvent(ttsengine_onPageLoad);
	
	// Allows any function to be appended to the basic 'window.load' event if multiple exist
	function ttsengine_addLoadEvent(func) {
	
		var oldonload = window.onload;
		if (typeof window.onload != 'function')
			window.onload = func;
		else {
			window.onload = function()	{
				if (oldonload)
					oldonload();
					
				func();
			}
		}
	
	}

	// Page load function
	function ttsengine_onPageLoad() {

		// Extend the listen button CSS class for different browsers
		ttsengine_extendButtonClassForBrowser();

		// Add jPlayer Instances to body
		ttsengine_addJPlayers();
	}
	
	// Extend the listen buttons CSS class depending on the rendering browser
	function ttsengine_extendButtonClassForBrowser() {
	
		// Check if the browser is IE		
		var isMSIE_check = /*@cc_on!@*/0;
		
		if (isMSIE_check)
			ttsengine_isMSIE = true;
		else
			ttsengine_isMSIE = false;
			
		var listenButtons = document.getElementsByName('listenbutton');
		
		for ( var i = 0; i < listenButtons.length; i++ ) {
			if (ttsengine_isMSIE)
				listenButtons[i].className += " listenbuttonIE";
			else
				listenButtons[i].className += " listenbutton";
		}
		
	}
	
	// Add the jPlayers to the start of the body tag
	function ttsengine_addJPlayers() {
	
		var jp1 = document.createElement("div");
		jp1.setAttribute('class', 'tts-jplayer');
		jp1.id = "jquery_jplayer_1";
		
		var jp2 = document.createElement("div");
		jp2.setAttribute('class', 'tts-jplayer');
		jp2.id = "jquery_jplayer_2";
		
		document.body.insertBefore(jp2, document.body.firstChild);
		document.body.insertBefore(jp1, document.body.firstChild);
		
	}
	
	// Strips the HTML tags from page content
	function ttsengine_html_strip(html) {
	
		var tmp = document.createElement("DIV");
		tmp.innerHTML = html;
		return tmp.textContent || tmp.innerText;
		
	}

	// Function called to start the text to speech process for a post
	function ttsengine_processTTS(listenButton) {

		var id = listenButton.id;
		
		// Halt an existing process if initiated
		if (ttsengine_inProcess)
			ttsengine_haltProcess();
		
		ttsengine_inProcess = true;	
		ttsengine_currentPostId = id.replace('listenbutton', '');
		
		// Remove this function from the buttons' click event
		jQuery("#" + id).attr('onclick', '').unbind('click');
		
		// Add a stop function to the buttons' click event
		listenButton.onclick = function(){ ttsengine_haltProcess(); }
		ttsengine_modifyButtonText("Stop");

		// Get the post's content associated with the clicked button by ID
		var text = ttsengine_getPostText(ttsengine_currentPostId);
			
		// Display the loading image
		var imagecontainer = document.getElementById("tts-imagecontainer" + ttsengine_currentPostId);
		imagecontainer.style.visibility = "visible";
		
		// Get a secure urls for the TTSEngine API call
		ttsengine_ajaxGetSecureRequestURLs(text);
	}
	
	// Get the Post Text to be processed and URI encode it.
	function ttsengine_getPostText(id) {
		
		var text = '';
		
		for( var i = 0; i < vars.tts_posts.length; i++ ) {
			if ( parseInt(vars.tts_posts[i].id) == parseInt(id) ) {
				text = vars.tts_posts[i].title + "\r\n" + vars.tts_posts[i].content;
				text = ttsengine_html_strip(text);
				text = encodeURIComponent(text);
				
				// Replace any LFs or CRLFs with a fullstop and CRLF
				text = text.replace(/%0D%0A/g, '.%0D%0A');
				text = text.replace(/%0A/g, '.%0D%0A');
			}
		}
		
		return text;
	}
	
	// Stops an initiated process
	function ttsengine_haltProcess() {
	
		ttsengine_resetListenButton();
		ttsengine_resetImageContainer();
		if (ttsengine_jPlayer_1)
			ttsengine_jPlayer_1.clearMedia();
		if (ttsengine_jPlayer_2)
			ttsengine_jPlayer_2.clearMedia();
		ttsengine_inProcess = false;
		
	}

	// Creates an AJAX connection
	function ttsengine_ajaxRequestConnection() {

		var ajaxRequest;

		try {
			ajaxRequest = new XMLHttpRequest();
		} catch (e) {
			try {
				ajaxRequest = new ActiveXObject( "Msxml2.XMLHTTP" );
			} catch (e) {
				try {
					ajaxRequest = new ActiveXObject( "Microsoft.XMLHTTP" );
				} catch (e) {
					alert( "Ajax Connection Error" );
					return false;
				}
			}
		}
		return ajaxRequest;

	}

	// Makes an AJAX call to 'tts-engine-get-urls.php' to retrieve the secure urls for the TTS Engine API calls
	function ttsengine_ajaxGetSecureRequestURLs(text) {
	
		var ajaxConn = ttsengine_ajaxRequestConnection();
		if (ajaxConn == null) return;
	
		var ajaxParams = "text=" + text + "&siteurl=" + vars.site_url + "&linkenabled=" + vars.link_enabled + "&abspath=" + vars.abs_path;

		ajaxConn.open("POST", vars.ajax, true);
		ajaxConn.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		ajaxConn.onreadystatechange = function() {
			if ( ajaxConn.readyState == 4 ) {

				var response = JSON.parse(ajaxConn.responseText);

				if (response.error) {			
					alert(response.error);
					ttsengine_haltProcess();
				}
				else {	
					ttsengine_sectionURLs = response.secureRequestURLs;
					ttsengine_playTTS();
				}
			}
		}
		
		ajaxConn.send(ajaxParams);
		
	}
		
	// Initializes JPlayer for a first playback or sets the media URL for subsequent playbacks
	function ttsengine_playTTS() {
	
		ttsengine_currentSectionID = 0;

		if (ttsengine_jPlayersInitialized) {
			ttsengine_jPlayer_1.setMedia( {mp3: ttsengine_sectionURLs[0], wav: ttsengine_sectionURLs[0]} ).play();
			if (ttsengine_sectionURLs.length > 1)
				ttsengine_jPlayer_2.setMedia( {mp3: ttsengine_sectionURLs[1], wav: ttsengine_sectionURLs[1]} );
		}
		else
			ttsengine_initializeJPlayers();
			
	}
	
	// Initializes JPlayers
	function ttsengine_initializeJPlayers() {

		// Add JPlayer Events
		ttsengine_addErrorEvent();
		ttsengine_addProgressEvent();
		ttsengine_addPlayingEvent();

		// Set the options to be passed to the JPlayer constructors
		var options = {
			swfPath:  vars.jplayer_swf,
			supplied: "mp3, wav",	
			cssSelectorAncestor: "",	
			cssSelector: {
				play:"",pause:"",stop:"",mute:"",unmute:"",currentTime:"",duration:"",
				videoPlay:"",seekBar:"",playBar:"",volumeBar:"",volumeBarValue:"",volumeMax:"",fullScreen:"",restoreScreen:"",repeat:"",repeatOff:"",gui:"",noSolution:""
			},
			size: { 
				width: "0px", height: "0px" 
			},
			errorAlerts: false,
			warningAlerts: false,
			volume: 1.0,
			preload: "auto"
		};

		// Create 2 instances of JPlayer (Android Fix version)
		ttsengine_jPlayer_1 = new ttsengine_JPlayerAndroidFix("#jquery_jplayer_1", { mp3: ttsengine_sectionURLs[0], wav: ttsengine_sectionURLs[0] }, options);
		
		var j2_media;
		if (ttsengine_sectionURLs.length > 1)
			j2_media = { mp3: ttsengine_sectionURLs[1], wav: ttsengine_sectionURLs[1] };
		else
			j2_media = { mp3: '', wav: '' };
		ttsengine_jPlayer_2 = new ttsengine_JPlayerAndroidFix("#jquery_jplayer_2", j2_media, options);
		
		ttsengine_jPlayersInitialized = true;
		
	}
	
	// Catches the JPlayer error events and types
	function ttsengine_addErrorEvent() {
			
		jQuery("#jquery_jplayer_1").bind(jQuery.jPlayer.event.error, function(event) { onError(event, "#jquery_jplayer_1"); });
		jQuery("#jquery_jplayer_2").bind(jQuery.jPlayer.event.error, function(event) { onError(event, "#jquery_jplayer_2"); });
			
	}
	
	
	function onError(event, id) {
	
		ttsengine_resetListenButton();
		ttsengine_resetImageContainer();

		// Alert user friendly error messages for JPlayer
		switch (event.jPlayer.error.type) {
			case jQuery.jPlayer.error.URL:
				alert("Error: Network Connection error.");
				break;
			case jQuery.jPlayer.error.NO_SOLUTION:
				alert("Error: Your browser does not support the audio format");
				break;
			case jQuery.jPlayer.error.NO_SUPPORT:
				alert("Error: Your browser does not support the audio format");
				break;
			case jQuery.jPlayer.error.URL_NOT_SET:
				alert("Error: Network Connection error.");
				break;
			case jQuery.jPlayer.error.VERSION:
				alert("Error: Browser compatibility error.");
				break;
			case jQuery.jPlayer.error.FLASH_DISABLED:
				alert("Error: Flash is disabled in your browser.");
				break;
			}
	}
	
	// Remove the loading image when the first instance of JPlayer Progress event and Playing events are triggered. Which one is triggered will depend on the displaying browser.
	function ttsengine_addProgressEvent() {
	
		jQuery("#jquery_jplayer_1").bind(jQuery.jPlayer.event.progress, function(event) {
			if (ttsengine_currentSectionID == 0)
				ttsengine_resetImageContainer();
		});
		
	}
	
	
	function ttsengine_addPlayingEvent() {
	
		jQuery("#jquery_jplayer_1").bind(jQuery.jPlayer.event.playing, function(event) {
			if (ttsengine_currentSectionID == 0)
				ttsengine_resetImageContainer();
		});

	}
	
	// Triggered on playback end for a section
	function onPlayBackEnd( jPlayerID ) {

		// If playing the last section, signal the end of the process
		if (ttsengine_currentSectionID == (ttsengine_sectionURLs.length - 1)) {
			ttsengine_resetListenButton();
			ttsengine_inProcess = false;
			ttsengine_currentSectionID == 0;
		}
		else {
			// Increment the section ID
			ttsengine_currentSectionID++;
			// Start playback of the next section by the other jPlayer instance
			playNextSection();
			// Preload the (next + 1) section media for this jPlayer if it exists
			if (ttsengine_currentSectionID < (ttsengine_sectionURLs.length - 1)) {
				if (jPlayerID  == '#jquery_jplayer_1' )
					ttsengine_jPlayer_1.setMedia( { mp3: ttsengine_sectionURLs[ttsengine_currentSectionID + 1], wav: ttsengine_sectionURLs[ttsengine_currentSectionID + 1] } );
				else
					ttsengine_jPlayer_2.setMedia( { mp3: ttsengine_sectionURLs[ttsengine_currentSectionID + 1], wav: ttsengine_sectionURLs[ttsengine_currentSectionID + 1] } );
			}
		}	
	}
	
	
	function playNextSection() {
		
		if ((ttsengine_currentSectionID % 2) == 0)
			ttsengine_jPlayer_1.play();
		else
			ttsengine_jPlayer_2.play();
	}
	
	// Resets the listen button text and click event
	function ttsengine_resetListenButton()	{

		jQuery("#listenbutton" + ttsengine_currentPostId).attr('onclick', '').unbind('click');
		var button = document.getElementById("listenbutton" + ttsengine_currentPostId);
		button.onclick = function(){ ttsengine_processTTS(this); }
		ttsengine_modifyButtonText("Listen to this Post");
		
	}
	
	// Resets the loading image to be invisible
	function ttsengine_resetImageContainer() {
	
		var imageContainer = document.getElementById("tts-imagecontainer" + ttsengine_currentPostId);
		//imageContainer.style.display = "none";
		imageContainer.style.visibility = "hidden";
		
	}
	
	// Alters the text in the Listen button
	function ttsengine_modifyButtonText(buttonText) {
	
		var button = document.getElementById("listenbutton" + ttsengine_currentPostId);
		button.innerHTML = '<em></em>' + buttonText;
		
	}
	
	
	///////////////////////////////////////////////////////
	// Android 2.3 fix for JPlayer                       //
	///////////////////////////////////////////////////////

	var ttsengine_JPlayerAndroidFix = (function(jQuery) {
	
		var fix = function(id, media, options) {
			this.playFix = false;
			this.init(id, media, options);
		};
		
		fix.prototype = {
		
			init: function(id, media, options)	{
			
				var self = this;
				// Store the params
				this.id = id;
				this.media = media;
				this.options = options;

				// Make a jQuery selector of the id, for use by the jPlayer instance.
				this.player = jQuery(this.id);
				
				// Make the ready event to set the media to initiate.
				this.player.bind(jQuery.jPlayer.event.ready, function(event) {
					// Use this fix's setMedia() method.

					if (id == "#jquery_jplayer_1")
						self.setMedia(self.media).play();
					else if (ttsengine_sectionURLs.length > 1)
						self.setMedia(self.media);
					
				});
				
				if (jQuery.jPlayer.platform.android) {
				
					// Fix playing new media immediately after setMedia.
					this.player.bind(jQuery.jPlayer.event.progress, function(event) {
						if (self.playFixRequired) {
							self.playFixRequired = false;

							// Enable the contols again
							// self.player.jPlayer('option', 'cssSelectorAncestor', self.cssSelectorAncestor);

							// Play if required, otherwise it will wait for the normal GUI input.
							if (self.playFix) {
								self.playFix = false;
								jQuery(this).jPlayer("play");
							}
						}
					});
					
					// Fix missing ended events.
					this.player.bind(jQuery.jPlayer.event.ended, function(event) {
						if (self.endedFix) {
							self.endedFix = false;
							setTimeout(function() {
								onPlayBackEnd(id);
							}, 0);
							// what if it was looping?
						}
					});
					
					this.player.bind(jQuery.jPlayer.event.pause, function(event) {
						if (self.endedFix) {
							var remaining = event.jPlayer.status.duration - event.jPlayer.status.currentTime;
							if (event.jPlayer.status.currentTime === 0 || remaining < 1) {
								// Trigger the ended event from inside jplayer instance.
								setTimeout(function() {
									self.jPlayer._trigger(jQuery.jPlayer.event.ended);
								}, 0);
							}
						}
					});
				}
				// Add play end event for all other non-Android instances
				else {
					this.player.bind(jQuery.jPlayer.event.ended, function(event) {
						onPlayBackEnd(id);
					});
				}

				// Instance jPlayer
				this.player.jPlayer(this.options);

				// Store a local copy of the jPlayer instance's object
				this.jPlayer = this.player.data('jPlayer');

				// Store the real cssSelectorAncestor being used.
				this.cssSelectorAncestor = this.player.jPlayer('option', 'cssSelectorAncestor');

				// Apply Android fixes
				this.resetAndroid();

				return this;
			},
			setMedia: function(media) {
				this.media = media;
				
				// Apply Android fixes
				this.resetAndroid();

				// Set the media
				this.player.jPlayer("setMedia", this.media);
				return this;
			},
			play: function() {
				// Apply Android fixes
				if (jQuery.jPlayer.platform.android && this.playFixRequired) {
					// Apply Android play fix, if it is required.
					this.playFix = true;
				} else {
					// Other browsers play it, as does Android if the fix is no longer required.
					this.player.jPlayer("play");
				}
			},
			resetAndroid: function() {
				// Apply Android fixes
				if (jQuery.jPlayer.platform.android) {
					this.playFix = false;
					this.playFixRequired = true;
					this.endedFix = true;
					// Disable the controls
					// this.player.jPlayer('option', 'cssSelectorAncestor', '#NeverFoundDisabled');
				}
			},
			stop: function() {
				this.player.jPlayer("stop");
			},
			clearMedia: function() {
				this.player.jPlayer("clearMedia");
			}
			
		};
	return fix;
	})(jQuery);
	
