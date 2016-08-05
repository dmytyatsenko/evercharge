$(document).ready(function() {
    function getAdwordsVariable(variable, field)
    {
           var nameValue = window.location.search.substring(1);
           if (nameValue != "" ) {
               var vars = nameValue.split("&");
               for (var i=0; i<vars.length; i++) {
                   var pair = vars[i].split("=");
                   if(pair[0] == variable){
                       $('#' + field).val(pair[1]);
                       return pair[1];
                   }
               }
           }
           return(false);
    }

    getAdwordsVariable('custom', 'adwordsField');
    getAdwordsVariable('gran', 'granularField')
});