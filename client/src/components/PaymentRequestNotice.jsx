export default function PaymentRequestNotice({ request, onPay, onDismiss }) {
  if (!request) return null;

  return (
    <div className="payment-request-layer" role="dialog" aria-modal="true" aria-label="Payment request">
      <button className="payment-request-scrim" type="button" onClick={onDismiss} aria-label="Dismiss payment request" />
      <section className="payment-request-panel">
        <span className="payment-request-icon" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 10h16" />
            <path d="M6 10V7l6-4 6 4v3" />
            <path d="M6 14v4" />
            <path d="M10 14v4" />
            <path d="M14 14v4" />
            <path d="M18 14v4" />
            <path d="M4 20h16" />
          </svg>
        </span>
        <div>
          <p className="muted">Payment Request</p>
          <h2>You owe ${Number(request.amount ?? 0).toFixed(2)}</h2>
        </div>
        <button className="btn btn-primary" type="button" onClick={onPay}>
          Pay ${Number(request.amount ?? 0).toFixed(2)}
        </button>
      </section>
    </div>
  );
}
