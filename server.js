const mongo = require('mongodb').MongoClient;
const socket = require('socket.io');
const express = require('express');
//app setup
const app = express();
// start server ด้วย port 4000
const server = app.listen(4000, function () {
    console.log('listening to requests on prt 4000');
});
//Static files
app.use(express.static('public'));
//Socket setup
const io = socket(server);

mongo.connect('mongodb://127.0.0.1/mongochat', { useNewUrlParser: true }, function (err, db) {
    if (err) {
        throw err;
    }
    console.log('MongoDB connected...');

    io.on('connection', function (socket) {
        let myDB = db.db('mongochat');
        let chat = myDB.collection('chats');

        // Get chats from mongo collection
        chat.find().limit(100).sort({ _id: 1 }).toArray(function (err, res) {
            if (err) {
                throw err;
            }
            // Emit the messages
            socket.emit('output', res);
        });
        // Create function to send status
        sendStatus = function (s) {
            socket.emit('status', s);
        }
        // Handle input events
        socket.on('input', function (data) {
            let name = data.name;
            let message = data.message;

            // Check for name and message
            if (name == '' || message == '') {
                sendStatus('Please enter a name and message');
            } else {
                chat.insertOne(
                    { name: name, message: message }, function () {
                        io.emit('output', [data]);

                        // Send status object
                        sendStatus({
                            message: 'Message sent',
                            clear: true
                        });
                    }
                );
            }
        });
        // Handle clear
        socket.on('clear', function (data) {
            chat.deleteMany({}, function () {
                socket.emit('cleared');
            });
        });
    });
});

