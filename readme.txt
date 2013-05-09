=== TTS Engine Post to Speech ===
Author URI: http://www.ttsengine.com
Plugin URI: http://www.ttsengine.com
Contributors: anthonymccourt
Tags: tts, text to speech, speech synthesis, text to talk, text 2 speech, txt to speech, text to speach, tts voices, text to speak, type to speech
Requires at least: 3.2
Tested up to: 3.5.1
Stable tag: 2.0
License: GPLv2
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Add free, high quality text to speech to your posts - 52 languages supported.

== Description ==

Add free, high quality text to speech functionality to your Wordpress posts - 52 languages supported.

### Features:
* Speech genereated for free using the [TTSEngine.com](http://www.ttsengine.com) API service.
* Reliable and high quality text to speech functionality.
* 52 languages supported - Simply select the language of your posts from the settings menu.
* Post title and content read to the user with the click of a button in the post.
* Non-intrusive functionality. No redirections to other web pages.
* Playback can be stopped at any time by the user.
* Compatible across all popular browsers (I.E, Firefox, Chrome, Opera, Safari) and mobile devices (Android, iOS).
* Option to display a link to [TTSEngine.com](http://www.ttsengine.com) in your post (disabled by default).
* Settings menu allows users to configure where they want the button/link located.

= Backlink = 
Please enable this option if you are using the plugin and are happy with the free service!
The link (if enabled) can also be placed at the beginning or end of each post in a non-intrusive manner.
These options can be set in the plugin settings page.


== Installation ==

Install using WordPress:

1. Log in and go to 'plugins' -> 'Add New'.
2. Search for 'TTS Engine Post to Speech' and hit the 'Install now' link in the results, Wordpress will install it.
3. Activate the plugin.
4. Optional: Go to the plugin settings page and select the language of your posts. The default is English.
5. Optional: Display a link to [TTSEngine.com](http://www.ttsengine.com) in your posts from the plugin settings. 

Install manually:

1. Download the zip file and unzip it. 
2. Open the unzipped folder and upload the entire contents to your `/wp-content/plugins` directory on the server.
3. Activate the plugin through the WordPress 'Plugins' menu.
4. Optional: Go to the plugin settings page and select the language of your posts. The default is English.
5. Optional: Display a link to [TTSEngine.com](http://www.ttsengine.com) in your posts from the plugin settings. 


== Frequently Asked Questions ==

= What is playing the audio in the browser? =
Playback of audio in all browsers except Mobile Safari uses the jQuery HTML5 Audio / Video Library 'jPlayer'.
Playback of audio in Mobile Safari uses the HTML5 <audio> tag or the Web Audio API depending on the iOS version.

= What is the Playback audio file format? =
The audio file format used for playback is determined by the calling browser.
We supply an option of 'mp3', 'wav' and 'oga' file formats.

= Where can I report bugs or issues? =
You can report bugs or issues here: [support@ttsengine.com](mailto:support@ttsengine.com).

= How do I use the plugin with iOS/Mobile Safari? =
Mobile Safari does not allow the preloading of audio elements through the browser.
Loading and playback of audio can only be triggered by a user touch gesture with the touchscreen.
These limitations means there is a lag in the playback of audio in mobile Safari in iOS 5 and older.
The performance is much better using iOS 6 (recommended for this plugin) but there are two
user gestures required. One to quickly load the audio and a second to begin playback.


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

= 1.3 =
* iOS Support included.

= 2.0 =
* Support for a large selection of languages added.
* Select from the 52 languages now supported in the plugin settings page.
* Major upgrade to iOS/Mobile Safari support. 
* Load times reduced for iOS 5 and older versions.
* Support included for the Web Audio API (iOS 6) which drastically improves performance in mobile Safari.
* Previous bugs involving loading audio for longer posts have been resolved.
* 'ogg/oga' file format support has been included for the relevant browsers.

== Upgrade Notice ==

= 1.0 =

= 1.2 =
This version fixes an Android bug.

= 1.3 =
iOS Support Enabled.

= 2.0 =
52 languages now supported.
Major iOS/Mobile Safari support upgrade.