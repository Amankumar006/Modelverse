export default function AdminPage() {
  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
      <h1 className="text-2xl font-bold mb-4">Welcome to the Modelverse Curator Admin Panel</h1>
      <p className="text-gray-600 dark:text-gray-400">
        You have successfully authenticated and your curator profile has been verified. 
        This is a secure area protected by both session middleware and database-level Authorization.
      </p>
      
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-md">
          <h2 className="font-semibold text-lg mb-2">Pending Models</h2>
          <p className="text-sm text-gray-500 mb-4">Review and verify automated model ingestions.</p>
          <span className="text-xs font-mono bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">Coming soon</span>
        </div>
        
        <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-md">
          <h2 className="font-semibold text-lg mb-2">News Triage</h2>
          <p className="text-sm text-gray-500 mb-4">Curate and publish model-related news.</p>
          <span className="text-xs font-mono bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">Coming soon</span>
        </div>
      </div>
    </div>
  )
}
