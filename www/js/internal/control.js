//Layout
//eerste tab selecteren (#TODO)
$("#tabOne").addClass('ui-btn-active');
$("#idpage").page();

//Knoppen
$("#btnBack").show();	
$("#btnHome").show();

//Vertaling instellen.	
$("#LibraryTitle").html(jLang.LibraryTitle);
$("#TabLocal").html(jLang.LibraryTabLocal);
$("#TabPortal").html(jLang.LibraryTabPortal);
$("#MenuPortalAction").html(jLang.LibraryMenuPortalAction);
$("#MenuPortalToLocalLibrary").html(jLang.LibraryMenuPortalToLocalLibrary);
$("#MenuPortalCancel").html(jLang.Cancel);
$("#MenuLocalAction").html(jLang.LibraryMenuLocalAction);
$("#MenuLocalToShow").html(jLang.LibraryMenuLocalToShow);
$("#MenuLocalToScreen").html(jLang.LibraryMenuLocalToScreen);
$("#MenuLocalDelete").html(jLang.Delete);
$("#MenuLocalCancel").html(jLang.Cancel);
$("#ButtonRefresh").html(jLang.Refresh);
$("#DirectTabEditShow").html(jLang.DirectTabEditShow);
$("#DirectTabStatus").html(jLang.DirectTabStatus);		
$("#DirectCurrentShow").html(jLang.DirectCurrentShow);	
$("#DirectButtonPlay").html(jLang.DirectButtonPlay);	
$("#DirectButtonPause").html(jLang.DirectButtonPause);	
$("#DirectNoCurrentShow").html(jLang.DirectNoCurrentShow);	
$("#DirectButtonRefresh").html(jLang.Refresh);	
$("#DirectButtonEditShow").html(jLang.DirectButtonEditShow);
$("#DirectController").html(jLang.DirectController);
$("#DirectDisplay").html(jLang.DirectDisplay);
$("#DirectAdvancedSettings").html(jLang.DirectAdvancedSettings);
$("#DirectShowEditor").html(jLang.DirectShowEditor);
$("#DirectTextEditor").html(jLang.DirectTextEditor);

$("#StatusBrightnessMode").html(jLang.StatusBrightnessMode);
$("#StatusBrightnessValue").html(jLang.StatusBrightnessValue);
$("#StatusPowermode").html(jLang.StatusPowermode);
$("#StatusControllerButtonRefresh").html(jLang.Refresh);
$("#StatusDisplayName").html(jLang.StatusDisplayName);
$("#StatusDisplayScreensize").html(jLang.StatusDisplayScreensize);
$("#StatusDisplayPixeldetection").html(jLang.StatusDisplayPixeldetection);
$("#StatusShowButtonRefresh").html(jLang.Refresh);
$("#StatusAdvancedSettingsUSB").html(jLang.StatusAdvancedSettingsUSB);
$("#StatusAdvancedSettingsOffset").html(jLang.StatusAdvancedSettingsOffset);
$("#StatusAdvancedSettingsProtocol").html(jLang.StatusAdvancedSettingsProtocol);

$("#ShowButtonSendShow").html(jLang.ShowButtonSendShow);
$("#ShowButtonClearShow").html(jLang.ShowButtonClearShow);

$("#EditTextLine").html(jLang.EditTextLine);
$("#EditTextButtonClearRow").html(jLang.EditTextButtonClearRow);
$("#EditTextButtonClear").html(jLang.EditTextButtonClear);
$("#EditTextButtonSave").html(jLang.EditTextButtonSave);

//Toevoegen van talen aan selectbox
var select = $("#TextColor");
$.each(jLang.EditTextSelectColor, function(index, val) {              
	var optTempl = '<option value="' +val.value+ '">'+ val.name+'</option>';            
	select.append(optTempl)
});
select.selectmenu();
select.selectmenu('refresh', true);

//Toevoegen van textgrootes aan selectbox
select = $("#TextSize");
$.each(EditTextTextSize, function(index, state) {              
	var optTempl = '<option value="' +state+ '">'+ jLang.EditTextSelectSize + ' ' + state+'</option>';            
	select.append(optTempl)
});
select.selectmenu();
select.selectmenu('refresh', true);



//=================================================================================
var sClickedImageID = "";
var sUser = "";
var Settings = {
			"Rows"			: [],
			"CurrentRow"	: 0, 
			"Width"			: 124,
			"Height"		: 80				
		};

$("#ControllerOK").hide();
$("#ControllerError").show();
$("#ControllerErrorText").html(jLang.DirectTextCheckingController);

//Testen of connectie wel goed werkt. Dit doen we door de Verdegro.xml uit te lezen. Indien succesvol ingelezen is player benaderbaar en hebben we meteen de settings
$.ajax(
	{
		url: GetURL('Verdegro.xml'),
		encoding: 'UTF-8',
		type: "POST",			
		timeout: AjaxControllerTimeout,
		async: true,
		//crossDomain: true,
		cache: false
	})
	.done(function( data ) {
		//alert('OK');
		//Alles is goed gegaan, Raspberry is te benaderen.
		//overige functies uitvoeren.
		//Ophalen van de naam van het display, indien deze anders is dan zorgen dat gegevens helemaal opnieuw worden ingelezen.
		InitScreen(data)
		
	})		
	.fail(function( jqXHR, textStatus ) {	
		if ((textStatus ==  'parsererror') && (jqXHR.statusText == "OK")) {
			InitScreen(null);
		} else {
			if (IsDebug == true) {
				navigator.notification.alert("AjaxError : \n ts : " + textStatus + "\n st : " + jqXHR.statusText + "\n rt : " + jqXHR.responseText, null, AlertTitle, 'OK');
			} else {
				navigator.notification.alert(jLang.TimeOut, null, AlertTitle, 'OK');
			}		
			$("#ControllerOK").hide();
			$("#ControllerErrorText").show();
			$("#ControllerErrorText").html(jLang.DirectTextTimeOutOrError);			
		} 
	}
);	




//=================================================================================

function InitScreen(data) {
	var sPlayerName = DirectControllerInfo.VerdegroDisplayName;
	PlayerProcesVerdegroInfo(data, DirectControllerInfo);		
	if (DirectControllerInfo.VerdegroDisplayName != sPlayerName) {
		//we hebben te maken met een nieuw scherm
		DirectControllerInfo.DataCollected = false  //zorgt ervoor dat het allemaal opnieuw wordt ingelezen.
		DirectShowTab = 'tabOne'					//zorgt ervoor dat we altijd naar de eerste tab gaan. 
	}
	if (DirectShowTab == 'tabOne') {
		switchTab('tabOne');
	} else {
		switchTab('tabTwo');
	}
	
	GetLibrary();									//Lokale library inlezen
	//Alleen de eerste keer automatisch gegevens inlezen, daarna altijd via refresh 
	if (DirectControllerInfo.DataCollected == false) {
		GetCurrentControllerStatus();				//Status controller en player ophalen en wegzetten.
		CurrentShowGet();							//Huidige show ophalen
		DirectControllerInfo.DataCollected = true;				
	} else {
		//we hebben de gegevens al, deze in beeld zetten.
		CurrentShowWrite()
		WriteCurrentController()
	} 
	
	WriteShow();	//Te editen show in beeld zetten.			
	TextGo();		//Teksteditor initiëren				
	
	//Juiste gegevens in beeld zetten.
	$( "#set" ).children( ":last" ).collapsible( "collapse" );
	$("#ControllerOK").show();
	$("#ControllerError").hide();

	//Text opnieuw vullen
	TextRowInfoGet(appSettings.ImageTextCurrentRow);
}


function switchTab(sTab) {
	$("#tabOne").hide();
	$("#tabTwo").hide();
	$("#" + sTab).show();
	DirectShowTab = sTab;
} 
	
//Toont Interne Bibliotheek
function GetLibrary() {
	var sResult = ""
	//$("#LibraryContainer").html(appSettings.Library.length)
	if (appSettings.Library.length == 0) {
		sResult = "<br>" + jLang.LibraryNoItems + "<br><br>"
	} else {
		for (var i=0;i<appSettings.Library.length;i++)
		{ 
			sResult = sResult + "<img src='" + appSettings.Library[i].base64 + "' style='width:80px;' alt='" + appSettings.Library[i].filename + "'onClick='LocalImageClick(this);'  id='imglocal" + i + "'>&nbsp;&nbsp;"
		}
	} 
	$("#LibraryContainer").html(sResult);
} 

function PortalImageClick(objElement) {
	//alert(objElement.id);
	sClickedImageID = objElement.id;
	var p = $("#" + objElement.id); 
	$( "#popupMenu" ).popup("open", {positionTo: '#' + objElement.id });
}

function LocalSendToShow() {
	if (appSettings.Slide.length < ShowDefaultSlideMax) {
		//Toevoegen van afbeelding aan de showedit
		var sId = sClickedImageID;
		sId = sId.replace("imglocal", "")		
		
		oDia = {	"filename" 		: appSettings.Library[parseInt(sId)].filename,
					"base64" 		: appSettings.Library[parseInt(sId)].base64,
					"duration"		: 5}
					
		//slide toevoegen
		appSettings.Slide.push(oDia);
		//show opslaan
		window.localStorage.appSettings = JSON.stringify(appSettings);
		//verversen van show.
		WriteShow(true);		
		$('#popupMenuLocalDirect').popup('close');
	} else {
		navigator.notification.alert(jLang.ShowMaxItemsReached, null, AlertTitle, 'OK');
	} 
} 

function LocalSendToScreen() {
	if (confirm(jLang.LibraryConfirmToSreen) == true) {			
		var sId = sClickedImageID;
		sId = sId.replace("imglocal", "")			
		sB64 = appSettings.Library[parseInt(sId)].base64;
		//mimetype eraf halen
		//sB64 = sB64.substring(sB64.indexOf(",")+1).toLowerCase();
		//Nieuwe show aanmaken
		var jShow = { "Slide" : [ { "filename" : "", "base64" : "", "duration" : ShowDefaultSlideTime}]}
		jShow.Slide[0].filename = appSettings.Library[parseInt(sId)].filename;
		jShow.Slide[0].base64 = sB64;
		var oResult = QSSendShow(jShow);
		if (oResult.OK == "true") {
			navigator.notification.alert(jLang.LibraryShowSendedDirectly, null, AlertTitle, 'OK');
			//navigator.notification.alert(jLang.LibraryShowSendedDirectly, null, AlertTitle, 'OK');
			//goed gegaan, show verversen
			CurrentShowGet();
		} else {
			if (IsDebug==true) {
				//gedeatileerde fout
				navigator.notification.alert("Result LocalSendToScreen : " + oResult.data, null, AlertTitle, 'OK');
			} else {
				navigator.notification.alert(jLang.LibraryShowSendedDirectlyError, null, AlertTitle, 'OK');					
			}
		}
		
	} 
	$('#popupMenuLocalDirect').popup('close');
}

function LocalDelete() {
	if (confirm(jLang.LibraryConfirmDelete) == true) {
		var sId = sClickedImageID;
		sId = sId.replace("imglocal", "")			
		//alert(sId);
		appSettings.Library.splice(parseInt(sId),1);
		//opslaan
		window.localStorage.appSettings = JSON.stringify(appSettings);	
		GetLibrary();
	} 
	$('#popupMenuLocalDirect').popup('close');
} 


function LocalImageClick(objElement) {
	//alert(objElement.id);
	sClickedImageID = objElement.id;
	var p = $("#" + objElement.id); 
	$( "#popupMenuLocalDirect" ).popup("open", {positionTo: '#' + objElement.id });
}

function PortalGetImage() {
	$('#popupMenu').popup('close');
	
	var sFile = $('#' + sClickedImageID).attr('src');
	var oImg = document.getElementById(sClickedImageID);	
	//toevoegen aan de library
	var jsonImage = { "filename": "", "base64" : ""} 
	jsonImage.filename = sFile.substring(sFile.lastIndexOf('/')+1);
	jsonImage.base64 = GetBase64FromImgObj(oImg)		
	appSettings.Library.push(jsonImage);
	//opslaan
	window.localStorage.appSettings = JSON.stringify(appSettings);		
	GetLibrary();
	navigator.notification.alert(jLang.LibraryAddedToLibrary, null, AlertTitle, 'OK');		
} 

//Get Current Show
function CurrentShowGet() {	

	var sURL = "";
	var sXML = "";
	//afhankelijk van type verbinding juiste URL opbouwen.	
	sURL = PHPURLExternal.replace("<ip>", appSettings.PHPIP);	
	sURL = sURL + 'Publish/PlayList.xml'
	//alert(sURL)
	//Indien het fout gaat ook een melding van geven.
	$.ajax(
		{
			url: sURL,
			encoding: "UTF-8",
			//type: "POST",
			type: "GET",
			timeout: AjaxControllerTimeout,
			data: {},
			async: false,
			dataType: 'text',
			//crossDomain: true,
			cache: false
		})
		.done(function( data ) {
			//alert(data);
			//alert($(data).find("root"));
			var jXML = $.xml2json(data, true);
			
			//alert(jXML.item.length);			
			DirectControllerInfo.Slide = [];				//Resetten van het array van plaatjes				
			sURL = PHPURLExternal.replace("<ip>", appSettings.PHPIP);	
			for (var i=0;i<jXML.item.length;i++) {
				oDia = {	"path"			:  sURL + "Publish/",
							"filename" 		: jXML.item[i].fileName,								
							"duration"		: jXML.item[i].duration,
							"base64"		: ""
				}					
				//slide toevoegen
				DirectControllerInfo.Slide.push(oDia);				
			}
			CurrentShowWrite()
			//alert(jXML.root);
		})		
		.fail(function( jqXHR, textStatus ) {	
			navigator.notification.alert(jLang.DirectErrorGettingPlaylist, null, AlertTitle, 'OK');	
		}
	);		
} 

function CurrentShowEdit() {
	navigator.notification.confirm(
		jLang.DirectEditThisShowWarning, 
		function(button) {
			//Kijken welke button geklikt is. Waarde om door te gaan als eerste opgeven.
			if ((button == 1) || ((typeof button == 'undefined') && (IsDebug == true))) {
				//We hebben voor yes gekozen.				 
				//Huidige show weghalen
				ClearShow(false);
				//Dia voor dia show over te zetten.
				//appSettings.Slide -> bevat de te wijzigen show
				//DirectControllerInfo.Slide -> bevat de huidige show				
				for (var i=0;i<DirectControllerInfo.Slide.length;i++) {
					oDia = {	"filename" 		: DirectControllerInfo.Slide[i].filename,
								"base64" 		: DirectControllerInfo.Slide[i].base64,
								"duration"		: DirectControllerInfo.Slide[i].duration}					
					//slide toevoegen
					appSettings.Slide.push(oDia);
				}
				//show opslaan
				window.localStorage.appSettings = JSON.stringify(appSettings);
				//verversen van show.
				WriteShow(true);
				//Naar edit tab gaan.
				switchTab('tabTwo');
			} 
		},
		AlertTitle,
		[jLang.Yes, jLang.No]
		);
} 

function CurrentShowWrite() {
	//Zet de huidige show uit de player in beeld.
	//alert(DirectControllerInfo.Slide.length);
	var sHTML = "";	
	sHTML = sHTML + '<nobr>'		
	for (var i=0;i<DirectControllerInfo.Slide.length;i++) {
		sHTML = sHTML + '<div style="border:1px solid #000000; width:200px; height:200px; margin:4px; padding:4px; vertical-align: middle; text-align:center; display: inline-block; border-radius: 0.9em;"> ';
		//sHTML = sHTML + '<div style="width:200px; height:200px; display: inline-block; vertical-align: middle; border:1px solid #000000; text-align:center;">'
		sHTML = sHTML + '	<b>' + (i+1) + '.</b><br> ';
		sHTML = sHTML + '	' + jLang.DirectCurrentShowTime +  ' : ' + DirectControllerInfo.Slide[i].duration + ' sec<br>	';
		if (DirectControllerInfo.Slide[i].base64 != "") {
			sHTML = sHTML + '	<div><img src="' + DirectControllerInfo.Slide[i].base64 + '" id="CurrentShowSlide' + i + '" onLoad="CurrentShowImageTobase64(this);" style="max-width: 140px; max-height: 140px;"><br></div> ';
		} else {	
		//	//alert("OK")
			sHTML = sHTML + '	<div><img src="' + DirectControllerInfo.Slide[i].path + DirectControllerInfo.Slide[i].filename + '?rf=' + makeid() + '" id="CurrentShowSlide' + i + '" onLoad="CurrentShowImageTobase64(this);" style="max-width: 140px; max-height: 140px;"><br></div> ';
		}			
		sHTML = sHTML + '</div> ';
		//alert("OK");						
	}	
	sHTML = sHTML + '</nobr>'	
	$("#touchScroller").html(sHTML);
	$("#touchScroller").trigger("create")		
} 



function CurrentShowImageTobase64(oImg)
{	//id bepalen van array, uit naam van id object
	sID = oImg.id.replace('CurrentShowSlide', '');
	if (DirectControllerInfo.Slide[parseInt(sID)].base64 == "") {			
		DirectControllerInfo.Slide[parseInt(sID)].base64 = GetBase64FromImgObj(oImg)			
		//alert("OK - " + sID); 
	}
} 


function GetCurrentControllerStatus() {
	$("#ControllerOK").hide();
	$("#ControllerError").show();
	$("#ControllerErrorText").html(jLang.DirectTextCheckingController);	
	var oReturn;
	oReturn = ControllerGetBrightness();
	if (oReturn.OK == "true") {			
		DirectControllerInfo.ControllerBrightnessMode = oReturn.data.type
		DirectControllerInfo.ControllerBrightnessValue = oReturn.data.value			
		oReturn = ControllerGetPowerState();
		if (oReturn.OK == "true") {					
			DirectControllerInfo.ControllerPowerMode = oReturn.data
			//We hebben de Brithtness ingelezen. Nu info uit de XML bestanden inlezen.
			PlayerGetScreenInfo(DirectControllerInfo);			
			PlayerGetVerdegroInfo(DirectControllerInfo);
		} else {
			//navigator.notification.alert(oReturn.Data, null, AlertTitle +  ' - ERROR', 'OK');
			navigator.notification.alert(oReturn.Data, null, AlertTitle, 'OK');
		}			
	} else {
		//navigator.notification.alert(oReturn.Data, null, AlertTitle +  ' - ERROR', 'OK');
		navigator.notification.alert(oReturn.Data, null, AlertTitle, 'OK');
	} 
	WriteCurrentController();
	$( "#set" ).children( ":last" ).collapsible( "collapse" );
	$("#ControllerOK").show();
	$("#ControllerError").hide();	
} 

//zet de gegevens over de controller in beeld
function WriteCurrentController() {
	$("#ControllerBrightnessMode").html(DirectControllerInfo.ControllerBrightnessMode);
	$("#ControllerBrightnessValue").html(((100/256) * parseInt(DirectControllerInfo.ControllerBrightnessValue)) + '%');	
	$("#ControllerPowerState").html(DirectControllerInfo.ControllerPowerMode);
	
	$("#StatusDisplayNameValue").html(DirectControllerInfo.VerdegroDisplayName);
	$("#StatusDisplayScreensizeValue").html(DirectControllerInfo.DisplaySizeWidth + " x " + DirectControllerInfo.DisplaySizeHeight);
	$("#StatusAdvancedSettingsUSBValue").html(DirectControllerInfo.ControllerUSBPort);
	$("#StatusAdvancedSettingsOffsetValue").html(DirectControllerInfo.DisplayOffsetX + "," + DirectControllerInfo.DisplayOffsetY);
	$("#StatusAdvancedSettingsProtocolValue").html(DirectControllerInfo.VerdegroProtocolVersion);	
	if (DirectControllerInfo.VerdegroPixelDetectionEnabled == true) {		
		$("#StatusDisplayPixeldetectionValue").html(jLang.Supported); 
	} else  {
		$("#StatusDisplayPixeldetectionValue").html(jLang.NotSupported); 
	}
		
	
} 

function WriteShow(refresh) {
	//deze functie vult de huidige te editen show.
	var sHTML = "";
	
	if (appSettings.Slide.length > 0 ) {
		sHTML = sHTML + '<nobr>'
		for (var i=0;i<appSettings.Slide.length;i++) {
			sHTML = sHTML + '<div style="border:1px solid #000000; width:200px; height:240px; margin:4px; padding:4px; text-align:center; vertical-align: middle; display: inline-block; border-radius: 0.9em;"> ';
			sHTML = sHTML + '	<b>' + (i+1) + '.</b><br> ';
			//sHTML = sHTML + '	<img src="data:image/' + GetMimeFromUrl(appSettings.Slide[i].filename) + ';base64,'+ appSettings.Slide[i].base64 + '" style="max-width: 140px; max-height: 140px;"><br> ';				
			sHTML = sHTML + '	<button type="button" data-icon="minus" data-iconpos="notext" data-mini="true" data-inline="true" onClick="SlideMin('+ i + ');" id="SlideTimeMin' + i + '"></button>'
			sHTML = sHTML + '	<span id="SlideSec' + i +'">' + appSettings.Slide[i].duration + '</span> sec &nbsp;';
			sHTML = sHTML + '	<button type="button" data-icon="plus" data-iconpos="notext" data-mini="true" data-inline="true" onClick="SlidePlus('+ i + ');" id="SlideTimePlus' + i + '"></button><br>'
			sHTML = sHTML + '	<img src="'+ appSettings.Slide[i].base64 + '" style="max-width: 150px; max-height: 130px;"><br> ';
			sHTML = sHTML + '   <button type="button" data-icon="delete" data-iconpos="notext" data-inline="true" onClick="DeleteSlide(' + i + ');"></button> ';
			sHTML = sHTML + '</div> ';
		}	
		sHTML = sHTML + '</nobr>'			
	} else {
		sHTML = '<div style="width:300px"><br><br>' + jLang.ShowNoShowAvailabe + '<br><br></div>'
	}
	
	$("#touchScroller2").html(sHTML);
	$("#touchScroller2").trigger("create")

} 

function ClearShow(oAskConfirm) {
	oAskConfirm = (typeof oAskConfirm === "undefined") ? true : oAskConfirm;
	var bOK = true;
	if (oAskConfirm == true)
	{
		bOK = confirm(jLang.AreYouSure); 
	} 
	
	if (bOK == true) {
		appSettings.Slide = [];
		window.localStorage.appSettings = JSON.stringify(appSettings);
		WriteShow();
	} 
} 
	
function SendShow() {
	var oResult = QSSendShow(appSettings);
	if (oResult.OK == "true") {
		navigator.notification.alert(jLang.LibraryShowSendedDirectly, null, AlertTitle, 'OK');
		//navigator.notification.alert(jLang.LibraryShowSendedDirectly, null, AlertTitle, 'OK');
		//goed gegaan, show verversen
		CurrentShowGet();
	} else {
		if (IsDebug==true) {
			//gedeatileerde fout
			navigator.notification.alert("Result LocalSendToScreen : " + oResult.data, null, AlertTitle, 'OK');
		} else {
			navigator.notification.alert(jLang.LibraryShowSendedDirectlyError, null, AlertTitle, 'OK');			
		}
	}
} 

function SlideMin(index) {
	if (appSettings.Slide[parseInt(index)].duration > 1) {
		appSettings.Slide[parseInt(index)].duration = parseInt(appSettings.Slide[parseInt(index)].duration) - 1;		
		$("#SlideSec" + index).html(appSettings.Slide[parseInt(index)].duration);
		window.localStorage.appSettings = JSON.stringify(appSettings);
	}
} 

function SlidePlus(index) { 
	if (appSettings.Slide[parseInt(index)].duration < 300) {
		appSettings.Slide[parseInt(index)].duration = parseInt(appSettings.Slide[parseInt(index)].duration) + 1;		
		$("#SlideSec" + index).html(appSettings.Slide[parseInt(index)].duration);
		window.localStorage.appSettings = JSON.stringify(appSettings);
	}
} 

function DeleteSlide(slideNumber) {
	if (confirm(jLang.AreYouSure) == true) {
		appSettings.Slide.splice(parseInt(slideNumber), 1);
		window.localStorage.appSettings = JSON.stringify(appSettings);
		if (appSettings.Slide.lenth == 0) {
			WriteShow();
		} else { 
			WriteShow(true);
		} 
		
	} 

}


//initialiseren van het scherm.
function TextGo() {
	//Resize canvas naar scherm instellingen
	$('#work_area').html();
	var elementID = 'cvText';
	$('<canvas>').attr({
		id: elementID,
		width: DirectControllerInfo.DisplaySizeWidth + 'px',
		height: DirectControllerInfo.DisplaySizeHeight + 'px'
	}).css({					
		border: "1px solid black",
		background : "#000000"		
	}).appendTo('#work_area');
	
	if (appSettings.ImageText.length == 0) {
		//Nog geen Regels gevonden. Eerste Regel aanmaken.
		var oRow = JSON.parse(JSON.stringify(oDefaultRow)) 						
		appSettings.ImageText.push(oRow);
	} 
	 
	//Controleren of te tonen regel
	if (appSettings.ImageTextCurrentRow+1 > appSettings.ImageText.length) { 
		//appSettings.ImageTextCurrentRow valt buiten de scope, naar eerste dia gaan, die is er altijd want die hebben we zojuist toegevoegd.
		appSettings.ImageTextCurrentRow = 0;					
	} 				
	
	//Gegevens in beeld zetten.
	TextRowInfoGet(appSettings.ImageTextCurrentRow);
	
	
} 

//van bepaalde rij in beeld zetten
function TextRowInfoGet(iRow) {
	$("#TextRow").html((iRow+1) + "/" + appSettings.ImageText.length);
	$("#TextText").val(appSettings.ImageText[iRow].Text);
	$("#TextColor").val(appSettings.ImageText[iRow].Color);
	$("#TextSize").val(appSettings.ImageText[iRow].Size);
	$("#TextColor").selectmenu("refresh", true);
	$("#TextSize").selectmenu("refresh", true);
	TextDrawRows();
} 			

//Gegevens van bepaalde rij opslaan
function TextRowInfoSet() {
	appSettings.ImageText[(appSettings.ImageTextCurrentRow)].Text = $("#TextText").val();
	appSettings.ImageText[(appSettings.ImageTextCurrentRow)].Size = $("#TextSize").val();
	appSettings.ImageText[(appSettings.ImageTextCurrentRow)].Color = $("#TextColor").val();
	TextDrawRows();
} 

//Canvas vullen met regelinformatie
function TextDrawRows() {
	var iHoogte = 0;
	var c=document.getElementById("cvText");
	var ctx=c.getContext("2d");
	//leegmaken 				
	ctx.clearRect(0, 0, c.width, c.height);
	//achtergrond zwart maken (anders wordt dit niet meegenomen op sommige tablets)
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, c.width, c.height);
	var center = ($("#cvText").width() / 2);  //Via jquery oproepen, omdat via javascript verkeerde waarde oplevert.
	//altijd centreren
	ctx.textAlign = 'center';								
	//debugger
	for (i = 0; i < appSettings.ImageText.length; i++) { 
		iHoogte = iHoogte + parseInt(appSettings.ImageText[i].Size, 0);
		//Instellen formaat en kleur
		ctx.font= appSettings.ImageText[i].Size + "px Arial";
		ctx.fillStyle = appSettings.ImageText[i].Color;
		//tekst plaatsen
		ctx.fillText(appSettings.ImageText[i].Text,center ,iHoogte);
	}
} 
	
//Volgende regel ophalen
function TextRowNext() {
	//Kijken of er een regel is anders deze aanmaken (op basis van de vorige)
	appSettings.ImageTextCurrentRow = appSettings.ImageTextCurrentRow + 1;				
	if (appSettings.ImageTextCurrentRow == appSettings.ImageText.length) {
		//We moeten een nieuwe dia aanmaken
		var oRow = JSON.parse(JSON.stringify(oDefaultRow))
		//kopie van object aangemaakt. Gegevens van vorige regel overnemen. (behalve text)
		oRow.Size = appSettings.ImageText[(appSettings.ImageTextCurrentRow-1)].Size;
		oRow.Color = appSettings.ImageText[(appSettings.ImageTextCurrentRow-1)].Color;
		appSettings.ImageText.push(oRow);
	} 
	//Gegevens ophalen				
	TextRowInfoGet(appSettings.ImageTextCurrentRow);
	window.localStorage.appSettings = JSON.stringify(appSettings); //oplsaan van de instellingen
} 

//Vorige regel ophalen
function TextRowPrevious() {
	//Alleen naar vorige gaan indien we nog niet op de eerste zitten.
	if (appSettings.ImageTextCurrentRow > 0) {
		appSettings.ImageTextCurrentRow = appSettings.ImageTextCurrentRow - 1;
		TextRowInfoGet(appSettings.ImageTextCurrentRow);
		window.localStorage.appSettings = JSON.stringify(appSettings); //opslaan van de instellingen
	} 
} 

//Daadwerkelijke tekst opslaan in library
function TextSaveToLocalLibrary() {
	var canvas=document.getElementById("cvText");
	//Nieuwe entry voor library maken en vullen
	var jsonImage = { "filename": "", "base64" : ""} 
	jsonImage.filename = "textimage.jpg"
	jsonImage.base64 = canvas.toDataURL('image/jpeg');				//Base64 string opvragen.
	//toevoegen aan library
	appSettings.Library.push(jsonImage);		
	window.localStorage.appSettings = JSON.stringify(appSettings);  //opslaan van de instellingen
	GetLibrary();												//verversen van library
} 

//Complete canvas wissen
function TextClear() {
	appSettings.ImageText = []; 									//Reset array
	var oRow = JSON.parse(JSON.stringify(oDefaultRow));				//Lege regel aanmaken	
	appSettings.ImageText.push(oRow);								//Aan array toevoegen
	appSettings.ImageTextCurrentRow = 0;							//Eerste regel selecteren		
	TextRowInfoGet(appSettings.ImageTextCurrentRow);
	window.localStorage.appSettings = JSON.stringify(appSettings);	//opslaan van de instellingen		
} 

//verwijderd huidige rij
function TextClearRow() {	
	//er moet minimaal 1 rij aanwezig blijven
	if (appSettings.ImageText.length > 1) {		
		appSettings.ImageText.splice(appSettings.ImageTextCurrentRow,1);
		if (appSettings.ImageTextCurrentRow > 0) {
			appSettings.ImageTextCurrentRow = appSettings.ImageTextCurrentRow - 1
		} else {
			appSettings.ImageTextCurrentRow = 0;
		} 
		TextRowInfoGet(appSettings.ImageTextCurrentRow);
		window.localStorage.appSettings = JSON.stringify(appSettings);	//opslaan van de instellingen				
	} else {
		//laatste regel weghalen = TextClear
		TextClear();
	} 		
}