import { Quote } from 'lucide-react';

export default function LeadershipStatement() {
  return (
    <section className="py-24 bg-[var(--warm-white)]">
      <div className="section-container">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[var(--champagne-gold)] to-[var(--royal-blue)] rounded-full mb-8">
            <Quote className="text-white" size={36} />
          </div>

          <h2 className="mb-8" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--midnight-navy)',
            lineHeight: '1.2'
          }}>
            Leadership Philosophy
          </h2>

          <blockquote className="mb-8" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
            fontStyle: 'italic',
            color: 'var(--royal-blue)',
            lineHeight: '1.6'
          }}>
            "True educational leadership lies not in preserving the status quo,
            but in courageously reimagining what higher education can achieve
            when innovation, industry collaboration, and student empowerment converge."
          </blockquote>

          <div className="w-24 h-1 bg-[var(--champagne-gold)] mx-auto mb-6" />

          <p className="text-[var(--midnight-navy)]/80 leading-relaxed max-w-3xl mx-auto" style={{ fontSize: '1.125rem' }}>
            With over 15 years as Vice Chancellor, Dr. Sharma has championed a vision of
            education that transcends traditional boundaries—creating institutions where
            academic excellence meets real-world impact, where research drives entrepreneurship,
            and where every student is equipped to lead the future.
          </p>
        </div>
      </div>
    </section>
  );
}
