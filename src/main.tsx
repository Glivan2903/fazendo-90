
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import React from 'react';

// Make sure we explicitly use React here
const root = createRoot(document.getElementById("root")!);
root.render(
  <React>
    <App />
  </React>
);
