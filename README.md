# Socket.io-cli-client
A personal tool for quickly sending strings as events to a socket.io server. Used for debugging/controlling services. 

## Usage:
Requries node. A newer version will probably be fine. 

Clone the repo, and run `npm install` in the directory to install the dependencies.

Run `node ./client.js`. 
By default connects to `localhost:3000`, but you can connect to any server by doing `node client.js [ip:port]`

Simply type anything and press enter to send. By default it sends as a `message` event. The default can be changed by doing `/event <new default event>`.

You can also specify an event by doing: `event,message`. So if you wrote: `echo,Hello World` it would send `Hello World` as the `echo` event. 

## Output log

The output log is structured like this: `<indicator> [<event>] <message>`.

The indicator is either `<`, `>` or `*`.
- `<` means an inbound message
- `>` means an outbound message
- `*` Means a system message produced by the client itself. The event is in this case always displayed as `System`

For example `< [auth] Please enter details`, would mean a message from the server, emitted in via the `auth` event with content: `Please enter your details`

### Enjoy
Do `/quit` or CTRL+C to quit.
