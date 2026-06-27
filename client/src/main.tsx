import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { initTouchHover } from './touchHover';

initTouchHover();

if (localStorage.getItem('scd_lite_mode') !== 'false') {
  document.body.classList.add('lite-mode');
}

if (!/bot|googlebot|crawler|spider|robot|crawling|lighthouse/i.test(navigator.userAgent)) {
  document.title = "AWS Student Community Day Dhule 2026";
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
