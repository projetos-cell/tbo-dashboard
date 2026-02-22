# TBO OS — Mapa de Permissoes

> Documento de referencia para controle de acesso por modulo e role.
> Atualizado em: 2026-02-22

---

## Roles Definidos

| Role Slug | Label | Nivel | Bypass RBAC |
|-----------|-------|-------|-------------|
| `founder` | Fundador | Super Admin | Sim |
| `admin` | Administrador | Super Admin | Sim |
| `owner` | Socio | Super Admin | Sim (alias founder) |
| `coordinator` | Coordenador | Gestor | Sim |
| `project_owner` | Lider de Projeto | Gestor | Nao |
| `finance` | Financeiro | Especialista | Nao |
| `comercial` | Comercial | Especialista | Nao |
| `artist` | Artista 3D | Colaborador | Nao |
| `3d-artist` | Artista 3D | Colaborador | Nao (alias artist) |
| `viewer` | Visualizador | Somente leitura | Nao |
| *(sem role)* | Aguardando Ativacao | Sem acesso | N/A |

---

## Modulos por Grupo e Permissao

### Inicio
| Modulo | Route | Roles Permitidos |
|--------|-------|------------------|
| Dashboard | `#/dashboard` | **Todos** (conteudo adapta por role) |
| Alertas | `#/alerts` | Todos |
| Caixa de Entrada | `#/inbox` | Todos |
| Chat | `#/chat` | Todos |

### Execucao
| Modulo | Route | Roles Permitidos |
|--------|-------|------------------|
| Projetos | `#/projetos` | Todos |
| Projetos (Notion) | `#/projetos-notion` | Todos (filtrado por BU) |
| Tarefas | `#/tarefas` | Todos |
| Calendario | `#/reunioes` | Todos |
| Agenda | `#/agenda` | Todos |
| Arquivos | `#/biblioteca` | Todos |
| Database | `#/database-notion` | Todos |

### Producao
| Modulo | Route | Roles Permitidos |
|--------|-------|------------------|
| QA / Aprovacoes | `#/entregas` | Todos |
| Revisoes | `#/revisoes` | Todos |
| Portal do Cliente | `#/portal-cliente` | founder, admin, coordinator, project_owner |

### Pessoas
| Modulo | Route | Roles Permitidos |
|--------|-------|------------------|
| Equipe (RH) | `#/rh` | Todos (dados filtrados por role) |
| Manual de Cultura | `#/cultura` | Todos |
| Trilha Aprendizagem | `#/trilha-aprendizagem` | Todos |
| Pessoas Avancado | `#/pessoas-avancado` | founder, admin, coordinator |

### Financeiro (SENSIVEL — oculto para nao autorizados)
| Modulo | Route | Roles Permitidos |
|--------|-------|------------------|
| Dashboard Financeiro | `#/financeiro` | founder, admin, finance |
| Contas a Pagar | `#/pagar` | founder, admin, finance |
| Contas a Receber | `#/receber` | founder, admin, finance |
| DRE / Margem | `#/margens` | founder, admin, finance |
| Conciliacao | `#/conciliacao` | founder, admin, finance |
| Conciliacao Bancaria | `#/conciliacao-bancaria` | founder, admin, finance |

### Comercial
| Modulo | Route | Roles Permitidos |
|--------|-------|------------------|
| Pipeline | `#/pipeline` | founder, admin, comercial, coordinator |
| Propostas | `#/comercial` | founder, admin, comercial, coordinator |
| Clientes | `#/clientes` | founder, admin, comercial, coordinator |
| Inteligencia BI | `#/inteligencia` | founder, admin, comercial |
| Intel. Imobiliaria | `#/inteligencia-imobiliaria` | founder, admin, comercial |
| Intel. de Mercado | `#/mercado` | founder, admin, comercial |

### Sistema (SENSIVEL — oculto para nao autorizados)
| Modulo | Route | Roles Permitidos |
|--------|-------|------------------|
| Admin Portal | `#/admin` | founder, admin |
| Seguranca | `#/permissoes-config` | founder, admin |
| Integracoes | `#/integracoes` | founder, admin |
| Configuracoes | `#/configuracoes` | Todos |
| Changelog | `#/changelog` | Todos |
| System Health | `#/system-health` | founder, admin |

### Outros
| Modulo | Route | Roles Permitidos |
|--------|-------|------------------|
| Conteudo & Redacao | `#/conteudo` | Todos |
| Decisoes | `#/decisoes` | founder, admin, coordinator |
| Templates | `#/templates` | Todos |
| Social Media | `#/rsm` | founder, admin, comercial |
| Relatorios | `#/relatorios` | founder, admin, coordinator, finance |

---

## Logica de BU (Business Unit)

- Cada usuario tem uma `bu` principal definida no profile (Supabase)
- **Colaboradores/Artistas** veem apenas dados da sua BU por padrao
- **Gestores (coordinator, project_owner)** veem dados da sua BU + toggle "Ver todas"
- **Admins (founder, admin)** veem tudo por padrao com toggle para filtrar por BU
- BUs conhecidas: Branding, Digital 3D, Audiovisual, Marketing, Vendas, Financeiro, Geral

## Regras Especiais

1. **Sem role definido** → Tela "Aguardando Ativacao" (nao navega para nenhum modulo)
2. **Super Admins** (founder, admin, owner) → Bypass total de RBAC
3. **Coordinator** → Bypass parcial (acesso amplo, mas nao admin/financeiro)
4. **Modulos sensiveis** → OCULTOS da sidebar (nao apenas bloqueados)
5. **RLS** → Todas as queries filtram por `tenant_id` via `get_user_tenant_ids()`

---

*Documento gerado em 2026-02-22. Manter atualizado ao adicionar novos modulos ou roles.*
