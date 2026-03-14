"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { BAU_CRIATIVO } from "@/features/cultura/data/cultura-notion-seed"

const contributeSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  category_id: z.string().min(1, "Selecione uma categoria"),
  subcategory_id: z.string().min(1, "Selecione uma subcategoria"),
  url: z.string().url("URL inválida — ex: https://exemplo.com"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres").max(500),
})

type ContributeFormData = z.infer<typeof contributeSchema>

interface BauContributeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BauContributeDialog({ open, onOpenChange }: BauContributeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ContributeFormData>({
    resolver: zodResolver(contributeSchema),
    defaultValues: {
      name: "",
      category_id: "",
      subcategory_id: "",
      url: "",
      description: "",
    },
  })

  const selectedCategoryId = form.watch("category_id")
  const selectedCategory = BAU_CRIATIVO.find((c) => c.id === selectedCategoryId)

  const handleSubmit = async (data: ContributeFormData) => {
    setIsSubmitting(true)
    // Simulate async submission (Supabase integration pending — tabela bau_references a criar)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsSubmitting(false)

    toast.success("Referência enviada para revisão!", {
      description: `"${data.name}" será avaliada pela equipe antes de ser publicada.`,
    })

    form.reset()
    onOpenChange(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) form.reset()
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contribuir com referência</DialogTitle>
          <DialogDescription>
            Envie uma referência para o Baú Criativo. Ela será revisada antes de ser publicada.
          </DialogDescription>
        </DialogHeader>

        <Form form={form} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da referência</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Behance — Tendências 3D 2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val)
                      form.setValue("subcategory_id", "")
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BAU_CRIATIVO.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.emoji} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subcategory_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategoria</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedCategory}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectedCategory?.subcategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." type="url" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Por que esta referência é relevante?</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva brevemente o que torna esta referência valiosa..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar referência"}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
