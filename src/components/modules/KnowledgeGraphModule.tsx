'use client';

import { useState, useMemo } from 'react';
import { 
  Search, 
  Network, 
  X, 
  Building2, 
  Users, 
  Compass, 
  Activity, 
  ChevronRight,
  Link2
} from 'lucide-react';
import { KnowledgeGraphBlockData } from '@/types/cms';

interface KnowledgeGraphModuleProps {
  id?: string;
  data: KnowledgeGraphBlockData;
}

function toTitleCase(str: string): string {
  return str
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getFriendlyCategory(group: string): string {
  switch (group) {
    case 'people': return 'Key Dignitary';
    case 'organizations': return 'Partner Organization';
    case 'centres': return 'Centre of Excellence';
    case 'initiatives': return 'Flagship Initiative';
    default: return toTitleCase(group);
  }
}

function getFriendlyRelationship(rel: string): string {
  const cleanRel = rel.toLowerCase();
  switch (cleanRel) {
    case 'industry_partner': return 'Industry Partner';
    case 'established_under': return 'Established Under';
    case 'holds_role': return 'Role';
    case 'belongs_to': return 'Affiliated With';
    case 'collaborates_with': return 'Collaborator';
    case 'associated_with': return 'Associated Entity';
    case 'tagged_with': return 'Related Theme';
    default: return toTitleCase(cleanRel.replace(/[-_]+/g, ' '));
  }
}

export default function KnowledgeGraphModule({ id, data }: KnowledgeGraphModuleProps) {
  const { title, subtitle, nodes = [], links = [] } = data;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);

  // Group colors mapping for icon accents
  const groupColors: Record<string, string> = {
    people: '#f9c53c',
    organizations: '#3b82f6', // Bright Blue
    centres: '#E25C5C',       // Coral Red
    initiatives: '#8b5cf6',   // Violet
  };

  const getGroupIcon = (group: string) => {
    switch (group) {
      case 'people': return <Users size={18} className="text-[#f9c53c]" />;
      case 'organizations': return <Building2 size={18} className="text-blue-400" />;
      case 'centres': return <Compass size={18} className="text-emerald-400" />;
      case 'initiatives': return <Activity size={18} className="text-purple-400" />;
      default: return <Link2 size={18} className="text-slate-400" />;
    }
  };

  // Calculate degrees (number of connections) for all nodes
  const nodeDegrees = useMemo(() => {
    const degrees: Record<string, number> = {};
    links.forEach(link => {
      const s = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const t = typeof link.target === 'string' ? link.target : (link.target as any).id;
      if (s) degrees[s] = (degrees[s] || 0) + 1;
      if (t) degrees[t] = (degrees[t] || 0) + 1;
    });
    return degrees;
  }, [links]);

  // Filter and sort nodes by degree (highest connectivity first)
  const processedNodes = useMemo(() => {
    return nodes
      .filter(node => ['people', 'organizations', 'centres', 'initiatives'].includes(node.group))
      .map(node => ({
        ...node,
        degree: nodeDegrees[node.id] || 0
      }))
      .sort((a, b) => b.degree - a.degree);
  }, [nodes, nodeDegrees]);

  // Filtered nodes list for displaying in the grid
  const filteredNodes = useMemo(() => {
    return processedNodes.filter(node => {
      const matchesCategory = selectedCategory === 'all' || node.group === selectedCategory;
      const matchesSearch = node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (node.details?.description && node.details.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [processedNodes, selectedCategory, searchQuery]);

  // Find currently selected node details
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return processedNodes.find(n => n.id === selectedNodeId) || null;
  }, [processedNodes, selectedNodeId]);

  // Compute connections of the selected node
  const selectedNodeConnections = useMemo(() => {
    if (!selectedNodeId) return [];
    return links
      .filter(link => {
        const s = typeof link.source === 'string' ? link.source : (link.source as any).id;
        const t = typeof link.target === 'string' ? link.target : (link.target as any).id;
        return s === selectedNodeId || t === selectedNodeId;
      })
      .map(link => {
        const s = typeof link.source === 'string' ? link.source : (link.source as any).id;
        const t = typeof link.target === 'string' ? link.target : (link.target as any).id;
        const partnerId = s === selectedNodeId ? t : s;
        const partnerNode = processedNodes.find(n => n.id === partnerId);
        return {
          nodeId: partnerId,
          label: partnerNode ? partnerNode.label : toTitleCase(partnerId.split('-').slice(1).join(' ')),
          group: partnerNode ? partnerNode.group : 'other',
          relationship: link.value
        };
      });
  }, [links, selectedNodeId, processedNodes]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setVisibleCount(12); // Reset pagination
  };

  return (
    <section id={id} className="py-16 bg-[var(--dark-surface)] text-white overflow-hidden border-t border-white/5 font-sans">
      {/* Self-contained keyframe styles for sliding drawer transitions */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to { opacity: 0.6; }
        }
        .animate-drawer-slide {
          animation: drawerSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-backdrop-fade {
          animation: backdropFadeIn 0.3s ease-out forwards;
        }
      `}} />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {title && (
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-2 text-white bg-gradient-to-r from-white via-[#f9c53c] to-slate-400 bg-clip-text text-transparent">
              {title}
            </h2>
            {subtitle && (
              <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Directory Search & Category Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          {/* Search bar */}
          <div className="w-full md:w-80 bg-[var(--midnight-navy)]/30 border border-white/10 rounded-xl flex items-center px-4 py-2.5 shadow-lg backdrop-blur-md">
            <Search size={16} className="text-slate-400 mr-2.5 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search people, centres, partners..."
              className="bg-transparent border-none text-white text-xs outline-none placeholder-slate-600 w-full font-sans"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white p-0.5">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'all', label: 'All Entities' },
              { id: 'centres', label: 'Centres of Excellence' },
              { id: 'organizations', label: 'Partners & Organizations' },
              { id: 'people', label: 'Key Dignitaries' },
              { id: 'initiatives', label: 'Flagship Initiatives' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide border transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[var(--royal-blue)]/40 text-[#f9c53c] border-[#f9c53c]/30 shadow-md'
                    : 'bg-transparent text-slate-400 border-transparent hover:border-white/5 hover:bg-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Card Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNodes.slice(0, visibleCount).map((node) => (
            <div
              key={node.id}
              onClick={() => setSelectedNodeId(node.id)}
              className="bg-[var(--midnight-navy)]/15 border border-white/5 hover:border-[#f9c53c]/30 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--midnight-navy)]/25 cursor-pointer shadow-xl group hover:shadow-[0_4px_25px_rgba(249,197,60,0.1)]"
            >
              <div>
                {/* Header: Icon & Category label */}
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 group-hover:border-[#f9c53c]/20 transition-colors">
                    {getGroupIcon(node.group)}
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-sans font-semibold">
                    {getFriendlyCategory(node.group)}
                  </span>
                </div>
 
                 {/* Card Title */}
                 <h4 className="text-sm font-bold font-serif mb-2 text-white tracking-tight group-hover:text-[#f9c53c] transition-colors leading-snug">
                   {node.label}
                 </h4>
 
                 {/* Card Description */}
                 <p className="text-xs text-slate-450 leading-relaxed line-clamp-3 mb-4 font-sans">
                   {node.details?.description || `Academic profile registered under Ganpat University Convocation network.`}
                 </p>
               </div>
 
               {/* Card Footer: Relationship summary */}
               <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-sans mt-auto">
                 <span className="flex items-center gap-1.5">
                   <Network size={12} className="text-[#f9c53c]/70" />
                   {node.degree} Connection{node.degree !== 1 && 's'}
                 </span>
                 <span className="text-[#f9c53c] group-hover:text-white transition-colors font-sans font-semibold flex items-center gap-1">
                   View Profile <ChevronRight size={10} />
                 </span>
               </div>
             </div>
           ))}
         </div>
 
         {/* Empty state */}
         {filteredNodes.length === 0 && (
           <div className="text-center py-20 bg-[var(--midnight-navy)]/5 border border-white/5 rounded-2xl">
             <Network size={40} className="text-slate-700 mx-auto mb-3 animate-pulse" />
             <h4 className="font-bold text-slate-300 text-sm mb-1">No Profiles Found</h4>
             <p className="text-slate-500 text-xs max-w-sm mx-auto">We couldn't find any profiles matching "{searchQuery}" under the selected category.</p>
           </div>
         )}
 
         {/* Load More Button */}
         {filteredNodes.length > visibleCount && (
           <div className="flex justify-center mt-12">
             <button
               onClick={() => setVisibleCount(prev => prev + 12)}
               className="px-8 py-3.5 bg-gradient-to-r from-[#e9a800] via-[#f9c53c] to-[#f59e0b] text-[#060f24] hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs font-bold tracking-wider rounded-xl cursor-pointer shadow-lg shadow-amber-500/25"
             >
               SHOW MORE PROFILES ({filteredNodes.length - visibleCount} REMAINING)
             </button>
           </div>
         )}

        {/* DETAILS SLIDING DRAWER BACKDROP & DRAWER */}
        {selectedNodeId && selectedNode && (
          <>
            {/* Dark Overlay backdrop */}
            <div
              onClick={() => setSelectedNodeId(null)}
              className="fixed inset-0 bg-black z-40 animate-backdrop-fade"
            />

            {/* Side Drawer Panel */}
            <div
              className="fixed right-0 top-0 bottom-0 w-full max-w-[460px] bg-[var(--dark-surface)] border-l border-white/10 z-50 shadow-2xl p-6 md:p-8 flex flex-col justify-between overflow-y-auto animate-drawer-slide"
            >
              <div>
                {/* Close button */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: groupColors[selectedNode.group] || '#fff' }} 
                    />
                    <span className="text-[9px] uppercase tracking-widest font-sans font-semibold text-slate-400">
                      {getFriendlyCategory(selectedNode.group)} Profile
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedNodeId(null)}
                    className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
 
                 {/* Node Title */}
                 <h3 className="text-2xl font-bold font-serif mb-4 text-white leading-tight tracking-tight">
                   {selectedNode.label}
                 </h3>
 
                 {/* Gold Divider */}
                 <div className="w-12 h-0.5 bg-[#f9c53c] mb-6" />

                 {/* Details metadata cards */}
                 {selectedNode.details && Object.keys(selectedNode.details).length > 0 ? (
                   <div className="space-y-5">
                     
                     {selectedNode.group === 'centres' && (
                       <div className="space-y-3.5 bg-white/5 p-5 rounded-xl border border-white/5 text-xs font-sans">
                         <div>
                           <strong className="text-slate-450 block mb-0.5 text-[9px] uppercase tracking-wider font-mono">Research Focus Area</strong>
                           <span className="text-white text-xs">{selectedNode.details.focusArea}</span>
                         </div>
                         {selectedNode.details.industryPartner && (
                           <div>
                             <strong className="text-slate-450 block mb-0.5 text-[9px] uppercase tracking-wider font-mono">Industry Collaborator</strong>
                             <span className="text-[#f9c53c] font-medium text-xs">{selectedNode.details.industryPartner}</span>
                           </div>
                         )}
                         {selectedNode.details.establishedYear && (
                           <div>
                             <strong className="text-slate-455 block mb-0.5 text-[9px] uppercase tracking-wider font-mono">Established</strong>
                             <span className="text-white text-xs">{selectedNode.details.establishedYear}</span>
                           </div>
                         )}
                         {selectedNode.details.description && (
                           <div className="pt-2 border-t border-white/5">
                             <p className="text-slate-350 leading-relaxed text-xs">{selectedNode.details.description}</p>
                           </div>
                         )}
                       </div>
                     )}

                     {selectedNode.group === 'people' && (
                       <div className="space-y-3.5 bg-white/5 p-5 rounded-xl border border-white/5 text-xs font-sans">
                         {selectedNode.details.roles && selectedNode.details.roles.length > 0 && (
                           <div>
                             <strong className="text-slate-450 block mb-2 text-[9px] uppercase tracking-wider font-mono">Roles Held</strong>
                             <div className="flex flex-col gap-1.5">
                               {selectedNode.details.roles.map((r: string, idx: number) => (
                                 <span key={idx} className="bg-slate-900 border border-white/5 px-3 py-2 rounded-lg text-slate-300 text-[10px] leading-relaxed">
                                   {toTitleCase(r.replace('role-', ''))}
                                 </span>
                               ))}
                             </div>
                           </div>
                         )}
                         {selectedNode.details.organization && (
                           <div className="pt-2 border-t border-white/5">
                             <strong className="text-slate-450 block mb-1 text-[9px] uppercase tracking-wider font-mono">Affiliations</strong>
                             <span className="text-white text-xs leading-relaxed">{selectedNode.details.organization}</span>
                           </div>
                         )}
                       </div>
                     )}

                     {selectedNode.group === 'organizations' && (
                       <div className="space-y-3.5 bg-white/5 p-5 rounded-xl border border-white/5 text-xs font-sans">
                         {selectedNode.details.type && (
                           <div>
                             <strong className="text-slate-450 block mb-0.5 text-[9px] uppercase tracking-wider font-mono">Type</strong>
                             <span className="text-white capitalize text-xs">{selectedNode.details.type}</span>
                           </div>
                         )}
                         {selectedNode.details.description && (
                           <div className="pt-2 border-t border-white/5">
                             <strong className="text-slate-450 block mb-1 text-[9px] uppercase tracking-wider font-mono font-bold">Overview</strong>
                             <p className="text-slate-350 leading-relaxed text-xs">{selectedNode.details.description}</p>
                           </div>
                         )}
                       </div>
                     )}

                     {selectedNode.group === 'initiatives' && (
                       <div className="space-y-3.5 bg-white/5 p-5 rounded-xl border border-white/5 text-xs font-sans">
                         {selectedNode.details.category && (
                           <div>
                             <strong className="text-slate-450 block mb-0.5 text-[9px] uppercase tracking-wider font-mono">Category</strong>
                             <span className="text-white text-xs">{selectedNode.details.category}</span>
                           </div>
                         )}
                         {selectedNode.details.description && (
                           <div className="pt-2 border-t border-white/5">
                             <strong className="text-slate-450 block mb-1 text-[9px] uppercase tracking-wider font-mono">Description</strong>
                             <p className="text-slate-350 leading-relaxed text-xs">{selectedNode.details.description}</p>
                           </div>
                         )}
                       </div>
                     )}
                   </div>
                 ) : (
                   <p className="text-slate-400 text-xs italic bg-white/5 p-4 rounded-xl border border-white/5">
                     This profile is registered under the official Ganpat University Convocation network.
                   </p>
                 )}

                 {/* Connected ecosystem connections list */}
                 <div className="mt-8">
                   <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-4 flex items-center gap-1.5 font-sans">
                     <Network size={12} className="text-[#f9c53c]" />
                     Professional Connections ({selectedNodeConnections.length})
                   </h4>
                   <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                     {selectedNodeConnections.map((conn, idx) => (
                       <div
                         key={idx}
                         onClick={() => setSelectedNodeId(conn.nodeId)}
                         className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-[var(--royal-blue)]/50 hover:bg-[var(--royal-blue)]/10 cursor-pointer flex flex-col transition-all group"
                       >
                         <div className="flex items-center justify-between gap-2 font-sans">
                           <span className="text-[11px] font-semibold text-slate-200 group-hover:text-white truncate">
                             {conn.label}
                           </span>
                           <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-medium">
                             {getFriendlyCategory(conn.group)}
                           </span>
                         </div>
                         <span className="text-[9px] text-[#f9c53c]/90 mt-1 flex items-center gap-1 font-sans">
                           {getFriendlyRelationship(conn.relationship)}
                         </span>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
 
               {/* Reset button inside drawer */}
               {selectedNodeId !== 'person-achyut-trivedi' && (
                 <div className="pt-6 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 mt-8 font-sans">
                   <button
                     onClick={() => setSelectedNodeId('person-achyut-trivedi')}
                     className="hover:text-white flex items-center gap-1.5 py-1.5 px-3 rounded hover:bg-white/5 transition-colors cursor-pointer"
                   >
                     &larr; Return to Convocation Leadership Profile
                   </button>
                   <span className="text-[9px] uppercase text-slate-500 font-medium">Ecosystem Network</span>
                 </div>
               )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
