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
  const [mode, setMode] = useState('item'); // 'item' | 'percentage'

  // Per-item mode state: { [itemId]: Set of participantIds }
  const [assignments, setAssignments] = useState({});

  // Percentage mode state: { [participantId]: string (0-100) }
  const [percentages, setPercentages] = useState({});

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getReceipt(receiptId).then(r => {
      setReceipt(r);
      const init = {};
      r.items.forEach(item => {
        init[item.id] = new Set(item.splits?.map(s => s.participant_id) ?? []);
      });
      setAssignments(init);
    });
  }, [receiptId]);

  useEffect(() => {
    if (!session) return;
    const init = {};
    session.participants.forEach(p => { init[p.id] = ''; });
    setPercentages(init);
  }, [session]);

  const participants = session?.participants ?? [];
  const receiptTotal = receipt?.items.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0;

  // --- Per-item helpers ---
  function toggleParticipant(itemId, participantId) {
    setAssignments(prev => {
      const set = new Set(prev[itemId] ?? []);
      if (set.has(participantId)) set.delete(participantId);
      else set.add(participantId);
      return { ...prev, [itemId]: set };
    });
  }

  function getItemTotal(item) { return item.price * item.quantity; }

  function getItemSplitAmt(item, participantId) {
    const assigned = assignments[item.id] ?? new Set();
    if (!assigned.has(participantId) || assigned.size === 0) return 0;
    return getItemTotal(item) / assigned.size;
  }

  function getParticipantItemTotal(participantId) {
    if (!receipt) return 0;
    return receipt.items.reduce((sum, item) => sum + getItemSplitAmt(item, participantId), 0);
  }

  function getUnassignedTotal() {
    if (!receipt) return 0;
    return receipt.items.reduce((sum, item) => {
      const assigned = assignments[item.id] ?? new Set();
      return assigned.size === 0 ? sum + getItemTotal(item) : sum;
    }, 0);
  }

  // --- Percentage helpers ---
  const pctTotal = Object.values(percentages).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const pctValid = Math.abs(pctTotal - 100) < 0.01 && participants.every(p => (parseFloat(percentages[p.id]) || 0) > 0);

  function setParticipantPct(participantId, value) {
    if (value === '' || (/^\d{0,3}(\.\d{0,2})?$/.test(value) && parseFloat(value) <= 100)) {
      setPercentages(prev => ({ ...prev, [participantId]: value }));
    }
  }

  function splitEvenly() {
    const each = (100 / participants.length).toFixed(2);
    const init = {};
    participants.forEach((p, i) => {
      // Last person gets the remainder to ensure sum is exactly 100
      const total = participants.slice(0, i).reduce((s, pp) => s + parseFloat(init[pp.id] || 0), 0);
      init[p.id] = i === participants.length - 1 ? (100 - total).toFixed(2) : each;
    });
    setPercentages(init);
  }

  // --- Save ---
  async function handleFinalize() {
    setSaving(true);
    try {
      let splits;
      if (mode === 'item') {
        splits = receipt.items.map(item => {
          const assigned = Array.from(assignments[item.id] ?? []);
          const perPerson = assigned.length > 0 ? getItemTotal(item) / assigned.length : 0;
          return {
            itemId: item.id,
            assignments: assigned.map(pid => ({ participantId: pid, amount: perPerson })),
          };
        });
      } else {
        // Percentage mode: distribute each item proportionally
        splits = receipt.items.map(item => {
          const total = getItemTotal(item);
          return {
            itemId: item.id,
            assignments: participants
              .filter(p => (parseFloat(percentages[p.id]) || 0) > 0)
              .map(p => ({
                participantId: p.id,
                amount: total * (parseFloat(percentages[p.id]) / 100),
              })),
          };
        });
      }
      await api.updateSplits(receiptId, splits);
      navigate(`/session/${sessionId}/receipts`);
    } finally {
      setSaving(false);
    }
  }

  const canSave = mode === 'item'
    ? getUnassignedTotal() === 0
    : pctValid;

  if (!receipt) return (
    <div className="page">
      <div className="page-content" style={{ alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
    </div>
  );

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
            Receipt
          </div>
          <h1 style={{ fontSize: '1.5rem' }}>{receipt.name}</h1>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 2 }}>Total Bill</div>
          <div className="amount">${receiptTotal.toFixed(2)}</div>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', background: 'var(--border)', borderRadius: 10, padding: 3, gap: 3 }}>
          {['item', 'percentage'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                background: mode === m ? 'var(--surface)' : 'transparent',
                color: mode === m ? 'var(--primary)' : 'var(--text-secondary)',
                boxShadow: mode === m ? 'var(--shadow)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {m === 'item' ? 'By Item' : 'By Percentage'}
            </button>
          ))}
        </div>

        {mode === 'item' ? (
          <>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Tap participants to assign each item</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {receipt.items.map(item => {
                const assigned = assignments[item.id] ?? new Set();
                return (
                  <div key={item.id} className="card" style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                        {item.is_tax_tip ? <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tax &amp; Tip</div> : null}
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

            <div className="card">
              <h3 style={{ marginBottom: 12 }}>Current Breakdown</h3>
              {participants.map(p => (
                <div key={p.id} className="list-row" style={{ padding: '10px 0' }}>
                  <div className="avatar" style={{ background: p.avatar_color, width: 28, height: 28, fontSize: '0.75rem' }}>
                    {p.name[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, fontWeight: 500 }}>{p.name}</div>
                  <div style={{ fontWeight: 700 }}>${getParticipantItemTotal(p.id).toFixed(2)}</div>
                </div>
              ))}
              {getUnassignedTotal() > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border)', marginTop: 4 }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Unassigned</span>
                  <span style={{ color: 'var(--danger)', fontWeight: 700 }}>${getUnassignedTotal().toFixed(2)}</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Enter each person's share</h3>
              <button
                onClick={splitEvenly}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}
              >
                Split evenly
              </button>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {participants.map(p => {
                const pct = parseFloat(percentages[p.id]) || 0;
                const dollarAmt = receiptTotal * (pct / 100);
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="avatar" style={{ background: p.avatar_color, width: 32, height: 32, fontSize: '0.8rem', flexShrink: 0 }}>
                      {p.name[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, fontWeight: 500 }}>{p.name.split(' ')[0]}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {pct > 0 && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          ${dollarAmt.toFixed(2)}
                        </span>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 8, overflow: 'hidden', width: 80 }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={percentages[p.id] ?? ''}
                          onChange={e => setParticipantPct(p.id, e.target.value)}
                          style={{
                            width: '100%',
                            border: 'none',
                            outline: 'none',
                            padding: '8px 4px 8px 8px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            background: 'var(--surface)',
                            color: 'var(--text)',
                          }}
                          placeholder="0"
                        />
                        <span style={{ paddingRight: 8, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>%</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Running total */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 12,
                borderTop: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total</span>
                <span style={{
                  fontWeight: 700,
                  color: Math.abs(pctTotal - 100) < 0.01 ? 'var(--primary)' : pctTotal > 100 ? 'var(--danger)' : 'var(--text)',
                }}>
                  {pctTotal.toFixed(pctTotal % 1 === 0 ? 0 : 2)}% / 100%
                </span>
              </div>
              {pctTotal > 0 && Math.abs(pctTotal - 100) >= 0.01 && (
                <p style={{ fontSize: '0.8rem', color: pctTotal > 100 ? 'var(--danger)' : 'var(--warning)', margin: 0 }}>
                  {pctTotal > 100
                    ? `Over by ${(pctTotal - 100).toFixed(2)}% — reduce someone's share`
                    : `${(100 - pctTotal).toFixed(2)}% remaining to assign`}
                </p>
              )}
            </div>
          </>
        )}

        <button
          className="btn btn-primary"
          onClick={handleFinalize}
          disabled={saving || !canSave}
        >
          {saving ? 'Saving...' : 'Finalize Splits'}
        </button>
      </div>

      <BottomNav sessionId={sessionId} />
    </div>
  );
}
