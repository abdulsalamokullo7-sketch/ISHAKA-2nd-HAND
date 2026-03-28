"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import { fieldLabel } from "@/lib/ui/field-styles";

type Props = {
  label?: string;
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  idPrefix?: string;
  /** Hint shown under tips (e.g. admin vs sell). */
  hint?: string;
  /** Already-uploaded image URLs (e.g. auto-uploaded from admin). */
  remoteUrls?: string[];
  onRemoteRemove?: (index: number) => void;
  /** Fired right after new files are appended (camera/gallery). */
  onFilesPicked?: (picked: File[]) => void;
};

export function PhotoTips() {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-950 ring-1 ring-emerald-100">
      <p className="font-bold text-emerald-900">Sell faster with great photos</p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-emerald-900/90">
        <li>Use daylight or a bright room — avoid blur.</li>
        <li>Show the front, any defects, and accessories in separate shots.</li>
        <li>Keep the product centred; tap to focus before shooting.</li>
      </ul>
    </div>
  );
}

export function ProductPhotosField({
  label = "Product photos",
  files,
  onFilesChange,
  maxFiles = 12,
  idPrefix = "product-photos",
  hint,
  remoteUrls = [],
  onRemoteRemove,
  onFilesPicked,
}: Props) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const previewUrls = useMemo(
    () => files.map((f) => URL.createObjectURL(f)),
    [files],
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const totalCount = remoteUrls.length + files.length;
  const canAdd = totalCount < maxFiles;

  function appendFromList(list: FileList | null) {
    if (!list?.length) return;
    const incoming = Array.from(list);
    const room = maxFiles - remoteUrls.length - files.length;
    if (room <= 0) return;
    const added = incoming.slice(0, room);
    const next = [...files, ...added];
    onFilesChange(next);
    if (added.length > 0) onFilesPicked?.(added);
  }

  function removeAt(index: number) {
    onFilesChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <label className={fieldLabel} htmlFor={`${idPrefix}-camera`}>
        {label}
      </label>
      <PhotoTips />
      {hint && (
        <p className="text-xs text-isha-text-muted">{hint}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          ref={cameraRef}
          id={`${idPrefix}-camera`}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          tabIndex={-1}
          disabled={!canAdd}
          onChange={(e) => {
            appendFromList(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={!canAdd}
          onClick={() => cameraRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-isha-primary bg-white px-4 py-3 text-sm font-extrabold text-isha-primary shadow-sm transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Take photo
        </button>

        <input
          ref={galleryRef}
          id={`${idPrefix}-gallery`}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          tabIndex={-1}
          disabled={!canAdd}
          onChange={(e) => {
            appendFromList(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={!canAdd}
          onClick={() => galleryRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-2xl border border-isha-border bg-white px-4 py-3 text-sm font-bold text-isha-text shadow-sm transition hover:bg-isha-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Gallery
        </button>
      </div>

      <p className="text-xs text-isha-text-muted">
        {totalCount} / {maxFiles} photos · On your phone, &quot;Take photo&quot; opens the camera.
        {onFilesPicked && (
          <span className="block text-isha-primary/90">
            New picks upload automatically — use Publish / Save to write the listing to Firestore.
          </span>
        )}
      </p>

      {(remoteUrls.length > 0 || previewUrls.length > 0) && (
        <ul className="flex flex-wrap gap-2">
          {remoteUrls.map((url, i) => (
            <li
              key={`remote-${url}-${i}`}
              className="relative h-24 w-24 overflow-hidden rounded-xl border border-isha-border bg-isha-muted shadow-sm"
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
                unoptimized
              />
              {onRemoteRemove && (
                <button
                  type="button"
                  onClick={() => onRemoteRemove(i)}
                  className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-sm font-bold text-white backdrop-blur hover:bg-black/80"
                  aria-label={`Remove uploaded photo ${i + 1}`}
                >
                  ×
                </button>
              )}
              <span className="absolute bottom-1 left-1 rounded bg-emerald-700/85 px-1.5 py-0.5 text-[10px] font-bold text-white">
                up
              </span>
            </li>
          ))}
          {previewUrls.map((url, i) => (
            <li
              key={`${url}-${i}`}
              className="relative h-24 w-24 overflow-hidden rounded-xl border border-isha-border bg-isha-muted shadow-sm"
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
                unoptimized
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-sm font-bold text-white backdrop-blur hover:bg-black/80"
                aria-label={`Remove photo ${remoteUrls.length + i + 1}`}
              >
                ×
              </button>
              <span className="absolute bottom-1 left-1 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {remoteUrls.length + i + 1}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
