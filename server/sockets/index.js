const User = require('./User');
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { getPrimeECDH, Curve, Point, scalarMul } = require('../lib/tools/tools.js');
const { randBetween } = require('bigint-crypto-utils');
const { encryptMsg, decryptMsg } = require('../lib/mode/cbc.js');

const pointToKey = (point) => {
  let x = point.x.toString(16).padStart(16, '0');
  let y = point.y.toString(16).padStart(16, '0');
  return x + y;
};

/*
msg body
{
  "to": user_id,
  "message": content,
}

get msg
{
  "with": user_id
}
*/

const setAfterHandshake = (io, socket, user) => {
  socket.join('room-'+user.id);
  const userBody = {
    "id": user.id,
    "name": user.name
  }
  let cipherBody = encryptMsg(userBody, user.sharedKey);
  socket.emit('user 1', cipherBody);
  socket.emit('user 2', cipherBody);

  socket.on('send message', async (cipherBody)=> {
    console.log(cipherBody);
    const msgBody = decryptMsg(cipherBody.encrypted, user.sharedKey);
    let receiver = await prisma.user.findFirst({
      where: {id: msgBody.to}
    })
    if(receiver) {
      let msg = await prisma.message.create({
        data: {
          fromId: user.id,
          toId: receiver.id,
          message: msgBody.message,
        }
      });
      console.log(msg);
      io.to('room-'+receiver.id).emit('new message', user.id);
    }
  });
  socket.on('get message', (cipherBody) => {
    console.log(cipherBody);
    const queryBody = decryptMsg(cipherBody.encrypted, user.sharedKey);
    prisma.message.findMany({
      where: {
        OR: [
          {
            fromId: user.id,
            toId: queryBody.with
          },
          {
            fromId: queryBody.with,
            toId: user.id
          }
        ]
      },
      include: {
        from: true,
        to: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    }).then((messages) => {
      socket.emit('messages', encryptMsg(messages, user.sharedKey)); //array
    });
  });
    // Send online user list
    // socket.emit('get online user', User.getOnlineUser());

    // let connectedUser = new User(socket.id, false);
    // User.users.set(socket.id, connectedUser);


    // // Login
    // socket.on('login', (fullName) => {

    //   // Check user
    //   let isUsing = false;
    //   User.users.forEach((key) => {
    //     if (key.fullname == fullName) {
    //       isUsing = true;
    //     }
    //   });
    //   socket.emit('check user', isUsing);

    //   // Add User
    //   if (User.users.has(socket.id) && !isUsing) {
    //     let currentUser = User.users.get(socket.id);
    //     currentUser.isLogin = true;
    //     currentUser.fullname = fullName;
    //     io.emit('new user', fullName);
    //   }

    // });

    // // Send message
    // socket.on('send message', (message) => {
    //   socket.broadcast.emit('new message', message);
    // });

    // // Disconnect
    // socket.on('disconnect', (reason) => {

    //   let currentUser = User.users.get(socket.id);
    //   if (currentUser.isLogin) {
    //     io.emit('exit user', currentUser.fullname);
    //   }

    //   User.users.delete(socket.id);
    //   // Send new online user list to all online user
    //   io.emit('get online user', User.getOnlineUser());
    // });
};

module.exports = (io) => {

  // Connection
  io.on('connection', async (socket) => {
    
    let addr = socket.handshake.headers.origin;
    let user = await prisma.user.findFirst({
      where: {addr: addr}
    });
    console.log(addr);
    if (!user || user.validDateTime < new Date()) {
      let mod = getPrimeECDH();
      let a = randBetween(mod-2n, 2n);
      let x = randBetween(mod-2n, 2n);
      let y = randBetween(mod-2n, 2n);
      let b = ((y**2n)%mod - (x**3n)%mod - a*x%mod) % mod;
      b = (b + mod) %mod;
      let curve = new Curve(a,b,mod);
      let base = new Point(x,y);
      socket.emit('start ALS', JSON.stringify(curve), JSON.stringify(base));
      let privateServer = randBetween(mod-2n, 2n);
      socket.emit('public server', JSON.stringify(scalarMul(curve, base, privateServer)));
      let sharedPoint = null;
      socket.on('public client', async (publicClientStr) => {
        publicClientStr = JSON.parse(publicClientStr);
        let publicClient = new Point(BigInt(publicClientStr.x), BigInt(publicClientStr.y));
        sharedPoint = scalarMul(curve, publicClient, privateServer);
        const sharedKey = pointToKey(sharedPoint);
        let name = "User-" + addr.substring(addr.lastIndexOf(":") + 1);
        console.log(sharedKey);
        let now = new Date();
        let validDate = new Date();
        validDate.setTime(now.getTime() + 1000*60*60*24*7);
        if(user) {
          user = await prisma.user.update({
            where: {id: user.id},
            data: {
              sharedKey: sharedKey,
              validDateTime: validDate
            }
          });
        } else {
          user = await prisma.user.create({
            data: {
              addr: addr,
              name: name,
              sharedKey: sharedKey,
              validDateTime: validDate
            }
          });
        }
        console.log(user);
        setAfterHandshake(io, socket, user);
      });
    } else {
      socket.emit('ALS already exist');
      setAfterHandshake(io, socket, user);
    }
  });
}