
var appSettings = {};

var appSettingsDefault = {
	"Language"				: "EN",							//Ingestelde taal
	"Library"				: [],							//Afbeeldingen in locale library
	"PortalUser" 			: "",							//Gebruikersnaam Portaal
	"PortalPass" 			: "",							//Wachtwoord Portaal
	"Slide" 				: [],							//Show die je maakt
	"ImageText"				: [],							//Array van oDefaultRow	
	"ImageTextCurrentRow"	: 0								//Pointer binnen de array van ImageText		
}; 
var oDefaultRow = { 
	"Text" 	: "",
	"Size" 	: 12,
	"Color" : "#ffffff"
} ;

var ControllerInfoDefault = {
	"DataCollected"					: false,						//Aangeven of de data al eens ingelezen is.	
	"Slide"							: [],							//Verzameling van de huidige dia's in player(Picture en tijd)
	"ControllerBrightnessMode" 		: "Manual",						//Controller mode van de brightness sensor
	"ControllerBrightnessValue"		: "0",							//Controller waarde brightness sensor
	"ControllerPowerMode"			: true,							//powermode , true is play	
	"ControllerUSBPort"				: "-Unknown-",					//Poort waarop USB aangesloten is.
	"DisplaySizeWidth"				: 80,							//Display breedte
	"DisplaySizeHeight"				: 80,							//Display hoogte
	"DisplayOffsetX"				: 0,							//Display start voor player x
	"DisplayOffsetY"				: 0,							//Display start voor player y
	"VerdegroDisplayName"			: "In development",				//Display Name
	"VerdegroProtocolVersion"		: "1.0"							//Versie van het protocol
};

	

//Vertalingen
var jLang = {};									//Bevat alle vertalingen die door de app heen gebruikt worden
var jLangAvailable = { "languages" : [			
									   { "language": "English",    	"shortlang": "EN" },
									   { "language": "Dutch", 		"shortlang": "NL" },
									   { "language": "Hungarian", 	"shortlang": "HU" }
									   
									  ]
					 } 
					 
