
//Instellingen

var IsDebug = false;								//Aangeven of we in debug modes zitten, dan kunnen we ook andere melding geven
var Versie = "1.0.4";							//Versie ook aanpassen in config.xml voor build
var IsDirectConnect = true;						//Aangeven of we een direct connectie hebben op IP

var Title="Display Control";					//Titel die boven aan de app komt te staan
var URLHomePage = "home.html";					//Homepage die standaard geopend wordt binnen de APP	
var URLExternal = "http://<ip>/RasPi/";			//Pad naar de bestanden voor het PHP protocol
var IPDirectConnect = "192.168.0.1";			//IP-adres wat we moeten gebruiken inden we direct connectie hebben.
var URLPortal = "http://portal.verdegro.com/";	//URL van het portaal. Hier halen we externe informatie vandaan.
var PHPUser = "admin"							//Gebruiker voor PHP communicatie
var PHPPass = "12345678"						//Wachtwoord voor PHP communicatie
var AlertTitle = "Display Control";				//Indien er een alert wordt gegeven (via phonegap). Krijgt de alertbox deze titel.
var AjaxControllerTimeout = 5000;				//Tijd in ms dat een transactie naar de tekstwagen mag duren.
var ShowDefaultSlideTime = 5;					//standaard tijd voor de dia
var ShowDefaultSlideMax = 10;					//Maximum van aantal slides in show

//Applicatie brede variabelen, maar die elke 
//keer dat de app gestart wordt worden gereset
var  DirectShowTab = 'tabOne';														//direct.html - om naar de juist tab
var  DirectControllerInfo = JSON.parse(JSON.stringify(ControllerInfoDefault));		//direct.html - data van het display en controller. In dit object opslaan zodat we het niet steeds hoeven uit te lezen.

//nodig voor ripple_emulator
_IS_RIPPLE_EMULATOR = $('#tinyhippos-injected').length > 0;

//Onderstaande regel activeren voor rechtstreeks testen in IE.
//StartApp(true);

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
		$("#divConnection").hide();	
		//$.ajaxSetup({ scriptCharset: "utf-8" , contentType: "application/json; charset=utf-8"});
    },
    // Bind Event Listeners    
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);		
		document.addEventListener('offline', this.onOffline, false);
		document.addEventListener('online', this.onOnline, false);	
    },
    
	// deviceready Event Handler    
    onDeviceReady: function() {		
        app.receivedEvent('deviceready');		
		StartApp(false);
		if(_IS_RIPPLE_EMULATOR) cordova.addDocumentEventHandler('backbutton'); 
		document.addEventListener("backbutton", onBackKeyDown, false);		
    },
	
	onOffline: function() {
        app.receivedEvent('offline');
		$("#divConnection").fadeIn();		
    },
	
	onOnline: function() {
        app.receivedEvent('online');		
		$("#divConnection").fadeOut();
    },
	
    // Update DOM on a Received Event
    receivedEvent: function(id) {
         console.log('Received Event: ' + id);
    }
};


function onBackKeyDown() {
    // Handle the back button	
	//alert('back');
	if ($("#btnBack").is(":visible") == true)
	{	//back uitvoeren
		//alert('back');
		$("#btnBack").click();		
	}
	else
	{	//indien homepage dan app verlaten. (homepage indien home niet zichtbaar is)
		if ($("#btnHome").is(":visible") == false)
		{					
			navigator.app.exitApp();			
		}
	}
	
}


function openURL(url){
	//alert(url);
    navigator.app.loadUrl(url, { openExternal:true });
    //return false;
	 //var ref = window.open(encodeURI(url), '_system', 'location=yes');	
}

function loadURL(url, jqObject){
	//jqObject is een string die bevat een jqery groep. Indien niet meegegeven pakken we standaard het dataveld.
	if ((String(jqObject).trim() + "" == "") || (jqObject == undefined)) {jqObject = "#divData"}
	
	$(jqObject).html("<center><img src='img/loading.gif'><br><br>Laden...</center>");
	
	$.ajax(
		{
			url: url,
            encoding: "UTF-8",
			//type: "POST",
			//data: "{}"
			//async: true,
			//crossDomain: true,
			cache: false
		})
		.done(function( html ) {
			$(jqObject).html(html).trigger("create");	//.trigger toegevoegd zodat het jquery framework erop los gelaten wordt en alle styles worden toegepast.
		})		
		.fail(function( jqXHR, textStatus ) {
			//Workaround voor windows Phone voor de geen internet pagina.
			if ((url == 'internal/nointernet.html')  && (jqXHR.status == '404')) {
				$(jqObject).html("<center><br><br><b>Deze app vereist een verbindingen</b><br><br><img src='img/noconnection.png' border='0'><br><br>U kunt niet doorgaan.</center>");
				$("#btnBack").hide();
				$("#btnMenu").hide();
				$("#btnLogOff").hide();
				$("#btnChange").hide();
				$("#btnHome").hide();
				document.removeEventListener('backbutton',onBackKeyDown); //voor windows phone
			} else {
				$(jqObject).html("FAILURE <br/>Status : " + jqXHR.status + "<br/>Message : " + jqXHR.responseText);
			}
		}
	);
	window.eventReturnValue = false;
	return false;	
}

function querystring(key) {
   var re=new RegExp('(?:\\?|&)'+key+'=(.*?)(?=&|$)','gi');
   var r=[], m;
   while ((m=re.exec(document.location.search)) != null) r.push(m[1]);
   return r;
}

function StartApp(manual) {
	//via deze functie omzeilen we de appinterface zodat website ook kan draaien binnen IE of andere broswers zonder app emulator
	
	if (manual == true)
	{
		alert('manual start');
		$("#divConnection").fadeOut();	
	}
	
	$("#divStatus").html("Status apparaat : OK");
	$("#divStatus").hide();
	
	//Innlezen variablen van de app			
	if (typeof(window.localStorage.appSettings) == "undefined") {
		//geen appsettings gevonden, dan standaard appsettings vullen en opslaan
		forceDefaultAppSettings();
		window.localStorage.appSettings = JSON.stringify(appSettings);
	} else {
		//appsettings inlezen.
		appSettings = JSON.parse(window.localStorage.appSettings);
		//Kijken of er geen standaard app settings zijn toegevoegd
		addNewDefaultAppSettings();
	} 
		
	var networkState = navigator.connection.type;	
	//alert(networkState);
	if (networkState != 'none')	{
		//we hebben internet		
		loadURL('internal/' + URLHomePage);
	} else {
		//we hebben geen internet
		loadURL('internal/nointernet.html');		
	}
	//versie plaatsen
	
	$("#lblVersie").html('v' + Versie );
	//title plaatsen	
	$("#lblTitle").html(Title);	
	
	//Taalinstellingen	
	LanguageStartUp()

}

function SetDebug(DebugOn)	{
	//Via deze functie kunnen we aan de APP en server kant de debug functie aanzetten.
	//Indien deze functie aan staat wordt er extra informatie getoond bij de verschillende processen.	
	if (IsDebug == true){
		IsDebug = false;
		alert('Debug : Off');
	}
	else {
		IsDebug = true;
		alert('Debug : On');
	}	
}

$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

function submitenter(myfield,e, sExecuteFunction)
{
	var keycode;
	if (window.event) keycode = window.event.keyCode;
	else if (e) keycode = e.which;
	else return true;
	if (keycode == 13)
	{
		eval(sExecuteFunction);
		return false;
	}
	else return true;
}

function forceDefaultAppSettings() {
	//deze functie haalt de default appsettings op en gooit deze over de huidige appsettings heen
	appSettings = JSON.parse(JSON.stringify(appSettingsDefault));
}

function addNewDefaultAppSettings() {
	//Bij een nieuwe release kan het voorkomen dat er extra settings zijn toegevoegd aan appSettingsDefault. 
	//Deze zitten dan niet in de appsettings die we van disk inlezen. We gaan nu door de default appsettings heen lopen en indien deze niet in de appsettings voorkomt
	//voegen we hem toe. De bestaande settings worden dus niet overschreven.
	
	
	var jDefaultAppSettings = JSON.parse(JSON.stringify(appSettingsDefault));
	var bItemsAdded = false;
	//Door de jDefaultAppSettings heen lopen en kijken of deze in de echte appsettings voorkomt.
	for (var key in jDefaultAppSettings) {
		if (typeof(appSettings[key]) == "undefined") {
			//waarde komt nog niet voor, dan toevoegen aan appsettings
			bItemsAdded = true;
			appSettings[key] = JSON.parse(JSON.stringify(jDefaultAppSettings[key]));
		}
	}
	if (bItemsAdded == true) {		
		//we hebben items toegevoegd, deze opslaan
		window.localStorage.appSettings = JSON.stringify(appSettings);
	}
} 

function GetBase64FromImgURL(sURL, bWithMime) {
	//optionele parameter standaard instellen indien niet meegegeven.
	bWithMime = bWithMime || false;
	
	//declareren variableen
	var canvas = document.createElement('CANVAS');
	var ctx = canvas.getContext('2d');
	var img = new Image;
	var sExtensie = "";
	var sReturn = "";
	
	//extensie bepalen en kijken of deze voldoet aan de meegegeven extensies.
	sExtensie = GetMimeFromUrl(sURL);
	if (sExtensie.substring(3) != "ERR") {
		
		//daadwerkelijk 	
		img.crossOrigin = 'Anonymous';	
		img.src = sURL;
		
		sReturn = GetBase64FromImgObj(img, bWithMime, sExtensie);
		img = null;
	} else {
		sReturn = sExtensie
	} 
	return sReturn

} 


function GetBase64FromImgObj(oImg, sExtension) {
	sExtension = sExtension || "jpeg";
	//optionele parameter standaard instellen indien niet meegegeven.
	
	
	//declareren variableen
	var canvas = document.createElement('CANVAS');
	var ctx = canvas.getContext('2d');	
	var sReturn = "";
	
	//inlezen in canvas en daarna als base64 exporteren.
	canvas.height = oImg.height;
	canvas.width = oImg.width;
	ctx.drawImage(oImg,0,0);
	sReturn = canvas.toDataURL('image/' + sExtension);
	//alert(sReturn);
    //opruimen objecten.
    canvas = null;
            
	return sReturn

} 

function GetMimeFromUrl(sURL){
	var sReturn = "";
	sExtensie = sURL;
    sExtensie = sExtensie.substring(sExtensie.lastIndexOf('.')+1);
    sExtensie = sExtensie.toLowerCase();
    //alert(sExtensie);
    
    switch (sExtensie)
    {
        case "png" :
        case "jpeg" :
        case "bmp" :
        case "gif" :
            break;
        case "jpg" :
             sExtensie = "jpeg";
            break;
        default:
          sReturn ="ERROR;Unsupported extension"
    }
	return sReturn
}



