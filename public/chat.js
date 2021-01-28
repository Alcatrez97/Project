
$(function(){
   	//make connection
	var socket = io.connect('http://localhost:4000')

	//buttons and inputs
	var message = $("#message")
	var username = $("#username")
	var active_contact = $('contact active')
	var send_message = $("#submit")
	var send_username = $("#send_username")
	var chatroom = $("#chatroom")
	var feedback = $("#feedback")
	var add_contact = $("contacts") 

	//Emit message
	send_message.click(function(){
		socket.emit('new_message', {message : message.val()})
	})

	//Listen on new_message
	socket.on("new_message", (data) => {
		feedback.html('dhfgdgzdg2352355fsdf');
		console.log(message.val());
		chatroom.append("<p class='message'>" + data.username + ": " + data.message + "</p>")
	})

	//Emit a username
	send_username.click(function(){
		socket.emit('change_username', {username : username.val()})
	})

	//Emit typing
	message.bind("keypress", () => {
		socket.emit('typing')
	})

	//Listen on typing
	socket.on('typing', (data) => {
		feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
	})

	////////////////////////////////////////////////////////////////////////////
	//add contact
	add_contact.click(() => {
		console.log('contact added')
	});

	send_message.click(()=>{
		message = $(".message-input input").val();
		if ($.trim(message) == '') {
			return false;
		}
		$('<li class="sent"><img src="http://emilcarlsson.se/assets/mikeross.png" alt="" /><p>' + message + '</p></li>').appendTo($('.messages ul'));
		$('.message-input input').val(null);
		$('.contact.active .preview').html('<span>You: </span>' + message);
		$(".messages").animate({ scrollTop: $(document).height() }, "fast");
	})

	socket.emit('new_message', { message: message.val() })


});


