/* ----------------------------------------------------------
   components/forms/PhotoPicker.tsx
   Re-usable photo grid with overlay delete buttons + previews
   ---------------------------------------------------------- */
'use client';

import { useEffect, useState } from 'react';
import { FaTrash, FaLeaf, FaUpload } from 'react-icons/fa';

export interface ExistingPhoto { _id: string; url: string; name?: string; key?: string; }

interface Props {
  /** already-saved photos coming from the DB                              */
  photos: ExistingPhoto[];
  /** remove permanently (server + state)                                  */
  onDelete: (photoId: string) => Promise<void>;
  /** upload newly-picked files (server + state), you receive File[]        */
  onUpload: (files: File[]) => Promise<void>;
}

/* ---------- component -------------------------------------------------- */
export default function PhotoPicker({ photos, onDelete, onUpload }: Props) {
  const [picked, setPicked] = useState<File[]>([]);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [busy,   setBusy]   = useState(false);
  const [err,    setErr]    = useState('');

  /* ---- generate local object-URLs for previews ---- */
  useEffect(() => {
    const urls = picked.map((f) => URL.createObjectURL(f));
    setThumbs(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [picked]);

  /* ---- handlers ----------------------------------- */
  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setPicked(Array.from(e.target.files));
  };

  const upload = async () => {
    if (!picked.length) return;
    setBusy(true); setErr('');
    try { await onUpload(picked); setPicked([]); }
    catch (e: any) { setErr(e.message ?? 'Upload failed'); }
    finally { setBusy(false); (document.getElementById('photoInput') as HTMLInputElement).value = '';}
  };

  /* ---- UI ----------------------------------------- */
  return (
    <div className="w-full">
      {/* existing photos */}
      <div className="flex flex-wrap gap-3 mb-4">
        {photos.map((p) => (
          <div key={p._id} className="relative group w-24 h-24">
            <img
              src={p.url}
              alt={p.name ?? 'photo'}
              className="object-cover w-full h-full rounded border"
            />
            <button
              type="button"
              aria-label="Delete"
              onClick={() => onDelete(p._id)}
              className="opacity-0 group-hover:opacity-100 transition
                         absolute -top-2 -right-2 bg-red-600 text-white
                         rounded-full w-6 h-6 flex items-center justify-center
                         text-[10px] shadow-md"
            >
              <FaTrash />
            </button>
          </div>
        ))}
        {/* local previews */}
        {thumbs.map((u, i) => (
          <div key={i} className="relative w-24 h-24 opacity-70">
            <img src={u} className="object-cover w-full h-full rounded border-2 border-dashed" />
          </div>
        ))}
      </div>

      {/* error ---- */}
      {err && <p className="text-red-500 text-sm mb-2">{err}</p>}

      {/* picker + upload ---- */}
      <div className="flex items-center gap-3">
        <input
          id="photoInput"
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={pick}
        />
        <label
          htmlFor="photoInput"
          className="btn btn-sm btn-ghost border border-secondary text-secondary flex gap-1"
        >
          <FaLeaf /> Select photo(s)
        </label>

        <button
          type="button"
          onClick={upload}
          disabled={busy || picked.length === 0}
          className="btn btn-sm btn-secondary flex gap-1 disabled:opacity-40"
        >
          <FaUpload /> {busy ? 'Uploading…' : 'Upload'}
        </button>
      </div>
    </div>
  );
}
