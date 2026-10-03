'use client';

import { useEffect, useRef, ElementType, ComponentPropsWithoutRef, ReactNode } from 'react';

type Variant = 'up' | 'left' | 'right' | 'scale' | 'none';

interface FadeInProps {
  children: ReactNode;
  /** ms delay before animation starts */
  delay?: number;
  /** entrance direction */
  variant?: Variant;
  className?: string;
  style?: React.CSSProperties;
  /** render as a different HTML element */
  as?: ElementType;
  /** fraction of element visible before triggering (0–1) */
  amount?: number;
}

/**
 * Lightweight scroll-reveal wrapper using IntersectionObserver + CSS transitions.
 * Zero dependency on Framer Motion. Works with SSR — server renders children
 * fully visible; animation only applies after JS hydrates on the client.
 *
 * Usage:
 *   <FadeIn variant="up" delay={100}>
 *     <h2>Title</h2>
 *   </FadeIn>
 */
export default function FadeIn({
  children,
  delay = 0,
  variant = 'up',
  className = '',
  style,
  as: Tag = 'div',
  amount = 0.12,
}: FadeInProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If user prefers reduced motion, reveal immediately — no animation
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.setAttribute('data-visible', '');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute('data-visible', '');
          observer.disconnect();
        }
      },
      { threshold: amount }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [amount]);

  return (
    <Tag
      ref={ref as any}
      data-animate={variant}
      className={className}
      style={delay ? { transitionDelay: `${delay}ms`, ...style } : style}
    >
      {children}
    </Tag>
  );
}
