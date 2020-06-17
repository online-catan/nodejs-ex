const express = require('express')
const app = express()
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var path = require('path');
// var bodyParser = require('body-parser');
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
    // mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    // mongoURLLabel = "";

app.use(express.static(__dirname));  
app.use(express.static(__dirname + "/Game Code"));  
app.use(express.static(__dirname + "/views"));  
app.use(express.static(__dirname + "/scripts"));  

app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/index.html');
});

app.get('/guest', function(req, res,next) {  
    res.sendFile(__dirname + '/guest.html');
});

app.get('/player2', function(req, res,next) {  
    res.sendFile(__dirname + '/player2.html');
});

app.get('/player3', function(req, res,next) {  
    res.sendFile(__dirname + '/player3.html');
});

app.get('/player4', function(req, res,next) {  
    res.sendFile(__dirname + '/player4.html');
});

var clients = new Map();
var guests = [];
var host;

io.on('connection', function(client) {
    console.log('Client connected...');
    clients.set(client, {type: ""});

    client.on('join', function(data) {
       console.log(data.msg);
       clients.get(client).type = data.type;
       if (data.type == "host") {
            host = client;
       } else if (data.type == "guest") {
            guests.push(client);
       }
    });
    client.on('send_click_id', (data) => {
        if (clients.get(client).type == "guest") {
            let player_id = client.request.headers.referer.substr(-7,7);
            let click_id = data.click_id 
            console.log(click_id);
            host.emit('receive_click_id', {click_id: click_id,
                                            player_id: player_id});
        }
    });
    client.on('send_updated_page', (data) => {
        if (clients.get(client).type == "host") {
            let body_html = data.body_html;
            for (let guest of guests) {
                guest.emit('receive_updated_page', { body_html: body_html });
            }
        }
    })
});

server.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);


