<?php
/*
tts-engine-language-support.php:	Creates the structures used to provide the language data support to the 
									admin settings menu.
*/

	if ( ! class_exists( 'TTS_Engine_Utilities' ) ) {
		
		class TTS_Engine_Utilities {
			
			public static function get_language_data() {
				
				$language_data = array(
					'usenglish' => array( 'English (US)', 'Listen to this Post', 'Loading', 'Play', 'Stop' ),
					'afrikaans' => array( 'Afrikaans', 'Luister', 'Wag', 'Begin', 'Stop' ),
					'albanian' => array( 'Albanian (Shqiptar)', 'Dëgjoj', 'Pres', 'Filloj', 'Ndalo' ),
					'aragonese' => array( 'Aragonese (Aragonés)', 'Escuchar', 'Esperar', 'Iniciar', 'Detener' ),
					'armenian' => array( 'Armenian (հայերեն)', 'լսել', 'սպասել', 'սկիզբ', 'կանգ առնել' ),
					'armenian-west' => array( 'Armenian West (Արեւմտահայերէն)', 'լսել', 'սպասել', 'սկիզբ', 'կանգ առնել' ),
					'brazilian' => array( 'Brazilian (Brasileira)', 'Ouvir', 'Esperar', 'Começar', 'Parar' ),
					'bulgarian' => array( 'Bulgarian (български)', 'слушам', 'чакам', 'започвам', 'спирам' ),
					'bosnian' => array( 'Bosnian (Bosanski)', 'Slušati', 'čekati', 'Početi', 'Zaustaviti' ),
					'catalan' => array( 'Catalan (Català)', 'Escoltar', 'Esperar', 'Iniciar', 'Aturar' ),
					'croatian' => array( 'Croatian (hrvatski)', 'Slušati', 'čekati', 'Početi', 'Zaustaviti' ),
					'czech' => array( 'Czech (čeština)', 'Poslouchat', 'Počkejte', 'Začít', 'Zastavit' ),
					'danish' => array( 'Danish (Dansk)', 'Lyt', 'Vente', 'Starte', 'Stoppe' ),
					'dutch' => array( 'Dutch (Nederlands)', 'Luisteren', 'Wachten', 'Starten', 'Stoppen' ),
					'esperanto' => array( 'Esperanto', 'Aŭskultu', 'Atendi', 'Komenci', 'Halti' ),
					'estonian' => array( 'Estonian (Eesti)', 'Kuulama', 'Ootama', 'Alustama', 'Lõpetama' ),
					'farsi' => array( 'Farsi (فارسی)', 'گوش دادن', 'صبر کردن', 'شروع کردن', 'متوقف ساختن' ),
					'finnish' => array( 'Finnish (Suomalainen)', 'Kuunnella', 'Odottaa', 'Alkaa', 'Lopetta' ),
					'french' => array( 'French (Français)', 'Écoutez', 'Patienter', 'Commencer', 'Arrêter' ),
					'georgian' => array( 'Georgian (საქართველოს)', 'მოუსმინეთ', 'დაველოდოთ', 'დაიწყოს', 'შეჩერება' ),
					'german' => array( 'German (Deutsch)', 'Hören', 'Warten', 'Starten', 'Stoppen' ),
					'greek' => array( 'Greek (ελληνικά)', 'ακούω', 'περιμένετε', 'ξεκινώ', 'σταματώ' ),
					'hindi' => array( 'Hindi (हिंदी)', 'सुनना', 'प्रतीक्षा करना', 'आरंभ करना', 'स्र्कना' ),
					'hungarian' => array( 'Hungarian (Magyar)', 'Hallgat', 'Vár', 'Kezd', 'Megáll' ),
					'icelandic' => array( 'Icelandic', 'Hlusta', 'Bíða', 'Byrja', 'Hætta' ),
					'indonesian' => array( 'Indonesian (Indonesia)', 'Mendengarkan', 'Menunggu', 'Mulai', 'Berhenti' ),
					'irish' => array( 'Irish (Gaeilge)', 'Éist', 'Fanacht', 'Imirt', 'Stop' ),
					'italian' => array( 'Italian (Italiano)', 'Ascolta', 'Aspettare', 'Avviare', 'Arrestare' ),
					'kannada' => array( 'Kannada (ಕನ್ನಡ)', 'ಆಲಿಸು', 'ನಿರೀಕ್ಷಿಸಿ', 'ಆರಂಭಿಸಲು', 'ನಿಲ್ಲಿಸಲು' ),
					'latin' => array( 'Latin (Latinum)', 'Audite', 'Exspecto', 'Conmoveo', 'Concesso' ),
					'latvian' => array( 'Latvian (Latvijas)', 'Klausīties', 'Gaidīt', 'Sākt', 'Apstāties' ),
					'lithuanian' => array( 'Lithuanian (Lietuvos)', 'Klausyti', 'Laukti', 'Pradėti', 'Sustabdyti' ),
					'lojban' => array( 'Lojban (Lojbo)', "Tinju'i", 'Denpa', 'Cfagau', "Stiri'a" ),
					'macedonian' => array( 'Macedonian (македонски)', 'слушам', 'почека', 'започне', 'престанат' ),
					'malayalam' => array( 'Malayalam (മലയാളം)', 'ലിസ്റെൻ', 'വെയിറ്റ്', 'സ്റ്റാർട്ട്‌', 'സ്റ്റോപ്പ്‌' ),
					'malay' => array( 'Malay (Melayu)', 'Dengar', 'Menunggu', 'Memulakan', 'Berhenti' ),
					'mandarin' => array( 'Mandarin (官話)', '听', '等待', '开始', '停止' ),
					'nepali' => array( 'Nepali (官नेपाली)', 'सुन्नु', 'पर्खनु', 'सुरु', 'रोक्नु' ),
					'norwegian' => array( 'Norwegian  (Norsk)', 'Lytt', 'Vente', 'Start', 'Stoppe' ),
					'polish' => array( 'Polish (Polski)', 'Słuchać', 'Czekać', 'Zaczynać', 'Skończyć' ),
					'portuguese' => array( 'Portuguese (Português)', 'Ouvir', 'Esperar', 'Começar', 'Parar' ),
					'punjabi' => array( 'Punjabi (ਪੰਜਾਬੀ)', 'ਸੁਣ', 'ਠਹਿਰਨਾ', 'ਚੌਕਣਾ', 'ਠਹਿਰਨਾ' ),
					'romanian' => array( 'Romanian (Română)', 'Ascultă', 'Incarcă', 'Play', 'Stop' ),
					'russian' => array( 'Russian (русский)', 'слушать', 'ждать', 'начинать', 'остановить' ),
					'serbian' => array( 'Serbian (српски)', 'слушати', 'чекати', 'почети', 'зауставити' ),
					'slovak' => array( 'Slovak (Slovenský)', 'Počúvať', 'Počkajte', 'Začať', 'Zastaviť' ),
					'spanish' => array( 'Spanish (Español)', 'Escuchar', 'Esperar', 'Iniciar', 'Detener' ),
					'swedish' => array( 'Swedish (Svensk)', 'Lyssna', 'Vänta', 'Starta', 'Stoppa' ),
					'tamil' => array( 'Tamil (தமிழ்)', 'கேட்க', 'காத்திருக்கவும்', 'ஆரம்பி', 'தடு' ),
					'turkish' => array( 'Turkish (Türk)', 'Dinlemek', 'Beklemek', 'Başlatmak', 'Durdurmak' ),
					'vietnam' => array( 'Vietnamese (Việt)', 'Nghe', 'đợi', 'bắt đầu', 'thôi' ),
					'welsh' => array( 'Welsh (Cymraeg)', 'Gwrando', 'Aros', 'Dechrau', "Stop" )
				);
				
				return $language_data;
				
			}
			
		}
		
	}

?>
