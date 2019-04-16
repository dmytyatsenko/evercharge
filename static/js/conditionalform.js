var submitButton = document.getElementById("final_submit_button");
if (submitButton) {
	submitButton.addEventListener('click', referenceSubmit, false);
	submitButton.addEventListener('click', notesSubmit, false);
	submitButton.addEventListener('click', replaceForm, false);
}

function replaceForm() {
	document.getElementById("form_heading").innerHTML = "Thank you!";
	document.getElementById("primary_form_content").innerHTML =
		"<center><p>You're even closer to EV charging. An EverCharge expert will reach out soon.</p><p>Want to talk to someone now? <strong>Give us a call, 888.342.7383</strong>.</p></center>";
	document.getElementById("thankyouHeader").innerHTML = "";
}

// REFERENCE AUTOSUBMIT
var teslaOptions = document.getElementById('reference_listener');
if (teslaOptions) {
	teslaOptions.addEventListener('click', autoDealerCheck, false);
	teslaOptions.addEventListener('click', referenceSubmit, false);
}


function autoDealerCheck()
{
	if (document.getElementById('auto_dealer_reference').checked){ $('#auto_dealer_contact_div').fadeIn('fast'); }
	else {document.getElementById('auto_dealer_contact_div').style.display = 'none';}
}

function referenceSubmit()
{
	document.getElementById("reference_form").submit();
}

function autoDealerContactSubmit() {
	document.getElementById("auto_dealer_contact_form").submit();}

function notesSubmit() {
	var notes = $('#notes_text');
	var url = notes.data('link');
	var form_data = {
		'lead_id': $('#lead_id').val(),
		'notes': notes.val()
	};

	$.ajax({
		type: "POST",
		url: url,
		data: form_data,
		success: function (data) {}
	});
}
