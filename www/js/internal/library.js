//Layout
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
$("#MenuLocalDelete").html(jLang.Delete);	
$("#MenuLocalCancel").html(jLang.Refresh);
$("#ButtonRefresh").html(jLang.Refresh);


//=================================================================================
var sClickedImageID = "";
var sUser = "";
	
GetLibrary();					//Lokale library inlezen	
GetLibraryPortal();				//portal library ophalen

//=================================================================================

//Functie die de library vanaf het netwerk haalt
function GetLibraryPortal() {	
	//Leegmaken bibliotheek
	$("#LibraryContainerOnline").html("");
	
	var url = URLPortal + "app/LibraryRead.json.asp"
	var sResult = "";
	//alert(url);
	$.ajax(
		{
			//dataType: "json",
			url: url,
			encoding: "UTF-8",
			data: {"username" : appSettings.PortalUser, "password" : appSettings.PortalPass},
			async: false,
			timeout: 2000,
			cache: false
		})
		.done(function( data ) {
			sResult = "";
			sUser = data.user;	
			if (sUser.substring(0,4) != "Unkn"){
				if (data.files.length == 0) {
					sResult = "<br>" + jLang.LibraryNoItems + "<br><br>"
				} else {
					for (var i=0;i<data.files.length;i++)
					{ 
						sResult = sResult + "<img src='" + URLPortal + "library/" + data.user + "/" + data.files[i].file + "' onClick='PortalImageClick(this);'  id='img" + i + "'>&nbsp;&nbsp;"
					}
				}
				$("#LibraryContainerOnline").html(sResult);
			} else {
				$("#LibraryContainerOnline").html("<br>" + jLang.LibraryWrongCredentials + "<br><br>");
			} 
		})		
		.fail(function( jqXHR, textStatus ) {
			if (IsDebug == true) { 
				$("#LibraryContainerOnline").html("FAILURE (GetLibraryPortal)<br/>Status : " + jqXHR.status + "<br/>Message : " + jqXHR.responseText);
			} else {
				$("#LibraryContainerOnline").html("<br>" + jLang.LibraryNoInternet + "<br><br>");
			} 				
		}		
	);			
} 	

//Toont Internet Bibliotheek
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
	$('#popupMenuLocal').popup('close');
} 