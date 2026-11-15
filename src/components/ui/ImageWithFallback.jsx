import { useState } from 'react';
import { BookOpen } from 'lucide-react';

export default function ImageWithFallback({
  src,
  alt,
  caption,
  className = '',
  aspectClass = 'aspect-[4/3]',
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <figure className={`overflow-hidden rounded-xl border border-slate-200 bg-slate-100 ${className}`}>
      <div className={`relative w-full ${aspectClass} overflow-hidden`}>
        {!hasError && src ? (
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#172554] to-[#2563EB] p-6 text-center text-white">
            <BookOpen className="h-8 w-8 mb-2 opacity-80" aria-hidden="true" />
            <p className="text-sm font-medium max-w-xs">{alt}</p>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="border-t border-slate-200 bg-white px-4 py-2.5 text-xs text-[#64748B]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
