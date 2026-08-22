'use client';

import { useState } from 'react';
import Link from 'next/link';
import { approveNewsItem, updateNewsItemStatus, deleteNewsItem, triageNews } from '../actions';

export type NewsItemAdmin = {
  id: string;
  slug: string;
  title: string;
  category: string;
  article_type?: string;
  publish_date: string;
  author?: string;
  read_time?: string;
  excerpt?: string;
  status: string;
  quality_status?: string;
  quality_score?: number;
  quality_reasons?: string[];
  curator_reviewed?: boolean;
  related_models?: string[];
  external_sources?: Array<{ name: string; url: string }>;
};

export type TriageItemAdmin = {
  id: string;
  title: string;
  source: string;
  source_url: string;
  published_at?: string;
  fetched_at: string;
};

interface NewsManagementClientProps {
  pendingItems: NewsItemAdmin[];
  publishedItems: NewsItemAdmin[];
  triageItems: TriageItemAdmin[];
}

export default function NewsManagementClient({
  pendingItems: initialPending,
  publishedItems: initialPublished,
  triageItems: initialTriage,
}: NewsManagementClientProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'triage'>('pending');
  const [pendingNews, setPendingNews] = useState<NewsItemAdmin[]>(initialPending);
  const [publishedNews, setPublishedNews] = useState<NewsItemAdmin[]>(initialPublished);
  const [triageList, setTriageList] = useState<TriageItemAdmin[]>(initialTriage);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Handle Approve & Index
  const handleApprove = async (item: NewsItemAdmin) => {
    setProcessingId(item.slug);
    try {
      await approveNewsItem(item.slug);
      setPendingNews((prev) => prev.filter((p) => p.slug !== item.slug));
      setPublishedNews((prev) => [{ ...item, quality_status: 'indexed', curator_reviewed: true, status: 'published' }, ...prev]);
      showNotification('success', `Approved and indexed: "${item.title}"`);
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to approve news item');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Unlisting from Google Search
  const handleUnlist = async (item: NewsItemAdmin) => {
    setProcessingId(item.slug);
    try {
      await updateNewsItemStatus(item.slug, 'published', 'unlisted');
      setPublishedNews((prev) => prev.map((p) => (p.slug === item.slug ? { ...p, quality_status: 'unlisted' } : p)));
      setPendingNews((prev) => [{ ...item, quality_status: 'unlisted' }, ...prev.filter((p) => p.slug !== item.slug)]);
      showNotification('success', `Unlisted "${item.title}" from search indexing`);
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to unlist news item');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Re-indexing
  const handleReindex = async (item: NewsItemAdmin) => {
    setProcessingId(item.slug);
    try {
      await updateNewsItemStatus(item.slug, 'published', 'indexed');
      setPendingNews((prev) => prev.filter((p) => p.slug !== item.slug));
      setPublishedNews((prev) => [{ ...item, quality_status: 'indexed' }, ...prev.filter((p) => p.slug !== item.slug)]);
      showNotification('success', `Re-indexed: "${item.title}"`);
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to re-index');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Delete
  const handleDelete = async (item: NewsItemAdmin) => {
    if (!confirm(`Are you sure you want to permanently delete "${item.title}"?`)) return;
    setProcessingId(item.slug);
    try {
      await deleteNewsItem(item.slug);
      setPendingNews((prev) => prev.filter((p) => p.slug !== item.slug));
      setPublishedNews((prev) => prev.filter((p) => p.slug !== item.slug));
      showNotification('success', `Deleted "${item.title}"`);
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Raw Triage Actions
  const handleTriageAction = async (id: string, action: 'approve' | 'dismiss', slug?: string) => {
    setProcessingId(id);
    try {
      await triageNews(id, action, slug);
      setTriageList((prev) => prev.filter((item) => item.id !== id));
      showNotification('success', action === 'approve' ? 'Linked triage link to model' : 'Dismissed triage item');
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to triage item');
    } finally {
      setProcessingId(null);
    }
  };

  // Filter lists based on search & category
  const filterNews = (list: NewsItemAdmin[]) => {
    return list.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.excerpt && item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  };

  const displayedPending = filterNews(pendingNews);
  const displayedPublished = filterNews(publishedNews);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/30'
              : 'bg-red-950/90 text-red-300 border-red-500/30'
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-daylight-muted/10 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-daylight-text">News & Articles Curation</h1>
          <p className="text-daylight-muted mt-1 text-sm">
            Approve, index, unlist, and manage technical AI news and deep-dive articles.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-daylight-card p-1 rounded-xl border border-daylight-muted/20">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'pending'
                ? 'bg-daylight-accent text-white shadow-sm'
                : 'text-daylight-muted hover:text-daylight-text'
            }`}
          >
            <span>Needs Review & Unlisted</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-daylight-muted/15 text-daylight-text'
              }`}
            >
              {pendingNews.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('published')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'published'
                ? 'bg-daylight-accent text-white shadow-sm'
                : 'text-daylight-muted hover:text-daylight-text'
            }`}
          >
            <span>Indexed & Live</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'published' ? 'bg-white/20 text-white' : 'bg-daylight-muted/15 text-daylight-text'
              }`}
            >
              {publishedNews.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('triage')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'triage'
                ? 'bg-daylight-accent text-white shadow-sm'
                : 'text-daylight-muted hover:text-daylight-text'
            }`}
          >
            <span>RSS Triage</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'triage' ? 'bg-white/20 text-white' : 'bg-daylight-muted/15 text-daylight-text'
              }`}
            >
              {triageList.length}
            </span>
          </button>
        </div>
      </div>

      {/* Filters (Search & Category) */}
      {activeTab !== 'triage' && (
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Search by title, slug, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-daylight-card border border-daylight-muted/20 rounded-xl text-sm text-daylight-text focus:outline-none focus:border-daylight-accent focus:ring-1 focus:ring-daylight-accent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-daylight-muted hover:text-daylight-text text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
            {['all', 'weekly-news', 'short-news', 'model-review', 'other'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                  categoryFilter === cat
                    ? 'bg-daylight-text text-daylight-bg font-semibold'
                    : 'bg-daylight-card text-daylight-muted border border-daylight-muted/20 hover:text-daylight-text'
                }`}
              >
                {cat.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: Needs Review & Unlisted */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {displayedPending.length === 0 ? (
            <div className="p-12 text-center text-daylight-muted bg-daylight-card rounded-2xl border border-daylight-muted/10">
              <p className="text-base font-semibold text-daylight-text mb-1">All Caught Up!</p>
              <p className="text-sm">No articles are currently awaiting review or unlisted.</p>
            </div>
          ) : (
            displayedPending.map((item) => (
              <div
                key={item.id}
                className="bg-daylight-card p-6 rounded-2xl border border-daylight-muted/20 hover:border-daylight-muted/40 transition-all flex flex-col gap-4 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wide">
                        {item.quality_status || 'unlisted'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-daylight-muted/10 text-daylight-muted capitalize">
                        {item.category.replace('-', ' ')}
                      </span>
                      {typeof item.quality_score === 'number' && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-mono font-semibold ${
                            item.quality_score >= 80
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : item.quality_score >= 60
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          Score: {item.quality_score}/100
                        </span>
                      )}
                      <span className="text-xs text-daylight-muted">
                        Published: {new Date(item.publish_date).toLocaleDateString()}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-daylight-text mb-1.5 hover:text-daylight-accent transition-colors">
                      <Link href={`/news/${item.slug}`} target="_blank">
                        {item.title} ↗
                      </Link>
                    </h2>

                    {item.excerpt && (
                      <p className="text-sm text-daylight-muted line-clamp-2 mb-3">{item.excerpt}</p>
                    )}

                    {item.related_models && item.related_models.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-daylight-muted">Related Models:</span>
                        {item.related_models.map((mod) => (
                          <span
                            key={mod}
                            className="font-mono text-xs bg-daylight-tag-bg text-daylight-tag-text px-2 py-0.5 rounded-md"
                          >
                            {mod}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 lg:flex-col lg:items-stretch lg:w-44 shrink-0 pt-2 lg:pt-0">
                    <button
                      onClick={() => handleApprove(item)}
                      disabled={processingId === item.slug}
                      className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      {processingId === item.slug ? 'Saving...' : '✓ Approve & Index'}
                    </button>
                    {item.quality_status === 'unlisted' && (
                      <button
                        onClick={() => handleReindex(item)}
                        disabled={processingId === item.slug}
                        className="px-3 py-1.5 bg-daylight-muted/10 hover:bg-daylight-muted/20 text-daylight-text rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        Force Re-index
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={processingId === item.slug}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Published & Indexed */}
      {activeTab === 'published' && (
        <div className="space-y-4">
          {displayedPublished.length === 0 ? (
            <div className="p-12 text-center text-daylight-muted bg-daylight-card rounded-2xl border border-daylight-muted/10">
              No matching published articles found.
            </div>
          ) : (
            displayedPublished.map((item) => (
              <div
                key={item.id}
                className="bg-daylight-card p-5 rounded-2xl border border-daylight-muted/10 hover:border-daylight-muted/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Indexed
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-daylight-muted/10 text-daylight-muted capitalize">
                      {item.category.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-daylight-muted">
                      {new Date(item.publish_date).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-semibold text-daylight-text truncate hover:text-daylight-accent transition-colors">
                    <Link href={`/news/${item.slug}`} target="_blank">
                      {item.title} ↗
                    </Link>
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleUnlist(item)}
                    disabled={processingId === item.slug}
                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    Unlist from Search
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={processingId === item.slug}
                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Raw RSS Triage */}
      {activeTab === 'triage' && (
        <div className="space-y-4">
          {triageList.length === 0 ? (
            <div className="p-12 text-center text-daylight-muted bg-daylight-card rounded-2xl border border-daylight-muted/10">
              <p className="text-base font-semibold text-daylight-text mb-1">No Pending Triage Links</p>
              <p className="text-sm">All incoming RSS items have been processed or linked.</p>
            </div>
          ) : (
            triageList.map((item) => (
              <div
                key={item.id}
                className="bg-daylight-card p-6 rounded-2xl shadow-sm border border-daylight-muted/20 flex flex-col md:flex-row gap-6 items-start"
              >
                <div className="flex-1">
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-bold text-daylight-text hover:text-daylight-accent underline-offset-4 hover:underline mb-1 inline-block"
                  >
                    {item.title} ↗
                  </a>
                  <div className="text-sm text-daylight-muted mb-4 flex items-center gap-2">
                    <span className="bg-daylight-muted/10 px-2 py-0.5 rounded font-medium">{item.source}</span>
                    <span>Fetched: {new Date(item.fetched_at).toLocaleDateString()}</span>
                  </div>

                  <form
                    className="flex flex-col sm:flex-row items-center gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const slug = formData.get('slug') as string;
                      handleTriageAction(item.id, 'approve', slug);
                    }}
                  >
                    <input
                      type="text"
                      name="slug"
                      required
                      placeholder="Related model slug (e.g. gpt-4o)"
                      className="w-full sm:w-64 px-3 py-2 bg-daylight-bg border border-daylight-muted/30 rounded-xl focus:outline-none focus:border-daylight-accent focus:ring-1 focus:ring-daylight-accent text-sm"
                    />
                    <button
                      type="submit"
                      disabled={processingId === item.id}
                      className="w-full sm:w-auto px-4 py-2 bg-daylight-text text-daylight-bg font-medium rounded-xl hover:opacity-90 disabled:opacity-50 transition-colors text-xs"
                    >
                      {processingId === item.id ? 'Linking...' : 'Link & Approve'}
                    </button>
                  </form>
                </div>

                <div className="md:border-l md:border-daylight-muted/10 md:pl-6 md:h-full flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleTriageAction(item.id, 'dismiss')}
                    disabled={processingId === item.id}
                    className="px-4 py-2 text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs font-medium disabled:opacity-50 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
