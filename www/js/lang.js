//Dit bestand bevat alle functies die we nodig hebben voor de taal afhankelijkheid.
					 
function LanguageChange(sLanguage) {
	//Deze functie pakt de standaard taal en overschrijft deze met de juiste andere taal.
		
	//Standaard overnemen van default language.
	var sLangToSet = "EN";		
	jLang = JSON.parse(LanguageGetFile(sLangToSet));	
	
	//Kijken of er een afwijkende taal is meegegeven.	
	if (sLanguage != "EN") { 
		//Default met nieuwe taal overschrijven.
		
		var jNewLang;		
		jNewLang = JSON.parse(LanguageGetFile(sLanguage));
		for (var key in jNewLang) {		
			var item = jNewLang[key];
			//overzetten naar standaard 
			jLang[key] = item;
		}
		sLangToSet = sLanguage;
	}	
	appSettings.Language = sLangToSet
	window.localStorage.appSettings = JSON.stringify(appSettings);
	
	//Standaard knoppen van naam laten wijzgen (terug, home)	
	$("#btnBack").changeButtonText(jLang.BasicBack); 
	$("#btnHome").changeButtonText(jLang.BasicHome); 
	
	
} 

function LanguageGetFile(sLanguage) {
	var url = "lang/" + sLanguage + '.js';
	var sResult = "";
	//alert(url);
	$.ajax(
		{
			dataType: "json",
			url: url,
            encoding: "UTF-8",
			async: false,			
			cache: false
		})
		.done(function( data ) {	
			sResult = JSON.stringify(data);			
		})		
		.fail(function( jqXHR, textStatus ) {
			navigator.notification.alert("FAILURE (LanguageGetFile)<br/>Status : " + jqXHR.status + "<br/>Message : " + jqXHR.responseText, null, AlertTitle, 'OK');
		}		
	);	
	//alert(sResult);
	return sResult 
} 


//Functie die de aangegeven combobox vult met de beschikbare talen.
function LanguageFillCombo(sIDCombo) {
	var oCombo = document.getElementById(sIDCombo);
	for (var i = 0; i < jLangAvailable.languages.length; i++)
	{
		var option = document.createElement("option");
		option.text = jLangAvailable.languages[i].language;
		option.value = jLangAvailable.languages[i].shortlang;	
		oCombo.add(option);
	}
	oCombo.value = appSettings.Language;
	//opnieuw renderen combobox ivm met jquerymobile
	//$('#' + sIDCombo).selectmenu('refresh');
	
	$('#' + sIDCombo).selectmenu();
	$('#' + sIDCombo).selectmenu('refresh', true);
} 

function LanguageStartUp() {
	//Ophalen ingestelde taal, indien niet beschikbaar standaard instellen.
	//var sLang = window.localStorage.Language 
	
	if (typeof(appSettings.Language) == "undefined") {
		//nog geen gekozen taal, dan standaard pakken.
		appSettings.Language = "EN"
	} 
	LanguageChange(appSettings.Language)	
} 

(function($) {
    /*
     * Changes the displayed text for a jquery mobile button.
     * Encapsulates the idiosyncracies of how jquery re-arranges the DOM
     * to display a button for either an <a> link or <input type="button">
     */
    $.fn.changeButtonText = function(newText) {
        return this.each(function() {
            $this = $(this);
            if( $this.is('a') ) {
                //$('span.ui-btn-text',$this).text(newText);
				$($this).text(newText).button('refresh');
                return;
            }
            if( $this.is('input') ) {
                $this.val(newText);
                // go up the tree
                var ctx = $this.closest('.ui-btn');
                $('span.ui-btn-text',ctx).text(newText);
                return;
            }
        });
    };
})(jQuery);

//function WriteLanguage() {
//	var sTekst = "";	
//	for (var key in jLang) {		
//		var item = jLang[key];
//		sTekst = sTekst + item + "<br>"
//	} 
//	document.getElementById("divDebug").innerHTML = sTekst;	
//} 


	