// //AJAX CALL FINAL SUBMIT BUTTON

// // VARIABLES
// var submitButton		= document.getElementById("final_submit_button");

// var parkingOptions 		= document.getElementById('parking_listener');
// var teslaOptions 		= document.getElementById('tesla_listener');
// var deliveryOptions 	= document.getElementById('delivery_listener');

// var ownerListener 		= document.getElementById('delivery_listener');
// var customerListener	= document.getElementById('customer_listener');
// var numberSpotsListener = document.getElementById('number_spots_listener');


// // REFACTORING

// function radioSubmit(radios, formId) {
// 	var radioList = document.getElementById(radios);
// 	for (var i = 0; i < radioList.length; i++) {
// 		if (radioList[i].checked) {
// 			document.getElementById(formId).submit()
// 		}
// 	}
// };

// parkingOptions.addEventListener('click', radioSubmit('parking_type', 'parking_spot_form'), false);


var submitButton		= document.getElementById("final_submit_button");
submitButton.addEventListener('click', replaceForm, false);

function replaceForm()
	{
		document.getElementById("form_heading").innerHTML = "Thank you!";
		document.getElementById("primary_form_content").innerHTML =
			"<p style='text-align:center; font-size: 1.25em;'>The additional information you provided will help us expedite your quote.</p><p style='text-align:center; font-size: 1.25em;'>You're even closer to EV charging. An EverCharge expert will reach out soon. <br><br><span style='font-size:1.25em'>Want to talk to someone now? <strong>Give us a call, 888.342.7383</strong></span>.";
		document.getElementById("thankyouHeader").innerHTML = "";

	}
	






	// TYPE OF SPOTS
var parkingOptions = document.getElementById('parking_listener');
parkingOptions.addEventListener('click', parkingSubmit, false);

function parkingSubmit()
{
	var parkingRadios = document.getElementsByName("parking_type");
	for (var i = 0, len = parkingRadios.length; i < len; i++)
	{
		if (parkingRadios[i].checked)
		{
			document.getElementById("parking_spot_form").submit();
		}
	}
};
// NUMBER OF SPOTS AUTOSUBMIT
var numberSpotsListener = document.getElementById('number_spots_listener');
numberSpotsListener.addEventListener('click', numberSpotsSubmit, false);

function numberSpotsSubmit()
{
	var spotsRadios = document.getElementsByName("number_of_spots");
	for (var i = 0, len = spotsRadios.length; i < len; i++)
	{
		if (spotsRadios[i].checked)
		{
			document.getElementById("number_spots_form").submit();
		}
	}
};
// REFERENCE AUTOSUBMIT
var teslaOptions = document.getElementById('tesla_listener');
teslaOptions.addEventListener('click', teslaCheck, false);
teslaOptions.addEventListener('click', referenceSubmit, false);

function teslaCheck()
{
	if (document.getElementById('auto_dealer_reference').checked){ $('#tesla_div').fadeIn('fast'); }
	else {document.getElementById('tesla_div').style.display = 'none';}
};

function referenceSubmit()
{
	var referenceRadios = document.getElementsByName("reference");
	for (var i = 0, len = referenceRadios.length; i < len; i++)
	{
		if (referenceRadios[i].checked)
		{
			document.getElementById("reference_form").submit();
		}
	}
};

function teslaContactSubmit()
	{
		document.getElementById("tesla_contact_form").submit();
		var teslaContact = document.getElementById("tesla_contact");
	}
	// PARKING SPOT NUMBER
parkingOptions.addEventListener('click', parkingCheck, false);

function parkingCheck()
{
	if (document.getElementById('assignedparking').checked)
	{
		document.getElementById('parking_spot_div').style.display = 'block';
	}
	else document.getElementById('parking_spot_div').style.display = 'none';
};

function parkingSpotNumberSubmit()
{
	document.getElementById("spot_number_form").submit();
	var spotNumber = document.getElementById("parking_spot_number_input");
};

// DELIVERY DATE
//var deliveryOptions = document.getElementById('delivery_listener');
//deliveryOptions.addEventListener('click', deliveryCheck);

//function deliveryCheck()
//{
//	if (document.getElementById('knowdelivery').checked)
//	{
//		document.getElementById('delivery_date_div').style.display = 'block';
//	}
//	else document.getElementById('delivery_date_div').style.display = 'none';
//};

function deliveryDateSubmit()
{
	document.getElementById("delivery_date_form").submit();
};

function dailyCommuteSubmit()
	{
		document.getElementById("commute_form").submit();
		var commuteTime = document.getElementById("commute_input");
	}
	// DO YOU HAVE AN EV?
//var ownerListener = document.getElementById('delivery_listener');
//ownerListener.addEventListener('click', evOwnerSubmit, false);

//function evOwnerSubmit()
//{
//	var ownerRadios = document.getElementsByName("ev_status");
//	for (var i = 0, len = ownerRadios.length; i < len; i++)
//	{
//		if (ownerRadios[i].checked)
//		{
//			document.getElementById("ev_owner_form").submit();
//		}
//	}
//};

// BUILDING EXISTING CUSTOMER AUTOSUBMIT
//var customerListener = document.getElementById('customer_listener');
//customerListener.addEventListener('click', customerSubmit, false);

//function customerSubmit()
//{
//	var customerRadios = document.getElementsByName("building_customer");
//	for (var i = 0, len = customerRadios.length; i < len; i++)
//	{
//		if (customerRadios[i].checked)
//		{
//			document.getElementById("existing_customer_form").submit();
//			console.log("submitted building customer info!");
//		}
//	}
//};

// PHONE NUMBER
function phoneSubmit()
	{
		document.getElementById("phone_number_form").submit();
	}

// ADDRESS
function addressSumbit() {
	document.getElementById('address_form').submit();
}