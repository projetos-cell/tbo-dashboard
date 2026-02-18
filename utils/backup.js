// TBO OS — Backup & Data Recovery System
// Auto-backup, import/export, rotation of localStorage snapshots

const TBO_BACKUP = {
  _prefix: 'tbo_backup_',
  _maxBackups: 7,
  _lastBackupKey: 'tbo_last_backup_date',

  // ── Collect all TBO data from localStorage ─────────────────────────────────

  _collectData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('tbo_') && !key.startsWith(this._prefix)) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key));
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    return data;
  },

  // ── Create a backup snapshot ───────────────────────────────────────────────

  createBackup(label = '') {
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const time = new Date().toISOString().slice(11, 19).replace(/:/g, ''); // HHmmss
    const key = `${this._prefix}${date}_${time}`;

    const snapshot = {
      version: typeof TBO_CONFIG !== 'undefined' ? TBO_CONFIG.app.version : 'unknown',
      createdAt: new Date().toISOString(),
      label: label || `Backup ${date}`,
      user: (() => {
        try {
          const auth = sessionStorage.getItem('tbo_auth');
          return auth ? JSON.parse(auth).name : 'sistema';
        } catch { return 'sistema'; }
      })(),
      data: this._collectData()
    };

    localStorage.setItem(key, JSON.stringify(snapshot));
    localStorage.setItem(this._lastBackupKey, new Date().toISOString());

    // Rotate old backups
    this._rotateBackups();

    return { key, snapshot };
  },

  // ── Auto-backup (once per day) ─────────────────────────────────────────────

  autoBackup() {
    const lastBackup = localStorage.getItem(this._lastBackupKey);
    if (lastBackup) {
      const lastDate = new Date(lastBackup).toISOString().slice(0, 10);
      const today = new Date().toISOString().slice(0, 10);
      if (lastDate === today) return false; // Already backed up today
    }

    this.createBackup('Backup automatico');
    console.log('[TBO Backup] Auto-backup criado');
    return true;
  },

  // ── Rotate backups (keep only last N) ──────────────────────────────────────

  _rotateBackups() {
    const backups = this.listBackups();
    if (backups.length > this._maxBackups) {
      // Remove oldest backups
      const toRemove = backups.slice(this._maxBackups);
      toRemove.forEach(b => localStorage.removeItem(b.key));
    }
  },

  // ── List all backups (newest first) ────────────────────────────────────────

  listBackups() {
    const backups = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this._prefix)) {
        try {
          const raw = localStorage.getItem(key);
          const snapshot = JSON.parse(raw);
          const dataKeys = snapshot.data ? Object.keys(snapshot.data).length : 0;
          const sizeKB = Math.round(raw.length / 1024);
          backups.push({
            key,
            date: snapshot.createdAt,
            label: snapshot.label,
            version: snapshot.version,
            user: snapshot.user,
            dataKeys,
            sizeKB
          });
        } catch {
          // Skip corrupted backups
        }
      }
    }
    // Sort newest first
    backups.sort((a, b) => new Date(b.date) - new Date(a.date));
    return backups;
  },

  // ── Restore from backup ────────────────────────────────────────────────────

  restoreBackup(backupKey) {
    const raw = localStorage.getItem(backupKey);
    if (!raw) return { ok: false, msg: 'Backup nao encontrado.' };

    try {
      const snapshot = JSON.parse(raw);
      if (!snapshot.data) return { ok: false, msg: 'Backup sem dados.' };

      // Clear existing TBO data (except backups and theme)
      const keysToKeep = new Set(['tbo_theme', 'tbo_sidebar_collapsed']);
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('tbo_') && !key.startsWith(this._prefix) && !keysToKeep.has(key)) {
          localStorage.removeItem(key);
        }
      }

      // Restore data
      let restored = 0;
      for (const [key, value] of Object.entries(snapshot.data)) {
        if (!keysToKeep.has(key)) {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          restored++;
        }
      }

      return {
        ok: true,
        msg: `Backup restaurado: ${restored} itens de ${snapshot.label} (v${snapshot.version})`,
        restoredKeys: restored
      };
    } catch (e) {
      return { ok: false, msg: 'Erro ao restaurar: ' + e.message };
    }
  },

  // ── Delete a specific backup ───────────────────────────────────────────────

  deleteBackup(backupKey) {
    localStorage.removeItem(backupKey);
  },

  // ── Export to downloadable JSON file ───────────────────────────────────────

  exportToFile() {
    const data = this._collectData();
    const exportObj = {
      exportedAt: new Date().toISOString(),
      version: typeof TBO_CONFIG !== 'undefined' ? TBO_CONFIG.app.version : 'unknown',
      user: (() => {
        try {
          const auth = sessionStorage.getItem('tbo_auth');
          return auth ? JSON.parse(auth).name : 'desconhecido';
        } catch { return 'desconhecido'; }
      })(),
      data
    };

    const json = JSON.stringify(exportObj, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tbo-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    return { ok: true, sizeKB: Math.round(json.length / 1024) };
  },

  // ── Import from JSON file ──────────────────────────────────────────────────

  importFromFile(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importObj = JSON.parse(e.target.result);

          if (!importObj.data) {
            resolve({ ok: false, msg: 'Arquivo invalido: campo "data" nao encontrado.' });
            return;
          }

          // Create safety backup before import
          this.createBackup('Pre-import safety backup');

          // Import data
          let imported = 0;
          for (const [key, value] of Object.entries(importObj.data)) {
            if (key.startsWith('tbo_') && !key.startsWith(this._prefix)) {
              localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
              imported++;
            }
          }

          resolve({
            ok: true,
            msg: `Importados ${imported} itens de v${importObj.version || '?'} (${importObj.exportedAt || 'data desconhecida'})`,
            importedKeys: imported
          });
        } catch (err) {
          resolve({ ok: false, msg: 'Erro ao ler arquivo: ' + err.message });
        }
      };
      reader.onerror = () => resolve({ ok: false, msg: 'Erro ao ler arquivo.' });
      reader.readAsText(file);
    });
  },

  // ── Storage usage info ─────────────────────────────────────────────────────

  getStorageInfo() {
    let totalSize = 0;
    let tboSize = 0;
    let backupSize = 0;
    let tboKeys = 0;
    let backupKeys = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      const size = (key.length + value.length) * 2; // UTF-16 = 2 bytes per char
      totalSize += size;

      if (key && key.startsWith('tbo_')) {
        if (key.startsWith(this._prefix)) {
          backupSize += size;
          backupKeys++;
        } else {
          tboSize += size;
          tboKeys++;
        }
      }
    }

    return {
      totalKB: Math.round(totalSize / 1024),
      tboKB: Math.round(tboSize / 1024),
      backupKB: Math.round(backupSize / 1024),
      tboKeys,
      backupKeys,
      limitKB: 5120 // ~5MB typical localStorage limit
    };
  }
};
