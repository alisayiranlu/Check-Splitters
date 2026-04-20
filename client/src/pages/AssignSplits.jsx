import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useSession } from '../context/useSession';
import BottomNav from '../components/BottomNav';

export default function AssignSplits() {
  const { id: sessionId, receiptId } = useParams();
  const navigate = useNavigate();
  const { session, refreshSession } = useSession();
  const [receipt, setReceipt] = useState(null);
  const [mode, setMode] = useState('item');
  const [assignments, setAssignments] = useState({});
  const [percentages, setPercentages] = useState({});
  const [saving, setSaving] = useState(false);
  const [showCustomCharge, setShowCustomCharge] = useState(false);
  const [customName, setCustomName] = useState('Custom Tip');
  const [customAmount, setCustomAmount] = useState('');
  const [savingCustomCharge, setSavingCustomCharge] = useState(false);
  const participants = session?.participants ?? [];

  useEffect(() => {
    refreshSession();
    api.getReceipt(receiptId).then(r => {
      setReceipt(r);
      const init = {};
      r.items.forEach(item => {
        init[item.id] = new Set(item.splits?.map(s => s.participant_id) ?? []);
      });
      setAssignments(init);
    });
  }, [receiptId, refreshSession]);

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
      return assigned.size === 0 ? sum + getItemTotal(item) : sum;
    }, 0);
  }

  const pctTotal = Object.values(percentages).reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
  const pctValid = Math.abs(pctTotal - 100) < 0.01;

  function setParticipantPct(participantId, value) {
    if (value === '' || (/^\d{0,3}(\.\d{1,2})?$/.test(value) && parseFloat(value) <= 100)) {
      setPercentages(prev => ({ ...prev, [participantId]: value }));
    }
  }

  function splitEvenly() {
    if (!participants.length) return;
    const each = (100 / participants.length).toFixed(2);
    const next = {};
    participants.forEach((p, index) => {
      const allocated = participants
        .slice(0, index)
        .reduce((sum, current) => sum + parseFloat(next[current.id] || 0), 0);
      next[p.id] = index === participants.length - 1 ? (100 - allocated).toFixed(2) : each;
    });
    setPercentages(next);
  }

  async function handleFinalize() {
    setSaving(true);
    try {
      const splits = mode === 'item'
        ? receipt.items.map(item => {
            const assigned = Array.from(assignments[item.id] ?? []);
            const perPerson = assigned.length > 0 ? getItemTotal(item) / assigned.length : 0;
            return {
              itemId: item.id,
              assignments: assigned.map(pid => ({ participantId: pid, amount: perPerson })),
            };
          })
        : receipt.items.map(item => {
            const itemTotal = getItemTotal(item);
            return {
              itemId: item.id,
              assignments: participants
                .filter(p => (parseFloat(percentages[p.id]) || 0) > 0)
                .map(p => ({
                  participantId: p.id,
                  amount: itemTotal * (parseFloat(percentages[p.id]) / 100),
                })),
            };
          });
      await api.updateSplits(receiptId, splits);
      await refreshSession();
      navigate(`/session/${sessionId}/splits`);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddCustomCharge(e) {
    e.preventDefault();
    const amount = parseFloat(customAmount);
    if (!customName.trim() || !Number.isFinite(amount) || amount <= 0) return;

    setSavingCustomCharge(true);
    try {
      const updated = await api.addReceiptItem(receiptId, {
        name: customName.trim(),
        quantity: 1,
        price: amount,
        isTaxTip: true,
      });
      const addedItem = updated.items[updated.items.length - 1];
      setReceipt(updated);
      setAssignments(prev => ({
        ...prev,
        [addedItem.id]: new Set(participants.map(p => p.id)),
      }));
      setCustomName('Custom Tip');
      setCustomAmount('');
      setShowCustomCharge(false);
    } finally {
      setSavingCustomCharge(false);
    }
  }

  const total = receipt?.items.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0;
  const unassigned = getUnassignedTotal();
  const canSave = mode === 'item' ? unassigned === 0 : pctValid;
  const receiptName = receipt?.name?.trim() ?? '';
  const receiptNameMatch = receiptName.match(/^(.+?)\s+at\s+(.+)$/i);
  const receiptPrefix = receiptNameMatch?.[1]?.trim() ? `${receiptNameMatch[1].trim()} at` : '';
  const receiptSuffix = receiptNameMatch?.[2]?.trim() ?? '';
  const receiptEyebrow = receiptPrefix || (receipt?.scanned_at ? 'Scanned receipt' : 'Receipt');
  const receiptTitle = receiptSuffix || receiptName || 'Untitled receipt';

  if (!receipt) {
    return <div className="page"><div className="page-content" style={{ justifyContent: 'center' }}>Loading</div><BottomNav sessionId={sessionId} /></div>;
  }

  return (
    <div className="page">
      <header className="topbar">
        <button className="topbar-back" onClick={() => navigate(`/session/${sessionId}/receipts/${receiptId}/edit`)} aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="topbar-title">Assign Splits</span>
        <div className="avatar" style={{ width: 32, height: 32, background: 'var(--text)' }}>{participants[0]?.name?.[0]?.toUpperCase() ?? 'A'}</div>
      </header>

      <main className="page-content">
        <section style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="eyebrow">{receiptEyebrow}</div>
          <h1>{receiptTitle}</h1>
          <p className="muted">Total Bill</p>
          <div className="amount">${total.toFixed(2)}</div>
        </section>

        <div className="tabs">
          <button className={`tab${mode === 'item' ? ' active' : ''}`} type="button" onClick={() => setMode('item')}>
            By Item
          </button>
          <button className={`tab${mode === 'percentage' ? ' active' : ''}`} type="button" onClick={() => setMode('percentage')}>
            By Percentage
          </button>
        </div>

        {mode === 'item' ? (
          <>
            <section className="list-stack" style={{ gap: 16 }}>
              <h3>Assign Items</h3>
              {receipt.items.map((item, index) => {
                const assigned = assignments[item.id] ?? new Set();
                return (
                  <div key={item.id} className={`card${index % 2 ? ' tonal' : ''}`}>
                    <div className="row-between" style={{ alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <h3>{item.name}</h3>
                        <p className="muted">{item.is_tax_tip ? 'Tax and tip' : item.quantity > 1 ? `Qty ${item.quantity}` : 'Item'}</p>
                      </div>
                      <h3>${getItemTotal(item).toFixed(2)}</h3>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
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
                            {splitAmt !== null ? <span style={{ marginLeft: 8, opacity: 0.8 }}>${splitAmt.toFixed(2)}</span> : null}
                            {isSelected ? <span style={{ marginLeft: 8 }}>x</span> : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </section>

            <section className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 128, height: 128, borderRadius: '0 0 0 999px', background: 'rgba(0, 104, 95, 0.05)' }} />
              <div style={{ position: 'relative' }}>
                <h3 style={{ marginBottom: 22 }}>Current Breakdown</h3>
                <div className="list-stack" style={{ gap: 20 }}>
                  {participants.map(p => (
                    <div className="row-between" key={p.id}>
                      <div className="list-row">
                        <div className="avatar soft" style={{ width: 32, height: 32 }}>
                          {p.name[0].toUpperCase()}
                        </div>
                        <strong>{p.name}</strong>
                      </div>
                      <h3>${getParticipantTotal(p.id).toFixed(2)}</h3>
                    </div>
                  ))}
                </div>
                <div className="total-line strong">
                  <span>Unassigned</span>
                  <span className={unassigned > 0 ? 'amount-danger' : 'amount-success'}>${unassigned.toFixed(2)}</span>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="row-between">
              <h3>Assign Percentages</h3>
              <button className="btn btn-ghost" type="button" onClick={splitEvenly}>
                Split evenly
              </button>
            </div>
            {participants.map(p => {
              const pct = parseFloat(percentages[p.id]) || 0;
              const amount = total * (pct / 100);
              return (
                <div key={p.id} className="row-between">
                  <div className="list-row">
                    <div className="avatar soft" style={{ width: 32, height: 32 }}>
                      {p.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3>{p.name}</h3>
                      <p className="muted">{pct > 0 ? `$${amount.toFixed(2)}` : '$0.00'}</p>
                    </div>
                  </div>
                  <div className="list-row" style={{ gap: 8 }}>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={percentages[p.id] ?? ''}
                      onChange={e => setParticipantPct(p.id, e.target.value)}
                      style={{ width: 86, minHeight: 38, textAlign: 'right', paddingRight: 8 }}
                      placeholder="0"
                    />
                    <span className="muted">%</span>
                  </div>
                </div>
              );
            })}
            <div className="total-line strong">
              <span>Total Assigned</span>
              <span className={Math.abs(pctTotal - 100) < 0.01 ? '' : 'danger-text'}>{pctTotal.toFixed(pctTotal % 1 === 0 ? 0 : 2)}%</span>
            </div>
            {pctTotal > 0 && Math.abs(pctTotal - 100) >= 0.01 && (
              <p style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 600 }}>
                {pctTotal > 100
                  ? `Over by ${(pctTotal - 100).toFixed(2)}% — reduce someone's share`
                  : `${(100 - pctTotal).toFixed(2)}% still unassigned`}
              </p>
            )}
          </section>
        )}

        <section className="card tonal" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button className="btn btn-primary" onClick={handleFinalize} disabled={saving || !canSave}>
            {saving ? 'Saving' : 'Finalize Splits'}
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => setShowCustomCharge(true)}>
            Add Custom Tip/Tax
          </button>
        </section>
      </main>

      {showCustomCharge && (
        <CustomChargeSheet
          name={customName}
          amount={customAmount}
          saving={savingCustomCharge}
          onNameChange={setCustomName}
          onAmountChange={setCustomAmount}
          onClose={() => setShowCustomCharge(false)}
          onSubmit={handleAddCustomCharge}
        />
      )}

      <BottomNav sessionId={sessionId} />
    </div>
  );
}

function CustomChargeSheet({ name, amount, saving, onNameChange, onAmountChange, onClose, onSubmit }) {
  return (
    <div className="floating-sheet" role="dialog" aria-modal="true" aria-label="Add custom tip or tax">
      <button className="floating-sheet-scrim" type="button" onClick={onClose} aria-label="Close custom charge" />
      <form className="floating-sheet-panel" onSubmit={onSubmit}>
        <div className="row-between" style={{ alignItems: 'flex-start', marginBottom: 22 }}>
          <div>
            <h2>Add Custom Tip/Tax</h2>
            <p className="muted" style={{ marginTop: 6 }}>Add a tax, service fee, or shared tip to this receipt.</p>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label>Label</label>
            <input className="input" value={name} onChange={e => onNameChange(e.target.value)} placeholder="Custom Tip" />
          </div>
          <div>
            <label>Amount</label>
            <input className="input" type="number" min="0" step="0.01" value={amount} onChange={e => onAmountChange(e.target.value)} placeholder="0.00" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving || !name.trim() || !(parseFloat(amount) > 0)}>
            {saving ? 'Adding' : 'Add to Receipt'}
          </button>
        </div>
      </form>
    </div>
  );
}
