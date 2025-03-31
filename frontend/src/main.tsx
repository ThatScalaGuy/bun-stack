import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { BackendProvider } from './context/BackendContext.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BackendProvider>
      <App />
    </BackendProvider>
  </React.StrictMode>,
);
