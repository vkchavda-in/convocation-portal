import { Quote } from 'lucide-react';

export default function SignatureQuote() {
  return (
    <section className="py-32 bg-gradient-to-br from-[var(--midnight-navy)] via-[var(--royal-blue)] to-[var(--dark-surface)] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center relative z-10">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full mb-12 border border-white/20">
          <Quote className="text-[#f9c53c]" size={48} />
        </div>

        <blockquote className="mb-12" style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
          fontStyle: 'italic',
          lineHeight: '1.5',
          color: 'white'
        }}>
          "The measure of leadership is not the positions held, but the lives transformed,
          the institutions strengthened, and the future possibilities unlocked for generations to come."
        </blockquote>

        <div className="w-32 h-1 bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] mx-auto mb-6 rounded-full" />

        <div style={{ fontSize: '1.25rem', color: '#f9c53c', fontFamily: 'var(--font-heading)' }}>
          Dr. Mahendra Sharma
        </div>
      </div>
    </section>
  );
}
