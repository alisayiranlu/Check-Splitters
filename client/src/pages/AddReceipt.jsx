import { useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { api } from '../api';

// Mock scanned receipt data
const MOCK_SCAN = {
  items: [
    { name: 'Steak Frites', quantity: 1, price: 45.00, note: 'Medium rare, extra fries' },
    { name: 'Oysters Half Dozen', quantity: 1, price: 24.00, note: 'East coast selection' },
    { name: 'House Wine (Bottle)', quantity: 1, price: 52.00, note: 'Pinot Noir' },
    { name: 'Tax & Tip', quantity: 1, price: 21.50, isTaxTip: true, note: 'NYC State Tax + 18% Gratuity' },
  ],
};

export default function AddReceipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();

  async function handleUpload() {
    // Mock: pretend we scanned a receipt
    const receiptName = session?.name ? `Dinner at ${session.name}` : 'Scanned Receipt';
    const receipt = await api.addReceipt(
      id,
      receiptName,
      MOCK_SCAN.items,
      new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    );
    navigate(`/session/${id}/receipts/${receipt.id}/edit`);
  }

  async function handleManual() {
    const receipt = await api.addReceipt(id, 'New Receipt', [], null);
    navigate(`/session/${id}/receipts/${receipt.id}/edit`);
  }

  return (
    <div className="page" style={{ paddingBottom: 0 }}>
      {/* Dimmed backdrop */}
      <div
        style={{ flex: 1, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}
        onClick={() => navigate(-1)}
      />

      <div style={{ background: 'var(--surface)', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ position: 'absolute', top: 'calc(100% - 340px)', right: 20, background: 'var(--bg)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <h2 style={{ textAlign: 'center', marginBottom: 8 }}>How would you like to add?</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 28 }}>
          Choose a method to input your expenses.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <button
            onClick={handleUpload}
            style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 16px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface)', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ background: 'var(--primary-light)', borderRadius: 10, padding: 12 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>Upload Receipt</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Snap a photo or choose an image from your gallery.
              </div>
            </div>
          </button>

          <button
            onClick={handleManual}
            style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 16px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface)', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ background: 'var(--primary-light)', borderRadius: 10, padding: 12 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>Manual Entry</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Type in the details yourself item by item.
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
