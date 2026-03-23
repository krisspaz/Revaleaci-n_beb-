import { useState, useEffect } from 'react';
import SecurityGate from './components/SecurityGate';
import Invitation from './components/Invitation';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app-container">
      {/* Animated background orbs */}
      <div className="app-bg-glow-pink"></div>
      <div className="app-bg-glow-blue"></div>
      <div className="app-bg-glow-lavender"></div>

      {loading ? (
        <div className="loading-screen">
          <img src="/baby-drawing.png" alt="Cargando" className="loading-image" />
          <p>Preparando la sorpresa...</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      ) : (
        <SecurityGate>
          <Invitation />
        </SecurityGate>
      )}
    </div>
  );
}

export default App;
