import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { supabase } from '../supabase';
import styles from './VotingSection.module.css';

export default function VotingSection() {
  const [votesBoy, setVotesBoy] = useState(0);
  const [votesGirl, setVotesGirl] = useState(0);
  const [userVote, setUserVote] = useState<'boy' | 'girl' | null>(null);

  useEffect(() => {
    // Check if user already voted on this device (local cache)
    const storedVote = localStorage.getItem('genderRevealVote_v5') as 'boy' | 'girl' | null;
    if (storedVote) {
      setUserVote(storedVote);
    }

    // Fetch initial votes from Supabase
    const fetchVotes = async () => {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('id', 1)
        .single();
        
      if (!error && data) {
        setVotesBoy(data.boy || 0);
        setVotesGirl(data.girl || 0);
      }
    };

    fetchVotes();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('votes_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'votes', filter: 'id=eq.1' },
        (payload) => {
          if (payload.new) {
            setVotesBoy(payload.new.boy || 0);
            setVotesGirl(payload.new.girl || 0);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleVote = async (gender: 'boy' | 'girl') => {
    if (userVote) return;

    const guestName = localStorage.getItem('guestName') || 'Anónimo';
    const guestId = localStorage.getItem('guestId');

    setUserVote(gender);
    localStorage.setItem('genderRevealVote_v5', gender); // v5 to reset local testing

    if (guestId) {
      // Si ya tenemos el ID de cuando entró, actualizamos esa fila
      const { error: updateError } = await supabase
        .from('guests')
        .update({ vote: gender })
        .eq('id', guestId);
      
      if (updateError) console.error('Error updating vote:', updateError);
    } else {
      // Fallback por si acaso no hay ID guardado
      await supabase.from('guests').insert([{ name: guestName, vote: gender }]);
    }

    // Call Supabase RPC function to atomically increment votes for global counters
    const columnToIncrement = gender === 'boy' ? 'boy' : 'girl';
    await supabase.rpc('increment_vote', { row_id: 1, gender_column: columnToIncrement });

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
