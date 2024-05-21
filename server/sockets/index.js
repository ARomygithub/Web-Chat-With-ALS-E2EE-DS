const User = require('./User');
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function prepareALS() {
  // do ECDH
}

// prisma.user.create({
//   data: {
//     addr: '123.456.789.123:2040',
//     name: 'Alice',
//     sharedKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
//   }
// })

module.exports = (io) => {

  // Connection
  io.on('connection', (socket) => {
    
    let addr = socket.handshake.headers.origin;
    console.log(addr);
    let name = "User-" + addr.substring(addr.lastIndexOf(":") + 1);

    // Send online user list
    socket.emit('get online user', User.getOnlineUser());

    let connectedUser = new User(socket.id, false);
    User.users.set(socket.id, connectedUser);

    // Login
    socket.on('login', (fullName) => {

      // Check user
      let isUsing = false;
      User.users.forEach((key) => {
        if (key.fullname == fullName) {
          isUsing = true;
        }
      });
      socket.emit('check user', isUsing);

      // Add User
      if (User.users.has(socket.id) && !isUsing) {
        let currentUser = User.users.get(socket.id);
        currentUser.isLogin = true;
        currentUser.fullname = fullName;
        io.emit('new user', fullName);
      }

    });

    // Send message
    socket.on('send message', (message) => {
      socket.broadcast.emit('new message', message);
    });

    // Disconnect
    socket.on('disconnect', (reason) => {

      let currentUser = User.users.get(socket.id);
      if (currentUser.isLogin) {
        io.emit('exit user', currentUser.fullname);
      }

      User.users.delete(socket.id);
      // Send new online user list to all online user
      io.emit('get online user', User.getOnlineUser());
    });

  });
}