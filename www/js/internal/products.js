//Layout
//Knoppen
$("#btnBack").show();	
$("#btnHome").show();

//Vertaling instellen.	
//$("#LibraryTitle").html(jLang.LibraryTitle);
	
//Declaratie pagina variablen

//Initiële functies uitvoeren.
GetProuctsPortal()
	
	

//=================================================================================

//Functie die de library vanaf het netwerk haalt
function GetProuctsPortal() {	
	//Leegmaken bibliotheek
	$("#ProductData").html("");	
	
	//voordat we online varianten ophalen eerst directe communicatie toevoegen aan lijst
	$('ul').append('<li><a href="#" onClick="SetProduct(PHPDirectIP, PHPDirectUser, PHPDirectPass, \'DirectConnect\');"><h2>!Direct connect</h2><p><img src="img/online.png" title="online">!Choose this option for direct connect</p></a></li>');
	
	//SetProduct(PHPDirectIP, PHPDirectUser, PHPDirectPass, 'DirectConnect');
	
	var url = URLPortal + "app/ProductsRead.json.asp"
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
			if (sUser.substring(0,6) != "Unknown"){
				if (data.products.length == 0) {
					$("#ProductData").html("<br>" + jLang.LibraryNoItems + "--aanpassen<br><br>");
				} else {
					for (var i=0;i<data.products.length;i++){ 
						var sStatus = 'online';
						if (data.products[i].Online = "False") {
							sStatus = 'offline';
						} 
						//alert(data.products[i].Online);
						$('ul').append('<li><a href="#" onClick="SetProduct(\'' + data.products[i].IP + '\', \'' + data.products[i].PHPUser + '\', \'' + data.products[i].PHPPass + '\', \'' + data.products[i].Name + '\')"><h2>'+ data.products[i].Name + '</h2><p><img src="img/' + sStatus + '.png" title="online"> ' + data.products[i].IP + ' (' + data.products[i].ID + ')</p></a></li>');
					}
				}				
			} else {
				$("#ProductData").html("<br>" + jLang.LibraryWrongCredentials + "<br><br>");
			} 
		})		
		.fail(function( jqXHR, textStatus ) {
			if (IsDebug == true) { 
				$("#ProductData").html("FAILURE (GetLibraryPortal)<br/>Status : " + jqXHR.status + "<br/>Message : " + jqXHR.responseText);
			} else {
				$("#ProductData").html("<br>" + jLang.LibraryNoInternet + "<br><br>");
			} 				
		}		
	);			
} 	
