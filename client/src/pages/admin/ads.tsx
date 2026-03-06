import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AdPlacement } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function AdminAds() {
  const { data: adPlacements = [], isLoading } = useQuery<AdPlacement[]>({ queryKey: ["/api/ad-placements"] });
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [scriptCode, setScriptCode] = useState("");
  const [location, setLocation] = useState("sidebar");
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => { setEditId(null); setTitle(""); setScriptCode(""); setLocation("sidebar"); setIsActive(true); };

  const openEdit = (ad: AdPlacement) => {
    setEditId(ad.id); setTitle(ad.title); setScriptCode(ad.scriptCode); setLocation(ad.location); setIsActive(ad.isActive); setIsOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = { title, scriptCode, location, isActive };
      if (editId) {
        await apiRequest("PATCH", `/api/ad-placements/${editId}`, body);
      } else {
        await apiRequest("POST", "/api/ad-placements", body);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ad-placements"] });
      toast({ title: editId ? "Ad placement updated" : "Ad placement created" });
      setIsOpen(false); resetForm();
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiRequest("PATCH", `/api/ad-placements/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ad-placements"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/ad-placements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ad-placements"] });
      toast({ title: "Ad placement deleted" });
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold" data-testid="text-ads-title">Ad Placements</h1>
        <p className="text-muted-foreground">Manage your monetization ad placements</p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
          <h2 className="text-xl font-serif font-semibold">All Ad Placements ({adPlacements.length})</h2>
          <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="btn-add-ad"><Plus className="w-4 h-4" /> Add Ad Placement</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editId ? "Edit Ad Placement" : "Add Ad Placement"}</DialogTitle>
                <DialogDescription>Paste your ad network script code (e.g., Google AdSense, Mediavine).</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g., Sidebar Ad" data-testid="input-ad-title" />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sidebar">Sidebar</SelectItem>
                        <SelectItem value="below-recipe">Below Recipe</SelectItem>
                        <SelectItem value="above-comments">Above Comments</SelectItem>
                        <SelectItem value="header-banner">Header Banner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Script Code</Label>
                  <Textarea value={scriptCode} onChange={(e) => setScriptCode(e.target.value)} placeholder="Paste your ad script here..." className="resize-none min-h-[150px] font-mono text-sm" />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border">
                  <div>
                    <Label className="text-base font-medium">Active</Label>
                    <p className="text-sm text-muted-foreground">Enable or disable this ad placement</p>
                  </div>
                  <Switch checked={isActive} onCheckedChange={setIsActive} data-testid="switch-ad-active" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} data-testid="btn-save-ad">
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editId ? "Update Ad" : "Save Ad"}
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
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : adPlacements.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No ad placements yet</TableCell></TableRow>
              ) : adPlacements.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell className="font-medium">{ad.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">{ad.location.replace("-", " ")}</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={ad.isActive}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: ad.id, isActive: checked })}
                      data-testid={`switch-ad-toggle-${ad.id}`}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(ad)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(ad.id)}>
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
