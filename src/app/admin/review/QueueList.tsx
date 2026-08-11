'use client';

import { useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import StatusDots from '@/components/StatusDots';
import { dismissModels, approveModels } from '../actions'; // we will need to create this action

type Model = {
  slug: string;
  name: string;
  developer: string;
  verification_status: string;
  updated_at: string;
  primary_task: string;
  family: string | null;
};

export default function QueueList({ models }: { models: Model[] }) {
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [expandedFamilies, setExpandedFamilies] = useState<Record<string, boolean>>({});
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [isDismissing, setIsDismissing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter models based on search query
  const filteredModels = models.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.slug.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.developer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Grouping logic
  const grouped = filteredModels.reduce((acc, model) => {
    const task = model.primary_task || 'Unknown Task';
    if (!acc[task]) acc[task] = { total: 0, disputed: 0, models: [], families: {} };
    
    acc[task].total++;
    if (model.verification_status === 'DISPUTED') acc[task].disputed++;

    if (model.family) {
      if (!acc[task].families[model.family]) {
        acc[task].families[model.family] = { total: 0, disputed: 0, models: [] };
      }
      acc[task].families[model.family].total++;
      if (model.verification_status === 'DISPUTED') acc[task].families[model.family].disputed++;
      acc[task].families[model.family].models.push(model);
    } else {
      acc[task].models.push(model);
    }
    
    return acc;
  }, {} as Record<string, {
    total: number;
    disputed: number;
    models: Model[];
    families: Record<string, { total: number; disputed: number; models: Model[] }>;
  }>);

  // Sorting
  const sortModels = (a: Model, b: Model) => {
    if (a.verification_status === 'DISPUTED' && b.verification_status !== 'DISPUTED') return -1;
    if (a.verification_status !== 'DISPUTED' && b.verification_status === 'DISPUTED') return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  };

  const tasks = Object.entries(grouped).sort((a, b) => {
    // Sort tasks by disputed count first, then total count
    if (b[1].disputed !== a[1].disputed) return b[1].disputed - a[1].disputed;
    return b[1].total - a[1].total;
  });

  const toggleTask = (task: string) => {
    setExpandedTasks(prev => ({ ...prev, [task]: !prev[task] }));
  };

  const toggleFamily = (task: string, family: string) => {
    const key = `${task}-${family}`;
    setExpandedFamilies(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSelect = (slug: string) => {
    const newSet = new Set(selectedSlugs);
    if (newSet.has(slug)) newSet.delete(slug);
    else newSet.add(slug);
    setSelectedSlugs(newSet);
  };

  const handleDismiss = async () => {
    if (selectedSlugs.size === 0) return;
    if (!confirm(`Are you sure you want to dismiss ${selectedSlugs.size} selected models?`)) return;
    
    setIsDismissing(true);
    await dismissModels(Array.from(selectedSlugs));
    setIsDismissing(false);
    setSelectedSlugs(new Set());
    // In a real app we'd refresh the page or use transition, relying on server action revalidatePath here.
  };

  const handleApprove = async () => {
    if (selectedSlugs.size === 0) return;
    if (!confirm(`Are you sure you want to approve ${selectedSlugs.size} selected models?`)) return;
    
    setIsApproving(true);
    await approveModels(Array.from(selectedSlugs));
    setIsApproving(false);
    setSelectedSlugs(new Set());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-daylight-card p-4 rounded-xl shadow-sm border border-daylight-muted/20 gap-4">
        <div className="text-sm text-daylight-text font-medium whitespace-nowrap">
          <span className="font-bold text-lg">{filteredModels.length}</span> models pending
        </div>
        
        <div className="flex-1 max-w-md w-full">
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-daylight-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search by name, slug, or developer..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-daylight-bg border border-daylight-muted/20 rounded-lg text-sm text-daylight-text focus:outline-none focus:ring-1 focus:ring-daylight-accent focus:border-daylight-accent placeholder-daylight-muted/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleDismiss}
            disabled={selectedSlugs.size === 0 || isDismissing || isApproving}
            className="px-4 py-2 bg-daylight-muted/10 text-daylight-muted font-medium rounded-lg hover:bg-daylight-muted/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {isDismissing ? 'Dismissing...' : `Dismiss (${selectedSlugs.size})`}
          </button>
          
          <button 
            onClick={handleApprove}
            disabled={selectedSlugs.size === 0 || isDismissing || isApproving}
            className="px-4 py-2 bg-emerald-500/10 text-emerald-600 font-medium rounded-lg hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {isApproving ? 'Approving...' : `Approve (${selectedSlugs.size})`}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map(([taskName, taskData]) => (
          <div key={taskName} className="bg-daylight-card rounded-xl shadow-sm border border-daylight-muted/20 overflow-hidden">
            <button 
              onClick={() => toggleTask(taskName)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-daylight-muted/5 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-daylight-text">{taskName}</h2>
                <div className="flex items-center gap-2 text-sm text-daylight-muted bg-daylight-bg px-2.5 py-1 rounded-full border border-daylight-muted/10">
                  <span>{taskData.total} models</span>
                  {taskData.disputed > 0 && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-daylight-muted/30" />
                      <span className="text-daylight-accent font-medium">{taskData.disputed} need attention</span>
                    </>
                  )}
                </div>
              </div>
              <svg className={clsx("w-5 h-5 text-daylight-muted transition-transform", expandedTasks[taskName] && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>

            {expandedTasks[taskName] && (
              <div className="border-t border-daylight-muted/10 divide-y divide-daylight-muted/10">
                {/* Families inside Task */}
                {Object.entries(taskData.families)
                  .sort((a, b) => b[1].disputed - a[1].disputed || b[1].total - a[1].total)
                  .map(([family, famData]) => {
                    const famKey = `${taskName}-${family}`;
                    const isExpanded = expandedFamilies[famKey];
                    return (
                      <div key={famKey} className="bg-daylight-bg/50">
                        <button 
                          onClick={() => toggleFamily(taskName, family)}
                          className="w-full px-8 py-3 flex items-center justify-between hover:bg-daylight-muted/10 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-daylight-text">{family} <span className="font-normal text-daylight-muted ml-1">Family</span></h3>
                            <div className="text-xs text-daylight-muted">
                              {famData.total} items {famData.disputed > 0 && <span className="text-daylight-accent ml-1">({famData.disputed} disputed)</span>}
                            </div>
                          </div>
                          <svg className={clsx("w-4 h-4 text-daylight-muted transition-transform", isExpanded && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        
                        {isExpanded && (
                          <div className="divide-y divide-daylight-muted/5 border-t border-daylight-muted/10 bg-daylight-card">
                            {famData.models.sort(sortModels).map(m => (
                              <ModelRow key={m.slug} model={m} isSelected={selectedSlugs.has(m.slug)} onSelect={() => toggleSelect(m.slug)} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                
                {/* Standalone models inside Task */}
                <div className="divide-y divide-daylight-muted/5">
                  {taskData.models.sort(sortModels).map(m => (
                    <ModelRow key={m.slug} model={m} isSelected={selectedSlugs.has(m.slug)} onSelect={() => toggleSelect(m.slug)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {filteredModels.length === 0 && (
          <div className="p-12 text-center text-daylight-muted bg-daylight-card rounded-xl border border-daylight-muted/20">
            {searchQuery ? 'No models match your search.' : 'No pending models to review. You\'re all caught up!'}
          </div>
        )}
      </div>
    </div>
  );
}

function ModelRow({ model, isSelected, onSelect }: { model: Model, isSelected: boolean, onSelect: () => void }) {
  return (
    <div className={clsx(
      "flex items-center px-6 py-3 gap-4 transition-colors hover:bg-daylight-muted/5",
      isSelected && "bg-daylight-accent-soft/30"
    )}>
      <input 
        type="checkbox" 
        checked={isSelected} 
        onChange={onSelect}
        className="w-4 h-4 rounded border-daylight-muted/30 text-daylight-accent focus:ring-daylight-accent"
      />
      <div className="flex-1 min-w-0">
        <Link href={`/admin/review/${model.slug}`} className="font-medium text-daylight-text hover:text-daylight-accent truncate block">
          {model.name}
        </Link>
        <div className="text-xs text-daylight-muted truncate">{model.developer}</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <StatusDots status={model.verification_status as "VERIFIED" | "LIKELY" | "DRAFT" | "DISPUTED"} />
          <span className="text-[10px] uppercase tracking-wider text-daylight-muted mt-1 font-medium">{model.verification_status || 'DRAFT'}</span>
        </div>
        <Link 
          href={`/admin/review/${model.slug}`}
          className="text-sm font-medium text-daylight-accent hover:text-daylight-accent/80 px-3 py-1.5 rounded-lg bg-daylight-accent/10"
        >
          Review
        </Link>
      </div>
    </div>
  );
}
