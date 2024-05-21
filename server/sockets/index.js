const User = require('./User');
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { getPrimeECDH, Curve, Point, scalarMul } = require('../lib/tools/tools.js');
const { randBetween } = require('bigint-crypto-utils');

// prisma.user.create({
//   data: {
//     addr: '123.456.789.123:2040',
//     name: 'Alice',
//     sharedKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
//   }
// })

const pointToKey = (point) => {
  let x = point.x.toString(16).padStart(64, '0');
  let y = point.y.toString(16).padStart(64, '0');
  return x + y;
};

module.exports = (io) => {

  // Connection
  io.on('connection', async (socket) => {
    
    let addr = socket.handshake.headers.origin;
    const user = await prisma.user.findFirst({
      where: {addr: addr}
    });
    console.log(addr);
    // if (user) {

    // } else {
    //   let mod = getPrimeECDH();
    //   let a = randBetween(mod-2n, 2n);
    //   let x = randBetween(mod-2n, 2n);
    //   let y = randBetween(mod-2n, 2n);
    //   let b = (y**2n - x**3n - a*x) % mod;
    //   let curve = new Curve(a,b,mod);
    //   let base = new Point(x,y);
    //   socket.emit('start ALS', {curve, base});
    //   let privateServer = randBetween(mod-2n, 2n);
    //   socket.emit('public server', scalarMul(curve, base, privateServer));
    //   let sharedPoint = null;
    //   socket.on('public client', async (publicClient) => {
    //     sharedPoint = scalarMul(curve, publicClient, privateServer);
    //     const sharedKey = pointToKey(sharedPoint);
    //     let name = "User-" + addr.substring(addr.lastIndexOf(":") + 1);
    //     await prisma.user.create({
    //       data: {
    //         addr: addr,
    //         name: name,
    //         sharedKey: sharedKey,
    //       }
    //     });
    //   });
    // }

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