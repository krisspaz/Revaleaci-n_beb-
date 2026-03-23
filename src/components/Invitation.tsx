import { useEffect, useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Calendar, Clock, MapPin, Heart, Sparkles, CameraOff } from 'lucide-react';
import styles from './Invitation.module.css';
import VotingSection from './VotingSection';

const EVENT_DETAILS = {
  date: "Sábado, 28 de Marzo, 2026",
  time: "4:00 PM",
  location: "Casa de Mis Papis 🏡",
  message: "Mis papis están súper emocionados y yo también. Ya casi es hora de revelar mi gran secreto, ¡y me encantaría que estés ahí para enterarnos juntos! ¿Seré un príncipe o una princesa? 👶✨"
};

const EVENT_DATE = new Date('2026-03-28T16:00:00');

function useCountdown(targetDate: Date) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, expired: false };
}

export default function Invitation() {
  const [animateIn, setAnimateIn] = useState(false);
  const countdown = useCountdown(EVENT_DATE);

  const staggerDelays = useMemo(() => [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7], []);

  useEffect(() => {
    setTimeout(() => {
      setAnimateIn(true);
      triggerConfetti();
    }, 300);

    const particleInterval = setInterval(() => {
      shootSubtleParticles();
    }, 2500);

    return () => clearInterval(particleInterval);
  }, []);

  const triggerConfetti = () => {
    const end = Date.now() + 3 * 1000;
    const colors = ['#FF8FAB', '#6EC1E4', '#FFD700', '#E8D5F5', '#B5EAD7', '#FFFFFF'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 65,
        origin: { x: 0 },
        colors: colors,
        disableForReducedMotion: true,
        shapes: ['circle', 'square'],
        scalar: 1.2
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 65,
        origin: { x: 1 },
        colors: colors,
        disableForReducedMotion: true,
        shapes: ['circle', 'square'],
        scalar: 1.2
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const shootSubtleParticles = () => {
    confetti({
      particleCount: 20,
      startVelocity: 20,
      spread: 360,
      origin: {
        x: Math.random(),
        y: Math.random() * 0.6
      },
      colors: ['#FF8FAB', '#6EC1E4', '#FFD700', '#E8D5F5'],
      ticks: 200,
      gravity: 0.4,
      scalar: 0.8,
      shapes: ['circle', 'star'],
      disableForReducedMotion: true
    });
  };

  return (
    <>
      <div className={`${styles.container} ${animateIn ? styles.visible : ''}`}>

        <header className={styles.hero}>
          <div className={styles.sparkleIcon} style={{ animationDelay: `${staggerDelays[0]}s` }}>
            <Sparkles size={36} color="var(--color-gold)" />
          </div>
          <h1 className={styles.title}>
            ¡Hola! Aún no me conoces, pero ya quiero celebrar contigo 🎉
          </h1>
          <p className={styles.subtitle}>
            Acompaña a mis papis a descubrir si seré...
          </p>

          <div className={styles.babiesContainer}>
            <div className={styles.babyOption}>
              <div className={styles.babyImageWrapper}>
                <img src="/prince.png" alt="Baby Boy" className={styles.babyImage} />
              </div>
              <span className={styles.boyText}>👦 Un Niño</span>
            </div>

            <div className={styles.vsText}>¿O?</div>

            <div className={styles.babyOption}>
              <div className={styles.babyImageWrapper}>
                <img src="/princess.png" alt="Baby Girl" className={styles.babyImage} />
              </div>
              <span className={styles.girlText}>👧 Una Niña</span>
            </div>
          </div>
        </header>

        {/* Countdown */}
        {!countdown.expired && (
          <section className={styles.countdownSection} style={{ animationDelay: `${staggerDelays[1]}s` }}>
            <h3 className={styles.countdownLabel}>⏳ ¡Faltan...</h3>
            <div className={styles.countdownGrid}>
              <div className={styles.countdownItem}>
                <span className={styles.countdownNumber}>{countdown.days}</span>
                <span className={styles.countdownUnit}>Días</span>
              </div>
              <div className={styles.countdownItem}>
                <span className={styles.countdownNumber}>{countdown.hours}</span>
                <span className={styles.countdownUnit}>Horas</span>
              </div>
              <div className={styles.countdownItem}>
                <span className={styles.countdownNumber}>{countdown.minutes}</span>
                <span className={styles.countdownUnit}>Min</span>
              </div>
              <div className={styles.countdownItem}>
                <span className={styles.countdownNumber}>{countdown.seconds}</span>
                <span className={styles.countdownUnit}>Seg</span>
              </div>
            </div>
          </section>
        )}

        <section className={styles.messageSection} style={{ animationDelay: `${staggerDelays[2]}s` }}>
          <Heart className={styles.heartIcon} size={32} />
          <p className={styles.messageText}>{EVENT_DETAILS.message}</p>
        </section>

        <VotingSection />

        <section className={styles.detailsCard} style={{ animationDelay: `${staggerDelays[4]}s` }}>
          <div className={styles.detailItem}>
            <div className={styles.detailIconWrap}>
              <Calendar className={styles.detailIcon} />
            </div>
            <div>
              <h3>Fecha</h3>
              <p>{EVENT_DETAILS.date}</p>
            </div>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.detailItem}>
            <div className={styles.detailIconWrap}>
              <Clock className={styles.detailIcon} />
            </div>
            <div>
              <h3>Hora</h3>
              <p>{EVENT_DETAILS.time}</p>
            </div>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.detailItem}>
            <div className={styles.detailIconWrap}>
              <MapPin className={styles.detailIcon} />
            </div>
            <div>
              <h3>Ubicación</h3>
              <p>{EVENT_DETAILS.location}</p>
            </div>
          </div>
        </section>

        <section className={styles.unpluggedSection} style={{ animationDelay: `${staggerDelays[5]}s` }}>
          <div className={styles.unpluggedIconWrap}>
            <CameraOff className={styles.unpluggedIcon} size={28} />
          </div>
          <div className={styles.unpluggedContent}>
            <h3>📵 ¡Guarda este recuerdo en tu corazón!</h3>
            <p>Queremos que este día sea súper íntimo y 100% familiar. Te pedimos amablemente <strong>no usar celulares ni tomar fotos o videos</strong> durante la revelación. ¡Simplemente disfrutemos juntos el momento! 💕</p>
          </div>
        </section>

      </div>
    </>
  );
}
