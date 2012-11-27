/*

noTouchi - 2012 Jason Burgess
http://www.jasonburgess.com

License--------------------------------------------------

Conditionally licensed under MIT Licensing 
providing all code and design stays open source
and this header stays intact.

Description-----------------------------------------------

noTouchi is a jQuery plugin that allows you to protect areas in software
where you don't want customers making changes without technical support
assistance.

--requires 
	Bootstrap for UI
	jQuery
	The included php component

*/

(function($){
 	
 	var uuid = 0;

    $.fn.extend({
         
        noTouchi: function(options) {

			var self,
				json;

			var defaults = {
                "php_postTo" : "noTouchi.php"
            }
            
            var options =  $.extend(defaults, options);

            //test for valid JSON response... if none
            //then we have a valid session and this is just real data
            try{
            	json = $.parseJSON( options.response );

            	//test the response for our JSON
            	if ( json.noTouchi_error != "true" ) {
            		//real JSON data... 
            		//just return status -> everything is good
	            	//and don't create the dialog
	            	return true;
            	}

            } catch(e){

            	//real data... just tell the host everything is good
            	//and don't create the dialog
            	return true;
            }

			var interface = {

				center : function (ele) {
				    
				    var self = this;
				    var dialog = $(".js_dialog", ele);

				    dialog.css("position","absolute !important");
				    dialog.css("top", Math.max(0, (($(window).height() - dialog.outerHeight()) / 2)));
				    dialog.css("left", Math.max(0, (($(window).width() - dialog.outerWidth()) / 2)));
				    
				    return dialog;
				},
				create : function(ele, callback){

					//create the overlay
					var self = this,
						u = self.uniqid(),
						tech_code = u.substring(u.length - 4, u.length),
						overlay_id = 'js_overlay_' + u,
						overlay = '<div id="' + overlay_id + '" class="js_overlay"><div class="js_dialog"> <legend>&nbsp;&nbsp;Tech Support Code: <span id="js_code_' + u + '">' + tech_code + '</span> </legend> <p>This requires the assistance of a technical support person.</p><div class="form-horizontal"> <div class="control-group"> <label class="control-label" for="js_key_id"> Support Key: </label> <div class="controls"> <input id="js_key_' + u + '" class="input-large js_key_" placeholder="Support Staff Key" type="password"> </div> </div> <div class="control-group"> <div class="controls"> <button id="js_button_' + u + '" class="btn btn-primary js_button_"> Send Key </button> <button id="js_cancel_' + u + '" class="btn js_cancel_"> Cancel </button> </div> </div> </div> </div></div>';

					$(ele).append(overlay);

					$(".js_overlay", ele)
						.unbind("click")
						.bind("click", function(){
							self.destroy(ele);
						})
						.css({
							"position" : "fixed",
							"top" : "0",
							"left" : "0"
						})
						.width($(window).width())
						.height($(window).height());

					//make sure clicking in the dialog doesn't propagate to the overlay	
					$(".js_dialog", ele)
						.unbind("click")
						.bind("click", function(e){
							e.stopPropagation();
						})

					//if return key 
					$(".js_key_", ele)
						.unbind("keypress")
						.bind("keypress", function(e){
							if ( e.which == 13 ) {
						    	$(".js_button_", ele)	
						    		.trigger("click");
						   	}
						});

					//click for cancel button
					$(".js_cancel_", ele)
						.unbind("click")
						.bind("click", function(){
							self.destroy(ele);
						});

					//click for send key button
					$(".js_button_", ele)
						.unbind("click")
						.bind("click", function(){
							
							var supportKey  = $("#js_key_" + u).val(),
								supportCode = $("#js_code_" + u).text(),
								postData = {
						          	"supportKey" : supportKey,
						        	"supportCode" : supportCode
					        	};

					        $.ajax({
								type: "POST",
								url: options.php_postTo,
								data: postData,
								error: function(x, ts, err){
									alert(ts + " " + err);
								},
								timeout: function(){

								},
								success: function(msg){

									//test for valid JSON response... if none
						            //then we have a valid session and this is just real data
						            try{

						            	json = $.parseJSON( msg );

						            	//ok... we got JSON back... is it our JSON?
										if ( json.noTouchi_error == "true" ) {
											
											//display the response
											alert(json.response);

											//place focus on the input box
											$("#js_key_" + u).focus().select();
											return false;
										}

						            } catch(e){

						            	//real data... just tell the host everything is good
						            	//and destroy the dialog
						            }

						            alert("Support session started.");
									self.destroy(ele);
								}
					        });
						});
					
					//center the dialog
					self.center(ele);

					//set the window resize for this instance
					$(window).bind("resize.noTouchi", function(){
						
						$("#" + overlay_id)
							.width($(window).width())
							.height($(window).height());

						self.center(ele);
					});

					$("#js_key_" + u).focus();

					callback(u);
				},
				destroy : function(ele, callback){

					$(".js_overlay", ele).remove();
					$(".js_cancel_", ele).unbind("click")
					$(".js_button_", ele).unbind("click")
					$(window).unbind("resize.noTouchi");
				},
				uniqid : function(){

					var d = (new Date()).getTime();
					d = d.toString();

					//return the last 6 numbers of the string
					return d.substring(d.length - 6, d.length);
				}
			}

            return this.each(function() {
             
                var ele = $(this),
                	opt = options;

               	interface.create(ele, function(u){
               		return false;
               	});
            });
        }
    });
      
})(jQuery);