interface Props {
  status: number | null;
  message: string;
  onRetry?: () => void;
}

export function AccessNotice({ status, message, onRetry }: Props) {
  const needsSignIn = status === 401 || status === null;

  return (
    <div className="nova-access" role="alert" data-testid="access-notice">
      <p className="nova-kicker">{needsSignIn ? "Session required" : "Nova access"}</p>
      <h1>{needsSignIn ? "Sign in to open Nova" : "Nova is not enabled for this account"}</h1>
      <p>{message}</p>
      <p className="nova-access-note">
        {needsSignIn
          ? "Nova uses your existing TPI member session. Sign in and return to this page."
          : "Nova is currently limited to the owner, administrators and accounts with an active Creator Studio entitlement while entitlements are finalized."}
      </p>
      <div className="nova-access-actions">
        <a className="nova-button nova-button-primary" href="/member-login.html">Sign in</a>
        {onRetry ? (
          <button type="button" className="nova-button" onClick={onRetry}>Try again</button>
        ) : null}
        <a className="nova-button nova-button-quiet" href="/">Return to the website</a>
      </div>
    </div>
  );
}
