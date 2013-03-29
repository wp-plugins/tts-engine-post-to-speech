=== TTS Engine Post to Speech ===
Author URI: http://www.ttsengine.com
Plugin URI: http://www.ttsengine.com
Contributors: anthonymccourt
Tags: tts, text to speech, speech synthesis, text to talk, text 2 speech, txt to speech, text to speach, tts voices, text to speak, type to speech
Requires at least: 3.2
Tested up to: 3.5.1
Stable tag: 1.2
License: GPLv2
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Add free, high quality text to speech to your posts (English).

== Description ==

Add free, high quality text to speech functionality to your Wordpress posts (English).

### Features:
* Speech genereated for free using the [TTSEngine.com](http://www.ttsengine.com) API service.
* Reliable and high quality text to speech functionality (English).
* Post title and content read to the user with the single click of a button in the post.
* Non-intrusive functionality. No redirections to other web pages.
* Playback can be stopped at any time by the user.
* Compatible across all popular browsers (I.E, Firefox, Chrome, Opera, Safari) and mobile devices.
* Option to display 'listen' button before or after each post.
* Option to display a link to [TTSEngine.com](http://www.ttsengine.com) in your post (disabled by default).

= Backlink = 
Please enable this option if you are using the plugin and are happy with the free service!
The link (if enabled) can also be placed at the beginning or end of each post in a non-intrusive manner.
These options can be set in the plugin settings page.


== Installation ==

Install using WordPress:

1. Log in and go to 'plugins' -> 'Add New'.
3. Search for 'TTS Engine Post to Speech' and hit the 'Install now' link in the results, Wordpress will install it.
4. Activate the plugin.
5. Optional: Display a link to [TTSEngine.com](http://www.ttsengine.com) in your posts from the plugin settings. 

Install manually:

1. Download the zip file and unzip it. 
2. Open the unzipped folder and upload the entire contents to your `/wp-content/plugins` directory on the server.
3. Activate the plugin through the WordPress 'Plugins' menu.
4. Optional: Display a link to [TTSEngine.com](http://www.ttsengine.com) in your posts from the plugin settings. 


== Frequently Asked Questions ==

= What is pleying the audio in the browser? =
Playback of audio uses the jQuery HTML5 Audio / Video Library 'jPlayer'.

= What is the Playback audio file format? =
The audio file format used by jPlayer is 'mp3' or 'wav' depending on the browser.

= Where can I report bugs or issues? =
You can report bugs or issues here: [support@ttsengine.com](mailto:support@ttsengine.com).


== Screenshots ==

1. 'Listen to this post' button sample
2. 'Listen' button with link to [TTSEngine.com](http://www.ttsengine.com)


== Changelog ==

= 1.0 =
* First release

= 1.1 =
* Filter applied to post content that is to be read.
* Wordpress 'shortcode' and extraneous CSS found in database 'post_content' entries is now filtered out.

= 1.2 =
* Some issues with the 'jPlayer Android Fix' submitting too many API request have been resolved.
* Enabled backlink now wraps to next line when applicable on mobile browsers.

== Upgrade Notice ==

= 1.0 =

= 1.2 =
This version fixes an Android bug.