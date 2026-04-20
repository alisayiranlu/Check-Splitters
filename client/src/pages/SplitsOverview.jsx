import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useSession } from '../context/SessionContext';
import BottomNav from '../components/BottomNav';

export default function SplitsOverview() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const [review, setReview] = useState(null);

  useEffect(() => {
    api.getReview(sessionId).then(setReview);
  }, [sessionId]);

  if (!review) return (
    <div className="page">
      <BottomNav sessionId={sessionId} />
    </div>
  );

  return (
    <div className="page">
      <div className="topbar">
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{session?.name}</div>
        <span className="topbar-title">Splits</span>
        <div style={{ width: 30 }} />
      </div>

      <div className="page-content">
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Who owes what</h3>
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
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>${p.total.toFixed(2)}</div>
              </div>
            ))
          )}
        </div>

        {review.grandTotal > 0 && (
          <div className="card" style={{ background: 'var(--primary)', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Grand Total</span>
              <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>${review.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        <button className="btn btn-primary" onClick={() => navigate(`/session/${sessionId}/review`)}>
          Go to Final Review
        </button>
      </div>

      <BottomNav sessionId={sessionId} />
    </div>
  );
}
