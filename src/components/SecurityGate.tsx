import { useState, useEffect, type ReactNode } from 'react';
import styles from './SecurityGate.module.css';

interface SecurityGateProps {
  children: ReactNode;
}

export default function SecurityGate({ children }: SecurityGateProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState(false);
  const [isObscured, setIsObscured] = useState(false);

  // Anti-Leak Protections
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsObscured(true);
      } else {
        setIsObscured(false);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'PrintScreen' ||
        ((e.ctrlKey || e.metaKey) && ['p', 's', 'c', 'x'].includes(e.key.toLowerCase())) ||
        (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key))
      ) {
        e.preventDefault();
        setIsObscured(true);
        setTimeout(() => setIsObscured(false), 3000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestName.trim().length > 0) {
      localStorage.setItem('guestName', guestName.trim());
      setIsUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (isObscured) {
    return (
      <div className={styles.obscuredScreen}>
        <div className={styles.obscuredContent}>
          <span className={styles.obscuredEmoji}>🔒</span>
          <h2>Contenido Protegido</h2>
          <p>La sorpresa está a salvo ✨</p>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className={styles.gateContainer}>
        <div className={styles.gateCard}>
          <img src="/hero-drawing.png" alt="Príncipe y Princesa" className={styles.gateImage} />
          <h1 className={styles.gateTitle}>Revelación de Género</h1>
          <p className={styles.gateSub}>
            Por favor, escribe tu nombre para ver los detalles del evento y poder votar.
          </p>
          <form onSubmit={handleNameSubmit} className={styles.gateForm}>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Tu Nombre"
              className={`${styles.pinInput} ${error ? styles.errorInput : ''}`}
            />
            {error && <p className={styles.errorText}>Por favor, ingresa tu nombre.</p>}
            <button type="submit" className={styles.unlockButton}>
              Entrar 💕
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
