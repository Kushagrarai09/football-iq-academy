export default function LiveLoading() {
  return (
    <div className="live-page" aria-busy="true" aria-live="polite">
      <div className="page-head">
        <div className="eyebrow">Worldwide match centre</div>
        <h1>Live football scores</h1>
        <p className="lead">Loading football fixtures…</p>
      </div>
      <div className="live-match-grid">
        {Array.from({ length: 3 }, (_, index) => (
          <div className="live-skeleton" key={index}><span /><span /><span /></div>
        ))}
      </div>
    </div>
  );
}
