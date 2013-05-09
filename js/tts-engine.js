/*
** Two instances of JPlayer are used so that the audio for a post's paragraph is requested from the
** TTSEngine.com API and loaded into an instance of JPlayer while the previous paragraph's audio is being
** played by the other JPlayer instance.
**
** For mobile Safari browsers a single instance of an HTML5 Audio tag is used as audio cannot be preloaded.
*/

jQuery.noConflict();
var ttsengine_audioPlayer;				// To be used by mobile Safari
var ttsengine_jPlayersInitialized = false;
var ttsengine_inProcess = false;
var ttsengine_currentPostId;
var ttsengine_isMSIE;					// Identify Internet Explorer Browser
var ttsengine_jPlayer_1; 				// 1st JPlayer instance
var ttsengine_jPlayer_2; 				// 2nd JPlayer instance
var ttsengine_sectionURLs;
var ttsengine_currentSectionID;
var ttsengine_isMobileSafari;			// Identify Mobile Safari
var ttsengine_iOSVersion;
var ttsengine_iOS_URLs;					// Array of Arrays, each storing the section urls for individual posts on the page
var ttsengine_iOS6URL;
var ttsengine_numPosts;
var ttsengine_interval;
var ttsengine_timeout;
var ttsengine_context;					// Instance of Web Audio API AudioContext used for mobile safari
var ttsengine_currentSource;
var ttsengine_activeButton;

var ttsengine_jPlayerOptions = {
		swfPath:  vars.jplayer_swf,
		supplied: "mp3, wav, oga",
		cssSelectorAncestor: "",
		cssSelector: {
			play:"",pause:"",stop:"",mute:"",unmute:"",currentTime:"",duration:"",
			videoPlay:"",seekBar:"",playBar:"",volumeBar:"",volumeBarValue:"",
			volumeMax:"",fullScreen:"",restoreScreen:"",repeat:"",repeatOff:"",
			gui:"",noSolution:""
		},
		size: { 
			width: "0px", height: "0px"
		},
		errorAlerts: false,
		warningAlerts: false,
		volume: 1.0,
		preload: "auto"
	};

// Call 'ttsengine_onPageLoad()' when the page finishes loading
ttsengine_addLoadEvent(ttsengine_onPageLoad);

// Allows any function to be appended to the basic 'window.load' event if multiple exist
function ttsengine_addLoadEvent(func) {

	var oldonload = window.onload;
	if (typeof window.onload !== 'function') {
		window.onload = func;
	}
	else {
		window.onload = function()	{
			if (oldonload)	oldonload();
			func();
		};
	}
	
}

// Page load function
function ttsengine_onPageLoad() {

	// Detect certain browsers
	ttsengine_mobileSafariCheck();
	ttsengine_IECheck();
	// Extend the listen button CSS class for different browsers
	var listenButtons = document.getElementsByName('listenbutton');
	ttsengine_extendButtonClassForBrowser(listenButtons);
	// Add the audio player Instances to the body
	if (!ttsengine_isMobileSafari || (!ttsengine_iOSVersion === 6))	ttsengine_addPlayers();
	// If browser is mobile safari, the audio URLs must be sourced before playback	
	if (ttsengine_isMobileSafari) {
		if (ttsengine_iOSVersion === 6)
			ttsengine_createContext();
		else
			ttsengine_getUrlsForMobileSafari(listenButtons);
	}
	
}

// Creates the AudioContext instance for mobile Safari
function ttsengine_createContext() {
	try {
		ttsengine_context = new webkitAudioContext();
	}
	catch(e) {
		alert('Web Audio API is not supported in this browser');
	}
}

// Detect Mobile Safari browser
function ttsengine_mobileSafariCheck() {

	var userAgent = window.navigator.userAgent;
	var iPad = ( userAgent.indexOf('iPad') !== -1 );
	var iPhone = ( userAgent.indexOf('iPhone') !== -1 );
	var safari = ( userAgent.indexOf('Safari') !== -1 );
	ttsengine_isMobileSafari = ( (iPad || iPhone) && safari );
	ttsengine_iOSVersion = parseInt(
	('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
		.replace('undefined', '3_2').replace('_', '.').replace('_', '')
	) || false;
	
}

// Detect IE browser
function ttsengine_IECheck() {

	var isMSIE_check = /*@cc_on!@*/0;
	if (isMSIE_check) {
		ttsengine_isMSIE = true;
	}
	else {
		ttsengine_isMSIE = false;
	}
	
}

// Extend the listen buttons CSS class depending on the rendering browser
function ttsengine_extendButtonClassForBrowser(listenButtons) {
	
	for ( var i = 0; i < listenButtons.length; i++ ) {
		if (ttsengine_isMSIE) {
			listenButtons[i].className += " listenbuttonIE";
		}
		else {
			listenButtons[i].className += " listenbutton";
		}
	}

}	
	
// Add the jPlayers to the start of the body tag
function ttsengine_addPlayers() {
	
	if (ttsengine_isMobileSafari) {	
		var audioDiv = document.createElement("div");
		audioDiv.id = 'audioDiv';
		audioDiv.setAttribute("style", "width:0px");
		audioDiv.setAttribute("style", "height:0px");
		document.body.insertBefore(audioDiv, document.body.firstChild);
		ttsengine_audioPlayer = new Audio();
		document.getElementById("audioDiv").appendChild(ttsengine_audioPlayer);
		ttsengine_audioPlayer.addEventListener('loadstart', ttsengine_mobileSafariLoadstart, false);
		ttsengine_audioPlayer.addEventListener('playing', ttsengine_onMobileSafariPlaying, false);
	}
	else {
		var jp1 = document.createElement("div");
		jp1.setAttribute('class', 'tts-jplayer');
		jp1.id = "jquery_jplayer_1";	
		
		var jp2 = document.createElement("div");
		jp2.setAttribute('class', 'tts-jplayer');
		jp2.id = "jquery_jplayer_2";
			
		document.body.insertBefore(jp2, document.body.firstChild);	
		document.body.insertBefore(jp1, document.body.firstChild);
	}

}

// Get each posts audio URLs for Mobile Safari
function ttsengine_getUrlsForMobileSafari(listenButtons) {
	
	// Perform the Ajax request for all Post Section URLs before any playback occurs
	ttsengine_numPosts = listenButtons.length;	
	var ajaxParams = '';
	for ( var i = 0; i < listenButtons.length; i++ ) {
		var id = listenButtons[i].id;
		id = id.replace('listenbutton', '');
		var text = ttsengine_getPostText(id);
		var param = 'post' + id + '=' + text + '&';
		ajaxParams += param;
	}
	ajaxParams += ( "language=" + vars.language +
					"&siteurl=" + vars.site_url + 
					"&linkenabled=" + vars.link_enabled + 
					"&abspath=" + vars.abs_path );
					
	ttsengine_ajaxGetSafariRequestURLs(ajaxParams);

}

// Remove any CRLFs from the iOS6 text
function ttsengine_get_iOS6PostText(id) {

	var text = '';
	for( var i = 0; i < vars.tts_posts.length; i++ ) {
		if ( parseInt(vars.tts_posts[i].id) === parseInt(id) ) {
			text = vars.tts_posts[i].title + "\r\n" + vars.tts_posts[i].content;
			text = ttsengine_html_strip(text);
			text = encodeURIComponent(text);
			// Replace any LFs or CRLFs with a fullstop and CRLF
			text = text.replace(/%0A/g, '.');
			text = text.replace(/%0D%0A/g, '.');
		}
	}	
	return text;
}

// Strips the HTML tags from page content
function ttsengine_html_strip(html) {

	var tmp = document.createElement("DIV");
	tmp.innerHTML = html;
	return tmp.textContent || tmp.innerText;
	
}

// Function called to start the text to speech process for a post
function ttsengine_processTTS(listenButton) {

	ttsengine_activeButton = listenButton;
	var id = listenButton.id;
	
	// Halt an existing process if initiated
	if (ttsengine_inProcess)	ttsengine_haltProcess();
	
	ttsengine_inProcess = true;	
	ttsengine_currentPostId = id.replace('listenbutton', '');
	
	// Remove this function from the buttons' click event
	jQuery("#" + id).attr('onclick', '').unbind('click');
		
	// Add a stop function to the buttons' click event
	listenButton.onclick = function(){ ttsengine_haltProcess(); };
	
	// Display the loading image
	var imagecontainer = document.getElementById("tts-imagecontainer" + ttsengine_currentPostId);
	imagecontainer.style.visibility = "visible";

	if (ttsengine_isMobileSafari) {
		if (ttsengine_iOSVersion === 6) {
			ttsengine_modifyButtonText(vars.loading_phrase);
			var text = ttsengine_get_iOS6PostText(ttsengine_currentPostId);
			ttsengine_ajaxGetiOS6RequestURL(text);
		}
		else {
			ttsengine_modifyButtonText(vars.stop_phrase);
			ttsengine_playMobileSafariUrl(ttsengine_currentPostId);
		}
	}
	else {
		ttsengine_modifyButtonText(vars.stop_phrase);
		// Get the post's content associated with the clicked button by ID
		var text = ttsengine_getPostText(ttsengine_currentPostId);
		// Get a secure urls for the TTSEngine API call
		ttsengine_ajaxGetSecureRequestURLs(text);
	}
	
}

// Buffer the audio URL for iOS6
function ttsengine_load_iOS6Audio(url) {

	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';
	request.onload = function() {
		ttsengine_context.decodeAudioData(request.response, function(buffer) {
			ttsengine_create_iOS6AudioSource(buffer);
		}, ttsengine_onLoadError);
	}
	request.send();
	
}

// Create the audio source for iOS6 using the buffered URL
function ttsengine_create_iOS6AudioSource(buffer) {

	ttsengine_currentSource = ttsengine_context.createBufferSource();
	ttsengine_currentSource.buffer = buffer;
	var duration = buffer.duration;
	ttsengine_currentSource.connect(ttsengine_context.destination);
	ttsengine_resetImageContainer();
	jQuery("#" + ttsengine_activeButton.id).attr('onclick', '').unbind('click');
	ttsengine_modifyButtonText(vars.play_phrase);
	ttsengine_activeButton.onclick = function(){ ttsengine_play_iOS6Audio(duration); };
	
}

// Playback audio in iOS6 after user gesture
function ttsengine_play_iOS6Audio(duration) {

	jQuery("#" + ttsengine_activeButton.id).attr('onclick', '').unbind('click');
	ttsengine_currentSource.noteOn(0);
	ttsengine_timeout = setTimeout(function(){ttsengine_haltProcess();},duration*1000);
	ttsengine_modifyButtonText(vars.stop_phrase);
	ttsengine_activeButton.onclick = function(){ ttsengine_haltProcess(); };
	
}

function ttsengine_onLoadError() {
	alert("Error: Failed to load Audio");
}

// Start playback of the post Urls on Safari
function ttsengine_playMobileSafariUrl(postID) {

	// Get the section URLs for the selected post
	ttsengine_sectionURLs = ttsengine_iOS_URLs[postID];
	ttsengine_currentSectionID = 0;
	// Load and play the first audio section
	ttsengine_audioPlayer.src = ttsengine_sectionURLs[0];
	ttsengine_audioPlayer.load();
	ttsengine_audioPlayer.play();

}

// Create an interval function when the audio starts loading in Mobile Safari
function ttsengine_mobileSafariLoadstart() {

	ttsengine_interval = setInterval( function(){ ttsengine_checkForPlaybackEnd(); }, 100);
	
}

// Checks the Mobile Safari Audio player for playback end
function ttsengine_checkForPlaybackEnd() {

	// The audio player duration value is only a finite number when streaming ends
	if( isFinite(ttsengine_audioPlayer.duration) ) {
		clearInterval(ttsengine_interval);
		ttsengine_currentSectionID++;
		if (ttsengine_currentSectionID < ttsengine_sectionURLs.length) {
			ttsengine_audioPlayer.src = ttsengine_sectionURLs[ttsengine_currentSectionID];
			ttsengine_audioPlayer.load();
			ttsengine_audioPlayer.play();
		}
		else {
			ttsengine_resetListenButton();
			ttsengine_inProcess = false;
		}
	}
	
}

function ttsengine_onMobileSafariPlaying() {

	ttsengine_resetImageContainer();
	
}

function ttsengine_getPostSections(text) {

	var str = '';
	var tmp = text.split('%0D%0A');
	var minLength = 100;
	var sections = [];
	var match;
	var buffer = '';
	for(var i=0; i < tmp.length; i++) {
		match = tmp[i].match(/[a-zA-Z]/g);
		if(match) {
			buffer = tmp[i];
			while( buffer.length < minLength && (i < (tmp.length - 1)) ) {
				i++;
				match = tmp[i].match(/[a-zA-Z]/g);
				if(match)	buffer += tmp[i];
			}
			str = str + buffer + ' ';
		}
	}
	return str;
	
}

// Get the Post Text to be processed and URI encode it.
function ttsengine_getPostText(id) {
	
	var text = '';
	
	for( var i = 0; i < vars.tts_posts.length; i++ ) {
		if ( parseInt(vars.tts_posts[i].id) === parseInt(id) ) {
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

	if (ttsengine_currentSource)	ttsengine_currentSource.noteOff(0);
	if (ttsengine_timeout)	clearTimeout(ttsengine_timeout);
	if (ttsengine_interval)	clearInterval(ttsengine_interval);
	ttsengine_resetListenButton();
	ttsengine_resetImageContainer();
	if (ttsengine_isMobileSafari && (ttsengine_iOSVersion !== 6))	ttsengine_audioPlayer.pause();
	if (ttsengine_jPlayer_1)	ttsengine_jPlayer_1.clearMedia();
	if (ttsengine_jPlayer_2)	ttsengine_jPlayer_2.clearMedia();
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

function ttsengine_ajaxGetSafariRequestURLs(ajaxParams) {
	
	var ajaxConn = ttsengine_ajaxRequestConnection();
	if (ajaxConn === null) return;
	ajaxConn.open("POST", vars.ajax_safari, true);
	ajaxConn.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	ajaxConn.onreadystatechange = function() {
		if ( ajaxConn.readyState == 4 ) {	
			var response = JSON.parse(ajaxConn.responseText);
			if (response.error) {			
				alert(response.error);
			}
			else {
				ttsengine_iOS_URLs = response.iOS_URLs;
			}
		}
	};
	ajaxConn.send(ajaxParams);
	
}

function ttsengine_ajaxGetiOS6RequestURL(text) {
	
	var ajaxConn = ttsengine_ajaxRequestConnection();
	if (ajaxConn === null) return;
	var ajaxParams = 	"text=" + text +
						"&language=" + vars.language +
						"&siteurl=" + vars.site_url + 
						"&linkenabled=" + vars.link_enabled + 
						"&abspath=" + vars.abs_path;
	ajaxConn.open("POST", vars.ajax_iOS6, true);
	ajaxConn.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	ajaxConn.onreadystatechange = function() {
		if ( ajaxConn.readyState == 4 ) {	
			var response = JSON.parse(ajaxConn.responseText);
			if (response.error) {			
				alert(response.error);
			}
			else {
				ttsengine_iOS6URL = response.iOS6URL;
				ttsengine_load_iOS6Audio(ttsengine_iOS6URL);
			}
		}
	};
	ajaxConn.send(ajaxParams);
	
}

// Makes an AJAX call to 'tts-engine-get-urls.php' to retrieve the secure urls for the TTS Engine API calls
function ttsengine_ajaxGetSecureRequestURLs(text) {

	var ajaxConn = ttsengine_ajaxRequestConnection();
	if (ajaxConn === null) return;

	var ajaxParams = 	"text=" + text +
						"&language=" + vars.language +
						"&siteurl=" + vars.site_url + 
						"&linkenabled=" + vars.link_enabled + 
						"&abspath=" + vars.abs_path;
	
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
	};
	
	ajaxConn.send(ajaxParams);
}

// Initializes JPlayer for a first playback or sets the media URL for subsequent playbacks
function ttsengine_playTTS() {

	ttsengine_currentSectionID = 0;
	var firstUrl = ttsengine_sectionURLs[0];
	var secondUrl = ( (ttsengine_sectionURLs.length > 1) ? ttsengine_sectionURLs[1] : '' );
	
	if (ttsengine_jPlayersInitialized) {
		ttsengine_jPlayer_1.setMedia( { mp3: firstUrl, wav: firstUrl, oga: firstUrl } ).play();
		if (ttsengine_sectionURLs.length > 1)
			ttsengine_jPlayer_2.setMedia( { mp3: secondUrl, wav: secondUrl, oga: secondUrl } );
	}
	else
		ttsengine_initializeJPlayers(firstUrl, secondUrl);

}

// Initializes JPlayers
function ttsengine_initializeJPlayers( firstUrl, secondUrl ) {

	// Add JPlayer Events
	ttsengine_addErrorEvent("#jquery_jplayer_1");
	ttsengine_addErrorEvent("#jquery_jplayer_2");
	ttsengine_addLoadStartEvent("#jquery_jplayer_1");

	// Create 2 instances of JPlayer (Android Fix version)
	ttsengine_jPlayer_1 = new ttsengine_JPlayer( "#jquery_jplayer_1", 
												{ mp3: firstUrl, wav: firstUrl, oga: firstUrl }, 
												ttsengine_jPlayerOptions );
	

	ttsengine_jPlayer_2 = new ttsengine_JPlayer( "#jquery_jplayer_2", 
												{ mp3: secondUrl, wav: secondUrl, oga: secondUrl }, 
												ttsengine_jPlayerOptions );
	
	ttsengine_jPlayersInitialized = true;
	
}

// Catches the JPlayer error events and types
function ttsengine_addErrorEvent(jPlayerID) {

	jQuery(jPlayerID).bind(jQuery.jPlayer.event.error, function(event) { ttsengine_onError(event); });
	
}

function ttsengine_onError(event) {

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

// Remove the loading image when the first instance of JPlayer starts playback.
function ttsengine_addLoadStartEvent(jPlayerID) {

	jQuery(jPlayerID).bind(jQuery.jPlayer.event.loadstart, function(event) {
		ttsengine_interval = setInterval( function(){ ttsengine_onPlayBack(jPlayerID); }, 100);
	});

}

// Resets the loading image when playback starts
function ttsengine_onPlayBack(jPlayerID) {
	
	var playTime = jQuery(jPlayerID).data().jPlayer.status.currentTime;
	if (playTime > 0) {
		if (ttsengine_currentSectionID == 0)
			ttsengine_resetImageContainer();
		clearInterval(ttsengine_interval);
	}
	
}

// Triggered on playback end for a section
function ttsengine_onPlayBackEnd(jPlayerID) {

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
		ttsengine_playNextSection();
		// Preload the (next + 1) section media for this jPlayer if it exists
		if (ttsengine_currentSectionID < (ttsengine_sectionURLs.length - 1)) {
			if (jPlayerID  == '#jquery_jplayer_1' )
				ttsengine_jPlayer_1.setMedia( 
					{ 	
						mp3: ttsengine_sectionURLs[ttsengine_currentSectionID + 1], 
						wav: ttsengine_sectionURLs[ttsengine_currentSectionID + 1],
						oga: ttsengine_sectionURLs[ttsengine_currentSectionID + 1]
					} );
			else
				ttsengine_jPlayer_2.setMedia( 
					{ 
						mp3: ttsengine_sectionURLs[ttsengine_currentSectionID + 1], 
						wav: ttsengine_sectionURLs[ttsengine_currentSectionID + 1],
						oga: ttsengine_sectionURLs[ttsengine_currentSectionID + 1] 
					} );
		}
	}
}

function ttsengine_playNextSection() {
	
	if ((ttsengine_currentSectionID % 2) == 0)
		ttsengine_jPlayer_1.play();
	else
		ttsengine_jPlayer_2.play();
}

// Resets the listen button text and click event
function ttsengine_resetListenButton()	{
	
	jQuery("#listenbutton" + ttsengine_currentPostId).attr('onclick', '').unbind('click');
	var button = document.getElementById("listenbutton" + ttsengine_currentPostId);
	button.onclick = function(){ ttsengine_processTTS(this); };
	ttsengine_modifyButtonText(vars.listen_phrase);
	
}

// Resets the loading image to be invisible
function ttsengine_resetImageContainer() {

	var imageContainer = document.getElementById("tts-imagecontainer" + ttsengine_currentPostId);
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

var ttsengine_JPlayer = (function(jQuery) {

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

				if (id == "#jquery_jplayer_1") {
					self.setMedia(self.media).play();
				}
				// i.e. if #jquery_jplayer_2 and media is set
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
							ttsengine_onPlayBackEnd(id);
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
					ttsengine_onPlayBackEnd(id);
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
			if (jQuery.jPlayer.platform.android || ttsengine_isMobileSafari) {
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
