$(document).ready(function(){

  //set defaults
  $(".info-price").html('$0');
    new Dragdealer('pr-slider', {
    animationCallback: function(x, y) {
      var slider_value = ((Math.round(x * 100)));
      //$("#pr-slider .value").text(slider_value);
      var stripe_width = slider_value+1;
      $(".stripe").css("width", ""+stripe_width+"%");

      if(slider_value < 1){
        //set 0
       $(".info-price").html('$0');
      } else if(slider_value > 1 && slider_value < 12){
        //set 0-25
       $(".info-price").html('$1200');
      } else if(slider_value > 13 && slider_value < 24){
        //set 0-50
        $(".info-price").html('$1600');
      } else if(slider_value > 25 && slider_value < 36) {
        //set 50-100
        $(".info-price").html('$2400');
      } else if(slider_value > 37 && slider_value < 48){
        //set 100-150
        $(".info-price").html('$3200');
      } else if(slider_value > 49 && slider_value < 60){
        //set 150-200
        $(".info-price").html('$4000');
      } else if(slider_value > 61 && slider_value < 72){
        //set 200-250
        $(".info-price").html('$4800');
      } else if(slider_value > 73 && slider_value < 84){
        //set 250-300
        $(".info-price").html('$5600');
      } else if(slider_value > 85){
        //set 300-350
        $(".info-price").html('$6400');
      }
    }
    });
});