/*
 * jDownload - A jQuery plugin to assist file downloads
 * Examples and documentation at: http://jdownloadplugin.com
 * Version: 1.4 (08/04/2011)
 * Copyright (c) 2010 Adam Chambers, Tim Myers
 * Licensed under the GNU General Public License v3: http://www.gnu.org/licenses/gpl.html
 * Requires: jQuery v1.4+ & jQueryUI 1.8+
*/

(function($) {

	$.fn.jDownload = function(settings){
		
		var config = {  
			root         : "/",
			filePath     : null,
			event        : "click", // default click event??
			dialogTitle  : "jDownload",
			dialogDesc   : 'Download the file now?',
			dialogWidth  : 400,
			dialogHeight : 'auto',
			dialogModal  : true,
			showfileInfo : true,
			start        : null,
			stop         : null,
			download     : null,
			cancel       : null
		}
				   	
	  	settings = $.extend(config, settings);
	  	
	  	var dialogID = "jDownloadDialog_"+$('.jDownloadDialog').length;
	  	var iframeID = "jDownloadFrame_"+$('.jDownloadFrame').length;
	  	
	  	// create html iframe and dialog
	  	var iframeHTML = '<iframe class="jDownloadFrame" src="" id="'+iframeID+'"></iframe>';	
	  	var dialogHTML = '<div class="jDownloadDialog" title="'+settings.dialogTitle+'" id="'+dialogID+'"></div>';
	  	
	  	// append both to document
	  	$('body').append(iframeHTML+dialogHTML);
	  	
	  	
	  	var iframe = $('#'+iframeID);
	  	var dialog = $('#'+dialogID);
	  	
	  	// set iframe styles
	  	iframe.css({
	  		"height"    : "0px",
	  		"width"     : "0px",
	  		"visibility"   : "hidden"
	  	});
	  	
	  	// set dialog options
	  	dialog.dialog({
	  		autoOpen : false,
	  		buttons	 : {
	  			"Cancel": function() { 
	  				if($.isFunction(settings.cancel)) {
	  					settings.cancel();
	  				}
	  				$(this).dialog('close');
	  			}, 
	  			
	  			"Download": function() {
	  				if($.isFunction(settings.download)) {
	  					settings.download();
	  				}
	  				start_download();
	  			}
	  		},
	  		width    : settings.dialogWidth,
	  		height   : settings.dialogHeight,
	  		modal    : settings.dialogModal,
	  		close    : ($.isFunction(settings.stop)) ? settings.stop : null
		});


		$(this).bind(settings.event, function(){
		
			if($.isFunction(settings.start)) {	
				settings.start();
			}
			
			var $this = $(this);
			
			
			dialog.html("");
		
			// if filePath is not specified then use the href attribute
			var filePath = (settings.filePath == null) ? $(this).attr('href') : settings.filePath;
			
			dialog.html('<p>Fetching File...</p><img src="'+settings.root+'jdownload/loader.gif" alt="Loading" />');
			
			$.ajax({
				type : 'GET',
				url  : settings.root+'jdownload/jdownload.php',
				data : 'action=download&path='+filePath,
				error : function(XMLHttpRequest, textStatus, errorThrown) {
					dialog.html("<p class=\"jDownloadError\">Fatal Error.</p>");
				},
				success : function(data) {
					setTimeout(function() {
						if(data == 'error') {
						
							dialog.html("<p class=\"jDownloadError\">File cannot be found.</p>");
							
						} else {
						
							if(settings.showfileInfo == true) {
								
								var url  = settings.root+'jdownload/jdownload.php';
								
								$.ajax({
									url : url,
									type : 'GET',
									dataType : 'json',
									data : 'action=info&path='+filePath,
									success : function(data) {
										
										// Check to see if file is not allowed
										if(data.error == 'denied'){
										
											// append new file info
											dialog.html('<p class=\"jDownloadError\">This file type is not allowed.</p>');
										
										}else{
											
											// parse JSON
											var html  = "<div class=\"jDownloadInfo\">";
											html += "<p><span>File Name:</span> "+data.filename+"</p>";
											html += "<p><span>File Type:</span> "+data.filetype+"</p>";
											html += "<p><span>File Size:</span> "+data.filesize+" KB</p>";
											html += "</div>";
										
											// remove any old file info & error messages
											$('.jDownloadInfo, .jDownloadError').remove();
										
											var desc = ($this.attr('title').length > 0) ? $this.attr('title') : 'Download the file now?';
										
											// append new file info
											dialog.html('<p>'+desc+'</p>'+html);
											
										}
									}
								});
							
							}
	
						}
					}, 200);
				}
		
			});
			
			// open dialog 
			dialog.data('jDownloadData', {filePath : filePath}).dialog('open');
					
			return false;
				
		});
		
		/* Iniate download when value Ok is iniated via the dialog */
		function start_download(i) {
			
			
			// change iframe src to fieDownload.php with filePath as query string?? 
			iframe.attr('src', settings.root+'jdownload/jdownload.php?action=download&path='+dialog.data('jDownloadData').filePath);
			
			// Close dialog
			dialog.dialog('close');
			
			return false;
		}
		
	}
	
})(jQuery);