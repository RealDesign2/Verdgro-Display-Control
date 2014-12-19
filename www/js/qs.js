//In dit javascript bestand worden alle beschikbare functies aangeboden die QS tech in het PHP protocol heeft geïmplementeerd.
//De meeste functies leveren altijd een xml bestand op. Dit bestand heeft de volgende layout
//<root>
//	<OK>false</OK>
//	<data>Foutmelding</data>
//</root>
// of
//<root>
//	<OK>true</OK>
//	<data>Return data</data>
//</root>
//
//We kunnen de diverse functies in de volgende functies indelen.
//1. Controller.
//2. Player.
//3. User.
//
//Daarnaast hebben we nog een aantal Combinatiefuncites en hulpfuncties.

// ***** CONTROLLER FUNCTIONS*****
function ControllerSetPowerState(bOn) {
	//bOn = bOn || true;
	var iAction = 0;
	if (bOn == true) {
		iAction = 1;
	}
	var jResult = SendData("PowerState", {"stat" : iAction});
	return jResult;
} 
function ControllerGetPowerState() {
	var jResult = SendData("GetPowerState", {});
	return jResult;
} 

function ControllerSetLockScreen(bOn) {
	//bOn = bOn || true;
	var iAction = 0;
	if (bOn == true) {
		iAction = 1;
	}
	var jResult = SendData("SetLockScreen", {"value" : iAction});	
	return jResult;
} 

function ControllerGetBrightness() {
	var jResult = SendData("GetBrightness", {});
	return jResult;
} 

// ***** PLAYER FUNCTIONS *****
function PlayerGetFiles() {
	var jResult = SendData("GetFiles", {});
	return jResult;
} 

function PlayerDeleteFile(sFileName) {
	var oPost = { "fileName" : sFileName}	
	var jResult = SendData("DeleteFile", oPost);
	return jResult;
} 

function PlayerUploadFile(sFileName, sBase64) {
	sFileName = sFileName;
	var oPost = { "name" : sFileName, "content" : sBase64}	;
	//alert(oPost.content);
	//var jResult = SendData("upload", oPost);
	var jResult = SendData("upload", oPost);
	return jResult;
} 

function PlayerSendPlaylist(sXML) {
	var oPost = { "value" : sXML}		
	var jResult = SendData("SendPlaylist", oPost);
	return jResult;
}

function PlayerGetScreenInfo(ControllerInfo) {
	//Deze functie leest het conifg.xml bestand van de player zodat we kunnen zien met wat voor scherm we te maken hebben
	
	$.ajax(
		{
			url: GetURL('config.xml'),
            encoding: 'UTF-8',
			type: "POST",			
			timeout: AjaxControllerTimeout,
			async: false,
			//crossDomain: true,
			cache: false
		})
		.done(function( data ) {
			//windows settings
			node = data.getElementsByTagName('window');				
			ControllerInfo.DisplaySizeWidth = node[0].getAttribute("w");
			ControllerInfo.DisplaySizeHeight	= node[0].getAttribute("h");
			ControllerInfo.DisplayOffsetX = node[0].getAttribute("x");
			ControllerInfo.DisplayOffsetY = node[0].getAttribute("y");
			//usbsetting
			node = data.getElementsByTagName('portName');	
			ControllerInfo.ControllerUSBPort = node[0].getAttribute("port");
			
		})		
		.fail(function( jqXHR, textStatus ) {	
			if (IsDebug == true) {
				alert("AjaxError : \n" + textStatus + "\n" + jqXHR.statusText + "\n" + jqXHR.responseText);
			} else {
				alert("Error getting screen info");
			}
		}
	);	
}

function PlayerGetVerdegroInfo(ControllerInfo) {
	$.ajax(
		{
			url: GetURL('Verdegro.xml'),
            encoding: 'UTF-8',
			type: "POST",			
			timeout: AjaxControllerTimeout,
			async: false,
			//crossDomain: true,
			cache: false
		})
		.done(function( data ) {
			PlayerProcesVerdegroInfo(data, ControllerInfo);					
		})		
		.fail(function( jqXHR, textStatus ) {	
			if (IsDebug == true) {
				alert("AjaxError : \n" + textStatus + "\n" + jqXHR.statusText + "\n" + jqXHR.responseText);
			} else {
				alert("Error getting screen info (vd)");
			}
		}
	);	
} 

function PlayerProcesVerdegroInfo(data, ControllerInfo) {
	var jsonVerdegroSettings = JSON.parse(JSON.stringify(VerdegroSettingsDefault));
	
	//TODO Kijken of elementen bestaan, anders standaard gebruiken (jsonVerdegroSettings)
	
	//display name
	node = data.getElementsByTagName('DisplayName');
	//alert(node[0].innerHTML);
	ControllerInfo.VerdegroDisplayName = node[0].innerHTML;
		
	//Protocol version
	node = data.getElementsByTagName('ProtocolVersion');
	//alert(node[0].innerHTML);
	ControllerInfo.VerdegroProtocolVersion = node[0].innerHTML;
	
	//PixelDetectionEnabled
	node = data.getElementsByTagName('PixelDetectionEnabled');
	//alert(node[0].innerHTML);
	ControllerInfo.PixelDetectionEnabled = node[0].innerHTML;
	
}


// ***** USER FUNCTIONS *****

function UserLogin(sUser, sPass) {
	//Indien geen waarden zijn meegegeven dan standaard waarden pakken
	sUser = sUser || PHPUser;
	sPass = sPass || PHPPass;
	var oPost = { "userName" : sUser, "password" : sPass}
	var jResult = SendData("Login", oPost);		
	return jResult;
} 


// ***** COMBINATIEFUNCTIES *****

function QSPlay() {
	var oReturn;
	oReturn = ControllerSetPowerState(true);
	if (oReturn.OK = "true") {
		oReturn = ControllerSetLockScreen(true);
		if (oReturn.OK = "true") {
			//alert('succesfully send play command');
		} else {
			alert('Error setting power state');
		} 
	} else {
		alert('Error setting power state');
	} 
}

function QSPause() {
	var oReturn;
	oReturn = ControllerSetPowerState(false);
	if (oReturn.OK = "true") {
		oReturn = ControllerSetLockScreen(false);
		if (oReturn.OK = "true") {
			//alert('succesfully send pause command');
		} else {
			alert('Error setting power state');
		} 
	} else {
		alert('Error setting power state');
	} 

} 

function QSSendShow(jShow) {
	//Deze funcite verstuud een show naar de player. Dit gebeurd in een aantal stappen.
	//1. Kijken of er wel items in de show zitten
	//2. Aanmelden
	//3. Ophalen van items in media-map
	//4. Verwijderen van items in media-map
	//5. Verzenden van nieuwe bestanden naar media-map (ondertussen xml opbouwen)
	//6. Verzenden van show (xml)
	
	var oReturn;
	var oReturn2;
	var sXML = "";
	
	if (jShow.Slide.length != 0) {
		oReturn = UserLogin();
		if (oReturn.OK == "true") {
			//we zijn aangemeld
			//Ophalen van items in map media				
			oReturn = PlayerGetFiles();
			if (oReturn.OK == "true") {
				//we hebben data, kijken of deze ook items bevalt
				if (oReturn.data.files.file.length > 0) {
					//alert(oReturn.data.files.file.length);
					//we hebben items in media map. Deze opruimen
					var sTempFile = "";
					for (var i=0;i<oReturn.data.files.file.length;i++)
					{ 
						//hieronder een onvolkomenhied van xml2json oplossen. (Indien maar 1 element aanwezig dan wordt niet omgezet naar array)
						if (oReturn.data.files.file[i].length == 1) {
							sTempFile = sTempFile + oReturn.data.files.file[i]
						} else {
							oReturn2 = PlayerDeleteFile(oReturn.data.files.file[i]);
						} 						
						//Niet naar resultaat kijken, indien fout dan toch gewoon doorgaan.
					}
					if (sTempFile != "") {
						oReturn2 = PlayerDeleteFile(sTempFile);
					}  
				} 				
				//bestanden verwijderd uit media. Nu nieuwe bestanden toevoegen uit show.
				for (var i=0;i<jShow.Slide.length;i++)
				{	//Door de slides heen lopen en uploaden, daarna xml samenstellen.
					var sFile;
					sFile = i + 1;
					sFile =  sFile + "." + jShow.Slide[i].filename.substring(jShow.Slide[i].filename.lastIndexOf('.')+1); 
					sFile = sFile.toLowerCase();
					//alert(sFile)
					oReturn2 = PlayerUploadFile(sFile, jShow.Slide[i].base64);
					//alert(oReturn2.data);
					sXML = sXML + '<item fileName="' + sFile + '" duration="' + jShow.Slide[i].duration + '" />'
				}
				//bestanden zijn geupload en xml aangemaakt, nu alleen root elementen toevoegen
				sXML = "<root>" + sXML + "</root>"
				//alert(sXML);
				oReturn = PlayerSendPlaylist(sXML);
				//alert(oReturn.OK);
				//alert(oReturn.data);
				//Even een unfreeze sturen
				//oReturn2 = PlayerFreeze(false);
				QSPlay();
			}
		}
				
	} else {
		oReturn = { OK: "false", "data" : jLang.QSNoSlidesInShow } 			
	} 
	
	return oReturn
	
} 


// ***** HULPFUNCTIES *****

//Deze functie doet een synchrone call 
function GetURL(sFunction)
{
	var sURL = "";	
	//afhankelijk van type verbinding juiste URL opbouwen.	
	if (IsDirectConnect == true) {
		sURL = URLExternal.replace("<ip>", IPDirectConnect);		
	} else {
		sURL = URLExternal.replace("<ip>", "SomeIP");
	} 	
	//we plakken automatisch .php achter de functie tenzij we een andere extensie meegeven
	sURL = sURL + sFunction
	if (sFunction.indexOf(".") == -1) { 
		sURL = sURL + '.php'
	}
	//alert(sURL);
	return sURL
} 

//Deze functie verstuurd de data daadwerkelijk naar de computer en geeft een 
function SendData(sFunction, jPostData, contentType) {	
	contentType = contentType || "UTF-8"
	var sURL = "";
	var sXML = "nu";
	//afhankelijk van type verbinding juiste URL opbouwen.	
	//if (IsDirectConnect == true) {
	//	sURL = URLExternal.replace("<ip>", IPDirectConnect);		
	//} else {
	//	sURL = URLExternal.replace("<ip>", "SomeIP");
	//} 	
	//sURL = sURL + sFunction + '.php'
	sURL = GetURL(sFunction);
	//alert(sURL)
	//Indien het fout gaat ook een melding van geven.
	$.ajax(
		{
			url: sURL,
            encoding: contentType,
			type: "POST",
			data: jPostData,
			timeout: AjaxControllerTimeout,
			async: false,
			//crossDomain: true,
			cache: false
		})
		.done(function( data ) {
			sXML = data;
		})		
		.fail(function( jqXHR, textStatus ) {	
			sXML = "";
			sXML = sXML + "<root>\n"
			sXML = sXML + "   <OK>false</OK>\n"
			sXML = sXML + "   <data>AjaxError : \n" + textStatus + "\n" + jqXHR.statusText + "\n" + jqXHR.responseText + "</data>\n"
			sXML = sXML + "</root>\n"	
		}
	);	
	return SendDataXMLToJson(sXML)
} 

//Deze functie zet de retour XML om naar JSON object
function SendDataXMLToJson(sXML) {
	//We gebruiken hier een library voor
	//alert(sXML)
	var json;
	try { 
		json = $.xml2json(sXML); 
		//Controleren of json object goed is (hebben we OK en hebben we data)		
		if ((typeof(json.OK) == "undefined") || (typeof(json.data) == "undefined")) {
			json = { OK: "false", data: "XML2JSON ongeldig JSON Object" } 
		} 
	} 
	catch (err) {
		json = { OK: "false", data: "Fout in XML2JSON" } 
	} 
	return json	
} 


