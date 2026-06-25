"use client";

import { useRef, useState } from "react";
import { Upload, Camera, X, Plus } from "lucide-react";

// Downscale + compress an image file entirely in the browser, so uploads from a
// phone are fast and stay high quality without needing an external service.
async function compress(file: File, max = 1600, quality = 0.85): Promise<string> {
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;
  if (width > max || height > max) {
    const scale = Math.min(max / width, max / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  // WebP keeps quality high at a small size; fall back to JPEG if unsupported.
  const webp = canvas.toDataURL("image/webp", quality);
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", quality);
}

export function ImageUploader({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true); setErr(null);
    const out: string[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      try { out.push(await compress(f)); }
      catch { setErr("One file couldn't be read (try JPG/PNG)."); }
    }
    if (out.length) onChange([...value, ...out]);
    setBusy(false);
  };

  const addUrl = () => {
    const u = url.trim();
    if (!u) return;
    if (!/^https?:\/\//.test(u)) { setErr("Enter a direct image URL (https://…)."); return; }
    onChange([...value, u]); setUrl(""); setErr(null);
  };

  const remove = (i: number) => onChange(value.filter((_, n) => n !== i));

  return (
    <div className="space-y-2">
      <label className="eyebrow block text-[0.6rem] text-muted-foreground">Product images</label>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((src, i) => (
            <div key={i} className="relative size-20 overflow-hidden rounded-md border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button onClick={() => remove(i)} aria-label="Remove" className="absolute right-0.5 top-0.5 grid size-5 place-items-center rounded-full bg-foreground/70 text-background"><X className="size-3" /></button>
              {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-foreground/70 py-0.5 text-center text-[0.55rem] text-background">Main</span>}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-accent disabled:opacity-50">
          <Upload className="size-4" /> {busy ? "Processing…" : "Upload"}
        </button>
        <button type="button" onClick={() => camRef.current?.click()} disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-accent disabled:opacity-50 sm:hidden">
          <Camera className="size-4" /> Camera
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
        <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => addFiles(e.target.files)} />
      </div>

      <div className="flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…or paste an image URL"
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
          className="h-9 flex-1 rounded-md border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none" />
        <button type="button" onClick={addUrl} className="grid size-9 place-items-center rounded-md border border-border hover:bg-accent" aria-label="Add URL"><Plus className="size-4" /></button>
      </div>
      {err && <p className="text-xs text-destructive">{err}</p>}
      <p className="text-[0.7rem] text-muted-foreground">Upload from your device or camera (auto-compressed, high quality), or paste a link. The first image is the main one.</p>
    </div>
  );
}
