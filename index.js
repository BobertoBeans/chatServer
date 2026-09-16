const http = require('http');
const fs = require('fs');
const websock = require('ws');

const wss = new websock.Server({ port : 4167 })
const login = new websock.Server({ port : 4169 })

const server = http.createServer((req,res) => {
    if (req.method === 'GET' && req.url === "/") {
        fs.readFile("index.html",(err,data) => {
            if(err) {
                res.writeHead(500,{"content-type" : "text/plain"});
                res.end("server error");
                return;
            }else {
                res.writeHead(200, {"content-type" : "text/html"});
                res.end(data)
            }
        });
    }
});

wss.on('connection', (ws) => {
    let first = true
    let name;
    ws.send("Enter name: ");
    ws.on('message', (message) => {
        if (message.toString() === '?quit') {
            ws.send("??quit??")
            ws.close()
        }else if (first === true) {
            name = message.toString();
            first = false;
            broadcast(`${message} has entered the chat!`)
        } else {
            broadcast(message,name)
        }
    })

    ws.on('close',() => {
        broadcast(`${name} has left the chat`)
    })
})

function broadcast(msg,name = null) {
    if (name) {
        for (const client of wss.clients) {
            client.send(`${name}: ${msg}`)
        }
    } else {
        for (const client of wss.clients) {
            client.send(msg)
        } 
    }
}

server.listen(8080,'0.0.0.0');
