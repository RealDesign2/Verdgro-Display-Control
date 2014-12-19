var sLatestVersion = "";
//navigatie instellen.
$("#btnBack").show();	
$("#btnHome").show();

//Combobox vullen
LanguageFillCombo('selLanguages');

//standaard waarden vullen
//Wachtwoord
$("#PortalUser").val(appSettings.PortalUser);
$("#PortalPass").val(appSettings.PortalPass);

//Update
$("#divUpdateCheck").show();
$("#divUpdateDownload").hide();
$("#divUpdateStatus").html("");


//Vertaling instellen.	
$("#OptionsTitle").html(jLang.OptionsTitle);
$("#TabLanguage").html(jLang.OptionsTabLanguage);
$("#TabPortal").html(jLang.OptionsTabPortal);
$("#TabUpdate").html(jLang.OptionsTabUpdate);	
$("#divPortalText").html(jLang.OptionsPortalInfotext);	
$("#ButtonSave").html(jLang.Save);
$("#divUsername").html(jLang.OptionsPortalUser);
$("#divPassword").html(jLang.OptionsPortalPass);
$("#ButtonCheck").html(jLang.OptionsUpdateButtonCheck);
$("#ButtonDownload").html(jLang.OptionsUpdateButtonDownload);	

function OptionsSaveUserPass() {
	appSettings.PortalUser = $("#PortalUser").val();
	appSettings.PortalPass = $("#PortalPass").val();
	window.localStorage.appSettings = JSON.stringify(appSettings);	
	navigator.notification.alert(jLang.OptionsPortalSaved);
} 

function OptionsUpdateCheck() {
	var url = URLPortal + "app/VersionLast.json.asp"
	var sResult = "";
	//alert(url);
	$.ajax(
		{
			//dataType: "json",
			url: url,
			encoding: "UTF-8",
			async: false,
			timeout: 2000,
			cache: false
		})
		.done(function( data ) {					
			//alert(data.Version);
			var sVersie = Versie;
			sVersie = sVersie.replace('T', '');              //T van Test eraf halen
			sVersie = sVersie.replace('L', '');              //L van Live eraf halen
			sVersie = sVersie.replace('.', '');               //. van scheiding verwijderen
			sVersie = sVersie.replace('.', '');               //. van scheiding verwijderen
			if (parseInt(data.Version) > parseInt(sVersie)) {
				//Nieuwe versie beschikbaar.
				$("#divUpdateCheck").hide();
				$("#divUpdateDownload").show();
				$("#divUpdateStatus").html(jLang.OptionsUpdateNewUpdate  + " (" + data.Version + ")");
				sLatestVersion = data.Version
			} else {
				//Geen nieuwe versie beschikbaar
				$("#divUpdateCheck").show();
				$("#divUpdateDownload").hide();
				$("#divUpdateStatus").html(jLang.OptionsUpdateNoNewUpdate);
			} 
				
		})		
		.fail(function( jqXHR, textStatus ) {
			if (IsDebug == true) { 
				$("#divUpdateStatus").html("FAILURE (GetLibraryPortal)<br/>Status : " + jqXHR.status + "<br/>Message : " + jqXHR.responseText);
			} else {
				$("#divUpdateStatus").html("<br>" + jLang.LibraryNoInternet + "<br><br>");
			} 				
		}		
	);
} 

function OptionsUpdateDownload() {
	var url = URLPortal + "app/apk/VDC" + sLatestVersion + ".apk"
	//alert(url);
	openURL(url);
} 