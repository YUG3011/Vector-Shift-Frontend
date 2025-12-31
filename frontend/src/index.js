import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// initialize theme from localStorage
try {
  const theme = localStorage.getItem('vs_theme');
  if (theme) document.documentElement.setAttribute('data-theme', theme);
} catch (e) {}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
