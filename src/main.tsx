
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import React from 'react';

// Correct way to render React application
const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
