//var pressed = false

$("#login-button").click(function(event){  
    //var that = this;
    // event.preventDefault();
    /*if (pressed = false) {
	event.preventDefault();
	pressed = true;
    }*/
    $('form').fadeOut(400);
    $('.wrapper').addClass('form-success');
    /*setTimeout(function() {
	document.getElementById("#login-button").click();
	console.log("success");
    }, 4000);
    pressed = false;*/
});
