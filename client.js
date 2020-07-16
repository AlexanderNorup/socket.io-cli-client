#!/usr/bin/env node
let server = 'http://localhost:3000';
if(process.argv.length > 2){
	if(process.argv[2] == "help"){
		console.log('usage: ./client.js [ip:port]');
        process.exit(1);
	}
	server = process.argv[2];
}
const color = require("ansi-color").set;
console.log(color('* [Status] Connecting to ' + server,'yellow'));
const socket = require('socket.io-client')(server);
let defaultEvent = 'message';


//Making a catch-all method, so we can catch all events
//Thanks to Flion on: https://stackoverflow.com/a/33960032
var Emitter = require('events').EventEmitter;
var emit = Emitter.prototype.emit;
var onevent = socket.onevent;
socket.onevent = function (packet) {
    var args = packet.data || [];
    onevent.call (this, packet);    // original call
    packet.data = ["*"].concat(args);
    onevent.call(this, packet);      // additional call to catch-all
};


const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

//Thanks to this fellow: https://code.tutsplus.com/tutorials/real-time-chat-with-nodejs-readline-socketio--cms-20953
function console_out(msg, more) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
	if(more != undefined){
		console.log(msg,more);
	}else{
		console.log(msg);
	}
    rl.prompt(true);
}


//Show all output of all events in the console
socket.on("*",function(event,data) {
	console_out("< ["+event+"]", data);
});


socket.on('connect', function () {
	socket.on('disconnect', (reason) => {
		console_out(color("* [Status] Connection lost to " + server,"red"));
		process.exit(1);
	});
	
	readline.moveCursor(process.stdout, 0,-1);
    console_out(color("* [Status] Connected to " + server,"green"));
	
	
	
	rl.on('line', function (answer) { //'line' event fires every time you enter anything in the console.
	
		//Clean up the last sent message so it looks nicer.
		readline.moveCursor(process.stdout, 0,-1);
		if(answer.indexOf(",") != -1){
			let query = answer.split(',');
			let e = query[0];
			query.shift();
			let msg = query.join(',');
			console.log("> ["+e+"] "+msg);
		}else{
			console.log("> ["+defaultEvent+"] "+answer);
		}
		
		
		if(answer.indexOf("/") == 0){
			
			//Executing a command:
			switch(answer.substr(1).split(" ")[0]){
				case "help": console_out("Commands:\n" +
										 " - /help			(shows help) \n" +
										 " - /event <event>		(Sets default event)\n" +
										 " - /quit			(Quits)"); break;
				case "event": defaultEvent = answer.trim().split(' ')[1]; console_out("Default event set to: " + defaultEvent); break;
				case "quit": console.log("Bye!"); process.exit(1); break;
				default: console_out("Unknown command: " + answer); break;
			}
			//Dont ask for new input here, because console_out() already resets the prompt.
		}else{
			
			//If the message contains a comma, we treat anything before the first comma as the event, and everything after as the raw data.
			if(answer.indexOf(",") != -1){
				//There is a comma somewhere. We split on the first one.
				let query = answer.split(',');
				let e = query[0];
				query.shift();
				let msg = query.join(',');
				socket.emit(e, msg);
			}else{
				//There is no comma, so we use the default event (set with the /event command)
				socket.emit(defaultEvent, answer);
			}
			
			rl.prompt(true); //Ask for new input
		}
	});
});


rl.on('SIGINT', () => {
	console.log("CTRL+C: Bye!");
	process.exit(1);
});