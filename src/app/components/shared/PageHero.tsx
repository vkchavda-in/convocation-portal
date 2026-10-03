interface PageHeroProps {
  title: string;
  subtitle: string;
  description: string;
}

export default function PageHero({ title, subtitle, description }: PageHeroProps) {
  return (
    <section className="relative bg-gradient-to-br from-[var(--midnight-navy)] via-[var(--royal-blue)] to-[var(--dark-surface)] text-white py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-1 bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] mx-auto mb-8 rounded-full" />

          <h1 className="mb-6" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            lineHeight: '1.1',
            letterSpacing: '-0.02em'
          }}>
            {title}
          </h1>

          <p className="text-[#f9c53c] font-semibold mb-6" style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)' }}>
            {subtitle}
          </p>

          <p className="text-white/80 leading-relaxed max-w-3xl mx-auto" style={{ fontSize: '1.125rem' }}>
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
