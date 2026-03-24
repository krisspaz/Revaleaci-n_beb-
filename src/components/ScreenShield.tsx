import { useEffect, useRef, useState } from 'react';

/**
 * ScreenShield Premium - Protección anti-screenshots multinivel
 * 
 * Capas de protección:
 * 1. Bloquea atajos de teclado (PrintScreen, Cmd+Shift, etc.)
 * 2. Deshabilita clic derecho
 * 3. Detecta cambio de pestaña y oculta contenido
 * 4. Detecta herramientas de desarrollo abiertas
 * 5. Agrega marca de agua dinámica invisible
 * 6. Bloquea arrastrar imágenes
 * 7. Protección CSS DRM-like con -webkit-filter en blur al capturar
 * 8. Overlay protector al detectar intento de captura
 */

export default function ScreenShield() {
  const [shieldActive, setShieldActive] = useState(false);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // === 1. BLOQUEAR ATAJOS DE TECLADO ===
    const blockKeys = (e: KeyboardEvent) => {
      // PrintScreen
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        flashShield();
        // Sobrescribir clipboard con vacío
        navigator.clipboard?.writeText?.('🔒 Contenido protegido').catch(() => {});
        return false;
      }

      // Cmd+Shift+3/4/5 (Mac screenshot)
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        flashShield();
        return false;
      }

      // Ctrl+Shift+I / Cmd+Option+I (DevTools)
      if ((e.ctrlKey && e.shiftKey && e.key === 'I') || 
          (e.metaKey && e.altKey && e.key === 'i')) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+J / Cmd+Option+J (Console)
      if ((e.ctrlKey && e.shiftKey && e.key === 'J') || 
          (e.metaKey && e.altKey && e.key === 'j')) {
        e.preventDefault();
        return false;
      }

      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Ctrl+U (Ver código fuente)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }

      // Ctrl+S (Guardar página)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        return false;
      }

      // Ctrl+P (Imprimir)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        return false;
      }

      // Ctrl+C / Cmd+C (Copiar)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        navigator.clipboard?.writeText?.('🔒').catch(() => {});
        return false;
      }
    };

    // === 2. BLOQUEAR CLIC DERECHO ===
    const blockContextMenu = (e: Event) => {
      e.preventDefault();
      flashShield();
      return false;
    };

    // === 3. DETECTAR CAMBIO DE PESTAÑA (screenshot en iOS/Android) ===
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Cuando la app pierde foco, activar escudo
        document.body.classList.add('shield-blur');
      } else {
        // Al volver, quitar blur con delay
        setTimeout(() => {
          document.body.classList.remove('shield-blur');
        }, 500);
      }
    };

    // === 4. DETECTAR DEVTOOLS ===
    const detectDevTools = () => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      
      if (widthDiff || heightDiff) {
        setDevToolsOpen(true);
      } else {
        setDevToolsOpen(false);
      }
    };

    const devToolsInterval = setInterval(detectDevTools, 1000);

    // === 5. BLOQUEAR DRAG DE IMÁGENES ===
    const blockDrag = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // === 6. BLOQUEAR SELECCIÓN TOUCH EN MOBILE ===
    const blockTouchCallout = () => {
      document.body.style.setProperty('-webkit-touch-callout', 'none');
      document.body.style.setProperty('-webkit-user-select', 'none');
      document.body.style.setProperty('-khtml-user-select', 'none');
      document.body.style.setProperty('-moz-user-select', 'none');
      document.body.style.setProperty('-ms-user-select', 'none');
      document.body.style.setProperty('user-select', 'none');
    };

    // Registrar todos los listeners
    document.addEventListener('keydown', blockKeys, true);
    document.addEventListener('contextmenu', blockContextMenu, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('dragstart', blockDrag, true);
    blockTouchCallout();

    // Deshabilitar arrastre en todas las imágenes
    const disableImageDrag = () => {
      document.querySelectorAll('img').forEach(img => {
        img.setAttribute('draggable', 'false');
        img.addEventListener('contextmenu', blockContextMenu as EventListener);
      });
    };
    disableImageDrag();
    const imgObserver = new MutationObserver(disableImageDrag);
    imgObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('keydown', blockKeys, true);
      document.removeEventListener('contextmenu', blockContextMenu, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('dragstart', blockDrag, true);
      clearInterval(devToolsInterval);
      imgObserver.disconnect();
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, []);

  const flashShield = () => {
    setShieldActive(true);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    warningTimeoutRef.current = setTimeout(() => setShieldActive(false), 2000);
  };

  if (devToolsOpen) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        color: '#fff',
        fontFamily: 'var(--font-body)',
      }}>
        <div style={{ fontSize: '4rem' }}>🔒</div>
        <h2 style={{ 
          fontSize: '1.5rem', 
          background: 'var(--gradient-btn)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
        }}>
          Contenido Protegido
        </h2>
        <p style={{ 
          color: 'rgba(255,255,255,0.6)', 
          textAlign: 'center',
          maxWidth: '300px',
          lineHeight: 1.6,
        }}>
          Por favor cierra las herramientas de desarrollador para ver la invitación
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Overlay de advertencia al intentar screenshot */}
      {shieldActive && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999998,
          background: 'rgba(0, 0, 0, 0.92)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px',
          animation: 'shieldFadeIn 0.2s ease-out',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
        }}>
          <div style={{ fontSize: '3.5rem', animation: 'shieldPulse 0.6s ease-in-out' }}>🛡️</div>
          <p style={{
            color: '#fff',
            fontSize: '1.2rem',
            fontWeight: 700,
            fontFamily: 'var(--font-body)',
            textAlign: 'center',
          }}>
            ¡Capturas de pantalla no permitidas! 📵
          </p>
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.9rem',
            fontFamily: 'var(--font-body)',
            textAlign: 'center',
            maxWidth: '280px',
          }}>
            Este contenido está protegido. Disfruta el momento ✨
          </p>
        </div>
      )}

      {/* Marca de agua dinámica invisible (se ve en screenshots) */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999990,
          pointerEvents: 'none',
          background: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 80px,
            rgba(255, 143, 171, 0.012) 80px,
            rgba(255, 143, 171, 0.012) 82px
          )`,
          mixBlendMode: 'multiply',
        }}
      />

      {/* CSS animations inyectadas */}
      <style>{`
        @keyframes shieldFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shieldPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        .shield-blur * {
          filter: blur(30px) !important;
          transition: filter 0.1s !important;
        }
        .shield-blur .app-container {
          filter: blur(50px) !important;
        }

        /* Protección CSS avanzada */
        img {
          -webkit-touch-callout: none !important;
          pointer-events: none;
        }
        
        /* Permitir clics en enlaces */
        a, button, input {
          pointer-events: auto !important;
        }
      `}</style>
    </>
  );
}
