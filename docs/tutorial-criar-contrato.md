# Como Criar um Contrato no TBO OS

> Tutorial passo a passo para criar, gerar e enviar contratos para assinatura digital.

---

## Acesso

1. No menu lateral, clique em **Contratos**
2. Clique no botao **+ Novo Contrato** (canto superior direito)
3. Voce sera redirecionado para o assistente de criacao em 5 etapas

> **Permissao necessaria:** Diretoria ou superior.

---

## Etapa 1 — Dados Basicos

Preencha as informacoes gerais do contrato.

| Campo | Obrigatorio | Descricao |
|-------|:-----------:|-----------|
| Titulo | Sim | Nome identificador do contrato. Ex: "Branding Empreendimento XYZ" |
| Descricao | Nao | Detalhes adicionais sobre o objeto do contrato |
| Categoria | Nao | Cliente, Equipe, Fornecedor ou Distrato |
| Tipo | Nao | PJ (padrao), NDA, Aditivo, Freelancer, CLT ou Outro |
| Valor Total | Nao | Valor global do contrato em R$ |
| Inicio | Nao | Data de inicio da vigencia |
| Fim | Nao | Data de encerramento da vigencia |

Clique em **Proximo** para avancar.

---

## Etapa 2 — Escopo

Adicione os itens de entrega do contrato. Cada item representa um servico ou entregavel.

1. Clique em **Adicionar Item**
2. Preencha:
   - **Titulo** (obrigatorio) — Ex: "Identidade Visual", "Filme de Lancamento"
   - **Categoria** — Branding, 3D, Audiovisual, Marketing Digital, Design, Desenvolvimento, Consultoria
   - **Valor (R$)** — Valor individual deste item
   - **Inicio/Fim Estimado** — Datas previstas de execucao

> O sistema soma automaticamente os valores de todos os itens no topo da tela.

Repita para cada entregavel. Voce pode **reordenar** os itens arrastando pelo icone de grip.

Clique em **Proximo**.

---

## Etapa 3 — Partes e Signatarios

Defina quem assina o contrato. O sistema ja adiciona automaticamente dois campos:

- **Contratante** (borda azul) — Quem contrata os servicos
- **Contratado** (borda verde) — Quem presta os servicos

Para cada parte, preencha:

| Campo | Obrigatorio | Descricao |
|-------|:-----------:|-----------|
| Nome / Razao Social | Sim | Nome completo ou razao social |
| E-mail | Sim | E-mail para receber o link de assinatura |
| CPF / CNPJ | Nao | Documento de identificacao |
| Papel | Sim | Contratante, Contratado, Signatario, Testemunha ou Aprovador |

### Adicionando mais partes

Use os botoes no topo:
- **Testemunha** — Adiciona uma testemunha (exigido por lei para validade)
- **Signatario** — Adiciona um signatario adicional

> **Dica:** O sistema alerta com badges amarelos se faltar Contratante ou Contratado.

Clique em **Proximo**.

---

## Etapa 4 — Documento

Aqui voce define o PDF do contrato. Existem duas opcoes:

### Opcao A: Gerar Automaticamente (Recomendado)

1. Clique em **Gerar Contrato PDF**
2. Na janela que abrir:
   - Escolha o **Modelo** (PJ, NDA, Freelancer, CLT, Aditivo ou Generico)
   - Os dados de Contratante e Contratado ja vem pre-preenchidos com os defaults da TBO
   - Use o **Assistente IA** para gerar clausulas automaticamente:
     - **Gerar Tudo** — Gera clausula objeto, escopo detalhado e sugestao de pagamento
     - **Clausula Objeto** — Apenas a clausula de objeto
     - **Detalhar Escopo** — Expande os itens de escopo em texto juridico
     - **Sugerir Pagamento** — Sugere estrutura de pagamento
   - Ajuste campos de **Pagamento e Multa** se necessario
   - Adicione **Clausulas Adicionais** se houver
3. Clique em **Gerar e Baixar PDF**
4. O PDF e automaticamente anexado ao contrato

> O modelo PJ padrao da TBO tem 13 clausulas completas, incluindo LGPD, direitos autorais, cessao e tolerancia.

### Opcao B: Upload Manual

1. Clique em **Ja tenho o documento pronto**
2. Arraste o arquivo ou clique para selecionar
3. Formatos aceitos: PDF, DOC, DOCX (max 10MB)

> Voce pode pular esta etapa e adicionar o documento depois.

Clique em **Proximo**.

---

## Etapa 5 — Revisao

Confira todos os dados antes de criar:

- **Dados Basicos** — Titulo, categoria, tipo, valor, periodo
- **Escopo** — Lista de itens com valores e total
- **Signatarios** — Nome, e-mail e papel de cada parte
- **Documento** — Arquivo anexado (ou aviso de que nao ha documento)
- **Assinatura Digital** — Status da integracao com Clicksign (verde = conectado)

> Se o badge do Clicksign estiver vermelho ou amarelo, o contrato sera criado mas o envio automatico para assinatura nao funcionara. Nesse caso, entre em contato com o time tecnico.

Clique em **Criar Contrato**.

---

## O que acontece apos criar

1. O contrato e salvo como **Rascunho** no banco de dados
2. Todos os itens de escopo sao criados com status **Pendente**
3. Todos os signatarios sao registrados com status **Pendente**
4. **Se houver documento + signatarios**: o sistema envia automaticamente para o Clicksign
5. Voce e redirecionado para a pagina de detalhe do contrato

---

## Pagina de Detalhe

Apos a criacao, voce tem acesso a:

| Secao | Descricao |
|-------|-----------|
| Status | Badge com status atual (Rascunho, Aguardando Assinatura, Ativo, etc.) |
| Escopo | Tabela editavel com progresso de cada entrega |
| Signatarios | Lista com status de assinatura de cada parte |
| Timeline | Historico de eventos do contrato |
| Acoes | Enviar/Reenviar para Clicksign, Cancelar envelope, Notificar signatarios |

---

## Fluxo Resumido

```
Dados Basicos → Escopo → Signatarios → Documento → Revisao → Criar
                                            |
                                     Gerar PDF (IA)
                                     ou Upload manual
                                            |
                                     Clicksign (automatico)
                                            |
                                     Assinatura digital
```

---

## Dicas

- **Contratante padrao**: O sistema ja preenche os dados da TBO (razao social, CNPJ, endereco) ao gerar o PDF
- **Templates**: Use o modelo PJ para prestacao de servicos (mais completo) ou NDA para confidencialidade
- **IA**: O assistente Claude gera clausulas baseadas no contexto do contrato — quanto mais dados voce preencher nas etapas anteriores, melhor o resultado
- **Escopo detalhado**: Itens de escopo bem descritos geram clausulas mais precisas no PDF
- **Sem documento**: Voce pode criar o contrato sem documento e adicionar depois pela pagina de detalhe
- **Clicksign**: A assinatura digital tem validade juridica. O badge de status no header indica se a integracao esta operacional
