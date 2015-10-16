function getAdwordsVariable(variable)
{
       var nameValue = window.location.hash.split('?')[1];
       if (nameValue != null ) {
	       var vars = nameValue.split("?");
	       for (var i=0;i<vars.length;i++) {
	               var pair = vars[i].split("=");
	               if(pair[0] == variable){
	               	$adwordsField.val(pair[1])
	               	return pair[1];
	               }
       	}
       }
       return(false);
}
