/**
 * Typingevents.js
 * Add typingstarted and typingstopped events
 */

(function(doc){
	'use strict';

	var threshold = 100,
		typing = false,
		dirty = false,
		lastPressed;

	var window = this;

	var typingStoppedEvent = new this.CustomEvent("typingstopped", {
		bubbles: true,
		cancelable: false
	});

	var typingStartedEvent = new this.CustomEvent("typingstarted", {
		bubbles: true,
		cancelable: false
	});

	doc.onkeydown = function(){
		dirty = true;
		if(!typing){
			typing = true;
			dispatchEvent(typingStartedEvent);
		}
	};

	doc.onkeyup = function(){
		var keyupTime =  currentTime();
		lastPressed = keyupTime;
		window.setTimeout(function(){
			if(keyupTime === lastPressed && dirty){
				typing = false;
				dispatchEvent(typingStoppedEvent);
			}
		}, threshold);
	};

	function dispatchEvent(event){
		doc.dispatchEvent(event);
	}

	function currentTime(){
		return (new Date()).getTime();
	}
}.bind(this))(this.document);