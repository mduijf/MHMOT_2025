import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { FillOutput } from './pages/FillOutput';
import { KeyOutput } from './pages/KeyOutput';
import { PlayerOutput } from './pages/PlayerOutput';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/fill" element={<FillOutput />} />
        <Route path="/key" element={<KeyOutput />} />
        <Route path="/player1" element={<PlayerOutput playerNumber={1} />} />
        <Route path="/player2" element={<PlayerOutput playerNumber={2} />} />
        <Route path="/player3" element={<PlayerOutput playerNumber={3} />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
