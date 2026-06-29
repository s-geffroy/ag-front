import React from 'react';

interface State {
  error: Error | null;
}

/** Top-level error boundary: a thrown render shows a recoverable message instead of a blank screen. */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[verdict-web] render error', error, info.componentStack);
  }

  override render(): React.ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" style={{ maxWidth: 640, margin: '4rem auto', padding: '1.5rem' }}>
        <h1>Une erreur est survenue</h1>
        <p>
          L’affichage a rencontré un problème inattendu. Vos données ne sont pas perdues — rechargez la
          page pour reprendre.
        </p>
        <button type="button" onClick={() => window.location.reload()}>
          Recharger
        </button>
      </div>
    );
  }
}
