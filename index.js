const http = require('http');
const fs = require('fs');
const websock = require('ws');
const crypto = require('crypto');
console.log(hash("1234"))

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
    } else if (req.method === 'GET' && req.url === "/login") {
        fs.readFile("login.html",(err,data) => {
            if(err) {
                res.writeHead(500,{"content-type" : "text/plain"});
                res.end("server error");
                return;
            }else {
                res.writeHead(200, {"content-type" : "text/html"});
                res.end(data)
            }
        });
    } else if (req.method === 'GET' && req.url === "/create") {
        fs.readFile("create.html",(err,data) => {
            if(err) {
                res.writeHead(500,{"content-type" : "text/plain"});
                res.end("server error");
                return;
            }else {
                res.writeHead(200, {"content-type" : "text/html"});
                res.end(data)
            }
        });
    } else if (req.method === 'GET' && req.url === "/style.css") {
        fs.readFile("style.css",(err,data) => {
            if(err) {
                res.writeHead(500,{"content-type" : "text/plain"});
                res.end("server error");
                return;
            }else {
                res.writeHead(200, {"content-type" : "text/css"});
                res.end(data)
            }
        });
    }
});
const wss = new websock.Server({ server })

function hash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

wss.on('connection', (ws) => {
    let first = true
    ws.send("Enter name: ");
    ws.on('message', (message) => {
        try {
            JSON.parse(message)
            fs.readFile("accounts.json",(err,data) => {
                if(!err) {
                    jason = JSON.parse(data)
                    let str = JSON.parse(message.toString())
                    let user = jason.find((user) => str.user === user.user)
                    if (!user) {
                        ws.send("E:Incorrect username")
                    }else {
                        if (user.pass === hash(str.pass)) {
                            ws.send("S")
                        }
                    }
                }})
        } catch {
            if (message.toString()[0] === '~' && message.toString()[1] === '*') {
                let body = ''
                for (i=2;i<message.toString().length;i++) {
                    body += message.toString()[i]
                }
                fs.readFile("accounts.json",(err,data) => {
                    if(!err) {
                        let jason = JSON.parse(data)
                        let str = JSON.parse(body)
                        let user = jason.find((user) => str.user === user.user)
                        if (!user) {
                            str.pass = hash(str.pass)
                            jason.push(str)
                            fs.writeFile("accounts.json",JSON.stringify(jason),err => {
                                if (err) throw err
                            })
                            ws.send('S')
                        }else {
                            ws.send('E:Account name already exists!')
                        }
                    }})
                }
            }
            if (message.toString() === '?quit') {
                ws.send("??quit??")
                ws.close()
            }else if (first === true) {
                let found = false;
                ws.name = message.toString();
                first = false;
                for (i of wss.clients) {
                    if (i != ws) {
                        if (i.name === ws.name && ws._socket.remoteAddress === i._socket.remoteAddress) {
                            found = true
                        } else if (i.name === ws.name) {
                            ws.send("Invalid name!")
                        }
                    }
                }
                if (!found) {
                    try {
                        JSON.parse(message.toString())
                    } catch {
                        broadcast(`${message.toString()} has entered the chat!`)
                    }
                }
            } else {
                try {
                    JSON.parse(message.toString())
                } catch {
                    broadcast(message,ws.name)
                }
            }
        }
    )

    ws.on('close',() => {
        if (ws.name != undefined) {
            try {
                JSON.parse(ws.name)
            } catch {
                broadcast(`${ws.name} has left the chat`)
            }
        }
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
