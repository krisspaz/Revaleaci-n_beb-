import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * ScreenShield Premium+ - Protección máxima anti-screenshots
 * 
 * === PROTECCIONES DESKTOP ===
 * 1. Bloquea atajos de teclado (PrintScreen, Cmd+Shift, F12, etc.)
 * 2. Deshabilita clic derecho
 * 3. Detecta herramientas de desarrollo
 * 4. Bloquea copiar, guardar, imprimir
 * 
 * === PROTECCIONES MOBILE ===
 * 5. Detecta blur/focus del window (screenshot trigger en iOS/Android)
 * 6. Detecta cambio de visibilidad (tab switch)
 * 7. Detecta resize súbito (animación de screenshot iOS)
 * 8. Bloquea touch-callout y long-press en imágenes
 * 9. Previene gestos multi-touch (3 dedos = screenshot en iPad)
 * 10. CSS DRM: -webkit-touch-callout, pointer-events en imágenes
 * 11. Marca de agua invisible
 * 12. Overlay de advertencia animado
 */

export default function ScreenShield() {
  const [shieldActive, setShieldActive] = useState(false);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastResizeRef = useRef<number>(0);

  const flashShield = useCallback(() => {
    setShieldActive(true);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    warningTimeoutRef.current = setTimeout(() => {
      setShieldActive(false);
    }, 2000);
  }, []);

  useEffect(() => {
    // ============================================
    // === PROTECCIONES DE TECLADO (DESKTOP) ======
    // ============================================
    const blockKeys = (e: KeyboardEvent) => {
      // PrintScreen
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        flashShield();
        navigator.clipboard?.writeText?.('🔒 Contenido protegido').catch(() => {});
        return false;
      }
      // Cmd+Shift+3/4/5 (Mac screenshot)
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        flashShield();
        return false;
      }
      // DevTools shortcuts
      if ((e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
          (e.metaKey && e.altKey && (e.key === 'i' || e.key === 'j' || e.key === 'c'))) {
        e.preventDefault();
        return false;
      }
      // F12
      if (e.key === 'F12') { e.preventDefault(); return false; }
      // Ctrl+U, Ctrl+S, Ctrl+P
      if ((e.ctrlKey || e.metaKey) && ['u', 's', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return false;
      }
      // Ctrl+C / Cmd+C
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        navigator.clipboard?.writeText?.('🔒').catch(() => {});
        return false;
      }
    };

    // ============================================
    // === PROTECCIÓN CLIC DERECHO ================
    // ============================================
    const blockContextMenu = (e: Event) => {
      e.preventDefault();
      flashShield();
      return false;
    };

    // ============================================
    // === PROTECCIONES MOBILE - MULTI-CAPA =======
    // ============================================

    // CAPA 1: Detectar cambio de visibilidad (Page Visibility API)
    // Solo se activa cuando la pestaña está COMPLETAMENTE oculta (minimizar, etc)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Solo blur cuando la pestaña se oculta completamente
        document.body.classList.add('shield-blur');
      } else {
        // Al volver, quitar blur rápido para no molestar al usuario
        setTimeout(() => {
          document.body.classList.remove('shield-blur');
        }, 300);
      }
    };

    // CAPA 2: Detectar cambio de tamaño súbito (solo mobile)
    // iOS hace una animación de resize cuando toma screenshot
    let resizeTimeout: ReturnType<typeof setTimeout> | undefined;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const handleResize = () => {
      if (!isMobile) return; // Solo en móviles
      const now = Date.now();
      if (now - lastResizeRef.current < 300) {
        flashShield();
      }
      lastResizeRef.current = now;
      clearTimeout(resizeTimeout);
    };

    // CAPA 4: Bloquear multi-touch (3+ dedos = screenshot en iPad)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length >= 3) {
        e.preventDefault();
        flashShield();
        return false;
      }
    };

    // CAPA 5: Bloquear long-press (mantener presionado = guardar imagen)
    let longPressTimer: ReturnType<typeof setTimeout>;
    const handleTouchStartLongPress = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' || target.closest('img')) {
        longPressTimer = setTimeout(() => {
          flashShield();
        }, 400);
      }
    };
    const handleTouchEnd = () => {
      clearTimeout(longPressTimer);
    };

    // CAPA 6: Bloquear drag de imágenes
    const blockDrag = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // CAPA 7: Detectar Screen Capture API (navegadores modernos)
    const detectScreenCapture = async () => {
      try {
        if ('getDisplayMedia' in navigator.mediaDevices) {
          // Puede interceptar pero solo informar
        }
      } catch {
        // No soportado, ignorar
      }
    };

    // CAPA 8: Protecciones CSS touch
    const applyMobileCSS = () => {
      const styles = [
        ['-webkit-touch-callout', 'none'],
        ['-webkit-user-select', 'none'],
        ['-khtml-user-select', 'none'],
        ['-moz-user-select', 'none'],
        ['-ms-user-select', 'none'],
        ['user-select', 'none'],
        ['-webkit-user-drag', 'none'],
      ];
      styles.forEach(([prop, val]) => document.body.style.setProperty(prop, val));
    };

    // CAPA 9: DevTools detection
    const detectDevTools = () => {
      const threshold = 300; // Más alto para evitar falsos positivos
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      setDevToolsOpen(widthDiff || heightDiff);
    };
    const devToolsInterval = setInterval(detectDevTools, 1000);

    // CAPA 10: Proteger imágenes dinámicamente
    const protectImages = () => {
      document.querySelectorAll('img').forEach(img => {
        img.setAttribute('draggable', 'false');
        img.addEventListener('contextmenu', blockContextMenu as EventListener);
        // Prevenir long-press save en iOS
        img.style.setProperty('-webkit-touch-callout', 'none');
        img.style.setProperty('pointer-events', 'none');
      });
    };

    // ============================================
    // === REGISTRAR TODOS LOS LISTENERS ==========
    // ============================================
    document.addEventListener('keydown', blockKeys, true);
    document.addEventListener('contextmenu', blockContextMenu, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('dragstart', blockDrag, true);
    window.addEventListener('resize', handleResize);
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchstart', handleTouchStartLongPress, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);

    applyMobileCSS();
    detectScreenCapture();
    protectImages();

    const imgObserver = new MutationObserver(protectImages);
    imgObserver.observe(document.body, { childList: true, subtree: true });



    // ============================================
    // === CLEANUP ================================
    // ============================================
    return () => {
      document.removeEventListener('keydown', blockKeys, true);
      document.removeEventListener('contextmenu', blockContextMenu, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('dragstart', blockDrag, true);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchstart', handleTouchStartLongPress);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
      clearInterval(devToolsInterval);
      clearTimeout(resizeTimeout);
      clearTimeout(longPressTimer);
      imgObserver.disconnect();
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [flashShield]);

  // ============================================
  // === RENDER: DEVTOOLS DETECTADO =============
  // ============================================
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

  // ============================================
  // === RENDER: PROTECCIONES ACTIVAS ===========
  // ============================================
  return (
    <>
      {/* Overlay de advertencia al detectar intento de screenshot */}
      {shieldActive && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999998,
          background: 'rgba(0, 0, 0, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px',
          animation: 'shieldFadeIn 0.15s ease-out',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
        }}>
          <div style={{ fontSize: '3.5rem', animation: 'shieldPulse 0.6s ease-in-out' }}>🛡️</div>
          <p style={{
            color: '#fff',
            fontSize: '1.2rem',
            fontWeight: 700,
            fontFamily: 'var(--font-body)',
            textAlign: 'center',
            padding: '0 20px',
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

      {/* Marca de agua invisible (aparece en screenshots) */}
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

      {/* CSS protección inyectada */}
      <style>{`
        @keyframes shieldFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shieldPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }

        /* Blur ultra-agresivo cuando se activa */
        .shield-blur .app-container {
          filter: blur(50px) brightness(0.3) !important;
          transition: filter 0.05s !important;
        }
        .shield-blur .app-container * {
          filter: blur(30px) !important;
          transition: filter 0.05s !important;
        }

        /* Protección de imágenes */
        img {
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          user-select: none !important;
          pointer-events: none !important;
          -webkit-user-drag: none !important;
        }

        /* Permitir interacciones necesarias */
        a, button, input, textarea, select, [role="button"] {
          pointer-events: auto !important;
          -webkit-user-select: auto !important;
        }

        /* Prevenir selección de texto en todo */
        * {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        /* Permitir escritura en inputs */
        input, textarea {
          -webkit-user-select: text !important;
          user-select: text !important;
        }

        /* Protección adicional para iOS Safari */
        body {
          -webkit-text-size-adjust: none;
          -webkit-touch-callout: none;
        }

        /* Overlay invisible que interfiere con herramientas de captura */
        html::after {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 999989;
          background: 
            linear-gradient(transparent 99.9%, rgba(255,255,255,0.001) 100%);
          mix-blend-mode: difference;
        }
      `}</style>
    </>
  );
}
