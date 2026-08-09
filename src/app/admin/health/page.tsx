import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function DataHealthPage() {
  const supabase = await createClient();

  // Fetch all models to analyze data health
  const { data: models } = await supabase
    .from('models')
    .select('id, name, slug, developer, logo, parameters, context_window, description, release_date');

  if (!models) {
    return <div>Error loading models for health check.</div>;
  }

  // Calculate missing data categories
  const missingLogos = models.filter(m => !m.logo || m.logo.trim() === '');
  const missingParams = models.filter(m => !m.parameters || m.parameters.trim() === '');
  const missingContext = models.filter(m => !m.context_window || m.context_window.trim() === '');
  const missingDesc = models.filter(m => !m.description || m.description.length < 50);
  const missingDate = models.filter(m => !m.release_date);

  const sections = [
    { title: 'Missing Logos', icon: '🎨', data: missingLogos, color: 'text-red-400' },
    { title: 'Missing Parameter Counts', icon: '🔢', data: missingParams, color: 'text-orange-400' },
    { title: 'Missing Context Window', icon: '🧠', data: missingContext, color: 'text-yellow-400' },
    { title: 'Short/Missing Description', icon: '📝', data: missingDesc, color: 'text-blue-400' },
    { title: 'Missing Release Date', icon: '📅', data: missingDate, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-daylight-text">Data Health Dashboard</h1>
        <div className="text-sm text-daylight-muted">
          Total Models: <span className="font-bold text-daylight-text">{models.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sections.map(section => (
          <div key={section.title} className="bg-daylight-card rounded-2xl shadow-card border border-daylight-muted/10 overflow-hidden flex flex-col max-h-[500px]">
            <div className="p-5 border-b border-daylight-muted/10 flex justify-between items-center bg-daylight-card sticky top-0">
              <h2 className={`font-semibold ${section.color} flex items-center gap-2`}>
                <span className="text-xl">{section.icon}</span> {section.title}
              </h2>
              <span className="bg-daylight-muted/10 text-daylight-text text-xs font-bold px-2 py-1 rounded-full">
                {section.data.length}
              </span>
            </div>
            
            <div className="overflow-y-auto p-4 space-y-2 flex-1">
              {section.data.length === 0 ? (
                <div className="text-center text-daylight-muted py-8 text-sm">
                  All clear! No models missing this data. 🎉
                </div>
              ) : (
                section.data.map(model => (
                  <Link 
                    key={model.id}
                    href={`/admin/review/${model.slug}`}
                    className="block p-3 rounded-xl border border-daylight-muted/10 hover:border-daylight-accent hover:bg-daylight-accent-soft/20 transition-all"
                  >
                    <div className="font-medium text-daylight-text">{model.name}</div>
                    <div className="text-xs text-daylight-muted mt-1">{model.developer}</div>
                  </Link>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
