import { useEffect, useState } from 'react';

export default function Avatar({ src, name = '', alt = 'profile', className = 'h-8 w-8' }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const initial = (name || alt || 'A').trim().charAt(0).toUpperCase() || 'A';

  if (!src || failed) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-red font-black text-white shadow-[0_0_20px_rgba(64,196,255,0.35)] ${className}`}
        aria-label={alt}
      >
        {initial}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`rounded-full border border-white/10 object-cover ${className}`}
    />
  );
}
