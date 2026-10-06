import FadeIn from '@/components/shared/FadeIn';
import { CustomBlockData } from '@/types/cms';
import { optimizeHtmlImages } from '@/lib/cms/optimize-html-images';

interface CustomModuleProps {
  id?: string;
  data: CustomBlockData;
}

export default function CustomModule({ id, data }: CustomModuleProps) {
  const { title, subtitle, body, fullWidth = false, titleAlignment = 'center' } = data;

  const normalizedBody = (body || '').replace(/\r\n/g, '\n');
  
  // Resolve dynamic image placeholders (e.g. {{ Image 1 }})
  let processedBody = normalizedBody;
  if (data.images && typeof data.images === 'object') {
    Object.entries(data.images).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`{{\\s*${escapedKey}\\s*}}`, 'g');
        processedBody = processedBody.replace(regex, value);
      }
    });
  }

  const optimizedBody = optimizeHtmlImages(processedBody);

  const alignClass =
    titleAlignment === 'left'
      ? 'text-left'
      : titleAlignment === 'right'
      ? 'text-right'
      : 'text-center';

  const headerContent = (title || subtitle) && (
    <div className={`mb-8 ${alignClass}`}>
      {subtitle && (
        <div className="text-xs font-semibold tracking-widest uppercase mb-3 text-[var(--secondary)]">
          {subtitle}
        </div>
      )}
      {title && (
        <h2
          className="text-3xl md:text-4xl font-bold leading-tight text-[#1E293B]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {title}
        </h2>
      )}
    </div>
  );

  const content = (
    <div 
      suppressHydrationWarning={true}
      className="prose prose-slate max-w-none text-slate-700 leading-relaxed font-sans text-sm md:text-base
                 prose-headings:font-serif prose-headings:text-slate-900 prose-headings:mb-4 prose-headings:mt-6
                 prose-p:mb-4 prose-a:text-[var(--royal-blue)] prose-a:underline hover:prose-a:text-[var(--secondary)]
                 prose-ul:list-disc prose-ul:pl-5 prose-ul:mb-4
                 prose-ol:list-decimal prose-ol:pl-5 prose-ol:mb-4
                 prose-li:mb-1
                 prose-table:w-full prose-table:border-collapse prose-table:mb-6
                 prose-th:border prose-th:border-slate-200 prose-th:bg-slate-50 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:text-xs prose-th:font-semibold prose-th:text-slate-700
                 prose-td:border prose-td:border-slate-200 prose-td:px-3 prose-td:py-2 prose-td:text-xs md:prose-td:text-sm prose-td:text-slate-600"
      dangerouslySetInnerHTML={{ __html: optimizedBody }} 
    />
  );

  if (fullWidth) {
    return (
      <section id={id} className="w-full bg-white">
        <div className="w-full">
          {headerContent && (
            <div className="section-container pt-12 md:pt-16">
              {headerContent}
            </div>
          )}
          <div className="w-full">
            {content}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id={id} className="py-12 md:py-16 bg-white overflow-hidden">
      <div className="section-container">
        <FadeIn variant="up" delay={0}>
          {headerContent}
          {content}
        </FadeIn>
      </div>
    </section>
  );
}
