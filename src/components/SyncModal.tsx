import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Copy, 
  Check, 
  RotateCw, 
  GitBranch, 
  UploadCloud, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { storage } from '../services/storage';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [pullMessage, setPullMessage] = useState<string | null>(null);

  // GitHub token sync state
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('simpledo_github_token') || '');
  const [committing, setCommitting] = useState(false);
  const [githubResult, setGithubResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const syncUrl = storage.generateSyncUrl();
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(syncUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(syncUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePullFromSite = async () => {
    setPulling(true);
    setPullMessage(null);
    const success = await storage.pullFromSite();
    setPulling(false);
    if (success) {
      setPullMessage('Successfully synced latest database from the site!');
    } else {
      setPullMessage('Could not load site database. (File may be empty or offline).');
    }
    setTimeout(() => setPullMessage(null), 4000);
  };

  const handleCommitToGitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubToken.trim()) return;

    setCommitting(true);
    setGithubResult(null);
    localStorage.setItem('simpledo_github_token', githubToken.trim());

    const res = await storage.saveToGitHub(githubToken.trim());
    setCommitting(false);
    setGithubResult(res);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-2xl sm:rounded-xl border border-[#ebebeb] shadow-modal max-w-lg w-full p-5 sm:p-6 space-y-6 animate-scaleIn max-h-[90vh] overflow-y-auto pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ebebeb]">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-neutral-900" />
            <div>
              <h2 className="text-base font-semibold text-neutral-900 tracking-tight">
                Phone & Cross-Device Sync
              </h2>
              <p className="text-xs text-neutral-500">
                Instantly transfer data to your phone or save it directly to the site.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-md hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Method 1: Instant QR Code & Link (Fastest for Phone) */}
        <div className="p-4 bg-[#fafafa] rounded-xl border border-[#ebebeb] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-neutral-900 uppercase tracking-wider">
              Method 1: Scan with Phone Camera
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200/60">
              Instant • Zero Setup
            </span>
          </div>
          <p className="text-xs text-neutral-600">
            Open your phone's camera, point it at this QR code, and tap the link to load all your data onto your phone immediately.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
            <div className="p-2.5 bg-white border border-[#ebebeb] rounded-lg shadow-2xs">
              <img
                src={qrCodeUrl}
                alt="Scan to Sync with Phone"
                className="w-40 h-40 object-contain rounded"
              />
            </div>
            <div className="space-y-2 text-center sm:text-left flex-1">
              <p className="text-xs text-neutral-500 font-mono">
                Or copy the sync link and send it to your phone (via iMessage, WhatsApp, Notes, etc.):
              </p>
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-lg transition-colors shadow-2xs"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied Sync Link!' : 'Copy Sync Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Method 2: Pull Latest from Site Database */}
        <div className="p-4 bg-white rounded-xl border border-[#ebebeb] shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-neutral-900 uppercase tracking-wider">
              Method 2: Pull from Site
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              public/database.json
            </span>
          </div>
          <p className="text-xs text-neutral-600">
            Fetch the latest shared database file directly from the website.
          </p>
          <button
            type="button"
            onClick={handlePullFromSite}
            disabled={pulling}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-[#ebebeb] text-xs font-medium rounded-md transition-colors shadow-2xs disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 text-neutral-600 ${pulling ? 'animate-spin' : ''}`} />
            <span>{pulling ? 'Checking Site...' : 'Pull Latest from Site'}</span>
          </button>

          {pullMessage && (
            <p className="text-xs font-mono text-neutral-700 pt-1">
              {pullMessage}
            </p>
          )}
        </div>

        {/* Method 3: Save directly to the Site via GitHub API */}
        <div className="p-4 bg-white rounded-xl border border-[#ebebeb] shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5" />
              <span>Method 3: Save Directly to Site Repository</span>
            </span>
          </div>
          <p className="text-xs text-neutral-600">
            Want your phone and laptop to permanently save data to the live website? Enter a GitHub Personal Access Token (with repo <code className="bg-neutral-100 px-1 py-0.5 rounded text-[11px]">contents: write</code> permission).
          </p>

          <form onSubmit={handleCommitToGitHub} className="space-y-2.5">
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="Paste GitHub Token (ghp_...)"
              className="w-full px-3 py-1.5 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md font-mono focus:outline-none focus:border-neutral-900"
            />
            <div className="flex items-center justify-between">
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=SimpleDo+Site+Sync"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-mono text-neutral-400 hover:text-neutral-800 underline inline-flex items-center gap-1"
              >
                <span>Generate Token on GitHub</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>

              <button
                type="submit"
                disabled={committing || !githubToken.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-40 shadow-2xs"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{committing ? 'Committing...' : 'Commit Database to Site'}</span>
              </button>
            </div>
          </form>

          {githubResult && (
            <div className={`p-2.5 rounded text-xs font-mono flex items-center gap-2 ${
              githubResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {githubResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
              <span>{githubResult.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
