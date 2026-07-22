"use client";

import { useController } from "react-hook-form";
import { Upload, X } from "lucide-react";
import { useRef } from "react";

export function FileUpload({ name }: { name: string }) {
  const { field } = useController({ name });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const files = Array.isArray(field.value) ? field.value : [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => file.name);
      field.onChange([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    field.onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <Upload className="h-4 w-4" />
        Upload attachment
      </button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      {files.length > 0 ? (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={`${file}-${index}`} className="flex items-center justify-between rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
              <span className="text-sm text-slate-900 dark:text-white">{file}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-slate-500 transition hover:text-red-600 dark:hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
