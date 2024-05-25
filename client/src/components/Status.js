import { useEffect, useState } from 'react';
import socket from '../Socket';
const { scalarMul, Point, Curve } = require('../lib/tools/tools.js');
const { randBetween } = require('bigint-crypto-utils');

const pointToKey = (point) => {
  let x = point.x.toString(16).padStart(16, '0');
  let y = point.y.toString(16).padStart(16, '0');
  return x + y;
};

function Status() {
  const [status, setStatus] = useState('info');
  const [text, setText] = useState('Connecting...');

  useEffect(() => {
    function onConnect() {
      socket.on('start ALS', (curveStr, baseStr) => {
        curveStr = JSON.parse(curveStr);
        baseStr = JSON.parse(baseStr);
        let curve = new Curve(BigInt(curveStr.a), BigInt(curveStr.b), BigInt(curveStr.p));
        let base = new Point(BigInt(baseStr.x), BigInt(baseStr.y));
        console.log(curve);
        console.log(base);
        socket.on('public server', (publicServerStr) => {
          publicServerStr = JSON.parse(publicServerStr);
          let publicServer = new Point(BigInt(publicServerStr.x), BigInt(publicServerStr.y));
          let privateClient = randBetween(curve.p-2n, 2n);
          socket.emit('public client', JSON.stringify(scalarMul(curve, base, privateClient)));
          let keyPoint = scalarMul(curve, publicServer, privateClient);
          let key = pointToKey(keyPoint);
          localStorage.setItem('sharedKey', key);
          setStatus('success');
          setText('Connection established.');
        });
      });
      socket.on('ALS already exist', () => {
        setStatus('success');
        setText('Connection established.');
      });
    }

    function onError(error) {
      setStatus('danger');
      setText(error.message);
    }

    // Connect
    socket.on('connect', onConnect);

    // Connect error
    socket.on('connect_error', onError);

    return () => {
      socket.off('connect');
      socket.off('connect_error');
    };
  }, []);

  return (
    <small>Status: <span className={"has-text-" + (status)}>{text}</span></small>
  );
}

export default Status;
