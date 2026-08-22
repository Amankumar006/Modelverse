import { createClient } from '@/utils/supabase/server';
import NewsManagementClient from './NewsManagementClient';

export const metadata = {
  title: 'News & Articles Curation - Admin',
};

export default async function NewsAdminPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return <div className="p-8 text-daylight-muted">Access Denied</div>;
  }

  // 1. Fetch pending & unlisted news items
  const { data: pendingItems, error: pendingError } = await supabase
    .from('news_items')
    .select('id, slug, title, category, article_type, publish_date, author, read_time, excerpt, status, quality_status, quality_score, quality_reasons, curator_reviewed, related_models, external_sources')
    .or('curator_reviewed.is.null,curator_reviewed.eq.false,quality_status.eq.unlisted,quality_status.eq.quarantined,status.neq.published')
    .order('publish_date', { ascending: false })
    .limit(100);

  if (pendingError) {
    console.error('Error fetching pending news items:', pendingError);
  }

  // 2. Fetch published & indexed news items
  const { data: publishedItems, error: publishedError } = await supabase
    .from('news_items')
    .select('id, slug, title, category, article_type, publish_date, author, read_time, excerpt, status, quality_status, quality_score, quality_reasons, curator_reviewed, related_models, external_sources')
    .eq('status', 'published')
    .eq('quality_status', 'indexed')
    .order('publish_date', { ascending: false })
    .limit(100);

  if (publishedError) {
    console.error('Error fetching published news items:', publishedError);
  }

  // 3. Fetch raw RSS triage items
  const { data: triageItems, error: triageError } = await supabase
    .from('news_triage')
    .select('*')
    .eq('review_status', 'pending')
    .order('fetched_at', { ascending: false })
    .limit(50);

  if (triageError) {
    console.error('Error fetching news triage:', triageError);
  }

  return (
    <NewsManagementClient
      pendingItems={pendingItems || []}
      publishedItems={publishedItems || []}
      triageItems={triageItems || []}
    />
  );
}
