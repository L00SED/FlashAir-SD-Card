// JavaScript Document

// Judge the card is V1 or V2.
function isV1(wlansd) {
	if ( wlansd.length == undefined || wlansd.length == 0 ) {
		// List is empty so the card version is not detectable. Assumes as V2.
		return false;
	} else if ( wlansd[0].length != undefined ) {
		// Each row in the list is array. V1.
		return true;
	} else {
		// Otherwise V2.
		return false;
	}
}
// Convert data format from V1 to V2.
function convertFileList() {
	for (var i = 0; i < wlansd.length; i++) {
		var elements = wlansd[i].split(",");
		wlansd[i] = new Array();
		wlansd[i]["r_uri"] = elements[0];
		wlansd[i]["fname"] = elements[1];
		wlansd[i]["fsize"] = Number(elements[2]);
		wlansd[i]["attr"]  = Number(elements[3]);
		wlansd[i]["fdate"] = Number(elements[4]);
		wlansd[i]["ftime"] = Number(elements[5]);
	}
}
// Callback Function for sort()
function cmptime(a, b) {
    if( a["fdate"] == b["fdate"] ) {
        return a["ftime"] - b["ftime"];
    }else{
        return a["fdate"] - b["fdate"];
    }
}

// Show file list
function showFileList(path) {
	// Clear box.
	$("#list").html('');
    // Output a link to the parent directory if it is not the root directory.
    if( path != "/" ) {
        $("#list").append(
            $("<div></div>").append(
                $('<a href="javascript:void(0)" class="dir">..</a>')
            )
        );
    }
    $.each(wlansd, function() {
		var file = this;
		// Skip hidden file.
		if ( file["attr"] & 0x02 ) {
			return;
		}
		// Make a link to directories and files.
		var filelink = $('<a href="javascript:void(0)"></a>');
		var caption = file["fname"];
		var fileobj = $("<div></div>");
        var deletelink = $('<a href="javascript:void(0)"></a>');
        var deletebutton = ' X';
        if ( file["attr"] & 0x10 ) {
            filelink.addClass("dir");
        } else {
            filelink.addClass("file").attr('href', file["r_uri"] + '/' + file["fname"]).attr("target","_blank");
            deletelink.addClass("remove").attr('href', "http://flashair/upload.cgi?DEL=" + file["r_uri"] + '/' + file["fname"]).attr("target","_blank");
        }
		// Append a file entry or directory to the end of the list.
        $("#list").append(fileobj.append(filelink.append(caption)).append(deletelink.append(deletebutton)));
    });     
}
// Making Path
function makePath(dir) {
	var arrPath = currentPath.split('/');
	if ( currentPath == "/" ) {
		arrPath.pop();
	}
    if ( dir == ".." ) {
		// Go to parent directory. Remove last fragment.
        arrPath.pop();
    } else if ( dir != "" && dir != "." ) {
		// Go to child directory. Append dir to the current path.
		arrPath.push(dir);
    }
	if ( arrPath.length == 1 ) {
		arrPath.push("");
	}
    return arrPath.join("/");
}
// Get file list
function getFileList(dir) {
	// Make a path to show next.
	var nextPath = makePath(dir);
	// Make URL for CGI. (DIR must not end with '/' except if it is the root.)
    var url = "/command.cgi?op=100&DIR=" + nextPath;
	// Issue CGI command.
    $.get(url, function(data) {
       // Save the current path.
        currentPath = nextPath;
        // Split lines by new line characters.
        wlansd = data.split(/\n/g);
        // Ignore the first line (title) and last line (blank).
        wlansd.shift();
        wlansd.pop();
		// Convert to V2 format.
		convertFileList(wlansd);
		// Sort by date and time.
        wlansd.sort(cmptime);
		
		// Show
		showFileList(currentPath);
	});
}

//Upload with active progress bar.
$(function() {

    var bar = $('.bar');
    var percent = $('.percent');
    var status = $('#status');

    $('form').ajaxForm({
        beforeSend: function() {
            status.empty();
            var percentVal = '0%';
            bar.width(percentVal);
            percent.html(percentVal);
        },
        uploadProgress: function(event, position, total, percentComplete) {
            var percentVal = percentComplete + '%';
            bar.width(percentComplete * 2.65);
            percent.html(percentVal);
        },
        complete: function(xhr, html, percentVal) {
            status.html(xhr.responseText);
			if (html.indexOf('SUCCESS')) {
				alert("success");
				getFileList(".");
			}else{
				alert("error");
				getFileList(".");
			}
        }
    });
});

// Document Ready
$(function() {
	// Iniialize global variables.
    currentPath = location.pathname;
	wlansd = new Array();
	
	// Show the root directory.
    getFileList('');
	
	// Register onClick handler for <a class="dir">
    $(document).on("click","a.dir",function() {
        getFileList(this.text);
    });
	
    // Reload the page when a file is deleted
    $(document).on("click","a.remove", function() {
        location.reload();
    });
    
	// File selection.
	$(document).on('change', ':file', function() {
	  var input = $(this),
		  numFiles = input.get(0).files ? input.get(0).files.length : 1,
		  label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
	  input.trigger('fileselect', [numFiles, label]);
	});
	
	// File selection.
	$(document).ready( function() {
		$(':file').on('fileselect', function(event, numFiles, label) {
  
			var input = $(this).parents('.input-group').find(':text'),
				log = numFiles > 1 ? numFiles + ' files selected' : label;
  
			if( input.length ) {
				input.val(log);
			} else {
				if( log ) console.log(log);
			}
		});
	});
	
	$(function Capacity() {
	var url = "/command.cgi?op=140";
	var capacitystring='None';
	$.get(url, function(capa) {
          Tcapacitystring = capa.split("/");
		  snotused = Tcapacitystring[0];
		  Tcapacitystring2 = Tcapacitystring[1].split(",");
		  nbtotal = Tcapacitystring2[0];
		  bpersec = Tcapacitystring2[1];
		  totalfree = Number(snotused) * Number(bpersec);
		  totalcard = Number(nbtotal) * Number(bpersec);
		  percentused = Number(((totalcard-totalfree)/totalcard)*100).toFixed(2);
		  unitfree='Oct';
		  unitTotal='Oct';
		  if (totalfree>1024){
			totalfree =  Number(totalfree / 1024).toFixed(2);
            console.log(totalfree);
			unitfree='Kb';
			}
		  if (totalfree>1024){
			totalfree =  Number(totalfree / 1024).toFixed(2);
            console.log(totalfree);
			unitfree='Mb';
			}
		  if (totalfree>1024){
			totalfree =  Number(totalfree / 1024).toFixed(2);
            console.log(totalfree);
			unitfree='Gb';
			}
		  if (totalcard>1024){
			totalcard =  Number(totalcard / 1024).toFixed(2);
			unitTotal='Kb';
			}
		  if (totalcard>1024){
			totalcard =  Number(totalcard / 1024).toFixed(2);
			unitTotal='Mb';
			}
		  if (totalcard>1024){
			totalcard =  Number(totalcard / 1024).toFixed(2);
			unitTotal='Gb';
			}
		$("#Capacity").html('Free : '+ totalfree + unitfree + "/" + totalcard + unitTotal + ", Used : "+ percentused + "%");
	});
	//capacitystring = sresult;
	
	return false;
	});

	//Callback Function for Polling
	function polling(){
    var url="/command.cgi?op=102";
    $.get(url,function(data){
        if($.trim(data)=="1"){
            location.reload(true);
        }
    });
	
	//Refresh timer.
	if ( isV1(wlansd) ) {
		convertFileList(wlansd);
    }
	wlansd.sort(cmptime);
	showFileList(location.pathname);
	setInterval(polling, 500);
	};
});