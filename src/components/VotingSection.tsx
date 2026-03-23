import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import styles from './VotingSection.module.css';

export default function VotingSection() {
  const [votesBoy, setVotesBoy] = useState(0);
  const [votesGirl, setVotesGirl] = useState(0);
  const [userVote, setUserVote] = useState<'boy' | 'girl' | null>(null);

  useEffect(() => {
    const storedVote = localStorage.getItem('genderRevealVote') as 'boy' | 'girl' | null;
    if (storedVote) {
      setUserVote(storedVote);
      if (storedVote === 'boy') setVotesBoy(prev => prev + 1);
      if (storedVote === 'girl') setVotesGirl(prev => prev + 1);
    }
  }, []);

  const handleVote = (gender: 'boy' | 'girl') => {
    if (userVote) return;

    setUserVote(gender);
    localStorage.setItem('genderRevealVote', gender);

    if (gender === 'boy') {
      setVotesBoy(prev => prev + 1);
      // Mini confetti blue burst
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.7, x: 0.3 },
        colors: ['#6EC1E4', '#A3DBF1', '#FFFFFF'],
        scalar: 1.2,
        shapes: ['circle', 'star'],
      });
    } else {
      setVotesGirl(prev => prev + 1);
      // Mini confetti pink burst
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.7, x: 0.7 },
        colors: ['#FF8FAB', '#FFB8CC', '#FFFFFF'],
        scalar: 1.2,
        shapes: ['circle', 'star'],
      });
    }
  };

  const totalVotes = votesBoy + votesGirl;
  const boyPercent = totalVotes === 0 ? 0 : Math.round((votesBoy / totalVotes) * 100);
  const girlPercent = totalVotes === 0 ? 0 : Math.round((votesGirl / totalVotes) * 100);

  return (
    <section className={styles.votingContainer}>
      <h2 className={styles.votingTitle}>¿Qué crees que seré? 🤔</h2>
      <p className={styles.votingSubtitle}>¡Deja tu apuesta y mira qué opinan los demás!</p>

      <div className={styles.cardsContainer}>
        <button
          className={`${styles.voteCard} ${styles.cardBoy} ${userVote === 'boy' ? styles.selected : ''} ${userVote && userVote !== 'boy' ? styles.dimmed : ''}`}
          onClick={() => handleVote('boy')}
          disabled={userVote !== null}
        >
          <span className={styles.voteEmoji}>👦</span>
          <h3>Niño</h3>
          {userVote && <span className={styles.voteCount}>{votesBoy} votos</span>}
        </button>

        <button
          className={`${styles.voteCard} ${styles.cardGirl} ${userVote === 'girl' ? styles.selected : ''} ${userVote && userVote !== 'girl' ? styles.dimmed : ''}`}
          onClick={() => handleVote('girl')}
          disabled={userVote !== null}
        >
          <span className={styles.voteEmoji}>👧</span>
          <h3>Niña</h3>
          {userVote && <span className={styles.voteCount}>{votesGirl} votos</span>}
        </button>
      </div>

      {userVote && (
        <div className={styles.resultsContainer}>
          <p className={styles.thanksMessage}>🎉 ¡Gracias por votar!</p>
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
        </div>
      )}
    </section>
  );
}
