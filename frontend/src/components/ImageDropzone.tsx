import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Check } from 'lucide-react';

interface ImageDropzoneProps {
  value?: string | null;
  onChange: (base64OrUrl: string) => void;
  onRemove?: () => void;
  label?: string;
  aspectRatio?: 'square' | 'video' | 'banner';
  helperText?: string;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  value,
  onChange,
  onRemove,
  label = 'Image',
  aspectRatio = 'square',
  helperText = 'Glissez-déposez une image ici ou cliquez pour parcourir (PNG, JPG, WebP max 5Mo)'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onChange(result);
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const aspectClass =
    aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'banner'
      ? 'aspect-[21/9]'
      : 'aspect-square max-h-48';

  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</label>}

      {value ? (
        <div className={`relative ${aspectClass} w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group shadow-inner`}>
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-white/90 text-slate-950 font-bold text-xs shadow hover:bg-white transition-all flex items-center gap-1"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Changer</span>
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="p-1.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow hover:bg-red-500 transition-all"
                title="Supprimer l'image"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full ${aspectClass} rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 text-center cursor-pointer ${
            isDragging
              ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20 scale-[0.99]'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-amber-500/60'
          }`}
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
            <UploadCloud className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {isProcessing ? 'Traitement en cours...' : 'Glissez-déposez une photo ici'}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-tight">
            ou <strong className="text-amber-600 dark:text-amber-400">parcourez vos fichiers</strong>
          </span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      {helperText && !value && (
        <p className="text-[10px] text-slate-400 leading-tight">{helperText}</p>
      )}
    </div>
  );
};
