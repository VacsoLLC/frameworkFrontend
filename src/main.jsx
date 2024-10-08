import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // theme
import 'primeflex/primeflex.css'; // css utility
import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.css'; // core css
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
