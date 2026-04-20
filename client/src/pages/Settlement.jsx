import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useSession } from '../context/SessionContext';

export default function Settlement() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const [review, setReview] = useState(null);

  useEffect(() => {
    api.getReview(sessionId).then(setReview);
  }, [sessionId]);

  if (!review) return (
    <div className="page">
      <div className="page-content" style={{ alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
    </div>
  );

  return (
    <div className="page">
      <div className="topbar">
        <div style={{ width: 30 }} />
        <span className="topbar-title">Settle Up</span>
        <button
          onClick={() => navigate(`/session/${sessionId}`)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600 }}
        >
          Done
        </button>
      </div>

      <div className="page-content">
        <div className="card" style={{ background: 'var(--primary)', color: '#fff', textAlign: 'center', padding: '28px 20px' }}>
          <h2 style={{ color: '#fff', marginBottom: 4 }}>{session?.name}</h2>
          <p style={{ opacity: 0.85, fontSize: '0.875rem', marginBottom: 16 }}>Here's the final breakdown</p>
          <div style={{ fontSize: '2.25rem', fontWeight: 800 }}>${review.grandTotal.toFixed(2)}</div>
          <div style={{ opacity: 0.75, fontSize: '0.8rem', marginTop: 4 }}>Grand Total</div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 14 }}>Who owes what</h3>
          {review.participants.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No splits assigned yet.</p>
          ) : (
            review.participants.map(p => (
              <div key={p.id} className="list-row">
                <div className="avatar" style={{ background: p.avatar_color }}>
                  {p.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                    {p.itemCount} item{p.itemCount !== 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>${p.total.toFixed(2)}</div>
              </div>
            ))
          )}
        </div>

        <button className="btn btn-primary" onClick={() => navigate(`/session/${sessionId}/review`)}>
          Confirm & Request Payment
        </button>

        <button className="btn btn-ghost" onClick={() => navigate(`/session/${sessionId}`)}>
          Back to Session
        </button>
      </div>
    </div>
  );
}
