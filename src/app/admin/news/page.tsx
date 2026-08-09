import { createClient } from '@/utils/supabase/server';
import NewsTriageList from './NewsTriageList';

export const metadata = {
  title: 'News Triage - Admin',
};

export default async function NewsTriagePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return <div>Access Denied</div>;
  }

  // Fetch pending news triage items
  const { data: items, error } = await supabase
    .from('news_triage')
    .select('*')
    .eq('review_status', 'pending')
    .order('fetched_at', { ascending: false });

  if (error) {
    console.error('Error fetching news triage:', error);
    return <div className="text-red-500 p-8">Failed to load news triage items.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-daylight-text">News Triage</h1>
        <p className="text-daylight-muted mt-2">Review automatically fetched news items and link them to models.</p>
      </div>
      <NewsTriageList initialItems={items || []} />
    </div>
  );
}
