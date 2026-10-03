import Icon from '@/components/shared/Icon';
import { MetricsBlockData } from '@/types/cms';
import FadeIn from '@/components/shared/FadeIn';

interface MetricsModuleProps {
  id?: string;
  data: MetricsBlockData;
  settings?: {
    theme?: 'light' | 'dark';
  };
}

export default function MetricsModule({ id, data, settings }: MetricsModuleProps) {
  const { title, subtitle, items } = data;
  const isDark = settings?.theme === 'dark';

  return (
    <section
      id={id}
      className={`py-12 transition-colors ${
        isDark
          ? 'bg-gradient-to-b from-[var(--dark-surface)] to-[var(--midnight-navy)] text-white'
          : 'bg-white text-[var(--midnight-navy)]'
      }`}
    >
      <div className="section-container">
        {/* Render Title/Subtitle if provided (Initiatives Page style) */}
        {title && (
          <FadeIn className="text-center mb-16">
            <h2
              className="mb-4"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className={`${isDark ? 'text-white/80' : 'text-[var(--midnight-navy)]/70'} max-w-3xl mx-auto`}
                style={{ fontSize: '1.125rem' }}
              >
                {subtitle}
              </p>
            )}
          </FadeIn>
        )}

        {/* Stat Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {(items || []).filter(item => !item.hidden).map((item, index) => (
            <FadeIn
              key={index}
              delay={Math.min(index * 60, 300)}
              className={`text-center transition-all ${
                isDark
                  ? 'bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-white/20 hover:border-[#f9c53c] hover:bg-white/10 transition-all'
                  : 'group cursor-pointer'
              }`}
            >
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-transform ${
                  isDark
                    ? 'bg-white/10 text-white'
                    : 'bg-gradient-to-br from-[var(--royal-blue)]/10 to-[var(--secondary)]/10 text-[var(--royal-blue)] group-hover:scale-110'
                }`}
              >
                <Icon
                  name={item.icon}
                  className={isDark ? 'text-white' : 'text-[var(--royal-blue)]'}
                  size={28}
                />
              </div>

              <div
                className="mb-2"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '2.5rem',
                  color: isDark ? '#ffffff' : 'var(--midnight-navy)',
                }}
              >
                {item.value}
              </div>

              <div className={`mb-1 font-semibold text-sm ${isDark ? 'text-white/95' : 'text-[var(--midnight-navy)]'}`}>
                {item.label}
              </div>

              <div className={`text-xs ${isDark ? 'text-[var(--secondary)]' : 'text-slate-500'}`}>
                {item.description}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
