import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

BigInt.prototype.toJSON = function() { return this.toString() };

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
