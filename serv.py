import socket

serv = socket.socket()
serv.bind(('10.10.1.178',9090))
serv.listen()
first = True

while True:
    comm, address = serv.accept()
    if first:
        user = comm.recv(1024).decode('utf-8')
        print(f'connected to... {user}!')
        first = False
    msg = comm.recv(1024).decode('utf-8')
    print(f'{user} says: {msg}')
    comm.send(input('your message: ').encode())