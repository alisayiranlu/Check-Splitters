import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useSession } from '../context/SessionContext';
import BottomNav from '../components/BottomNav';

export default function AssignSplits() {
  const { id: sessionId, receiptId } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const [receipt, setReceipt] = useState(null);
  // assignments: { [itemId]: Set of participantIds }
  const [assignments, setAssignments] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getReceipt(receiptId).then(r => {
      setReceipt(r);
      // Init assignments from existing splits
      const init = {};
      r.items.forEach(item => {
        init[item.id] = new Set(item.splits?.map(s => s.participant_id) ?? []);
      });
      setAssignments(init);
    });
  }, [receiptId]);

  function toggleParticipant(itemId, participantId) {
    setAssignments(prev => {
      const set = new Set(prev[itemId] ?? []);
      if (set.has(participantId)) set.delete(participantId);
      else set.add(participantId);
      return { ...prev, [itemId]: set };
    });
  }

  function getItemTotal(item) {
    return item.price * item.quantity;
  }

  function getSplitAmount(item, participantId) {
    const assigned = assignments[item.id] ?? new Set();
    if (!assigned.has(participantId) || assigned.size === 0) return 0;
    return getItemTotal(item) / assigned.size;
  }

  function getParticipantTotal(participantId) {
    if (!receipt) return 0;
    return receipt.items.reduce((sum, item) => sum + getSplitAmount(item, participantId), 0);
  }

  function getUnassignedTotal() {
    if (!receipt) return 0;
    return receipt.items.reduce((sum, item) => {
      const assigned = assignments[item.id] ?? new Set();
      if (assigned.size === 0) return sum + getItemTotal(item);
      return sum;
    }, 0);
  }

  async function handleFinalize() {
    setSaving(true);
    try {
      const splits = receipt.items.map(item => {
        const assigned = Array.from(assignments[item.id] ?? []);
        const perPerson = assigned.length > 0 ? getItemTotal(item) / assigned.length : 0;
        return {
          itemId: item.id,
          assignments: assigned.map(pid => ({ participantId: pid, amount: perPerson })),
        };
      });
      await api.updateSplits(receiptId, splits);
      navigate(`/session/${sessionId}/receipts`);
    } finally {
      setSaving(false);
    }
  }

  const participants = session?.participants ?? [];
  const unassigned = getUnassignedTotal();

  if (!receipt) return <div className="page"><div className="page-content" style={{ alignItems: 'center', justifyContent: 'center' }}>Loading...</div></div>;

  return (
    <div className="page">
      <div className="topbar">
        <button className="topbar-back" onClick={() => navigate(-1)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="topbar-title">Assign Splits</span>
        <div style={{ width: 30 }} />
      </div>

      <div className="page-content">
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {receipt.scanned_at ? `Dinner at` : 'Receipt'}
          </div>
          <h1 style={{ fontSize: '1.5rem' }}>{receipt.name}</h1>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            Total Bill
          </div>
          <div className="amount">
            ${receipt.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}
          </div>
        </div>

        <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Assign Items</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {receipt.items.map(item => {
            const assigned = assignments[item.id] ?? new Set();
            return (
              <div key={item.id} className="card" style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    {item.is_tax_tip ? (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tax &amp; Tip</div>
                    ) : null}
                  </div>
                  <div style={{ fontWeight: 700 }}>${getItemTotal(item).toFixed(2)}</div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {participants.map(p => {
                    const isSelected = assigned.has(p.id);
                    const splitAmt = isSelected && assigned.size > 0 ? getItemTotal(item) / assigned.size : null;
                    return (
                      <button
                        key={p.id}
                        className={`chip ${isSelected ? 'chip-selected' : 'chip-unselected'}`}
                        onClick={() => toggleParticipant(item.id, p.id)}
                      >
                        {p.name.split(' ')[0]}
                        {isSelected && splitAmt !== null && (
                          <span style={{ marginLeft: 4, opacity: 0.85 }}>${splitAmt.toFixed(2)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current breakdown */}
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Current Breakdown</h3>
          {participants.map(p => (
            <div key={p.id} className="list-row" style={{ padding: '10px 0' }}>
              <div className="avatar" style={{ background: p.avatar_color, width: 28, height: 28, fontSize: '0.75rem' }}>
                {p.name[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, fontWeight: 500 }}>{p.name}</div>
              <div style={{ fontWeight: 700 }}>${getParticipantTotal(p.id).toFixed(2)}</div>
            </div>
          ))}
          {unassigned > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border)', marginTop: 4 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Unassigned</span>
              <span style={{ color: 'var(--danger)', fontWeight: 700 }}>${unassigned.toFixed(2)}</span>
            </div>
          )}
        </div>

        <button className="btn btn-primary" onClick={handleFinalize} disabled={saving}>
          {saving ? 'Saving...' : 'Finalize Splits'}
        </button>
      </div>

      <BottomNav sessionId={sessionId} />
    </div>
  );
}
