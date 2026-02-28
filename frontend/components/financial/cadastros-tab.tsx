"use client";

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  FolderTree,
  Building2,
  Users,
  Wallet,
  Plus,
} from "lucide-react";
import {
  useFinCategories,
  useCostCenters,
  useVendors,
  useFinClients,
} from "@/hooks/use-financial";

export function CadastrosTab() {
  const [subTab, setSubTab] = useState("categories");
  const [catSearch, setCatSearch] = useState("");
  const [ccSearch, setCcSearch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");

  const { data: categories = [], isLoading: loadingCat } = useFinCategories();
  const { data: costCenters = [], isLoading: loadingCC } = useCostCenters();
  const { data: vendors = [], isLoading: loadingVendors } = useVendors(vendorSearch || undefined);
  const { data: clients = [], isLoading: loadingClients } = useFinClients(clientSearch || undefined);

  const filteredCategories = catSearch
    ? categories.filter((c) => c.name.toLowerCase().includes(catSearch.toLowerCase()))
    : categories;

  const filteredCostCenters = ccSearch
    ? costCenters.filter((c) => c.name.toLowerCase().includes(ccSearch.toLowerCase()))
    : costCenters;

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

        {/* Categories */}
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
            <Button size="sm" variant="outline" disabled>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Nova Categoria
            </Button>
          </div>
          {loadingCat ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
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
            <Button size="sm" variant="outline" disabled>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Novo Centro de Custo
            </Button>
          </div>
          {loadingCC ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
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
            <Button size="sm" variant="outline" disabled>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Novo Fornecedor
            </Button>
          </div>
          {loadingVendors ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
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
            <Button size="sm" variant="outline" disabled>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Novo Cliente
            </Button>
          </div>
          {loadingClients ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
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
