$(function(){
	var socket = io.connect("http://localhost:8082");
	var name = window.location.href.match(/\b\/(.+)\/?\b/)[1];

	alert(name);

	socket.on('status-update', function(update){

	});

	socket.emit('hello');

	function render_update(update){

	}
});