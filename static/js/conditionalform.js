var submitButton = document.getElementById("final_submit_button");
submitButton.addEventListener('click', replaceForm, false);

function replaceForm() {
	document.getElementById("form_heading").innerHTML = "Thank you!";
	document.getElementById("primary_form_content").innerHTML =
		"<center><p>The additional information you provided will help us expedite your quote.</p><p>You're even closer to EV charging. An EverCharge expert will reach out soon.</p><p>Want to talk to someone now? <strong>Give us a call, 888.342.7383</strong>.</p></center>";
	document.getElementById("thankyouHeader").innerHTML = "";
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

function autoDealerContactSubmit() {
	document.getElementById("auto_dealer_contact_form").submit();}

function notesSubmit() {document.getElementById("notes_form").submit();}