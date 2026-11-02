import React, { useState } from 'react';
import {
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  Sun,
  Moon,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { AppData } from '../types';
import { exportBackup } from '../services/storage';

interface SettingsViewProps {
  appData: AppData;
  onUpdateSettings: (settings: AppData['settings']) => void;
  onImportData: (data: AppData) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  appData,
  onUpdateSettings,
  onImportData,
  onResetData,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = () => {
    exportBackup(appData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.goals) && Array.isArray(parsed.habits)) {
          onImportData(parsed);
          setImportStatus('Backup restored successfully!');
          setTimeout(() => setImportStatus(null), 3500);
        } else {
          setImportStatus('Invalid SimpleDo backup JSON format.');
        }
      } catch (err) {
        setImportStatus('Error reading JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-[var(--border)] pb-4">
        <span className="mono-label">SYSTEM CONFIGURATION & STORAGE</span>
        <h1 className="font-sans text-xl md:text-2xl font-bold text-[var(--c5)]">
          Settings & Persistence
        </h1>
        <p className="mt-1 font-mono text-xs text-[var(--c3)]">
          Manage appearance, inspect local disk storage file, and export or import data.
        </p>
      </div>

      {importStatus && (
        <div className="p-3 border border-[var(--border)] bg-[var(--c1)] font-mono text-xs text-[var(--c5)] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Theme Settings */}
      <div className="uw-card space-y-3">
        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
          <Sun className="w-4 h-4 text-[var(--c4)]" />
          <h3 className="font-sans text-sm font-bold text-[var(--c5)]">
            Appearance & Theme
          </h3>
        </div>

        <p className="font-mono text-xs text-[var(--c3)]">
          SimpleDo utilizes UWExplorer's high-contrast monochrome design system with Sora and DM Mono typography.
        </p>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => onUpdateSettings({ ...appData.settings, theme: 'light' })}
            className={`uw-button uw-button-sm !px-4 ${
              appData.settings.theme === 'light' ? 'active' : ''
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>light mode</span>
          </button>

          <button
            onClick={() => onUpdateSettings({ ...appData.settings, theme: 'dark' })}
            className={`uw-button uw-button-sm !px-4 ${
              appData.settings.theme === 'dark' ? 'active' : ''
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>dark mode</span>
          </button>
        </div>
      </div>

      {/* Persistent Storage Information */}
      <div className="uw-card space-y-3">
        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
          <HardDrive className="w-4 h-4 text-[var(--c4)]" />
          <h3 className="font-sans text-sm font-bold text-[var(--c5)]">
            Local Disk Storage System
          </h3>
        </div>

        <p className="font-mono text-xs text-[var(--c3)] leading-relaxed">
          Zero database, zero authentication. All goals, habits, daily logs, and custom aspect inboxes are saved locally to disk in plain JSON format:
        </p>

        <div className="p-3 border border-[var(--border)] bg-[var(--c1)]/50 font-mono text-xs space-y-1">
          <div className="text-[var(--c5)] font-semibold">Location: data/simpledo_db.json</div>
          <div className="text-[var(--c3)]">Active Goals: {appData.goals.length}</div>
          <div className="text-[var(--c3)]">Tracked Habits: {appData.habits.length}</div>
          <div className="text-[var(--c3)]">Aspect Inboxes: {appData.inboxes.length}</div>
          <div className="text-[var(--c3)]">Archived Logs: {appData.dailyLogs.length}</div>
        </div>
      </div>

      {/* Backup and Restore */}
      <div className="uw-card space-y-3">
        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
          <Download className="w-4 h-4 text-[var(--c4)]" />
          <h3 className="font-sans text-sm font-bold text-[var(--c5)]">
            Backup & Migration
          </h3>
        </div>

        <p className="font-mono text-xs text-[var(--c3)]">
          Download a standalone JSON backup of your tasks, habits, and streak archives, or restore from an existing file.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExport}
            className="uw-button uw-button-sm flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>export json backup</span>
          </button>

          <label className="uw-button uw-button-sm flex items-center gap-2 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>restore backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Reset System */}
      <div className="uw-card space-y-3 border-red-500/30">
        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <h3 className="font-sans text-sm font-bold text-red-500">
            Reset Database
          </h3>
        </div>

        <p className="font-mono text-xs text-[var(--c3)]">
          Reset all goals, habits, and inboxes back to the default initial template. This cannot be undone unless you export a backup first.
        </p>

        <div>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all SimpleDo data to defaults?')) {
                onResetData();
              }
            }}
            className="uw-button uw-button-sm !border-red-500/50 text-red-500 hover:bg-red-500/10 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>reset to initial state</span>
          </button>
        </div>
      </div>
    </div>
  );
};
