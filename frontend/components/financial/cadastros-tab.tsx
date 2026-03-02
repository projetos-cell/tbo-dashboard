"use client";

import { useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  FolderTree,
  Building2,
  Users,
  Wallet,
  Plus,
  Pencil,
  Loader2,
} from "lucide-react";
import {
  useFinCategories,
  useCostCenters,
  useCreateCostCenter,
  useUpdateCostCenter,
  useVendors,
  useCreateVendor,
  useUpdateVendor,
  useFinClients,
  useCreateFinClient,
  useUpdateFinClient,
} from "@/hooks/use-financial";
import { useAuthStore } from "@/stores/auth-store";

// ── Types ──────────────────────────────────────────────────────

interface CostCenterForm {
  name: string;
  slug: string;
  category: string;
  description: string;
  requires_project: boolean;
}

interface VendorForm {
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  category: string;
}

interface ClientForm {
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  contact_name: string;
}

const emptyCostCenter: CostCenterForm = {
  name: "",
  slug: "",
  category: "",
  description: "",
  requires_project: false,
};

const emptyVendor: VendorForm = {
  name: "",
  cnpj: "",
  email: "",
  phone: "",
  category: "",
};

const emptyClient: ClientForm = {
  name: "",
  cnpj: "",
  email: "",
  phone: "",
  contact_name: "",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ── Component ──────────────────────────────────────────────────

export function CadastrosTab() {
  const tenantId = useAuthStore((s) => s.tenantId);

  const [subTab, setSubTab] = useState("categories");
  const [catSearch, setCatSearch] = useState("");
  const [ccSearch, setCcSearch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");

  // Data hooks
  const { data: categories = [], isLoading: loadingCat } = useFinCategories();
  const { data: costCenters = [], isLoading: loadingCC } = useCostCenters();
  const { data: vendors = [], isLoading: loadingVendors } = useVendors(vendorSearch || undefined);
  const { data: clients = [], isLoading: loadingClients } = useFinClients(clientSearch || undefined);

  // Mutation hooks
  const createCC = useCreateCostCenter();
  const updateCC = useUpdateCostCenter();
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const createClient = useCreateFinClient();
  const updateClient = useUpdateFinClient();

  // Dialog state
  const [ccDialogOpen, setCcDialogOpen] = useState(false);
  const [ccEditId, setCcEditId] = useState<string | null>(null);
  const [ccForm, setCcForm] = useState<CostCenterForm>(emptyCostCenter);

  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [vendorEditId, setVendorEditId] = useState<string | null>(null);
  const [vendorForm, setVendorForm] = useState<VendorForm>(emptyVendor);

  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [clientEditId, setClientEditId] = useState<string | null>(null);
  const [clientForm, setClientForm] = useState<ClientForm>(emptyClient);

  // Filtered data
  const filteredCategories = catSearch
    ? categories.filter((c) => c.name.toLowerCase().includes(catSearch.toLowerCase()))
    : categories;

  const filteredCostCenters = ccSearch
    ? costCenters.filter((c) => c.name.toLowerCase().includes(ccSearch.toLowerCase()))
    : costCenters;

  // ── Cost Center handlers ──

  const openNewCC = useCallback(() => {
    setCcEditId(null);
    setCcForm(emptyCostCenter);
    setCcDialogOpen(true);
  }, []);

  const openEditCC = useCallback(
    (cc: (typeof costCenters)[number]) => {
      setCcEditId(cc.id);
      setCcForm({
        name: cc.name,
        slug: cc.slug,
        category: cc.category ?? "",
        description: cc.description ?? "",
        requires_project: cc.requires_project ?? false,
      });
      setCcDialogOpen(true);
    },
    []
  );

  const handleSaveCC = useCallback(() => {
    if (!ccForm.name.trim() || !tenantId) return;
    const slug = ccForm.slug.trim() || slugify(ccForm.name);

    if (ccEditId) {
      updateCC.mutate(
        {
          id: ccEditId,
          updates: {
            name: ccForm.name.trim(),
            slug,
            category: ccForm.category || null,
            description: ccForm.description || null,
            requires_project: ccForm.requires_project,
          },
        },
        { onSuccess: () => setCcDialogOpen(false) }
      );
    } else {
      createCC.mutate(
        {
          name: ccForm.name.trim(),
          slug,
          category: ccForm.category || null,
          description: ccForm.description || null,
          requires_project: ccForm.requires_project,
          tenant_id: tenantId,
        } as never,
        { onSuccess: () => setCcDialogOpen(false) }
      );
    }
  }, [ccForm, ccEditId, tenantId, createCC, updateCC]);

  // ── Vendor handlers ──

  const openNewVendor = useCallback(() => {
    setVendorEditId(null);
    setVendorForm(emptyVendor);
    setVendorDialogOpen(true);
  }, []);

  const openEditVendor = useCallback(
    (v: (typeof vendors)[number]) => {
      setVendorEditId(v.id);
      setVendorForm({
        name: v.name,
        cnpj: v.cnpj ?? "",
        email: v.email ?? "",
        phone: v.phone ?? "",
        category: v.category ?? "",
      });
      setVendorDialogOpen(true);
    },
    []
  );

  const handleSaveVendor = useCallback(() => {
    if (!vendorForm.name.trim() || !tenantId) return;

    if (vendorEditId) {
      updateVendor.mutate(
        {
          id: vendorEditId,
          updates: {
            name: vendorForm.name.trim(),
            cnpj: vendorForm.cnpj || null,
            email: vendorForm.email || null,
            phone: vendorForm.phone || null,
            category: vendorForm.category || null,
          },
        },
        { onSuccess: () => setVendorDialogOpen(false) }
      );
    } else {
      createVendor.mutate(
        {
          name: vendorForm.name.trim(),
          cnpj: vendorForm.cnpj || null,
          email: vendorForm.email || null,
          phone: vendorForm.phone || null,
          category: vendorForm.category || null,
          tenant_id: tenantId,
        } as never,
        { onSuccess: () => setVendorDialogOpen(false) }
      );
    }
  }, [vendorForm, vendorEditId, tenantId, createVendor, updateVendor]);

  // ── Client handlers ──

  const openNewClient = useCallback(() => {
    setClientEditId(null);
    setClientForm(emptyClient);
    setClientDialogOpen(true);
  }, []);

  const openEditClient = useCallback(
    (c: (typeof clients)[number]) => {
      setClientEditId(c.id);
      setClientForm({
        name: c.name,
        cnpj: c.cnpj ?? "",
        email: c.email ?? "",
        phone: c.phone ?? "",
        contact_name: c.contact_name ?? "",
      });
      setClientDialogOpen(true);
    },
    []
  );

  const handleSaveClient = useCallback(() => {
    if (!clientForm.name.trim() || !tenantId) return;

    if (clientEditId) {
      updateClient.mutate(
        {
          id: clientEditId,
          updates: {
            name: clientForm.name.trim(),
            cnpj: clientForm.cnpj || null,
            email: clientForm.email || null,
            phone: clientForm.phone || null,
            contact_name: clientForm.contact_name || null,
          },
        },
        { onSuccess: () => setClientDialogOpen(false) }
      );
    } else {
      createClient.mutate(
        {
          name: clientForm.name.trim(),
          cnpj: clientForm.cnpj || null,
          email: clientForm.email || null,
          phone: clientForm.phone || null,
          contact_name: clientForm.contact_name || null,
          tenant_id: tenantId,
        } as never,
        { onSuccess: () => setClientDialogOpen(false) }
      );
    }
  }, [clientForm, clientEditId, tenantId, createClient, updateClient]);

  const isSavingCC = createCC.isPending || updateCC.isPending;
  const isSavingVendor = createVendor.isPending || updateVendor.isPending;
  const isSavingClient = createClient.isPending || updateClient.isPending;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Gerencie categorias, centros de custo, fornecedores e clientes.
      </p>

      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList>
          <TabsTrigger value="categories">
            <FolderTree className="mr-1.5 h-3.5 w-3.5" />
            Categorias
          </TabsTrigger>
          <TabsTrigger value="cost-centers">
            <Wallet className="mr-1.5 h-3.5 w-3.5" />
            Centros de Custo
          </TabsTrigger>
          <TabsTrigger value="vendors">
            <Building2 className="mr-1.5 h-3.5 w-3.5" />
            Fornecedores
          </TabsTrigger>
          <TabsTrigger value="clients">
            <Users className="mr-1.5 h-3.5 w-3.5" />
            Clientes
          </TabsTrigger>
        </TabsList>

        {/* Categories — READ-ONLY (synced from Omie) */}
        <TabsContent value="categories" className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                placeholder="Buscar categoria..."
                className="pl-9"
              />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button size="sm" variant="outline" disabled>
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Nova Categoria
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Categorias sao sincronizadas do Omie</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {loadingCat ? (
            <LoadingState />
          ) : filteredCategories.length === 0 ? (
            <EmptyState icon={FolderTree} text="Nenhuma categoria encontrada" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-center">Ativa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {cat.color && (
                          <span
                            className="size-3 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                        )}
                        <span className="font-medium text-sm">{cat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {cat.type ?? "\u2014"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {cat.slug ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={cat.is_active ? "default" : "secondary"} className="text-xs">
                        {cat.is_active ? "Sim" : "Nao"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        {/* Cost Centers */}
        <TabsContent value="cost-centers" className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={ccSearch}
                onChange={(e) => setCcSearch(e.target.value)}
                placeholder="Buscar centro de custo..."
                className="pl-9"
              />
            </div>
            <Button size="sm" onClick={openNewCC}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Novo Centro de Custo
            </Button>
          </div>
          {loadingCC ? (
            <LoadingState />
          ) : filteredCostCenters.length === 0 ? (
            <EmptyState icon={Wallet} text="Nenhum centro de custo encontrado" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descricao</TableHead>
                  <TableHead className="text-center">Req. Projeto</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCostCenters.map((cc) => (
                  <TableRow key={cc.id}>
                    <TableCell className="font-medium text-sm">{cc.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {cc.category ?? "\u2014"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {cc.description ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {cc.requires_project ? "Sim" : "Nao"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEditCC(cc)}
                        aria-label="Editar centro de custo"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        {/* Vendors */}
        <TabsContent value="vendors" className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
                placeholder="Buscar fornecedor..."
                className="pl-9"
              />
            </div>
            <Button size="sm" onClick={openNewVendor}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Novo Fornecedor
            </Button>
          </div>
          {loadingVendors ? (
            <LoadingState />
          ) : vendors.length === 0 ? (
            <EmptyState icon={Building2} text="Nenhum fornecedor encontrado" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium text-sm">{v.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {v.cnpj ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {v.email ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {v.phone ?? "\u2014"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {v.category ?? "\u2014"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEditVendor(v)}
                        aria-label="Editar fornecedor"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        {/* Clients */}
        <TabsContent value="clients" className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Buscar cliente..."
                className="pl-9"
              />
            </div>
            <Button size="sm" onClick={openNewClient}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Novo Cliente
            </Button>
          </div>
          {loadingClients ? (
            <LoadingState />
          ) : clients.length === 0 ? (
            <EmptyState icon={Users} text="Nenhum cliente encontrado" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-sm">{c.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {c.cnpj ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.email ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.phone ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.contact_name ?? "\u2014"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEditClient(c)}
                        aria-label="Editar cliente"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Cost Center Dialog ── */}
      <Dialog open={ccDialogOpen} onOpenChange={setCcDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {ccEditId ? "Editar Centro de Custo" : "Novo Centro de Custo"}
            </DialogTitle>
            <DialogDescription>
              {ccEditId
                ? "Altere os dados do centro de custo."
                : "Preencha os dados para criar um novo centro de custo."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="cc-name">Nome *</Label>
              <Input
                id="cc-name"
                value={ccForm.name}
                onChange={(e) =>
                  setCcForm((f) => ({
                    ...f,
                    name: e.target.value,
                    slug: f.slug || slugify(e.target.value),
                  }))
                }
                placeholder="Ex: Marketing Digital"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cc-slug">Slug</Label>
              <Input
                id="cc-slug"
                value={ccForm.slug}
                onChange={(e) => setCcForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="marketing-digital"
                className="font-mono text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cc-category">Categoria</Label>
              <Input
                id="cc-category"
                value={ccForm.category}
                onChange={(e) => setCcForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="Ex: operacional"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cc-desc">Descricao</Label>
              <Input
                id="cc-desc"
                value={ccForm.description}
                onChange={(e) => setCcForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Descricao opcional"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="cc-req-project"
                checked={ccForm.requires_project}
                onCheckedChange={(checked) =>
                  setCcForm((f) => ({ ...f, requires_project: !!checked }))
                }
              />
              <Label htmlFor="cc-req-project" className="text-sm">
                Requer vinculo com projeto
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCcDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCC} disabled={!ccForm.name.trim() || isSavingCC}>
              {isSavingCC && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              {ccEditId ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Vendor Dialog ── */}
      <Dialog open={vendorDialogOpen} onOpenChange={setVendorDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {vendorEditId ? "Editar Fornecedor" : "Novo Fornecedor"}
            </DialogTitle>
            <DialogDescription>
              {vendorEditId
                ? "Altere os dados do fornecedor."
                : "Preencha os dados para cadastrar um novo fornecedor."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="vendor-name">Nome *</Label>
              <Input
                id="vendor-name"
                value={vendorForm.name}
                onChange={(e) => setVendorForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Razao social ou nome fantasia"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vendor-cnpj">CNPJ</Label>
              <Input
                id="vendor-cnpj"
                value={vendorForm.cnpj}
                onChange={(e) => setVendorForm((f) => ({ ...f, cnpj: e.target.value }))}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="vendor-email">Email</Label>
                <Input
                  id="vendor-email"
                  type="email"
                  value={vendorForm.email}
                  onChange={(e) => setVendorForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="contato@empresa.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vendor-phone">Telefone</Label>
                <Input
                  id="vendor-phone"
                  value={vendorForm.phone}
                  onChange={(e) => setVendorForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vendor-cat">Categoria</Label>
              <Input
                id="vendor-cat"
                value={vendorForm.category}
                onChange={(e) => setVendorForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="Ex: tecnologia, servicos"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVendorDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveVendor} disabled={!vendorForm.name.trim() || isSavingVendor}>
              {isSavingVendor && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              {vendorEditId ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Client Dialog ── */}
      <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {clientEditId ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
            <DialogDescription>
              {clientEditId
                ? "Altere os dados do cliente."
                : "Preencha os dados para cadastrar um novo cliente."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="client-name">Nome *</Label>
              <Input
                id="client-name"
                value={clientForm.name}
                onChange={(e) => setClientForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Razao social ou nome fantasia"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client-cnpj">CNPJ</Label>
              <Input
                id="client-cnpj"
                value={clientForm.cnpj}
                onChange={(e) => setClientForm((f) => ({ ...f, cnpj: e.target.value }))}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="client-email">Email</Label>
                <Input
                  id="client-email"
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="contato@empresa.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client-phone">Telefone</Label>
                <Input
                  id="client-phone"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client-contact">Nome do Contato</Label>
              <Input
                id="client-contact"
                value={clientForm.contact_name}
                onChange={(e) => setClientForm((f) => ({ ...f, contact_name: e.target.value }))}
                placeholder="Pessoa de contato"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClientDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveClient} disabled={!clientForm.name.trim() || isSavingClient}>
              {isSavingClient && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              {clientEditId ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
      <Icon className="mb-3 h-10 w-10 text-muted-foreground/50" />
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
  );
}
