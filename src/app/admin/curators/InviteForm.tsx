'use client';

import { useState } from 'react';
import { inviteCurator } from '../actions';

export default function InviteForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const displayName = formData.get('displayName') as string;

    try {
      await inviteCurator(email, displayName);
      setSuccess(`Successfully invited ${email}`);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || 'Failed to invite curator');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-daylight-card p-6 rounded-xl shadow-sm border border-daylight-muted/20 space-y-4">
      <h2 className="text-xl font-bold text-daylight-text">Invite Curator</h2>
      
      {error && <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm">{error}</div>}
      {success && <div className="p-3 bg-green-100 text-green-800 rounded-lg text-sm">{success}</div>}

      <div className="space-y-3">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-daylight-text mb-1">Email</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            required 
            className="w-full px-4 py-2 bg-daylight-bg border border-daylight-muted/30 rounded-lg focus:outline-none focus:border-daylight-accent focus:ring-1 focus:ring-daylight-accent"
          />
        </div>
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-daylight-text mb-1">Display Name</label>
          <input 
            type="text" 
            id="displayName" 
            name="displayName" 
            required 
            className="w-full px-4 py-2 bg-daylight-bg border border-daylight-muted/30 rounded-lg focus:outline-none focus:border-daylight-accent focus:ring-1 focus:ring-daylight-accent"
          />
        </div>
      </div>
      
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full px-4 py-2 bg-daylight-accent text-daylight-bg font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? 'Inviting...' : 'Send Invite'}
      </button>
    </form>
  );
}
