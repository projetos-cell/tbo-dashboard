// ============================================================================
// TBO OS — Document Versions Engine
// Upload, versionamento, historico, rollback e preview de documentos
// ============================================================================

const TBO_DOC_VERSIONS = {

  _BUCKET: 'document-versions',

  // ══════════════════════════════════════════════════════════════════════
  // UPLOAD DE NOVA VERSAO
  // ══════════════════════════════════════════════════════════════════════
  async uploadNewVersion(documentId, documentType, file, changelog = '') {
    const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
    if (!client) throw new Error('Supabase nao disponivel');

    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    if (!user) throw new Error('Usuario nao autenticado');

    // 1. Upload do arquivo para Storage
    const ext = file.name.split('.').pop();
    const storagePath = `${documentType}/${documentId}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await client.storage
      .from(this._BUCKET)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) throw uploadError;

    // 2. Inserir registro na tabela document_versions
    // (o trigger fn_auto_version_document cuida da versao e is_current)
    const { data: version, error: insertError } = await client
      .from('document_versions')
      .insert({
        document_id: documentId,
        document_type: documentType,
        file_name: file.name,
        file_path: storagePath,
        file_size: file.size,
        mime_type: file.type,
        changelog: changelog,
        uploaded_by: user.supabaseId,
        uploaded_by_name: user.name
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // 3. Gerar preview (chamar Edge Function)
    try {
      await client.functions.invoke('document-preview', {
        body: {
          document_version_id: version.id,
          file_path: storagePath,
          mime_type: file.type
        }
      });
    } catch (e) {
      console.warn('[TBO DocVersions] Preview generation failed:', e);
    }

    if (typeof TBO_TOAST !== 'undefined') {
      TBO_TOAST.success('Versao enviada', `Versao ${version.version} de "${file.name}" salva com sucesso.`);
    }

    return version;
  },

  // ══════════════════════════════════════════════════════════════════════
  // LISTAR VERSOES DE UM DOCUMENTO
  // ══════════════════════════════════════════════════════════════════════
  async getVersions(documentId) {
    const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
    if (!client) return [];

    const { data, error } = await client
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version', { ascending: false });

    if (error) {
      console.error('[TBO DocVersions] Erro ao buscar versoes:', error);
      return [];
    }

    return data || [];
  },

  // ══════════════════════════════════════════════════════════════════════
  // OBTER URL PUBLICA DE UM ARQUIVO
  // ══════════════════════════════════════════════════════════════════════
  getFileUrl(filePath) {
    const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
    if (!client || !filePath) return '';

    const { data } = client.storage
      .from(this._BUCKET)
      .getPublicUrl(filePath);

    return data?.publicUrl || '';
  },

  // ══════════════════════════════════════════════════════════════════════
  // ROLLBACK (restaurar versao anterior como current)
  // ══════════════════════════════════════════════════════════════════════
  async rollbackToVersion(documentId, versionId) {
    const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
    if (!client) throw new Error('Supabase nao disponivel');

    // 1. Desmarcar todas como nao-current
    await client
      .from('document_versions')
      .update({ is_current: false })
      .eq('document_id', documentId);

    // 2. Marcar a versao escolhida como current
    const { data, error } = await client
      .from('document_versions')
      .update({ is_current: true })
      .eq('id', versionId)
      .select()
      .single();

    if (error) throw error;

    if (typeof TBO_TOAST !== 'undefined') {
      TBO_TOAST.success('Versao restaurada', `Versao ${data.version} agora e a versao atual.`);
    }

    return data;
  },

  // ══════════════════════════════════════════════════════════════════════
  // RENDERIZAR HISTORICO DE VERSOES (UI inline)
  // ══════════════════════════════════════════════════════════════════════
  async renderVersionHistory(container, documentId, documentType = 'deliverable') {
    if (!container) return;

    container.innerHTML = `
      <div style="text-align:center;padding:20px;">
        <div class="skel-shimmer" style="width:100%;height:200px;border-radius:8px;"></div>
      </div>
    `;

    const versions = await this.getVersions(documentId);

    if (versions.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:32px;color:var(--text-muted);">
          <i data-lucide="file-x" style="width:32px;height:32px;margin-bottom:8px;"></i>
          <p style="font-size:0.8rem;">Nenhuma versao encontrada.</p>
          <button class="btn btn-primary btn-sm doc-upload-btn" style="margin-top:8px;">
            <i data-lucide="upload" style="width:14px;height:14px;"></i> Enviar primeira versao
          </button>
        </div>
      `;
      this._bindUploadBtn(container, documentId, documentType);
      if (window.lucide) lucide.createIcons();
      return;
    }

    const formatSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    container.innerHTML = `
      <div class="doc-version-history">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <h4 style="margin:0;font-size:0.85rem;display:flex;align-items:center;gap:6px;">
            <i data-lucide="history" style="width:16px;height:16px;color:var(--brand-orange);"></i>
            Historico de Versoes (${versions.length})
          </h4>
          <button class="btn btn-primary btn-sm doc-upload-btn">
            <i data-lucide="upload" style="width:14px;height:14px;"></i> Nova Versao
          </button>
        </div>

        <div class="doc-versions-list" style="display:flex;flex-direction:column;gap:6px;">
          ${versions.map((v, i) => `
            <div class="doc-version-item" data-version-id="${v.id}" style="
              display:flex;align-items:center;gap:12px;padding:10px 12px;
              border-radius:8px;border:1px solid ${v.is_current ? 'var(--brand-orange)' : 'var(--border-default)'};
              background:${v.is_current ? 'rgba(255,107,53,0.05)' : 'var(--bg-card)'};
              transition:all 150ms;">

              <!-- Icone do tipo -->
              <div style="width:36px;height:36px;border-radius:8px;background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <i data-lucide="${this._getFileIcon(v.mime_type)}" style="width:18px;height:18px;color:${v.is_current ? 'var(--brand-orange)' : 'var(--text-muted)'};"></i>
              </div>

              <!-- Info -->
              <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="font-size:0.8rem;font-weight:600;">v${v.version}</span>
                  ${v.is_current ? '<span style="font-size:0.6rem;background:var(--brand-orange);color:#fff;padding:2px 6px;border-radius:4px;font-weight:600;">ATUAL</span>' : ''}
                  <span style="font-size:0.72rem;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${v.file_name}</span>
                </div>
                <div style="display:flex;align-items:center;gap:8px;margin-top:2px;">
                  <span style="font-size:0.65rem;color:var(--text-muted);">${formatDate(v.created_at)}</span>
                  <span style="font-size:0.65rem;color:var(--text-muted);">·</span>
                  <span style="font-size:0.65rem;color:var(--text-muted);">${formatSize(v.file_size)}</span>
                  <span style="font-size:0.65rem;color:var(--text-muted);">·</span>
                  <span style="font-size:0.65rem;color:var(--text-muted);">${v.uploaded_by_name || 'Sistema'}</span>
                </div>
                ${v.changelog ? `<div style="font-size:0.68rem;color:var(--text-secondary);margin-top:4px;font-style:italic;">"${v.changelog}"</div>` : ''}
              </div>

              <!-- Acoes -->
              <div style="display:flex;gap:4px;flex-shrink:0;">
                <button class="btn btn-sm doc-preview-btn" data-path="${v.file_path}" data-mime="${v.mime_type}" title="Visualizar"
                  style="padding:4px 8px;">
                  <i data-lucide="eye" style="width:14px;height:14px;"></i>
                </button>
                <button class="btn btn-sm doc-download-btn" data-path="${v.file_path}" data-name="${v.file_name}" title="Baixar"
                  style="padding:4px 8px;">
                  <i data-lucide="download" style="width:14px;height:14px;"></i>
                </button>
                ${!v.is_current ? `
                  <button class="btn btn-sm doc-rollback-btn" data-version-id="${v.id}" data-doc-id="${documentId}" title="Restaurar como atual"
                    style="padding:4px 8px;">
                    <i data-lucide="rotate-ccw" style="width:14px;height:14px;"></i>
                  </button>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Bind events
    this._bindUploadBtn(container, documentId, documentType);
    this._bindVersionActions(container, documentId, documentType);
    if (window.lucide) lucide.createIcons();
  },

  _getFileIcon(mimeType) {
    if (!mimeType) return 'file';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'file-text';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'file-text';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'table';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'music';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return 'file-archive';
    return 'file';
  },

  _bindUploadBtn(container, documentId, documentType) {
    container.querySelectorAll('.doc-upload-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._showUploadModal(documentId, documentType, container);
      });
    });
  },

  _showUploadModal(documentId, documentType, container) {
    // Criar modal de upload inline
    const modal = document.createElement('div');
    modal.className = 'doc-upload-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = `
      <div style="background:var(--bg-card);border-radius:12px;padding:24px;max-width:440px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
        <h3 style="margin:0 0 16px;font-size:0.95rem;display:flex;align-items:center;gap:8px;">
          <i data-lucide="upload" style="width:18px;height:18px;color:var(--brand-orange);"></i>
          Nova Versao do Documento
        </h3>

        <div class="doc-upload-dropzone" style="
          border:2px dashed var(--border-default);border-radius:8px;padding:32px;
          text-align:center;cursor:pointer;transition:all 200ms;margin-bottom:12px;">
          <i data-lucide="cloud-upload" style="width:32px;height:32px;color:var(--text-muted);margin-bottom:8px;"></i>
          <p style="margin:0;font-size:0.8rem;color:var(--text-muted);">Clique ou arraste um arquivo aqui</p>
          <input type="file" class="doc-file-input" style="display:none;">
          <div class="doc-file-preview" style="display:none;margin-top:12px;"></div>
        </div>

        <div class="form-group" style="margin-bottom:12px;">
          <label style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:4px;display:block;">Notas da versao (opcional)</label>
          <textarea class="form-input doc-changelog" rows="2" placeholder="O que mudou nesta versao?" style="font-size:0.8rem;"></textarea>
        </div>

        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button class="btn btn-sm doc-cancel-btn">Cancelar</button>
          <button class="btn btn-primary btn-sm doc-submit-btn" disabled>Enviar Versao</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    if (window.lucide) lucide.createIcons();

    let selectedFile = null;
    const fileInput = modal.querySelector('.doc-file-input');
    const dropzone = modal.querySelector('.doc-upload-dropzone');
    const preview = modal.querySelector('.doc-file-preview');
    const submitBtn = modal.querySelector('.doc-submit-btn');
    const cancelBtn = modal.querySelector('.doc-cancel-btn');
    const changelog = modal.querySelector('.doc-changelog');

    // Dropzone click
    dropzone.addEventListener('click', () => fileInput.click());

    // Drag & drop
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--brand-orange)'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = 'var(--border-default)'; });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--border-default)';
      if (e.dataTransfer.files.length > 0) selectFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) selectFile(fileInput.files[0]);
    });

    const selectFile = (file) => {
      selectedFile = file;
      const size = file.size < 1048576 ? (file.size / 1024).toFixed(1) + ' KB' : (file.size / 1048576).toFixed(1) + ' MB';
      preview.style.display = 'block';
      preview.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;padding:8px;background:var(--bg-tertiary);border-radius:6px;">
          <i data-lucide="${this._getFileIcon(file.type)}" style="width:16px;height:16px;color:var(--brand-orange);"></i>
          <span style="font-size:0.75rem;flex:1;text-align:left;">${file.name}</span>
          <span style="font-size:0.65rem;color:var(--text-muted);">${size}</span>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      submitBtn.disabled = false;
    };

    cancelBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    submitBtn.addEventListener('click', async () => {
      if (!selectedFile) return;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';

      try {
        await this.uploadNewVersion(documentId, documentType, selectedFile, changelog.value.trim());
        modal.remove();
        // Re-render version history
        await this.renderVersionHistory(container, documentId, documentType);
      } catch (e) {
        console.error('[TBO DocVersions] Upload error:', e);
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro no upload', e.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Versao';
      }
    });
  },

  _bindVersionActions(container, documentId, documentType) {
    // Preview
    container.querySelectorAll('.doc-preview-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const path = btn.dataset.path;
        const mime = btn.dataset.mime;
        const url = this.getFileUrl(path);
        if (url) window.open(url, '_blank');
      });
    });

    // Download
    container.querySelectorAll('.doc-download-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const path = btn.dataset.path;
        const name = btn.dataset.name;
        const url = this.getFileUrl(path);
        if (url) {
          const a = document.createElement('a');
          a.href = url;
          a.download = name;
          a.click();
        }
      });
    });

    // Rollback
    container.querySelectorAll('.doc-rollback-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const versionId = btn.dataset.versionId;
        const docId = btn.dataset.docId;
        if (!confirm('Restaurar esta versao como a versao atual?')) return;
        try {
          await this.rollbackToVersion(docId, versionId);
          await this.renderVersionHistory(container, docId, documentType);
        } catch (e) {
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', e.message);
        }
      });
    });
  },

  // ══════════════════════════════════════════════════════════════════════
  // INIT
  // ══════════════════════════════════════════════════════════════════════
  init() {
    console.log('[TBO DocVersions] Engine initialized');
  }
};
