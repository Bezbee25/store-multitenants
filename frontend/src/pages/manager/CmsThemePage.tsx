import React, { useState } from 'react';
import { Sparkles, Palette, Type, Layout, Image, Check, AlertCircle, PackagePlus, RefreshCw } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import { PRESET_OPTIONS } from '../../presets/presets';
import { ImageDropzone } from '../../components/ImageDropzone';

export const CmsThemePage: React.FC = () => {
  const { tenant, setTenant } = useTenant();
  const { token } = useAuth();
  const [selectedPreset, setSelectedPreset] = useState(tenant?.themePreset || 'autre');
  const [name, setName] = useState(tenant?.name || '');
  const [tagline, setTagline] = useState(tenant?.tagline || '');
  const [description, setDescription] = useState(tenant?.description || '');
  const [heroImageUrl, setHeroImageUrl] = useState(tenant?.heroImageUrl || '');
  const [logoUrl, setLogoUrl] = useState(tenant?.logoUrl || '');
  const [primaryColor, setPrimaryColor] = useState(tenant?.themeConfig?.primaryColor || '#059669');
  const [announcement, setAnnouncement] = useState(tenant?.cmsConfig?.announcement || '');
  const [aboutTitle, setAboutTitle] = useState(tenant?.cmsConfig?.aboutTitle || '');
  const [aboutText, setAboutText] = useState(tenant?.cmsConfig?.aboutText || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importingPreset, setImportingPreset] = useState<string | null>(null);

  const handleApplyPreset = async (presetId: string, replaceProducts: boolean = false) => {
    setSelectedPreset(presetId);
    setImportingPreset(presetId);

    const preset = PRESET_OPTIONS.find(p => p.id === presetId);
    if (preset) {
      setPrimaryColor(preset.themeConfig.primaryColor);
      setHeroImageUrl(preset.heroImageUrl);
      setLogoUrl(preset.logoUrl);
      setTagline(preset.tagline);
      setDescription(preset.description);
      setAboutTitle(preset.cmsConfig.aboutTitle || '');
      setAboutText(preset.cmsConfig.aboutText || '');
      if (preset.cmsConfig.announcement) setAnnouncement(preset.cmsConfig.announcement);
    }

    try {
      const res = await fetch('/api/manager/preset/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Slug': tenant?.subdomain || 'cbd25'
        },
        body: JSON.stringify({ presetId, replaceProducts })
      });
      if (res.ok) {
        const data = await res.json();
        setTenant(data.tenant);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch {
      // Handled
    } finally {
      setImportingPreset(null);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    const updatedThemeConfig = {
      ...(tenant?.themeConfig || {}),
      primaryColor
    };

    const updatedCmsConfig = {
      ...(tenant?.cmsConfig || {}),
      announcement,
      aboutTitle,
      aboutText
    };

    try {
      const res = await fetch('/api/manager/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Slug': tenant?.subdomain || 'cbd25'
        },
        body: JSON.stringify({
          name,
          tagline,
          description,
          heroImageUrl,
          logoUrl,
          themeConfig: updatedThemeConfig,
          cmsConfig: updatedCmsConfig
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setTenant(updated);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch {
      // Handled
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-white/10">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Personnalisation Vitrine</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading mt-1">
          Modèles & Templates de Départ pour votre Magasin
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Choisissez un modèle préconfiguré pour démarrer rapidement, ou personnalisez chaque élément (couleurs, photos, textes, logo).
        </p>
      </div>

      {/* 1. Templates Gallery Section */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Galerie des Modèles / Templates
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Cliquez pour appliquer l'ambiance graphique ou importer le pack d'exemples de produits correspondant à votre secteur.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {PRESET_OPTIONS.map((p) => {
            const isSelected = selectedPreset === p.id;
            const isApplying = importingPreset === p.id;

            return (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-amber-500/5 dark:bg-slate-850 border-amber-500 shadow-xl shadow-amber-500/10'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950">
                    <img src={p.heroImageUrl} alt={p.name} className="w-full h-full object-cover" />
                    <div
                      className="absolute top-2 left-2 w-4 h-4 rounded-full border border-white/60 shadow-sm"
                      style={{ backgroundColor: p.themeConfig.primaryColor }}
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> Modèle Actif
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</h3>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block">{p.category}</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{p.description}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <button
                    type="button"
                    disabled={isApplying}
                    onClick={() => handleApplyPreset(p.id, false)}
                    className={`w-full py-2 rounded-xl text-[11px] font-bold transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {isApplying ? 'Application...' : isSelected ? 'Thème Actif' : 'Appliquer le Design'}
                  </button>

                  <button
                    type="button"
                    disabled={isApplying}
                    onClick={() => {
                      if (confirm(`Importer le template "${p.name}" avec ses exemples de catégories et produits ?`)) {
                        handleApplyPreset(p.id, true);
                      }
                    }}
                    className="w-full py-1.5 rounded-xl text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-amber-500 transition-colors flex items-center justify-center gap-1"
                    title="Remplace les catégories et produits par les exemples du template"
                  >
                    <PackagePlus className="w-3.5 h-3.5" />
                    <span>+ Importer Exemples Produits</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Customization Form */}
      <form onSubmit={handleSaveSettings} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
          <Palette className="w-5 h-5 text-amber-500" /> Personnaliser les Textes & Visuels de votre Boutique
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nom de votre commerce *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Slogan / Phrase d'accroche</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bannière d'annonce (Haut de page)</label>
            <input
              type="text"
              placeholder="Ex: ✨ -10% sur votre première commande en Click & Collect !"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Drag & Drop Hero Banner */}
          <div className="md:col-span-2">
            <ImageDropzone
              label="Photo de Couverture (Bannière Hero)"
              value={heroImageUrl}
              onChange={setHeroImageUrl}
              onRemove={() => setHeroImageUrl('')}
              aspectRatio="banner"
              helperText="Glissez l'image principale de votre vitrine (JPG, PNG, WebP)"
            />
          </div>

          {/* Drag & Drop Logo */}
          <div>
            <ImageDropzone
              label="Logo de votre Magasin"
              value={logoUrl}
              onChange={setLogoUrl}
              onRemove={() => setLogoUrl('')}
              aspectRatio="square"
              helperText="Glissez votre logo carré ou rond (PNG avec fond transparent conseillé)"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Couleur primaire du thème</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Titre de présentation (À propos)</label>
              <input
                type="text"
                value={aboutTitle}
                onChange={(e) => setAboutTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Texte de présentation / Histoire du commerce</label>
            <textarea
              rows={3}
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <Check className="w-4 h-4" /> Modifications enregistrées sur votre boutique !
            </span>
          ) : <span />}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer la Personnalisation'}
          </button>
        </div>
      </form>
    </div>
  );
};
