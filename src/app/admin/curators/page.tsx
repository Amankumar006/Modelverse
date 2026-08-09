import { createClient } from '@/utils/supabase/server';
import InviteForm from './InviteForm';

export const metadata = {
  title: 'Curators - Admin',
};

export default async function CuratorsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return <div>Access Denied</div>;
  }

  // Fetch the current user's profile to see if they're an admin
  const { data: profile } = await supabase
    .from('curator_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';

  // Fetch all curators
  const { data: curators, error } = await supabase
    .from('curator_profiles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching curators:', error);
    return <div className="text-red-500 p-8">Failed to load curators.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-daylight-text">Curators</h1>
        <p className="text-daylight-muted mt-2">Manage the curation team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 bg-daylight-card rounded-xl shadow-sm border border-daylight-muted/20 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-daylight-bg/50 border-b border-daylight-muted/10 text-daylight-muted text-sm">
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-daylight-muted/10">
              {curators?.map((c) => (
                <tr key={c.id} className="hover:bg-daylight-muted/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-daylight-text">{c.display_name}</td>
                  <td className="px-6 py-4">
                    <span className="bg-daylight-tag-bg text-daylight-tag-text px-2 py-1 rounded text-xs font-mono uppercase tracking-wider">
                      {c.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-daylight-muted">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isAdmin ? (
          <InviteForm />
        ) : (
          <div className="bg-daylight-card p-6 rounded-xl border border-daylight-muted/20 text-sm text-daylight-muted text-center">
            You must be an admin to invite new curators.
          </div>
        )}
      </div>
    </div>
  );
}
