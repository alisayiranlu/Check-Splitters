export default function ConfirmationToast({ message, variant = 'toast', status = 'success', actionLabel, onAction, onDismiss }) {
  if (variant === 'modal') {
    const loading = status === 'loading';

    return (
      <div className="confirmation-modal-layer" role="dialog" aria-modal="true" aria-live="polite">
        <button className="confirmation-modal-scrim" type="button" onClick={onDismiss} aria-label="Dismiss confirmation" />
        <section className="confirmation-modal-panel">
          <span className={`confirmation-icon large${loading ? ' loading' : ' success'}`} aria-hidden="true">
            {loading ? (
              <span className="confirmation-spinner" />
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
          <h2>{message}</h2>
          {actionLabel && (
            <button className="btn btn-primary confirmation-action" type="button" onClick={onAction}>
              {actionLabel}
            </button>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="confirmation-toast" role="status" aria-live="polite">
      <span className="confirmation-icon" aria-hidden="true">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      <span>{message}</span>
    </div>
  );
}
