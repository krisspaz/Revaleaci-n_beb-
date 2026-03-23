import { useState, useEffect, type ReactNode } from 'react';
import styles from './SecurityGate.module.css';

interface SecurityGateProps {
  children: ReactNode;
}

const CORRECT_PIN = 'BABY2026';

export default function SecurityGate({ children }: SecurityGateProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
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

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.toUpperCase() === CORRECT_PIN) {
      setIsUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setPin('');
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
          <span className={styles.gateEmoji}>👶</span>
          <h1 className={styles.gateTitle}>Revelación de Género</h1>
          <p className={styles.gateSub}>
            Ingresa el código de invitación para ver los detalles del evento.
          </p>
          <form onSubmit={handlePinSubmit} className={styles.gateForm}>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Código de Acceso"
              className={`${styles.pinInput} ${error ? styles.errorInput : ''}`}
            />
            {error && <p className={styles.errorText}>Código incorrecto. Intenta de nuevo.</p>}
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
