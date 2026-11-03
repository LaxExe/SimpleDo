import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Copy, 
  Check, 
  RotateCw, 
  Zap,
  AlertCircle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { storage } from '../services/storage';
import { subscribeToFirebaseStatus, pushToFirebase, SyncStatus } from '../services/firebase';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState<SyncStatus>('connecting');
  const [manualSyncing, setManualSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = subscribeToFirebaseStatus((status) => {
      setFirebaseStatus(status);
    });
    return unsubscribe;
  }, [isOpen]);

  if (!isOpen) return null;

  const syncUrl = storage.generateSyncUrl();
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(syncUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(syncUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleManualPush = async () => {
    setManualSyncing(true);
    setSyncNotice(null);
    const success = await pushToFirebase(storage.load());
    setManualSyncing(false);
    if (success) {
      setSyncNotice('Successfully uploaded latest data to Firebase!');
    } else {
      setSyncNotice('Failed to upload. Check if your Firebase Database rules are set to read/write: true.');
    }
    setTimeout(() => setSyncNotice(null), 4000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-2xl sm:rounded-xl border border-[#ebebeb] shadow-modal max-w-lg w-full p-5 sm:p-6 space-y-5 animate-scaleIn max-h-[90vh] overflow-y-auto pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ebebeb]">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-neutral-900" />
            <div>
              <h2 className="text-base font-semibold text-neutral-900 tracking-tight">
                Real-Time Cloud & Phone Sync
              </h2>
              <p className="text-xs text-neutral-500">
                Instant sync across phone and desktop with zero git commits.
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

        {/* Section 1: Firebase Realtime Database Status */}
        <div className="p-4 bg-white rounded-xl border border-[#ebebeb] shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Firebase Realtime Sync</span>
            </span>
            
            {firebaseStatus === 'connected' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Connected
              </span>
            )}
            {firebaseStatus === 'permission_denied' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                <ShieldAlert className="w-3 h-3 text-amber-600" />
                Locked Mode (Action Needed)
              </span>
            )}
            {firebaseStatus === 'connecting' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                Connecting...
              </span>
            )}
            {firebaseStatus === 'error' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                Offline
              </span>
            )}
          </div>

          {firebaseStatus === 'connected' ? (
            <p className="text-xs text-neutral-600 leading-relaxed">
              Every action on your phone or desktop is automatically synchronized across all open devices in <strong>&lt;50ms</strong> without touching GitHub.
            </p>
          ) : firebaseStatus === 'permission_denied' ? (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-2 text-xs text-amber-900">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Database is currently in Locked Mode</p>
                  <p className="text-amber-800 text-[11px] mt-0.5">
                    Firebase is rejecting read/write access. To enable instant syncing:
                  </p>
                </div>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] font-mono pl-1 text-amber-950">
                <li>Open your Firebase Console</li>
                <li>Go to <strong>Realtime Database &gt; Rules</strong></li>
                <li>Set <code className="bg-white/80 px-1 py-0.5 rounded border border-amber-200">".read": true, ".write": true</code></li>
                <li>Click <strong>Publish</strong></li>
              </ol>
              <a
                href="https://console.firebase.google.com/project/simple-do-c5438/database/simple-do-c5438-default-rtdb/rules"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-900 underline hover:text-black pt-1"
              >
                <span>Open Firebase Rules Tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <p className="text-xs text-neutral-500">
              Connecting to <code className="font-mono text-[11px] bg-neutral-100 px-1 py-0.5 rounded">simple-do-c5438</code>...
            </p>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleManualPush}
              disabled={manualSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-md transition-colors shadow-2xs disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${manualSyncing ? 'animate-spin' : ''}`} />
              <span>{manualSyncing ? 'Syncing...' : 'Force Sync to Firebase'}</span>
            </button>

            {syncNotice && (
              <span className="text-xs font-mono text-neutral-600">
                {syncNotice}
              </span>
            )}
          </div>
        </div>

        {/* Section 2: Instant QR Code / Transfer Link */}
        <div className="p-4 bg-[#fafafa] rounded-xl border border-[#ebebeb] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-neutral-900 uppercase tracking-wider">
              Fallback: Scan with Phone Camera
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200/60 text-neutral-700 font-medium">
              Offline Direct Transfer
            </span>
          </div>
          <p className="text-xs text-neutral-600">
            Scan this code with your phone camera to open SimpleDo with your exact current database loaded:
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
            <div className="p-2.5 bg-white border border-[#ebebeb] rounded-lg shadow-2xs">
              <img
                src={qrCodeUrl}
                alt="Scan to Sync with Phone"
                className="w-36 h-36 object-contain rounded"
              />
            </div>
            <div className="space-y-2 text-center sm:text-left flex-1">
              <p className="text-xs text-neutral-500 font-mono">
                Or copy the direct sync link to send via iMessage, Notes, or WhatsApp:
              </p>
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-neutral-50 text-neutral-900 border border-[#ebebeb] text-xs font-medium rounded-lg transition-colors shadow-2xs"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied Sync Link!' : 'Copy Sync Link'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
