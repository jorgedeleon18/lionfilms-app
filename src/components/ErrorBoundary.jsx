import { Component } from 'react';

/* Si alguna pantalla se rompe, en vez de dejar todo negro se muestra un
   aviso con opciones para seguir. Se reinicia solo al cambiar de página. */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error, info) {
    console.error('Error en pantalla', error, info);
  }
  componentDidUpdate(prev) {
    if (this.state.failed && prev.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }
  render() {
    if (!this.state.failed) return this.props.children;
    if (this.props.fallback !== undefined) return this.props.fallback;
    return (
      <main className="view active">
        <div className="state-box" role="alert">
          <h3>Algo salió mal en esta pantalla</h3>
          <p>Probá recargar la página. Si sigue pasando, escribinos por WhatsApp y lo resolvemos.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-gradient" onClick={() => window.location.reload()}>Recargar</button>
            <a className="btn btn-outline" href="/">Volver al inicio</a>
          </div>
        </div>
      </main>
    );
  }
}
