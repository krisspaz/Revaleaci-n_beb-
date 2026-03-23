import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { database } from '../firebase';
import { ref, onValue, runTransaction } from 'firebase/database';
import styles from './VotingSection.module.css';

export default function VotingSection() {
  const [votesBoy, setVotesBoy] = useState(0);
  const [votesGirl, setVotesGirl] = useState(0);
  const [userVote, setUserVote] = useState<'boy' | 'girl' | null>(null);

  useEffect(() => {
    // Check if user already voted on this device
    const storedVote = localStorage.getItem('genderRevealVote_v2') as 'boy' | 'girl' | null;
    if (storedVote) {
      setUserVote(storedVote);
    }

    if (!database) return;

    // Listen to real-time vote counts from Firebase
    try {
      const votesRef = ref(database, 'votes');
      const unsubscribe = onValue(votesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setVotesBoy(data.boy || 0);
          setVotesGirl(data.girl || 0);
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Firebase not configured");
    }
  }, []);

  const handleVote = (gender: 'boy' | 'girl') => {
    if (userVote) return;

    setUserVote(gender);
    localStorage.setItem('genderRevealVote_v2', gender);

    // Atomically increment the vote count in Firebase
    if (database) {
      try {
        const voteRef = ref(database, `votes/${gender}`);
        runTransaction(voteRef, (currentCount) => {
          return (currentCount || 0) + 1;
        });
      } catch (e) {
        // Fallback for local testing without Firebase
        if (gender === 'boy') setVotesBoy(prev => prev + 1);
        else setVotesGirl(prev => prev + 1);
      }
    } else {
      // Fallback for local testing without Firebase
      if (gender === 'boy') setVotesBoy(prev => prev + 1);
      else setVotesGirl(prev => prev + 1);
    }

    // Mini confetti burst
    const colors = gender === 'boy'
      ? ['#6EC1E4', '#A3DBF1', '#FFFFFF']
      : ['#FF8FAB', '#FFB8CC', '#FFFFFF'];

    confetti({
      particleCount: 50,
      spread: 80,
      origin: { y: 0.7, x: gender === 'boy' ? 0.3 : 0.7 },
      colors,
      scalar: 1.2,
      shapes: ['circle', 'star'],
    });
  };

  const totalVotes = votesBoy + votesGirl;
  const boyPercent = totalVotes === 0 ? 0 : Math.round((votesBoy / totalVotes) * 100);
  const girlPercent = totalVotes === 0 ? 0 : Math.round((votesGirl / totalVotes) * 100);

  return (
    <section className={styles.votingContainer}>
      <h2 className={styles.votingTitle}>¿Qué crees que seré?</h2>
      <p className={styles.votingSubtitle}>¡Deja tu voto y mira qué opinan los demás!</p>

      <div className={styles.cardsContainer}>
        <button
          className={`${styles.voteCard} ${styles.cardBoy} ${userVote === 'boy' ? styles.selected : ''} ${userVote && userVote !== 'boy' ? styles.dimmed : ''}`}
          onClick={() => handleVote('boy')}
          disabled={userVote !== null}
        >
          <img src="/prince.png" alt="Niño" className={styles.voteImage} />
          <h3>Niño</h3>
          {userVote && <span className={styles.voteCount}>{votesBoy} votos</span>}
        </button>

        <button
          className={`${styles.voteCard} ${styles.cardGirl} ${userVote === 'girl' ? styles.selected : ''} ${userVote && userVote !== 'girl' ? styles.dimmed : ''}`}
          onClick={() => handleVote('girl')}
          disabled={userVote !== null}
        >
          <img src="/princess.png" alt="Niña" className={styles.voteImage} />
          <h3>Niña</h3>
          {userVote && <span className={styles.voteCount}>{votesGirl} votos</span>}
        </button>
      </div>

      {userVote && (
        <div className={styles.resultsContainer}>
          <p className={styles.thanksMessage}>¡Gracias por votar!</p>
          <div className={styles.progressBarWrapper}>
            <div className={styles.progressBarResult}>
              <div
                className={styles.barBoy}
                style={{ width: `${boyPercent}%` }}
              >
                {boyPercent > 10 && `${boyPercent}%`}
              </div>
              <div
                className={styles.barGirl}
                style={{ width: `${girlPercent}%` }}
              >
                {girlPercent > 10 && `${girlPercent}%`}
              </div>
            </div>
          </div>
          <p className={styles.totalVotes}>{totalVotes} votos en total</p>
        </div>
      )}
    </section>
  );
}
