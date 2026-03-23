import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import styles from './RSVPModal.module.css';

interface RSVPModalProps {
  onClose: () => void;
}

export default function RSVPModal({ onClose }: RSVPModalProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    guests: '1',
    dietary: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    setTimeout(() => {
      setStatus('success');
      // Celebration confetti!
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FF8FAB', '#6EC1E4', '#FFD700', '#E8D5F5', '#B5EAD7'],
        shapes: ['circle', 'star'],
        scalar: 1.3,
      });
    }, 1500);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalBody}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>

        {status === 'success' ? (
          <div className={styles.successState}>
            <span className={styles.successEmoji}>🎉</span>
            <CheckCircle2 size={50} color="var(--color-pink)" className={styles.successIcon} />
            <h2>¡Gracias por confirmar!</h2>
            <p>Hemos registrado tu asistencia. ¡Nos vemos en el revelado! 💕</p>
            <button className={styles.doneBtn} onClick={onClose}>
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <h2 className={styles.modalTitle}>¡Confirma Tu Asistencia! 🎈</h2>
            <p className={styles.modalSub}>Nos encantaría que nos acompañes 💕</p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Nombre y Apellido</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. María Pérez"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Acompañantes</label>
                <select
                  value={formData.guests}
                  onChange={e => setFormData({ ...formData, guests: e.target.value })}
                >
                  <option value="1">Solo yo 🙋</option>
                  <option value="2">2 personas 👫</option>
                  <option value="3">3 personas 👨‍👩‍👦</option>
                  <option value="4">4 personas 👨‍👩‍👧‍👦</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Restricciones Alimenticias (Opcional)</label>
                <textarea
                  rows={2}
                  value={formData.dietary}
                  onChange={e => setFormData({ ...formData, dietary: e.target.value })}
                  placeholder="Alergias, vegano, vegetariano..."
                ></textarea>
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? '✨ Enviando...' : '¡Confirmar Asistencia! 🎉'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
