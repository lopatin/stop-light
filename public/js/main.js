$(function(){
	var socket = io.connect("http://localhost/");

	socket.on('status-update', function(update){
		// alert('hi');
		alert(update);
		render_update(update);
	});

	socket.emit('hello', {name: name});



	var name = window.location.href.match(/\b\/(.+)\/?\b/)[1];

	var statuses = ['available', 'offline', 'away', 'on-call'];

	// alert(name);
	function render_update(update){
		$(".status").html(update.status);
		$('.away-message').html(update.away_message);
	}

	function set_bg(url){
		$(".container").css({
			"background-image": "url('"+url+"')"
		});
	}

	function clearClasses(){
		for(var i = 0; i < statuses.length; i++){
			$(".status").removeClass(statuses[i]);
		}
	}

	/*
	 * Bind click event for collapsing / expanding
	 */
	$("#bgChooser .handle").click(function(e){
		toggle_toolbar();
		e.preventDefault();
	});

	function toggle_toolbar(){
		$("#bgChooser").toggleClass('collapsed');
		$("#bgChooser").toggleClass('expanded');
	}

	/*
	 * In order to hint to the user that there is an expandable
	 * toolbar at the bottom, show it on load and collapse half
	 * a second later
	 */
	// setTimeout(function(){
	// 	toggle_toolbar();
	// }, 1000);
});