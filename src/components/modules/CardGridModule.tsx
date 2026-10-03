'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Target, Quote, Star, CheckCircle2, BookOpen, Play, Newspaper, ChevronRight } from 'lucide-react';
import FadeIn from '@/components/shared/FadeIn';
import Icon from '@/components/shared/Icon';
import { CardGridBlockData, CardItem } from '@/types/cms';

interface ParsedDescription {
  topic?: string;
  partner?: string;
  body: string;
}

function parseCardDescription(text: string): ParsedDescription {
  if (!text) return { body: '' };

  const partnerRegex = /(?:\r?\n)?(?:Industry Partner|Partner):\s*([^.\n\r]+)(?:\.|\r?\n|$)/i;
  const match = text.match(partnerRegex);

  if (match) {
    const partnerText = match[1].trim();
    const parts = text.split(match[0]);
    
    let topic = parts[0]?.trim() || '';
    if (topic.endsWith('.')) {
      topic = topic.slice(0, -1).trim();
    }
    
    let body = parts[1]?.trim() || '';
    
    return {
      topic: topic || undefined,
      partner: partnerText,
      body: body
    };
  }

  return { body: text };
}

const getCardContainerClasses = (style: string, dark: boolean) => {
  switch (style) {
    case 'glass':
      return dark
        ? 'bg-white/5 backdrop-blur-md border border-white/10 text-white'
        : 'bg-white/80 backdrop-blur-md border border-slate-200 text-[var(--midnight-navy)]';
    case 'glow':
      return dark
        ? 'bg-[var(--midnight-navy)]/60 border border-white/10 text-white'
        : 'bg-white border border-slate-200 text-[var(--midnight-navy)]';
    case 'editorial':
      return dark
        ? 'bg-transparent text-white border-l-2 border-l-[#f9c53c] pl-6 py-4'
        : 'bg-transparent text-[#1E293B] border-l-2 border-l-[#f9c53c] pl-6 py-4';
    case 'standard':
    default:
      return dark
        ? 'bg-white/5 border border-white/10 text-white'
        : 'bg-white border border-slate-200 text-[var(--ink,#0D1B2E)]';
  }
};

interface CardWrapperProps {
  index: number;
  cardStyle: string;
  isDark: boolean;
  className?: string;
  padding?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const CardWrapper = ({ index, cardStyle, isDark, className = '', padding = 'p-8', onClick, children }: CardWrapperProps) => {
  const containerClasses = getCardContainerClasses(cardStyle, isDark);
  
  return (
    <div
      onClick={onClick}
      className={`h-full flex flex-col rounded-2xl relative overflow-hidden ${containerClasses} ${padding} ${className}`}
    >
      {/* Actual Card Content */}
      <div className="relative z-10 flex flex-col h-full w-full">
        {children}
      </div>
    </div>
  );
};

interface CardGridModuleProps {
  id?: string;
  data: CardGridBlockData;
}

export default function CardGridModule({ id, data }: CardGridModuleProps) {
  const {
    title,
    subtitle,
    category,
    categoryIcon,
    cardType = 'standard',
    columns = 3,
    isDark = false,
    viewAllLink,
    items,
    cardStyle = 'standard'
  } = data;

  const visibleItems = (items || []).filter(item => !item.hidden);
  const [visibleCount, setVisibleCount] = useState(cardType === 'award' ? 6 : visibleItems.length);

  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }[columns] || 'grid-cols-1 md:grid-cols-3';

  // Helper to render card icons with clean, elegant styling
  const renderIcon = (iconName: string) => {
    return (
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 bg-slate-50 border border-slate-200/80 text-[var(--navy,#0B2545)] shrink-0">
        <Icon name={iconName} size={18} />
      </div>
    );
  };

  // Sub-renderer for standard cards (e.g. Areas of Influence, Core Values, Contact Categories)
  const renderStandardCard = (item: CardItem, index: number) => {
    const parsed = parseCardDescription(item.description || '');

    return (
      <CardWrapper
        key={index}
        index={index}
        cardStyle={cardStyle}
        isDark={isDark}
      >
        {item.icon && renderIcon(item.icon)}

        {parsed.topic && (
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--royal-blue)] dark:text-[var(--champagne-gold)] mb-2.5">
            {parsed.topic}
          </div>
        )}

        <h3 className={`mb-3 ${
          cardStyle === 'editorial' 
            ? 'font-serif text-xl font-medium text-[var(--midnight-navy)] dark:text-white' 
            : 'font-sans text-lg font-semibold text-[var(--midnight-navy)] dark:text-white'
        } leading-snug`}>
          {item.title}
        </h3>

        {parsed.partner && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] text-[var(--midnight-navy)]/80 dark:text-white/80 mt-1 mb-3.5 w-fit">
            <span className="font-semibold text-[var(--royal-blue)] dark:text-[var(--champagne-gold)] uppercase tracking-wider text-[9px]">Partner:</span>
            <span className="font-medium">{parsed.partner}</span>
          </div>
        )}

        {parsed.body && (
          <p className={`leading-relaxed text-sm flex-1 ${
            isDark ? 'text-white/70' : 'text-slate-600'
          }`}>
            {parsed.body}
          </p>
        )}
      </CardWrapper>
    );
  };

  // Sub-renderer for pillar cards (e.g. Future of Education pillars on dark background)
  const renderPillarCard = (item: CardItem, index: number) => {
    return (
      <CardWrapper
        key={index}
        index={index}
        cardStyle={cardStyle}
        isDark={isDark}
      >
        {item.icon && renderIcon(item.icon)}
        
        <h3
          className={`mb-4 ${
            cardStyle === 'editorial' ? 'font-serif text-2xl font-medium' : 'font-sans text-xl font-semibold'
          }`}
          style={{
            color: isDark ? '#ffffff' : 'var(--midnight-navy)'
          }}
        >
          {item.title}
        </h3>
        
        {item.description && (
          <p className={`mb-6 leading-relaxed text-sm ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
            {item.description}
          </p>
        )}
        
        {item.highlights && item.highlights.length > 0 && (
          <ul className="space-y-2.5 mt-auto pt-4 border-t border-slate-100 dark:border-white/10">
            {item.highlights.map((h, idx) => (
              <li key={idx} className={`flex items-start text-sm ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
                <div className="w-1.5 h-1.5 bg-[var(--secondary)] transform rotate-45 mt-2 mr-3 flex-shrink-0" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}
      </CardWrapper>
    );
  };

  // Sub-renderer for initiative cards (e.g. Featured Initiatives, Initiatives Grid)
  const renderInitiativeCard = (item: CardItem, index: number) => {
    return (
      <CardWrapper
        key={index}
        index={index}
        cardStyle={cardStyle}
        isDark={isDark}
        padding="p-0"
      >
        <div className="p-8 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-4 text-xs font-semibold tracking-wider uppercase">
            {item.category && (
              <span className="text-slate-600 px-3 py-1 bg-slate-100 rounded-full">
                {item.category}
              </span>
            )}
            {item.status && (
              <span className="text-[var(--royal-blue)] dark:text-white/80 flex items-center">
                <Target size={14} className="mr-1.5" />
                {item.status}
              </span>
            )}
          </div>
          
          <h3 className={`mb-3 ${
            cardStyle === 'editorial' ? 'font-serif text-xl font-medium' : 'font-sans text-lg font-semibold'
          } text-[var(--midnight-navy)] dark:text-white`}>
            {item.title}
          </h3>
          
          {item.description && (
            <p className="text-slate-600 dark:text-white/70 mb-5 leading-relaxed text-sm flex-1">
              {item.description}
            </p>
          )}
          
          {item.impact && (
            <div className="pt-4 border-t border-slate-100 dark:border-white/10 text-xs font-bold mt-auto text-slate-700 dark:text-slate-300 tracking-wider uppercase flex items-center justify-between">
              <span>{item.impact}</span>
              <ArrowRight size={14} />
            </div>
          )}
        </div>
      </CardWrapper>
    );
  };

  // Sub-renderer for award cards
  const renderAwardCard = (item: CardItem, index: number) => {
    return (
      <CardWrapper
        key={index}
        index={index}
        cardStyle={cardStyle}
        isDark={isDark}
        padding="p-6"
      >
        <div className="flex items-start gap-5">
          {item.icon && (
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-center text-[var(--navy,#0B2545)]">
                <Icon name={item.icon} size={18} />
              </div>
            </div>
          )}
          <div className="flex-1 min-w-0">
            {item.year && (
              <div className="text-slate-500 font-serif font-semibold mb-1 text-xs tracking-wider uppercase">
                {item.year}
              </div>
            )}
            <h3 className={`mb-1 ${
              cardStyle === 'editorial' ? 'font-serif text-base font-medium' : 'font-sans text-sm font-semibold'
            } text-[var(--midnight-navy)] dark:text-white`}>
              {item.title}
            </h3>
            {item.description && (
              <p className="text-slate-600 dark:text-white/65 text-xs leading-relaxed">
                {item.description}
              </p>
            )}
          </div>
        </div>
      </CardWrapper>
    );
  };

  // Sub-renderer for academic blocks (e.g. Awardees & Attendees Corner, Degree Programs)
  const renderAcademicCard = (item: CardItem, index: number) => {
    return (
      <div
        key={index}
        className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 h-full flex flex-col justify-between"
      >
        <div>
          {/* Top Row: Clean Simple Icon */}
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[var(--navy,#0B2545)] mb-4 shrink-0">
            <Icon name={item.icon || 'GraduationCap'} size={18} />
          </div>

          {/* Title */}
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[var(--navy,#0B2545)] mb-2.5 leading-snug">
            {item.title}
          </h3>

          {/* Subtitle / Description */}
          {item.subtitle && (
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
              {item.subtitle}
            </div>
          )}
          {item.description && (
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              {item.description}
            </p>
          )}
        </div>

        {/* Highlights / Bullet points */}
        {item.highlights && item.highlights.length > 0 && (
          <div className="pt-4 border-t border-slate-100 mt-auto">
            <ul className="space-y-2">
              {item.highlights.map((highlight, hIdx) => (
                <li key={hIdx} className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span className="truncate" title={highlight}>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Sub-renderer for collaboration model (Industry + Academia)
  const renderCollaborationCard = (item: CardItem, index: number) => {
    const isMiddle = index === 1;
    return (
      <div
        key={index}
        className="relative p-8 text-center rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border hover:shadow-xl hover:-translate-y-1.5"
        style={{
          background: isMiddle ? 'linear-gradient(135deg, var(--royal-blue), var(--secondary))' : 'rgba(255,255,255,1)',
          borderColor: isMiddle ? 'transparent' : 'rgba(21,86,178,0.1)'
        }}
      >
        <div
          className="text-5xl font-bold mb-4 font-mono select-none"
          style={{
            color: isMiddle ? 'rgba(255,255,255,0.2)' : 'rgba(21,86,178,0.1)',
            lineHeight: 1
          }}
        >
          {item.year || String(index + 1).padStart(2, '0')}
        </div>
        
        {item.icon && (
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              isMiddle ? 'bg-white/10' : 'bg-[var(--royal-blue)]/5'
            }`}
          >
            <Icon
              name={item.icon}
              className={isMiddle ? 'text-white' : 'text-[var(--royal-blue)]'}
              size={22}
            />
          </div>
        )}

        <h3
          className="text-xl font-bold mb-4"
          style={{ color: isMiddle ? '#fff' : 'var(--midnight-navy)' }}
        >
          {item.title}
        </h3>
        
        {item.description && (
          <p
            className="text-sm leading-relaxed"
            style={{ color: isMiddle ? 'rgba(255,255,255,0.8)' : 'rgba(15,23,42,0.7)' }}
          >
            {item.description}
          </p>
        )}
      </div>
    );
  };

  // Sub-renderer for testimonials (floating quote badge style)
  const renderTestimonialCard = (item: CardItem, index: number) => {
    return (
      <CardWrapper
        key={index}
        index={index}
        cardStyle={cardStyle}
        isDark={isDark}
        padding="p-7"
        className="cursor-default"
      >
        {/* Large decorative quote mark */}
        <div
          className="absolute top-5 right-6 text-[80px] leading-none font-serif pointer-events-none select-none"
          style={{ color: 'var(--gold-pale, #FDF3D7)', fontFamily: 'Georgia, serif' }}
          aria-hidden
        >
          &ldquo;
        </div>

        {/* Stars */}
        {item.rating && (
          <div className="flex gap-0.5 mb-4">
            {[...Array(item.rating)].map((_, i) => (
              <Star key={i} size={14} style={{ color: '#f9c53c', fill: '#f9c53c' }} />
            ))}
          </div>
        )}

        {item.description && (
          <p className="text-[var(--ink,#0D1B2E)]/70 mb-6 leading-relaxed italic text-sm flex-1 relative z-10">
            &ldquo;{item.description}&rdquo;
          </p>
        )}

        <div className="pt-4 border-t border-[var(--fog,#DDE4EE)] mt-auto">
          <div className="text-[var(--ink,#0D1B2E)] font-semibold text-sm">
            {item.title}
          </div>
          {item.subtitle && (
            <div className="text-[var(--slate-text,#3D5A80)] dark:text-white/60 text-xs mt-0.5 font-medium">
              {item.subtitle}
            </div>
          )}
        </div>
      </CardWrapper>
    );
  };

  // Sub-renderer for roadmap phase cards (dark backgrounds)
  const renderRoadmapCard = (item: CardItem, index: number) => {
    return (
      <CardWrapper
        key={index}
        index={index}
        cardStyle={cardStyle}
        isDark={isDark}
      >
        {item.year && (
          <div className="text-[#f9c53c] mb-4 font-serif font-bold text-lg tracking-wide">
            {item.year}
          </div>
        )}
        <h3 className={`mb-6 text-white dark:text-white transition-colors ${
          cardStyle === 'editorial' ? 'font-serif text-2xl font-medium' : 'font-sans text-xl font-semibold'
        }`}>
          {item.title}
        </h3>
        {item.highlights && item.highlights.length > 0 && (
          <ul className="space-y-4 flex-1">
            {item.highlights.map((h, idx) => (
              <li key={idx} className="flex items-start gap-3 text-white/80 dark:text-white/80 text-sm">
                <ArrowRight className="text-[#f9c53c] flex-shrink-0 mt-0.5 group-hover:translate-x-1 transition-transform" size={16} />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}
      </CardWrapper>
    );
  };

  // Sub-renderer for institution building checklist cards
  const renderAchievementCard = (item: CardItem, index: number) => {
    return (
      <CardWrapper
        key={index}
        index={index}
        cardStyle={cardStyle}
        isDark={isDark}
      >
        <h3 className={`mb-6 text-[var(--midnight-navy)] dark:text-white transition-colors ${
          cardStyle === 'editorial' ? 'font-serif text-2xl font-medium' : 'font-sans text-xl font-semibold'
        }`}>
          {item.title}
        </h3>
        {item.highlights && item.highlights.length > 0 && (
          <ul className="space-y-4 text-sm flex-1">
            {item.highlights.map((h, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--secondary)]/10 dark:bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-[var(--secondary)]/30 group-hover:bg-[var(--secondary)] group-hover:text-white transition-colors">
                  <CheckCircle2 className="text-[var(--secondary)] group-hover:text-white" size={14} />
                </div>
                <span className="text-[#1E293B]/75 dark:text-white/75 leading-relaxed">{h}</span>
              </li>
            ))}
          </ul>
        )}
      </CardWrapper>
    );
  };

  // Sub-renderer for Thought Leadership publications
  const renderThoughtLeadershipCard = (item: CardItem, index: number) => {
    return (
      <CardWrapper
        key={index}
        index={index}
        cardStyle={cardStyle}
        isDark={isDark}
        padding="p-0"
        className="h-full flex flex-col"
      >
        {cardStyle !== 'editorial' && (
          <div className="h-36 bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] flex items-center justify-center flex-shrink-0 border-b border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_1px,transparent_0)] bg-[size:16px_16px] pointer-events-none" />
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(21,177,216,0.3)] transition-all duration-300">
              <BookOpen size={24} className="text-[var(--secondary)]" />
            </div>
          </div>
        )}

        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-4 text-xs font-semibold">
            {item.category && (
              <span className="text-[var(--secondary)] px-3 py-1 bg-[var(--secondary)]/10 rounded-full tracking-wider uppercase text-[10px]">
                {item.category}
              </span>
            )}
            {item.year && (
              <span className="text-slate-400 dark:text-white/55 tracking-wider font-mono">
                {item.year}
              </span>
            )}
          </div>

          <h3 className={`mb-3 text-[#1E293B] dark:text-white group-hover:text-[var(--royal-blue)] dark:group-hover:text-[var(--secondary)] transition-colors line-clamp-2 ${
            cardStyle === 'editorial' ? 'font-serif text-xl font-medium' : 'font-sans text-base font-semibold leading-snug'
          }`}>
            {item.title}
          </h3>

          {item.description && (
            <p className="text-slate-500 dark:text-white/65 mb-5 leading-relaxed text-sm line-clamp-3 flex-1">
              {item.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/10 text-xs mt-auto">
            {item.subtitle && (
              <span className="text-slate-450 dark:text-white/55 font-medium truncate max-w-[55%] text-[11px]" title={item.subtitle}>
                {item.subtitle}
              </span>
            )}
            <button className="text-[var(--royal-blue)] dark:text-[var(--secondary)] flex items-center space-x-1 group-hover:text-[var(--secondary)] dark:group-hover:text-white transition-colors font-semibold tracking-wider uppercase text-[10px] whitespace-nowrap">
              <span>Read More</span>
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </CardWrapper>
    );
  };

  // Sub-renderer for Media Highlights appearances
  const renderMediaHighlightCard = (item: CardItem, index: number) => {
    const isVideo = item.category === 'video';
    return (
      <CardWrapper
        key={index}
        index={index}
        cardStyle={cardStyle}
        isDark={isDark}
        padding="p-0"
        className="h-full flex flex-col"
      >
        {cardStyle !== 'editorial' && (
          <div className="aspect-video bg-gradient-to-br from-[var(--royal-blue)] to-[var(--midnight-navy)] flex items-center justify-center relative flex-shrink-0 border-b border-white/5 overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_1px,transparent_0)] bg-[size:16px_16px] pointer-events-none" />
            {isVideo ? (
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300">
                <Play size={22} className="text-white ml-1" fill="white" />
              </div>
            ) : (
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(21,177,216,0.3)] transition-all duration-300">
                <Newspaper size={26} className="text-[var(--secondary)]" />
              </div>
            )}
          </div>
        )}

        <div className="p-6 flex flex-col flex-1">
          <h3 className={`mb-3 text-[#1E293B] dark:text-white group-hover:text-[var(--royal-blue)] dark:group-hover:text-[var(--secondary)] transition-colors line-clamp-2 ${
            cardStyle === 'editorial' ? 'font-serif text-lg font-medium' : 'font-sans text-sm font-semibold leading-snug'
          }`}>
            {item.title}
          </h3>
          {item.description && (
            <p className="text-slate-500 dark:text-white/65 text-xs mt-auto font-medium">
              {item.description}
            </p>
          )}
        </div>
      </CardWrapper>
    );
  };

  // Sub-renderer for past guests & dignitaries
  const renderGuestCard = (item: CardItem, index: number) => {
    return (
      <div
        key={index}
        className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 h-full flex flex-col justify-between hover:border-amber-400 hover:shadow-xl transition-all duration-300 group relative"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-3.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300/60 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {item.category || 'Chief Guest'}
            </span>
            {item.year && (
              <span className="text-[11px] font-bold text-slate-500 font-mono shrink-0">
                {item.year}
              </span>
            )}
          </div>

          <h3 className="font-serif text-lg sm:text-xl font-bold text-[var(--navy,#0B2545)] mb-1 group-hover:text-amber-600 transition-colors">
            {item.title}
          </h3>

          {item.subtitle && (
            <div className="text-xs font-semibold text-slate-500 mb-3 leading-snug">
              {item.subtitle}
            </div>
          )}

          {item.description && (
            <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-100">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-700/80 mb-1">
                Guest(s) of Honour / Special Dignitaries
              </span>
              <span className="text-slate-700 font-medium">
                {item.description}
              </span>
            </div>
          )}
        </div>

        <div className="pt-3.5 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Ganpat University</span>
          <span className="text-amber-600">Convocation Record</span>
        </div>
      </div>
    );
  };

  const cardRendererMap: Record<string, (item: CardItem, index: number) => React.ReactNode> = {
    standard: renderStandardCard,
    pillar: renderPillarCard,
    initiative: renderInitiativeCard,
    award: renderAwardCard,
    academic: renderAcademicCard,
    testimonial: renderTestimonialCard,
    guest: renderGuestCard,
    guest_marquee: renderGuestCard,
    roadmap: renderRoadmapCard,
    achievement: renderAchievementCard,
    thought_leadership: renderThoughtLeadershipCard,
    media_highlight: renderMediaHighlightCard,
    collaboration_model: renderCollaborationCard
  };

  const renderer = cardRendererMap[cardType] || renderStandardCard;

  if (cardType === 'research_table') {
    return (
      <section
        id={id}
        className={`py-24 relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-b from-[var(--dark-surface)] to-[var(--midnight-navy)] text-white'
            : 'bg-[var(--warm-white)] text-[var(--midnight-navy)]'
        }`}
      >
        <div className="section-container relative z-10">
          {/* Header */}
          <FadeIn
            variant="up"
            delay={0}
            className="text-center flex flex-col items-center justify-center mb-12 max-w-3xl mx-auto"
          >
            {category && (
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-4 ${
                isDark ? 'bg-white/20' : 'bg-[var(--royal-blue)]/10'
              }`}>
                {categoryIcon && <Icon name={categoryIcon} className={isDark ? 'text-white' : 'text-[var(--royal-blue)]'} size={18} />}
                <span className={isDark ? 'text-white/90' : 'text-[var(--royal-blue)] font-medium'}>{category}</span>
              </div>
            )}
            <h2
              className="mb-3 font-semibold text-center"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: isDark ? '#ffffff' : 'var(--midnight-navy)',
                lineHeight: '1.2'
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className={`text-center ${isDark ? 'text-white/80' : 'text-[var(--midnight-navy)]/70'}`} style={{ fontSize: '1.125rem' }}>
                {subtitle}
              </p>
            )}
          </FadeIn>

          {/* Table Container */}
          <FadeIn
            variant="up"
            delay={0}
            className="bg-white dark:bg-[var(--dark-surface)] rounded-2xl overflow-hidden border border-[var(--royal-blue)]/10 dark:border-white/10 shadow-lg"
          >
            <div
              className="grid grid-cols-1 md:grid-cols-2 px-8 py-4 text-xs font-bold uppercase tracking-wider text-white"
              style={{ background: 'linear-gradient(135deg, var(--royal-blue), var(--secondary))' }}
            >
              <div>Research Domain</div>
              <div className="hidden md:block">Proposed Research Areas</div>
            </div>
            {visibleItems.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-2 px-8 py-6 gap-4 md:gap-0"
                style={{ borderTop: idx > 0 ? '1px solid rgba(21,86,178,0.08)' : 'none' }}
              >
                <div className="flex items-start gap-4 pr-8">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: idx % 2 === 0 ? 'rgba(21,86,178,0.1)' : 'rgba(21,177,216,0.1)'
                    }}
                  >
                    <Icon
                      name={item.icon || 'FlaskConical'}
                      size={18}
                      className={idx % 2 === 0 ? 'text-[var(--royal-blue)]' : 'text-[var(--secondary)]'}
                    />
                  </div>
                  <span className="text-base font-semibold pt-1.5 text-[var(--midnight-navy)] dark:text-white">
                    {item.title}
                  </span>
                </div>
                <div>
                  <div className="block md:hidden text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Proposed Research Areas</div>
                  <ul className="space-y-2.5">
                    {(item.highlights || []).map((highlight, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2.5 text-sm text-slate-500 dark:text-white/70">
                        <ChevronRight
                          size={14}
                          className="shrink-0 mt-1"
                          style={{
                            color: idx % 2 === 0 ? 'var(--royal-blue)' : 'var(--secondary)'
                          }}
                        />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </FadeIn>
        </div>
      </section>
    );
  }

  const marqueeItems = useMemo(() => {
    if (!visibleItems || visibleItems.length === 0) return [];
    let base = [...visibleItems];
    while (base.length < 6) {
      base = [...base, ...visibleItems];
    }
    return [...base, ...base];
  }, [visibleItems]);

  const guestsDuration = useMemo(() => {
    const halfCount = marqueeItems.length / 2;
    return `${Math.max(140, Math.round(halfCount * 8.5))}s`;
  }, [marqueeItems]);

  const testimonialsDuration = useMemo(() => {
    const halfCount = marqueeItems.length / 2;
    return `${Math.max(95, Math.round(halfCount * 12))}s`;
  }, [marqueeItems]);

  return (
    <section
      id={id}
      className={`py-16 md:py-20 relative overflow-hidden ${
        isDark
          ? 'bg-gradient-to-b from-[var(--dark-surface)] to-[var(--midnight-navy)] text-white'
          : cardType === 'testimonial'
          ? 'text-[var(--ink,#0D1B2E)]'
          : 'text-[var(--ink,#0D1B2E)]'
      }`}
      style={!isDark ? {
        background: cardType === 'testimonial' ? 'var(--cream, #F7F3EA)' : 'var(--parchment, #FEFCF8)'
      } : undefined}
    >
      {isDark && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
      )}

      <div className="section-container relative z-10">
        <FadeIn
          variant="up"
          delay={0}
          className="text-center flex flex-col items-center justify-center mb-10 max-w-3xl mx-auto"
        >
          {category && (
            <div
              className="inline-flex items-center px-3 py-1.5 rounded-full mb-4 text-[10px] font-bold uppercase tracking-[0.2em]"
              style={isDark
                ? { background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)' }
                : { background: 'rgba(249, 197, 60, 0.15)', color: '#8C6514', border: '1px solid rgba(249, 197, 60, 0.3)' }
              }
            >
              {category}
            </div>
          )}
          <h2
            className="mb-3 font-bold text-center"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
              color: isDark ? '#ffffff' : 'var(--ink,#0D1B2E)',
              lineHeight: '1.2'
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className="text-center max-w-2xl mx-auto"
              style={{ fontSize: '1rem', color: isDark ? 'rgba(255,255,255,0.7)' : 'var(--slate-text,#3D5A80)' }}
            >
              {subtitle}
            </p>
          )}
        </FadeIn>

        {/* Past Convocation Guests Gentle Marquee (Right-to-Left / Forward) */}
        {(cardType === 'guest_marquee' || cardType === 'guest') ? (
          <div className="relative w-full overflow-hidden py-4 -mx-4 sm:-mx-8">
            <style>{`
              @keyframes marquee-forward {
                0% { transform: translate3d(0%, 0, 0); }
                100% { transform: translate3d(-50%, 0, 0); }
              }
              .animate-guests-marquee {
                display: flex;
                width: max-content;
                animation: marquee-forward ${guestsDuration} linear infinite;
                will-change: transform;
                backface-visibility: hidden;
              }
              .animate-guests-marquee:hover {
                animation-play-state: paused;
              }
            `}</style>

            {/* Edge Blur Gradients */}
            <div
              className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 z-20 pointer-events-none"
              style={{ background: isDark ? 'linear-gradient(to right, #0F172A, transparent)' : 'linear-gradient(to right, var(--parchment, #FEFCF8), transparent)' }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 z-20 pointer-events-none"
              style={{ background: isDark ? 'linear-gradient(to left, #0F172A, transparent)' : 'linear-gradient(to left, var(--parchment, #FEFCF8), transparent)' }}
            />

            {/* Marquee Track Moving Right-to-Left (Forward) */}
            <div className="animate-guests-marquee flex gap-6 items-stretch">
              {marqueeItems.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="w-[320px] sm:w-[380px] shrink-0 flex flex-col"
                >
                  {renderer(item, index)}
                </div>
              ))}
            </div>
          </div>
        ) : cardType === 'testimonial' ? (
          /* Testimonials Gentle Marquee (Left-to-Right, opposite direction!) */
          <div className="relative w-full overflow-hidden py-4 -mx-4 sm:-mx-8">
            <style>{`
              @keyframes marquee-reverse {
                0% { transform: translate3d(-50%, 0, 0); }
                100% { transform: translate3d(0%, 0, 0); }
              }
              .animate-testimonials-marquee {
                display: flex;
                width: max-content;
                animation: marquee-reverse ${testimonialsDuration} linear infinite;
                will-change: transform;
                backface-visibility: hidden;
              }
              .animate-testimonials-marquee:hover {
                animation-play-state: paused;
              }
            `}</style>

            {/* Edge Blur Gradients */}
            <div
              className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 z-20 pointer-events-none"
              style={{ background: isDark ? 'linear-gradient(to right, #0F172A, transparent)' : 'linear-gradient(to right, var(--cream, #F7F3EA), transparent)' }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 z-20 pointer-events-none"
              style={{ background: isDark ? 'linear-gradient(to left, #0F172A, transparent)' : 'linear-gradient(to left, var(--cream, #F7F3EA), transparent)' }}
            />

            {/* Marquee Track Moving Left-to-Right */}
            <div className="animate-testimonials-marquee flex gap-6 items-stretch">
              {marqueeItems.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="w-[340px] sm:w-[400px] shrink-0 flex flex-col"
                >
                  {renderer(item, index)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Dynamic Standard Card Grid Container */
          <div className={(cardType === 'academic' && (columns || 1) === 1) ? 'space-y-6 max-w-4xl mx-auto' : `grid ${gridColsClass} gap-6 items-stretch`}>
            {visibleItems.slice(0, visibleCount).map((item, index) => (
              <FadeIn
                key={index}
                variant="up"
                delay={Math.min(index * 60, 300)}
                className="h-full flex flex-col"
              >
                {renderer(item, index)}
              </FadeIn>
            ))}
          </div>
        )}

        {cardType !== 'testimonial' && visibleItems.length > visibleCount && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setVisibleCount((prev) => Math.min(prev + 6, visibleItems.length))}
              className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl border font-bold text-sm transition-all hover:scale-105 active:scale-95 ${
                isDark 
                  ? 'border-white/20 hover:border-[#f9c53c] bg-white/5 hover:bg-white/10 text-white' 
                  : 'border-[var(--royal-blue)]/30 hover:border-[#f9c53c] bg-white hover:bg-[#f9c53c]/10 text-[var(--midnight-navy)]'
              }`}
            >
              <span>Load More Awards ({visibleItems.length - visibleCount} remaining)</span>
            </button>
          </div>
        )}

        {viewAllLink && (
          <div className="mt-12 text-center">
            <Link
              href={viewAllLink.url}
              className={`inline-flex items-center space-x-2 transition-colors group font-semibold text-sm ${
                isDark ? 'text-[var(--secondary)] hover:text-white' : 'text-[var(--royal-blue)] hover:text-[var(--secondary)]'
              }`}
            >
              <span>{viewAllLink.label}</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
