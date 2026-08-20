export default function GlassCard({ className = '', children }) {
  return (
    <section className={`admin-glass rounded-3xl p-5 sm:p-6 ${className}`}>
      {children}
    </section>
  );
}
