var submitButton = document.getElementById("final_submit_button");
if (submitButton) {
	submitButton.addEventListener('click', referenceSubmit, false);
	submitButton.addEventListener('click', replaceForm, false);
}

function replaceForm() {
	document.getElementById("form_heading").innerHTML = "Thank you!";
	document.getElementById("primary_form_content").innerHTML =
		"<center><p>You're even closer to EV charging. An EverCharge expert will reach out soon.</p><p>Want to talk to someone now? <strong>Give us a call, 888.342.7383</strong>.</p></center>";
	document.getElementById("thankyouHeader").innerHTML = "";
}

// REFERENCE AUTOSUBMIT
function referenceSubmit()
{
	document.getElementById("reference_form").submit();
}



