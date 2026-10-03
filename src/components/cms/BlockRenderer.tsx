import React from 'react';
import { getSectionComponent } from '@/lib/cms/section-registry';
import { CMSBlock } from '@/types/cms';

interface BlockRendererProps {
  sections: CMSBlock[];
}

export default function BlockRenderer({ sections }: BlockRendererProps) {
  if (!sections || sections.length === 0) return null;

  const visibleSections = sections.filter((s) => !s.hidden);

  return (
    <>
      {visibleSections.map((section, idx) => {
        const Component = getSectionComponent(section.type);
        if (!Component) {
          console.warn(`[BlockRenderer] Section type "${section.type}" is not registered.`);
          return null;
        }

        return (
          <React.Fragment key={section.id}>
            {idx > 0 && (
              <div className="w-full h-[1px] bg-[var(--border)] opacity-20" />
            )}
            <Component id={section.id} data={section.data} settings={section.settings} />
          </React.Fragment>
        );
      })}
    </>
  );
}
