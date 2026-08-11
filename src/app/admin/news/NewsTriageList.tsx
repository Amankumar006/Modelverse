'use client';

import { useState } from 'react';
import { triageNews } from '../actions';
export type NewsItem = {
  id: string;
  title: string;
  source: string;
  source_url: string;
  published_at?: string;
  fetched_at: string;
};

export default function NewsTriageList({ initialItems }: { initialItems: NewsItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleTriage = async (id: string, action: 'approve' | 'dismiss', e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const slug = formData.get('slug') as string;

    setIsProcessing(id);
    try {
      await triageNews(id, action, slug);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to triage news.');
    } finally {
      setIsProcessing(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-12 text-center text-daylight-muted bg-daylight-card rounded-xl border border-daylight-muted/20">
        No pending news triage items.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="bg-daylight-card p-6 rounded-xl shadow-sm border border-daylight-muted/20 flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1">
            <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-daylight-text hover:text-daylight-accent underline-offset-4 hover:underline mb-1 inline-block">
              {item.title}
            </a>
            <div className="text-sm text-daylight-muted mb-4 flex items-center gap-2">
              <span className="bg-daylight-muted/10 px-2 py-0.5 rounded font-medium">{item.source}</span>
              <span>Published: {new Date(item.published_at || item.fetched_at).toLocaleDateString()}</span>
            </div>
            
            <form className="flex flex-col sm:flex-row items-center gap-3" onSubmit={(e) => handleTriage(item.id, 'approve', e)}>
              <input 
                type="text" 
                name="slug"
                required
                placeholder="Related model slug (e.g. gpt-4)"
                className="w-full sm:w-64 px-3 py-2 bg-daylight-bg border border-daylight-muted/30 rounded-lg focus:outline-none focus:border-daylight-accent focus:ring-1 focus:ring-daylight-accent text-sm"
              />
              <button 
                type="submit" 
                disabled={isProcessing === item.id}
                className="w-full sm:w-auto px-4 py-2 bg-daylight-text text-daylight-bg font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
              >
                {isProcessing === item.id ? '...' : 'Link to Model'}
              </button>
            </form>
          </div>

          <div className="md:border-l md:border-daylight-muted/10 md:pl-6 md:h-full flex items-center shrink-0">
            <button 
              type="button"
              onClick={() => handleTriage(String(item.id), 'dismiss', { preventDefault: () => {} } as unknown as React.FormEvent<HTMLFormElement>)}
              disabled={isProcessing === item.id}
              className="px-4 py-2 text-daylight-accent hover:bg-daylight-accent/10 rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
