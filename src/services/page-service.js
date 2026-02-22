/**
 * TBO OS — Page Service
 *
 * Ponto unico de criacao de paginas.
 * Garante que toda pagina nova ja venha com o editor de blocos
 * e pelo menos um bloco de texto vazio.
 *
 * TODOS os modulos devem usar PageService.createPage() em vez de PagesRepo.create() direto.
 */

const PageService = (() => {
  'use strict';

  return {
    /**
     * Criar nova pagina com bloco inicial
     * @param {Object} opts
     * @param {string} opts.space_id - ID do workspace
     * @param {string} [opts.title] - Titulo (default: 'Nova pagina')
     * @param {string} [opts.icon] - Icone (emoji ou lucide name)
     * @param {string} [opts.cover_url] - URL da capa
     * @param {string} opts.created_by - UUID do usuario criador
     * @returns {Object} Pagina criada (com has_blocks = true)
     */
    async createPage({ space_id, title, icon, cover_url, created_by }) {
      if (!created_by) throw new Error('[PageService] created_by e obrigatorio');

      // 1. Criar pagina com has_blocks = true
      const page = await PagesRepo.create({
        space_id,
        title: title || 'Nova página',
        content: {},
        icon: icon || null,
        cover_url: cover_url || null,
        created_by
      });

      // 2. Marcar como pagina de blocos
      await PagesRepo.update(page.id, { has_blocks: true });
      page.has_blocks = true;

      // 3. Criar bloco inicial de texto vazio
      try {
        await PageBlocksRepo.create({
          page_id: page.id,
          type: 'text',
          content: { text: '', marks: [] },
          props: {},
          position: 1,
          created_by
        });
      } catch (err) {
        console.error('[PageService] Erro ao criar bloco inicial:', err);
        // Pagina foi criada — nao falhar totalmente
      }

      return page;
    },

    /**
     * Migrar pagina legada (content.html) para blocos
     * Cria um unico bloco de texto com o HTML existente
     */
    async migrateToBlocks(pageId) {
      const page = await PagesRepo.getById(pageId);
      if (!page) throw new Error('Pagina nao encontrada');
      if (page.has_blocks) return page; // ja migrada

      const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
      const uid = user?.supabaseId || user?.id;

      // Criar bloco com conteudo HTML legado
      const htmlContent = page.content?.html || '';
      await PageBlocksRepo.create({
        page_id: pageId,
        type: 'text',
        content: { text: htmlContent, marks: [], legacy_html: true },
        props: {},
        position: 1,
        created_by: uid
      });

      // Marcar pagina como blocos
      await PagesRepo.update(pageId, { has_blocks: true });
      page.has_blocks = true;

      return page;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.PageService = PageService;
}
