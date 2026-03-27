"use client";

import { useRef } from "react";
import { fieldLabel } from "@/lib/ui/field-styles";

type Props = {
  label: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  id: string;
  useFrontCamera?: true;
};

/** One image: camera (environment or user) or gallery. */
export function SingleImageCapture({
  label,
  file,
  onFileChange,
  id,
  useFrontCamera,
}: Props) {
  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <span className={fieldLabel}>{label}</span>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          ref={camRef}
          id={`${id}-cam`}
          type="file"
          accept="image/*"
          capture={useFrontCamera ? "user" : "environment"}
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            onFileChange(f);
            e.target.value = "";
          }}
        />
        <input
          ref={galRef}
          id={`${id}-gal`}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            onFileChange(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => camRef.current?.click()}
          className="rounded-xl border border-isha-border bg-white px-3 py-2 text-xs font-bold text-isha-text hover:bg-isha-muted"
        >
          Camera
        </button>
        <button
          type="button"
          onClick={() => galRef.current?.click()}
          className="rounded-xl border border-isha-border bg-white px-3 py-2 text-xs font-bold text-isha-text hover:bg-isha-muted"
        >
          Choose file
        </button>
        {file && (
          <span className="self-center text-xs font-medium text-emerald-700">
            {file.name}
          </span>
        )}
      </div>
    </div>
  );
}
