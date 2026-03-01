# TBO OS â€” Implementor Agent Guide

> Agente de implementacao. Corrige findings do Auditor usando templates.
> Trigger: "implementar fix", "corrigir [finding]", "aplicar template"
> Referencia: @docs/architecture.md para regras enterprise

## Pipeline Position
Auditor (1o) -> **Implementor** (2o) -> Validator (3o)

## 11 Templates de Implementacao

### Template 1: Page Layout
```tsx
// Server Component padrao
export default async function ModulePage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader title="" description="" actions={[]} />
      <Suspense fallback={<ModuleSkeleton />}>
        <ModuleContent />
      </Suspense>
    </div>
  )
}
```

### Template 2: Data Hook (React Query)
```tsx
export function useModuleData(id: string) {
  return useQuery({
    queryKey: ['module', id],
    queryFn: () => supabase.from('table').select('*').eq('id', id).single(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useModuleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ModuleInput) => supabase.from('table').upsert(data),
    onMutate: async (newData) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['module'] })
      const previous = queryClient.getQueryData(['module'])
      queryClient.setQueryData(['module'], (old) => ({ ...old, ...newData }))
      return { previous }
    },
    onError: (err, vars, context) => {
      queryClient.setQueryData(['module'], context?.previous)
      toast.error('Erro ao salvar')
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['module'] }),
  })
}
```

### Template 3: Three-State Component
```tsx
export function ModuleContent() {
  const { data, isLoading, error } = useModuleData()
  if (isLoading) return <ModuleSkeleton />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />
  if (!data?.length) return <EmptyState icon={Icon} title="" cta={{ label: '', onClick }} />
  return <ModuleList data={data} />
}
```

### Template 4: Form with Zod
```tsx
const schema = z.object({
  name: z.string().min(1, 'Obrigatorio'),
  email: z.string().email('Email invalido'),
})

export function ModuleForm({ onSubmit }: Props) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  })
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit">Salvar</Button>
      </form>
    </Form>
  )
}
```

### Template 5: Drag & Drop Universal
```tsx
export function SortableList({ items, onReorder }: Props) {
  const [undoStack, setUndoStack] = useState<Item[][]>([])
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const previousState = [...items]
    setUndoStack(prev => [...prev, previousState])

    // 1. Get target section rules
    const targetSection = getSectionRules(over.data.current?.sectionId)

    // 2. Optimistic update
    const newItems = arrayMove(items, oldIndex, newIndex).map(item =>
      item.id === active.id ? { ...item, ...targetSection.defaults } : item
    )
    queryClient.setQueryData(['items'], newItems)

    // 3. Persist to Supabase
    mutation.mutate({ id: active.id, order: newIndex, section_id: targetSection.id })
  }

  // Ctrl+Z handler
  useEffect(() => {
    function handleUndo(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && undoStack.length > 0) {
        const previous = undoStack[undoStack.length - 1]
        setUndoStack(prev => prev.slice(0, -1))
        queryClient.setQueryData(['items'], previous)
        mutation.mutate({ items: previous }) // sync to Supabase
      }
    }
    window.addEventListener('keydown', handleUndo)
    return () => window.removeEventListener('keydown', handleUndo)
  }, [undoStack])

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map(item => <SortableItem key={item.id} item={item} />)}
      </SortableContext>
    </DndContext>
  )
}
```

### Template 6: Notion-Style Table
```tsx
const PROPERTY_TYPES = {
  text: TextCell, number: NumberCell, select: SelectCell,
  multi_select: MultiSelectCell, status: StatusCell, person: PersonCell,
  checkbox: CheckboxCell, phone: PhoneCell, date: DateCell,
  files: FilesCell, url: UrlCell, email: EmailCell,
  relation: RelationCell, rollup: RollupCell, formula: FormulaCell,
  id: IdCell, created_at: TimestampCell, updated_at: TimestampCell,
} as const

export function NotionTable({ columns, rows, viewId }: Props) {
  const { data: filters } = useViewFilters(viewId)
  const [columnOrder, setColumnOrder] = useState(columns.map(c => c.id))

  return (
    <DndContext onDragEnd={handleColumnReorder}>
      <Table>
        <TableHeader>
          <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
            {columnOrder.map(colId => <SortableColumn key={colId} column={columns.find(c => c.id === colId)} />)}
          </SortableContext>
        </TableHeader>
        <TableBody>
          {filteredRows.map(row => (
            <TableRow key={row.id}>
              {columnOrder.map(colId => {
                const col = columns.find(c => c.id === colId)
                const CellComponent = PROPERTY_TYPES[col.type]
                return <CellComponent key={colId} value={row[col.key]} onChange={handleCellChange} />
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DndContext>
  )
}
```

### Template 7: RBAC Guard
```tsx
type Role = 'founder' | 'diretoria' | 'lider' | 'colaborador'
const ROLE_HIERARCHY: Record<Role, number> = {
  founder: 4, diretoria: 3, lider: 2, colaborador: 1,
}

export function RBACGuard({
  children, minRole, allowedRoles, fallback = null
}: {
  children: ReactNode
  minRole?: Role
  allowedRoles?: Role[]
  fallback?: ReactNode
}) {
  const { user } = useAuth()
  const userRole = user?.role as Role

  const hasAccess = allowedRoles
    ? allowedRoles.includes(userRole)
    : minRole
      ? ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole]
      : true

  if (!hasAccess) return fallback
  return <>{children}</>
}
```

### Template 8: Dashboard Dinamico por Role
```tsx
const DASHBOARD_WIDGETS: Record<Role, WidgetConfig[]> = {
  founder: [RevenueWidget, PipelineWidget, OKRsWidget, TeamWidget, IntelligenceWidget],
  diretoria: [RevenueWidget, PipelineWidget, OKRsWidget, TeamWidget],
  lider: [TeamWidget, ProjectsWidget, OKRsWidget],
  colaborador: [MyTasksWidget, MyOKRsWidget, RecognitionWidget],
}

export function DashboardPage() {
  const { user } = useAuth()
  const widgets = DASHBOARD_WIDGETS[user.role as Role] || []
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {widgets.map((Widget, i) => (
        <Suspense key={i} fallback={<WidgetSkeleton />}>
          <Widget />
        </Suspense>
      ))}
    </div>
  )
}
```

### Template 9: Audit Trail Logger
```tsx
export async function logAuditTrail({
  userId, action, table, recordId, before, after
}: AuditEntry) {
  await supabase.from('audit_trail').insert({
    user_id: userId,
    action, // 'create' | 'update' | 'delete'
    table_name: table,
    record_id: recordId,
    before_state: before ? JSON.stringify(before) : null,
    after_state: after ? JSON.stringify(after) : null,
    created_at: new Date().toISOString(),
  })
}
```

### Template 10: Integration Sync Pattern
```tsx
export async function syncIntegration(provider: 'omie' | 'rdstation' | 'fireflies') {
  const MAX_RETRIES = 3
  let attempt = 0

  while (attempt < MAX_RETRIES) {
    try {
      await supabase.from('sync_status').upsert({
        provider, status: 'syncing', last_attempt: new Date().toISOString()
      })

      const data = await fetchFromProvider(provider)
      await upsertToSupabase(provider, data)

      await supabase.from('sync_status').upsert({
        provider, status: 'synced', last_sync: new Date().toISOString(),
        records_synced: data.length, error_message: null
      })
      return
    } catch (error) {
      attempt++
      if (attempt >= MAX_RETRIES) {
        await supabase.from('sync_status').upsert({
          provider, status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
      }
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000))
    }
  }
}
```

### Template 11: Framer Motion Transitions
```tsx
export const motionTokens = {
  fast: { duration: 0.15 },
  normal: { duration: 0.25 },
  slow: { duration: 0.4 },
  spring: { type: 'spring', stiffness: 300, damping: 24 },
  stagger: { staggerChildren: 0.05 },
}

export const fadeIn = { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: motionTokens.normal }
export const slideUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: motionTokens.normal }
export const scaleIn = { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: motionTokens.fast }
```

## Regras de Implementacao
- SEMPRE seguir o template mais proximo antes de customizar
- SEMPRE verificar @docs/architecture.md para regras enterprise
- NUNCA implementar sem os 3 estados (loading, error, empty)
- NUNCA implementar D&D sem undo + optimistic + section rules
- NUNCA implementar RBAC sem dual-layer (frontend + RLS)
- NUNCA implementar integracao sem retry + sync status + fallback
