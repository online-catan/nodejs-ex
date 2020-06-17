var socket = io.connect('http://localhost:3000');
socket.on('connect', function(data) {
    socket.emit('join', {msg: "Hello World from guest",
                        type: "guest"});
});
socket.on('receive_updated_page', (data) => {
    let body_html = data.body_html;
	document.getElementById("main_div").innerHTML = body_html;
})

$(document).click(function(event) {
    let id = event.target.id;
    sendElementId(id);
});

function sendElementId(id) {
	socket.emit("send_click_id", {click_id: id} )
}

function loadDoc() {
	console.log("Loading...")
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.querySelector("html").innerHTML = this.responseText;
    }
  };
  xhttp.open("GET", "index.html", true);
  xhttp.send();
}

var body = $("body");
function updatePage() {
	console.log("Loading...")
	$.ajax({
	  url: "",
	  type: "get", //send it through get method
	  data: { 
	    command: "update_page"
	  },
	  success: function(response) {
	    //Do Something
	    console.log("Response received")
	  },
	  error: function(xhr) {
	    //Do Something to handle error
	  }
	});

	// var xhttp = new XMLHttpRequest();
	// xhttp.onreadystatechange = function() {
	// 	if (this.readyState == 4 && this.status == 200) {
	// 		document.querySelector("html").innerHTML = this.responseText;
	// 	}
	// };
	// xhttp.open("GET", "index.html", true);
	// xhttp.send();
}


