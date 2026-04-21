import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../context/useSession';
import { api } from '../api';

const MOCK_SCAN = {
  items: [
    { name: 'Steak Frites', quantity: 1, price: 45.00, note: 'Medium rare, extra fries' },
    { name: 'Oysters Half Dozen', quantity: 1, price: 24.00, note: 'East coast selection' },
    { name: 'House Wine Bottle', quantity: 1, price: 52.00, note: 'Pinot Noir' },
    { name: 'Tax and Tip', quantity: 1, price: 21.50, isTaxTip: true, note: 'NYC State Tax plus gratuity' },
  ],
};

export default function AddReceipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session, participant } = useSession();
  const isAdmin = Boolean(participant?.is_admin);

  useEffect(() => {
    if (participant && !isAdmin) {
      navigate(`/session/${id}/receipts`, { replace: true });
    }
  }, [id, isAdmin, navigate, participant]);

  async function handleUpload() {
    if (!isAdmin) return;

    const receiptName = session?.name ? `Dinner at ${session.name}` : 'Scanned Receipt';
    const receipt = await api.addReceipt(
      id,
      receiptName,
      MOCK_SCAN.items,
      new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      participant.id
    );
    navigate(`/session/${id}/receipts/${receipt.id}/edit`);
  }

  async function handleManual() {
    if (!isAdmin) return;

    const receipt = await api.addReceipt(id, 'New Receipt', [], null, participant.id);
    navigate(`/session/${id}/receipts/${receipt.id}/edit`);
  }

  if (participant && !isAdmin) return null;

  return (
    <div className="modal-route">
      <button style={{ flex: 1, border: 0, background: 'transparent' }} onClick={() => navigate(`/session/${id}/receipts`)} aria-label="Close" />

      <section className="sheet">
        <div className="row-between" style={{ alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2>How would you like to add?</h2>
            <p className="muted">Choose a method to input your expenses.</p>
          </div>
          <button className="icon-btn" onClick={() => navigate(`/session/${id}/receipts`)} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="list-stack" style={{ gap: 16 }}>
          <button className="method-card" onClick={handleUpload} type="button">
            <span className="method-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <path d="M8 8h8" />
                <path d="M8 12h8" />
                <path d="M8 16h5" />
              </svg>
            </span>
            <span>
              <strong>Upload Receipt</strong>
              <span className="muted" style={{ display: 'block' }}>Snap a photo or choose an image from your gallery.</span>
            </span>
          </button>

          <button className="method-card" onClick={handleManual} type="button">
            <span className="method-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6" />
                <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
              </svg>
            </span>
            <span>
              <strong>Manual Entry</strong>
              <span className="muted" style={{ display: 'block' }}>Type in the details yourself item by item.</span>
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}
