import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './main.css';
import './output.css';
import {Toaster} from './components/ui/toaster';

ReactDOM.render(
  <React.StrictMode>
    <App />
    <Toaster />
  </React.StrictMode>,
  document.querySelector('#root'),
);
