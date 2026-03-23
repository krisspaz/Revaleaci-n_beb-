import { useState, useEffect } from 'react';
import SecurityGate from './components/SecurityGate';
import Invitation from './components/Invitation';
import './App.css';

const FLOATING_EMOJIS = ['⭐', '💕', '✨', '🌟', '💖', '✨'];

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

      {/* Floating emoji decorations */}
      <div className="floating-emojis">
        {FLOATING_EMOJIS.map((emoji, i) => (
          <span key={i} className="float-item">{emoji}</span>
        ))}
      </div>

      {loading ? (
        <div className="loading-screen">
          <div className="loading-emoji">👶</div>
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
