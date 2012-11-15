var express = require('express'),
	app 	= express.createServer(),
	io 		= require('socket.io').listen(app),
	_ 		= require('underscore');

/*
 * Setup public directory for serving assets
 */
app.configure(function(){
	app.use(express.static(__dirname + '/public'));
});

/*
 * Main Stop Light server-side class. Keeps track of state.
 */
function StopLight(){
	var self = this;

	self.connections = [];

	self.new_connection = function(socket){
		self.socket = socket;
	};
}

var stoplight = new StopLight();

io.sockets.on('connection', function(socket){
	/*
	 * In this scope, the argument `socket` refers to the
	 * socket object of the newly connected user.
	 */



});

/*
 * Display home page with a prominent textfield for their username
 */
app.get('/', function(req, res){
});

app.listen(8082);

