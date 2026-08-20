import { useRef, useState } from 'react';
import Avatar from './Avatar';
import { readAndCompressImage } from '../utils/readImageFile';

export default function ProfilePhotoPicker({
  value,
  name,
  onChange,
  sizeClassName = 'h-24 w-24 text-2xl',
}) {
  const fileRef = useRef(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      const dataUrl = await readAndCompressImage(file);
      onChange(dataUrl);
    } catch (err) {
      setError(err.message || 'Could not upload that photo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          handleFile(file);
        }}
      />
      <button type="button" onClick={() => fileRef.current?.click()} className="group relative">
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-neon-blue to-neon-red opacity-40 blur-md transition group-hover:opacity-80" />
        <Avatar src={value} name={name} className={`relative ${sizeClassName}`} />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/60 text-[10px] font-semibold uppercase tracking-widest text-white opacity-0 transition group-hover:opacity-100">
          {busy ? '...' : 'Change'}
        </span>
      </button>
      <div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-full border border-neon-blue/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-neon-blue hover:bg-neon-blue/10"
        >
          {busy ? 'Processing...' : 'Upload photo'}
        </button>
        <p className="mt-2 text-xs text-slate-400">JPG, PNG, or WEBP. Saved to this profile.</p>
        {error && <p className="mt-1 text-xs text-neon-red">{error}</p>}
      </div>
    </div>
  );
}
