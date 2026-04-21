'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body style={{ fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f1f5f9' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '0.5rem' }}>
            Terjadi Kesalahan
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error?.message || 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.'}
          </p>
          <button
            onClick={() => reset()}
            style={{ padding: '0.75rem 1.5rem', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}
