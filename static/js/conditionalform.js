var submitButton = document.getElementById("final_submit_button");
submitButton.addEventListener('click', replaceForm, false);

function replaceForm()
{
	document.getElementById("form_heading").innerHTML = "Thank you!";
	document.getElementById("primary_form_content").innerHTML =
		"<center><p>The additional information you provided will help us expedite your quote.</p><p>You're even closer to EV charging. An EverCharge expert will reach out soon.</p><p>Want to talk to someone now? <strong>Give us a call, 888.342.7383</strong>.</p></center>";
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
}

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
}

// REFERENCE AUTOSUBMIT
var teslaOptions = document.getElementById('reference_listener');
teslaOptions.addEventListener('click', autoDealerCheck, false);
teslaOptions.addEventListener('click', referenceSubmit, false);

function autoDealerCheck()
{
	if (document.getElementById('auto_dealer_reference').checked){ $('#auto_dealer_contact_div').fadeIn('fast'); }
	else {document.getElementById('auto_dealer_contact_div').style.display = 'none';}
}

function referenceSubmit()
{
	var referenceRadios = document.getElementsByName("reference");
	for (var i = 0, len = referenceRadios.length; i < len; i++)
	{
		if (referenceRadios[i].checked) {document.getElementById("reference_form").submit();}
	}
}

function autoDealerContactSubmit()
	{
		document.getElementById("auto_dealer_contact_form").submit();
	}
