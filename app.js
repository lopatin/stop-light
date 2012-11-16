var express = require('express'),
	app 	= express(),
	jade	= require('jade'),
	io 		= require('socket.io').listen(app),
	_ 		= require('underscore');

/*
 * Setup public directory for serving assets
 */
app.configure(function(){
	app.use(express.static(__dirname + '/public'));
	app.set('views', __dirname + '/views')
	app.set('view engine', 'jade')
});

/*
 * Main Stop Light server-side class. Keeps track of state.
 */
function StopLight(){
	var self = this;

	self.user_statuses = {};
	self.connections = {};

	self.new_connection = function(socket, name){
		self.connections[name] = {socket: socket};
	};

	self.get_connection = function(name){
		return self.connections[name];
	}

	self.get_status = function(name){
		return self.user_statuses[name];
	};

	self.set_status = function(params){
		self.user_statuses[params.name] = params;
		self.emit_status(params.name);
	};

	self.emit_status = function(name){
		var connection = self.connections[name];
		if(connection){
			connection.socket.emit('status-update', self.user_statuses[name]);
		}
	};
}

var stoplight = new StopLight();

io.sockets.on('connection', function(socket){
	/*
	 * In this scope, the argument `socket` refers to the
	 * socket object of the newly connected user.
	 */

	 socket.on('hello', function(data){
		 stoplight.new_connection(socket, data.name);
		 stoplight.emit_status(name);
	 });

});


app.get('/', function(req, res){
	res.render('index', {
		title: "Welcome to Stop Light"
	});
});

app.get('/:name', function(req, res){
	var name = req.params.name;
	res.render('display', {
		title: name+"'s Current Status",
		username: name,
		status: req.params.status,
		away_message: req.params.away_message
	});
});

app.get('/set_status/:name/:status/:away_message', function(req, res){
	stoplight.set_status(req.params);
});

app.listen(8082);
