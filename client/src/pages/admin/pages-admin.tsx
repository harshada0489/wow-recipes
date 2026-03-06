import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { LegalPage } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPages() {
  const { data: pages = [], isLoading } = useQuery<LegalPage[]>({ queryKey: ["/api/pages"] });
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");

  const resetForm = () => { setEditId(null); setTitle(""); setSlug(""); setContent(""); };

  const openEdit = (p: LegalPage) => {
    setEditId(p.id); setTitle(p.title); setSlug(p.slug); setContent(p.content); setIsOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = { title, slug, content };
      if (editId) {
        await apiRequest("PATCH", `/api/pages/${editId}`, body);
      } else {
        await apiRequest("POST", "/api/pages", body);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({ title: editId ? "Page updated" : "Page created" });
      setIsOpen(false); resetForm();
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/pages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({ title: "Page deleted" });
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold" data-testid="text-pages-title">Pages</h1>
        <p className="text-muted-foreground">Manage legal and informational pages</p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
          <h2 className="text-xl font-serif font-semibold">All Pages ({pages.length})</h2>
          <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="btn-add-page"><Plus className="w-4 h-4" /> Add Page</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editId ? "Edit Page" : "Add Page"}</DialogTitle>
                <DialogDescription>Create or edit informational pages.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Page Title</Label>
                    <Input value={title} onChange={(e) => { setTitle(e.target.value); if (!editId) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")); }} placeholder="E.g., Privacy Policy" data-testid="input-page-title" />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="privacy-policy" data-testid="input-page-slug" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Enter the page content here..." className="resize-none min-h-[200px]" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} data-testid="btn-save-page">
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editId ? "Update Page" : "Save Page"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : pages.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No pages yet</TableCell></TableRow>
              ) : pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{page.slug}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(page.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(page)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(page.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
