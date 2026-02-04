import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  archiveProduct,
  clearSession,
  createProduct,
  fetchProducts,
  login,
  SESSION_KEY,
  updateProduct,
  uploadImage,
} from "@/admin/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Archive,
  Check,
  CloudUpload,
  Image as ImageIcon,
  Loader2,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  Save,
} from "lucide-react";

type ProductRecord = Record<string, string | number | undefined> & { _rowNumber?: number };

const background = "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950";

const Admin = () => {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(
    typeof localStorage !== "undefined" ? localStorage.getItem(SESSION_KEY) : null,
  );
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ProductRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const nameKey = useMemo(() => pickKey(headers, ["name", "naam", "title"]), [headers]);
  const priceKey = useMemo(() => pickKey(headers, ["price", "prijs", "sale_price"]), [headers]);
  const statusKey = useMemo(() => pickKey(headers, ["status", "active"]), [headers]);
  const imageKey = useMemo(() => findKey(headers, ["image", "image1", "afbeelding", "image_id"]), [headers]);

  useEffect(() => {
    if (!token) return;
    loadProducts();
  }, [token]);

  const loadProducts = async (focusRow?: number) => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchProducts(token || undefined);
      const list: ProductRecord[] = data?.products || [];
      const hdrs: string[] = data?.headers || inferHeaders(list);
      setProducts(list);
      setHeaders(hdrs);
      if (focusRow) {
        const found = list.find((p) => p._rowNumber === focusRow);
        if (found) setSelected(found);
      } else if (list.length > 0 && !selected) {
        setSelected(list[0]);
      } else if (selected) {
        const refreshed = list.find((p) => p._rowNumber === selected._rowNumber);
        if (refreshed) setSelected(refreshed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kon producten niet laden");
      if ((err as Error)?.message?.toLowerCase().includes("unauthorized")) {
        clearSession();
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      const newToken = await login(password);
      setToken(newToken);
      toast({ title: "Ingelogd", description: "Je blijft ingelogd op dit apparaat." });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login mislukt");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selected?._rowNumber) return;
    try {
      setSaving(true);
      const payload = { ...selected };
      delete payload._rowNumber;
      await updateProduct(selected._rowNumber, payload as Record<string, string>, token || undefined);
      toast({ title: "Opgeslagen", description: "Product is bijgewerkt in Google Sheets." });
      await loadProducts(selected._rowNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!selected?._rowNumber) return;
    try {
      setSaving(true);
      await archiveProduct(selected._rowNumber, token || undefined);
      toast({ title: "Gearchiveerd", description: "Status is ingesteld op Archived." });
      await loadProducts(selected._rowNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Archiveren mislukt");
    } finally {
      setSaving(false);
    }
  };

  const handleAddRow = async () => {
    try {
      setSaving(true);
      const defaults = buildDefaultRow(headers);
      const res = await createProduct(defaults, token || undefined);
      toast({ title: "Nieuwe rij toegevoegd", description: "Je kunt nu de velden invullen." });
      await loadProducts(res?.rowNumber || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rij toevoegen mislukt");
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setSelected((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selected?._rowNumber) return;
    try {
      setUploading(true);
      const res = await uploadImage({
        file,
        rowNumber: selected._rowNumber,
        column: imageKey || "image",
        token: token || undefined,
      });
      const newId = res?.imageId;
      if (newId) {
        setSelected((prev) => (prev ? { ...prev, [imageKey || "image"]: newId } : prev));
        toast({ title: "Afbeelding geupload", description: `ImageID: ${newId}` });
      }
      await loadProducts(selected._rowNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload mislukt");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const logout = () => {
    clearSession();
    setToken(null);
    setSelected(null);
    setProducts([]);
  };

  if (!token) {
    return (
      <div className={`min-h-screen ${background} text-white flex items-center justify-center px-4`}>
        <Card className="max-w-md w-full bg-white/10 border-white/20 shadow-2xl backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Admin login
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-slate-100">
                Eenmalig wachtwoord
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-900/60 border-white/10 text-white placeholder:text-slate-400"
                placeholder="Voer het beheerders-wachtwoord in"
              />
            </div>
            <Button onClick={handleLogin} disabled={loading || !password} className="w-full">
              {loading ? <Loader2 className="animate-spin" /> : <Lock className="h-4 w-4" />}
              {loading ? "Bezig met inloggen..." : "Log in"}
            </Button>
            {error && <p className="text-sm text-amber-200">{error}</p>}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${background} text-white`}>
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Admin PWA</p>
            <h1 className="text-3xl md:text-4xl font-bold">Productbeheer</h1>
            <p className="text-slate-300 mt-1">Werk direct in de Google Sheet, zonder opnieuw in te loggen.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => loadProducts()} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Verversen
            </Button>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Uitloggen
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-amber-500/15 border border-amber-400/40 text-amber-50 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-[1.25fr_1fr] gap-6">
          <Card className="bg-white/5 border-white/10 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Producten</CardTitle>
              <Button size="sm" onClick={handleAddRow} disabled={saving}>
                {saving ? <Loader2 className="animate-spin" /> : <Plus className="h-4 w-4" />}
                Nieuwe rij
              </Button>
            </CardHeader>
            <CardContent className="overflow-auto">
              {loading ? (
                <div className="py-10 flex justify-center">
                  <Loader2 className="animate-spin text-white/70 h-8 w-8" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-white/5">
                      <TableHead className="text-white/70">Naam</TableHead>
                      <TableHead className="text-white/70">Prijs</TableHead>
                      <TableHead className="text-white/70">Status</TableHead>
                      <TableHead className="text-white/70">Row</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product, idx) => (
                      <TableRow
                        key={product._rowNumber ?? `${displayValue(product[nameKey])}-${idx}`}
                        className={`cursor-pointer transition hover:bg-white/5 ${
                          selected?._rowNumber === product._rowNumber ? "bg-white/10" : ""
                        }`}
                        onClick={() => setSelected(product)}
                      >
                        <TableCell className="text-white">{displayValue(product[nameKey]) || "Onbekend"}</TableCell>
                        <TableCell className="text-white/80">{displayValue(product[priceKey]) || "-"}</TableCell>
                        <TableCell className="text-white/80">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              (product[statusKey] || "").toString().toLowerCase() === "archived"
                                ? "bg-red-500/20 text-red-100"
                                : "bg-emerald-500/20 text-emerald-100"
                            }`}
                          >
                            {displayValue(product[statusKey]) || "actief"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white/60 text-xs">{product._rowNumber ?? "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Check className="h-4 w-4" />
                Bewerken
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleSave} disabled={!selected || saving}>
                  {saving ? <Loader2 className="animate-spin" /> : <Save className="h-4 w-4" />}
                  Opslaan
                </Button>
                <Button variant="destructive" size="sm" onClick={handleArchive} disabled={!selected || saving}>
                  <Archive className="h-4 w-4" />
                  Archiveer
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selected && <p className="text-white/70">Selecteer een product om te bewerken.</p>}
              {selected && (
                <>
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>Row #{selected._rowNumber}</span>
                    {imageKey && (
                      <span className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        {displayValue(selected[imageKey]) || "Geen imageID"}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {headers.map((header) => {
                      const key = header.toLowerCase();
                      const value = (selected[key] ?? "") as string;
                      const isLong = key.includes("description") || key.includes("beschrijving");
                      return (
                        <div key={header} className="space-y-1.5">
                          <Label className="text-xs text-white/70">{header}</Label>
                          {isLong ? (
                            <Textarea
                              value={value}
                              onChange={(e) => handleFieldChange(key, e.target.value)}
                              className="bg-slate-900/70 border-white/10 text-white min-h-[90px]"
                            />
                          ) : (
                            <Input
                              value={value}
                              onChange={(e) => handleFieldChange(key, e.target.value)}
                              className="bg-slate-900/70 border-white/10 text-white"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button variant="outline" size="sm" onClick={handleUploadClick} disabled={uploading || !imageKey}>
                      {uploading ? <Loader2 className="animate-spin" /> : <CloudUpload className="h-4 w-4" />}
                      Upload naar Cloudflare
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

function findKey(headers: string[], candidates: string[]) {
  const lowered = headers.map((h) => h.toLowerCase());
  const found = candidates.find((c) => lowered.includes(c.toLowerCase()));
  return found || "";
}

function pickKey(headers: string[], candidates: string[]) {
  const lowered = headers.map((h) => h.toLowerCase());
  const found = findKey(headers, candidates);
  return found || lowered[0] || "";
}

function inferHeaders(list: ProductRecord[]) {
  if (!list || list.length === 0) return [];
  return Object.keys(list[0]).filter((key) => key !== "_rowNumber");
}

function displayValue(val: any) {
  if (val === undefined || val === null) return "";
  return val.toString();
}

function buildDefaultRow(headers: string[]) {
  const lowered = headers.map((h) => h.toLowerCase());
  const obj: Record<string, string> = {};
  lowered.forEach((h) => {
    obj[h] = "";
  });
  if (lowered.includes("status")) obj.status = "Draft";
  if (lowered.includes("active")) obj.active = "TRUE";
  return obj;
}

export default Admin;
