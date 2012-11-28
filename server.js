var express = require('express'),
	app 	= express(),
	http	= require('http'),
	server  = http.createServer(app),
	jade	= require('jade'),
	io 		= require('socket.io').listen(server),
	_ 		= require('underscore'),
	request = require('request');

server.listen(8082);

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
	 	socket.emit();
		 stoplight.new_connection(socket, data.name);
		 // stoplight.emit_status(data.name);
	 });

	 socket.on('search', function(query, fn){
	 	if(!query){
	 		fn("Please use a valid query");
	 		return;
	 	}
	 	request('http://api.flickr.com/services/rest/?method=flickr.photos.search&text='+query+'&content_type=1&safe_search=1&sort=interestingness-desc&page=1&per_page=10&api_key=f43295fec77dfdee5f6cadd0555c0888&format=json&nojsoncallback=1',
	 		function(error, response, body){
	 			if(error){
	 				fn(error);
	 				return;
	 			}

	 			var data = JSON.parse(body);
	 			// console.log(data.query.results);
	 			if(data.photos.photo)
		 			fn(error, _.map(data.photos.photo, function(result){
		 				return "http://farm"+result.farm+".staticflickr.com/"+result.server+"/"+result.id+"_"+result.secret+"_q.jpg";
		 			}));
		 		else
		 			fn("results is blank");
	 		});
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
	console.log(req.params);
	stoplight.set_status(req.params);
	res.end('recieved');
});

