
document.getElementById("insurance_title").addEventListener("mouseover", mouseOver('insurance_info'));
document.getElementById("insurance_title").addEventListener("mouseout", mouseOut('insurance_info'));


function mouseOver(info) {
	document.getElementById(info).style.color = "red";
}

function mouseOut(info) {
	document.getElementById(info).style.color = "black";
}

