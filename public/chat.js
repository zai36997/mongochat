(function () {
    // Connect to socket.io
    var socket = io.connect('http://127.0.0.1:4000');
    var element = function (id) {
        return document.getElementById(id);
    }
    var status = element('status');
    var messages = element('messages');
    var sentmessages = element('sentmessages');
    var sent = element('sent');
    var username = element('username');
    var clearBtn = element('clear');

    // Set default status
    var statusDefault = status.textContent;
    var setStatus = function (s) {
        // Set status
        status.textContent = s;
        if (s !== statusDefault) {
            var delay = setTimeout(function () {
                setStatus(statusDefault);
                clearTimeout (delay);
            }, 2000);
        }
    }
    // Get Status From Server
    socket.on('status', function (data) {
        setStatus((typeof data === 'object') ? data.message : data);
        // If status is clear, clear text
        if (data.clear) {
            sentmessages.value = '';
        }
    });

    // Check for connection
    if (socket !== undefined) {
        console.log('Connected to socket...');
        // Handle Output
        socket.on('output', function (data) {
            //console.log(data);
            if (data.length) {
                for (var x = 0; x < data.length; x++) {
                    // Build out message div
                    var message = document.createElement('div');
                    message.setAttribute('class', 'chat-message');
                    message.innerHTML = '<p><strong >' + data[x].name + '  : </strong>' + data[x].message + '</p>';
                    messages.appendChild(message);
                    var el = document.getElementById('messages');
                    el.scrollTop = el.scrollHeight;
                  
                }
            }
        });

        // Handle Input
        /*sentmessages.addEventListener('keydown', function (event) {
            if (event.which === 13 && event.shiftKey == false) {
                // Emit to server input
                socket.emit('input', {
                    name: username.value,
                    message: sentmessages.value
                });
                event.preventDefault();
            }
        })
    */
        // Handle Chat Clear
        clearBtn.addEventListener('click', function () {
            socket.emit('clear'); //ส่งข้อมูลไปยัง Server
        });

        sent.addEventListener('click', function () {
           // console.log(username.value)
            //อ่านค่า จาก input เก็บไว้ที่ตัวแปร name และ message
            socket.emit('input', {
                name: username.value,
                message: sentmessages.value
            });
        });
        // Clear Message
        socket.on('cleared', function () {
            messages.textContent = '';
        });
    }
})()
