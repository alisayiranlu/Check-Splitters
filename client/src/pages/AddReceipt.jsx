import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../context/useSession';
import { api } from '../api';

const MOCK_SCAN = {
  name: 'Dinner at Dinefine Restaurant',
  scannedAt: 'Aug 9, 2025',
  items: [
    { name: 'Caesar Salad',     quantity: 2, price: 12.00 },
    { name: 'Grilled Salmon',   quantity: 1, price: 22.00 },
    { name: 'Cheesecake',       quantity: 1, price:  7.50 },
    { name: 'Sparkling Water',  quantity: 2, price:  3.00 },
    { name: 'Tax',              quantity: 1, price:  3.08, isTaxTip: true },
  ],
};

export default function AddReceipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session, participant } = useSession();
  const isAdmin = Boolean(participant?.is_admin);
  const fileRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (participant && !isAdmin) {
      navigate(`/session/${id}/receipts`, { replace: true });
    }
  }, [id, isAdmin, navigate, participant]);

  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleUploadClick() {
    if (!isAdmin) return;
    fileRef.current?.click();
  }

  function handleFileChange(e) {
    if (!isAdmin) return;

    const file = e.target.files?.[0];
    if (!file) return;

    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);
    setScanning(true);
    e.target.value = '';

    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    scanTimeoutRef.current = setTimeout(async () => {
      try {
        const receiptName = session?.name ? `Dinner at ${session.name}` : MOCK_SCAN.name;
        const receipt = await api.addReceipt(
          id,
          receiptName,
          MOCK_SCAN.items,
          MOCK_SCAN.scannedAt,
          participant?.id
        );
        navigate(`/session/${id}/receipts/${receipt.id}/edit`);
      } catch (error) {
        console.error('Failed to add receipt:', error);
      } finally {
        scanTimeoutRef.current = null;
        setScanning(false);
      }
    }, 2800);
  }

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
    if (!isAdmin || !participant) return;

    const receipt = await api.addReceipt(id, 'New Receipt', [], null, participant.id);
    navigate(`/session/${id}/receipts/${receipt.id}/edit`);
  }

  if (participant && !isAdmin) return null;

  if (scanning) {
    return (
      <div className="modal-route">
        <div className="sheet" style={{ alignItems: 'center', gap: 0, padding: 0, overflow: 'hidden' }}>
          <div style={{ position: 'relative', width: '100%', height: 340, overflow: 'hidden', background: '#111' }}>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Receipt"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
              />
            )}
            <div style={{
              position: 'absolute', left: 0, right: 0, height: 2,
              background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
              boxShadow: '0 0 12px 4px rgba(0,131,120,0.6)',
              animation: 'scanLine 1.4s ease-in-out infinite',
            }} />
            {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
              <div key={v+h} style={{
                position: 'absolute', [v]: 16, [h]: 16,
                width: 24, height: 24,
                borderTop: v === 'top' ? '3px solid var(--primary)' : 'none',
                borderBottom: v === 'bottom' ? '3px solid var(--primary)' : 'none',
                borderLeft: h === 'left' ? '3px solid var(--primary)' : 'none',
                borderRight: h === 'right' ? '3px solid var(--primary)' : 'none',
              }} />
            ))}
          </div>

          <div style={{ padding: '28px 24px', width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2>Scanning receipt...</h2>
            <p className="muted">Reading items and prices. This will only take a moment.</p>
            <div style={{ marginTop: 8, height: 4, borderRadius: 999, background: 'var(--surface-high)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 999,
                background: 'var(--primary)',
                animation: 'scanProgress 2.8s ease-out forwards',
              }} />
            </div>
          </div>
        </div>

        <style>{`
          @keyframes scanLine {
            0%   { top: 0%; }
            50%  { top: calc(100% - 2px); }
          }
          @keyframes scanProgress {
            0%   { width: 0%; }
            60%  { width: 75%; }
            90%  { width: 92%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

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
          <button className="method-card" onClick={handleUploadClick} type="button">
            <span className="method-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <path d="M8 8h8" /><path d="M8 12h8" /><path d="M8 16h5" />
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

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}
