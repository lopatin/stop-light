$(function(){
	var socket = io.connect("http://"+window.location.hostname),
		search_textfield = $("input.search"),
		clear_button = $(".button.clear-search"),
		last_query = "",
		selected_url = "",
		name = window.location.href.match(/\/([a-zA-Z1-9]+)\/?$/)[1];;


	socket.on('status-update', function(update){
		render_update(update);
	});

	socket.emit('hello', {name: name});

	var default_backgrounds = [
		"http://farm8.staticflickr.com/7051/6928218837_1faf5c17d8_q.jpg",
		"http://farm8.staticflickr.com/7064/6967657209_38c2aedae9_q.jpg",
		"http://farm8.staticflickr.com/7098/7306132044_41cdeaab0c_q.jpg",
		"http://farm7.staticflickr.com/6153/6176105332_5a12334d92_q.jpg",
		"http://farm5.staticflickr.com/4038/4325168951_31efefefb4_q.jpg",
		"/images/frog.png",
		"http://farm6.staticflickr.com/5244/5322949313_9bfe95dfb9_q.jpg",
		"http://farm9.staticflickr.com/8434/7786420744_8a1f692248_q.jpg",
		"http://farm6.staticflickr.com/5346/7093064477_379d1c3fd6_q.jpg",
		"http://farm9.staticflickr.com/8322/8032195208_a366cf6a63_q.jpg"
	];



	var name = window.location.href.match(/\b\/(.+)\/?\b/)[1];

	var statuses = ['available', 'offline', 'away', 'on-call'];

	function render_update(update){
		$(".container > div").removeClass("offline available on-call away");
		$(".container > div").addClass(update.status);

		if(!update.message)
			$(".modal-box.message").fadeOut(200);
		else{
			$(".modal-box.message").fadeIn(200);
			$(".modal-box.message").html(update.message);
		}
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
	add_photos(default_backgrounds, function(){
		show_photos();
		setTimeout(toggle_toolbar, 1200);
	});


	$(document).bind('typingstopped', function(e){
		if(search_textfield.is(":focus"))
			new_input(get_query());
	});
	$("input.search").bind('keyup', function(e){
		if(e.keyCode === 13)
			new_input(get_query());
		if(!get_query())
			new_input("");
		if(e.keyCode === 27){
			clear_search();
			search_textfield.blur();
		}
	});
	$("input.search").click(function(){
		$(this).select();
	});

	function new_input(query){
		if(last_query !== query){
			if(!query){
				display_new_photos(default_backgrounds);
				update_theme_label("Default background images");
			}
			else{
				socket.emit('search', query, function(error, results){
					console.log(error);
					console.log(results);
					if(!error && results && get_query() === query){
						display_new_photos(results);
						update_theme_label("Results for '"+query+"'");
					}
				});
			}
			last_query = query;
		}
		update_clear_button();

		function display_new_photos(urls){
			var waiter = new Waiter(2, show_photos),
				incr = function(){waiter.increment()};
			clear_current_photos(incr);
			add_photos(urls, incr);
		}
	}

	/*
	 * Get the current value of the search field
	 */
	function get_query(){
		return search_textfield.val();
	}

	/*
	 * Clear button event bindings and handlers
	 */
	clear_button.click(function(e){
		clear_search();
	});
	function clear_search(){
		search_textfield.val("");
		new_input("");
	}
	function update_clear_button(){
		if(!!get_query()){
			clear_button.addClass('enabled');
		} 
		else {
			clear_button.removeClass('enabled');
		}
	}


	function clear_current_photos(fn){
		var holder = $("#bgChooser .list .photo-holder");
		holder.animate({
			left: "-2200px",
			opacity: "0"
		}, 300, function(){
			holder.remove();
			fn();
		});
	}

	function add_photos(urls, fn){
		var holder = $("<div class='photo-holder'>")
		_.each(urls, function(url){
			var photo = $("<a class='photo'>").css({
					"background-image": "url('"+url+"')"
				});
			photo.click(function(){
				select_photo($(this));
			});
			$.data(photo[0], 'url', strip_url(url));
			holder.append(photo);
		});
		$("#bgChooser .list").append(holder);
		setTimeout(fn, 100);
	}

	function show_photos(fn){
		var photos = $("a.photo");
		for(var i = 0; i <= 10; i++){
			(function(i){
				setTimeout(function(){
					$(photos.get(i)).addClass('show');
				}, i*60);
			})(i);
		}
		check_for_matches();
		preload();
	}

	function Waiter(limit, fn){
		this.count = 0;
		this.increment = function(){
			this.count++;
			if(this.count === limit)
				fn();
		};
	}

	function select_photo(element){
		var url = strip_url($.data(element[0], 'url'));
		if($.data(this, 'url') === selected_url)
			return;

		$("a.photo").removeClass('selected');
		element.addClass('selected');
		set_background(url);
		selected_url = url;
	}

	function check_for_matches(){
		$("a.photo").each(function(){
			if($.data(this, 'url') === selected_url)
				select_photo($(this));
		});
	}

	function strip_url(url){
		return url.replace(/_q/, '');
	}

	function set_background(url){
		$(".container").css({
			"background-image": "url('"+url+"')"
		});
	}

	function preload(array){
	    $("a.photo").each(function(){
	        $('<img/>')[0].src = strip_url($.data(this, 'url'));
	    });
    }

    function update_theme_label(name){
    	$("h2.displaying .name").html(name);
    }

});



