import { Settings, Save, Shield, Database } from "lucide-react";

export default function AdminSettings() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-[var(--text-secondary)] text-sm">Configure system configurations and credentials.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Security Section */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border)]">
            <Shield className="text-[var(--accent)]" size={22} />
            <h2 className="text-xl font-bold">Admin Credentials</h2>
          </div>
          
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-technical text-[var(--text-secondary)] mb-2">NEW PASSWORD</label>
                <input type="password" placeholder="••••••••" className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-technical text-[var(--text-secondary)] mb-2">CONFIRM NEW PASSWORD</label>
                <input type="password" placeholder="••••••••" className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors" />
              </div>
            </div>
            <button type="button" className="flex items-center gap-2 px-4 py-2 bg-[var(--border)] border border-[var(--border)] rounded-lg text-sm font-semibold hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] transition-all mt-4">
              <Save size={16} />
              <span>Change Password</span>
            </button>
          </form>
        </div>

        {/* Database Config Section */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border)]">
            <Database className="text-[var(--accent)]" size={22} />
            <h2 className="text-xl font-bold">Database Status</h2>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-[var(--bg-primary)]/40 border border-[var(--border)]">
            <div>
              <p className="font-technical text-xs text-[var(--text-secondary)] mb-1">DATABASE PROVIDER</p>
              <p className="font-semibold text-sm">PostgreSQL (Supabase)</p>
            </div>
            <div>
              <p className="font-technical text-xs text-[var(--text-secondary)] mb-1">CONNECTION STATUS</p>
              <span className="inline-flex items-center gap-1.5 text-xs text-green-400 font-technical">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
