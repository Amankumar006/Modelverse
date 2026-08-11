import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import StatusDots from '@/components/StatusDots';

export default async function AdminPage() {
  const supabase = await createClient();
  
  // Fetch models where needs_review = true to get counts
  const { data: models } = await supabase
    .from('models')
    .select('verification_status')
    .eq('needs_review', true);

  const counts = {
    DRAFT: 0,
    LIKELY: 0,
    DISPUTED: 0,
    VERIFIED: 0,
  };

  if (models) {
    models.forEach((m: Record<string, unknown>) => {
      if (typeof m.verification_status === 'string' && m.verification_status in counts) {
        counts[m.verification_status as keyof typeof counts]++;
      }
    });
  }

  // Fetch recently verified
  const { count: recentlyVerified } = await supabase
    .from('models')
    .select('*', { count: 'exact', head: true })
    .eq('verification_status', 'VERIFIED');

  counts.VERIFIED = recentlyVerified || 0;

  // Fetch last 5 audit logs
  const { data: auditLogs } = await supabase
    .from('audit_log')
    .select('*, curator_profiles(display_name)')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-daylight-text">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/admin/review?status=DISPUTED" className="bg-daylight-card p-6 rounded-2xl shadow-card border border-daylight-muted/10 hover:border-daylight-accent transition-colors block">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-daylight-muted">Disputed</h2>
            <StatusDots status="DISPUTED" />
          </div>
          <div className="text-4xl font-bold text-daylight-text tabular-nums">{counts.DISPUTED}</div>
        </Link>
        
        <Link href="/admin/review?status=LIKELY" className="bg-daylight-card p-6 rounded-2xl shadow-card border border-daylight-muted/10 hover:border-daylight-accent transition-colors block">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-daylight-muted">Likely</h2>
            <StatusDots status="LIKELY" />
          </div>
          <div className="text-4xl font-bold text-daylight-text tabular-nums">{counts.LIKELY}</div>
        </Link>

        <Link href="/admin/review?status=DRAFT" className="bg-daylight-card p-6 rounded-2xl shadow-card border border-daylight-muted/10 hover:border-daylight-accent transition-colors block">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-daylight-muted">Draft</h2>
            <StatusDots status="DRAFT" />
          </div>
          <div className="text-4xl font-bold text-daylight-text tabular-nums">{counts.DRAFT}</div>
        </Link>

        <Link href="/admin/review?status=VERIFIED" className="bg-daylight-card p-6 rounded-2xl shadow-card border border-daylight-muted/10 hover:border-daylight-accent transition-colors block">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-daylight-muted">Verified</h2>
            <StatusDots status="VERIFIED" />
          </div>
          <div className="text-4xl font-bold text-daylight-text tabular-nums">{counts.VERIFIED}</div>
        </Link>
      </div>

      <div className="bg-daylight-card rounded-2xl shadow-card border border-daylight-muted/10 overflow-hidden">
        <div className="p-6 border-b border-daylight-muted/10">
          <h2 className="text-xl font-bold text-daylight-text">Recent Activity</h2>
        </div>
        <div className="divide-y divide-daylight-muted/10">
          {auditLogs?.map((log: Record<string, unknown>) => (
            <div key={String(log.id)} className="p-4 px-6 flex items-start gap-4 hover:bg-daylight-muted/5 transition-colors">
              <div className="flex-1">
                <p className="text-sm text-daylight-text">
                  <span className="font-semibold">{(log.curator_profiles as Record<string, unknown>)?.display_name as string || 'Unknown curator'}</span>{' '}
                  performed <span className="font-mono text-xs bg-daylight-tag-bg text-daylight-tag-text px-1.5 py-0.5 rounded">{String(log.action)}</span> on table <span className="font-mono text-xs text-daylight-muted">{String(log.table_name)}</span>
                </p>
                <p className="text-xs text-daylight-muted mt-1">{new Date(String(log.created_at)).toLocaleString()}</p>
              </div>
            </div>
          ))}
          {(!auditLogs || auditLogs.length === 0) && (
            <div className="p-6 text-center text-daylight-muted">No recent activity</div>
          )}
        </div>
      </div>
    </div>
  );
}
