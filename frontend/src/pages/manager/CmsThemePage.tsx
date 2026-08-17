import React, { useState } from 'react';
import { Sparkles, Palette, Type, Layout, Image, Check, AlertCircle } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import { PRESET_OPTIONS } from '../../presets/presets';
import { ImageDropzone } from '../../components/ImageDropzone';

export const CmsThemePage: React.FC = () => {
  const { tenant, setTenant } = useTenant();
  const { token } = useAuth();
  const [selectedPreset, setSelectedPreset] = useState(tenant?.themePreset || 'burger');
  const [name, setName] = useState(tenant?.name || '');
  const [tagline, setTagline] = useState(tenant?.tagline || '');
  const [description, setDescription] = useState(tenant?.description || '');
  const [heroImageUrl, setHeroImageUrl] = useState(tenant?.heroImageUrl || '');
  const [primaryColor, setPrimaryColor] = useState(tenant?.themeConfig?.primaryColor || '#EA580C');
  const [announcement, setAnnouncement] = useState(tenant?.cmsConfig?.announcement || '');
  const [aboutTitle, setAboutTitle] = useState(tenant?.cmsConfig?.aboutTitle || '');
  const [aboutText, setAboutText] = useState(tenant?.cmsConfig?.aboutText || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleApplyPreset = async (presetId: string, replaceProducts: boolean = false) => {
    setSelectedPreset(presetId);
    const preset = PRESET_OPTIONS.find(p => p.id === presetId);
    if (preset) {
      setPrimaryColor(preset.themeConfig.primaryColor);
      setHeroImageUrl(preset.heroImageUrl);
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
          'X-Tenant-Slug': tenant?.subdomain || 'smash-burger'
        },
        body: JSON.stringify({ presetId, replaceProducts })
      });
      if (res.ok) {
        const data = await res.json();
        setTenant(data.tenant);
      }
    } catch {
      // Handled
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
          'X-Tenant-Slug': tenant?.subdomain || 'smash-burger'
        },
        body: JSON.stringify({
          name,
          tagline,
          description,
          heroImageUrl,
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
      <div className="glass-card p-6 rounded-3xl border border-white/10">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Design & Vitrine</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading mt-1">
          Personnalisation CMS & Thème Visuel
        </h1>
      </div>

      {/* 1. Presets Métiers Section */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Presets Métiers en 1 Clic
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Changez l'ambiance visuelle, la typographie et la palette de votre commerce instantanément.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESET_OPTIONS.map((p) => {
            const isSelected = selectedPreset === p.id;
            return (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? 'bg-slate-850 border-amber-500 shadow-xl shadow-amber-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
                onClick={() => handleApplyPreset(p.id, false)}
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950">
                  <img src={p.heroImageUrl} alt={p.name} className="w-full h-full object-cover" />
                  <div
                    className="absolute top-2 left-2 w-4 h-4 rounded-full border border-white/40 shadow-sm"
                    style={{ backgroundColor: p.themeConfig.primaryColor }}
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 p-1 rounded-full">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-white text-sm">{p.name}</h3>
                  <span className="text-[11px] text-amber-400 font-semibold block">{p.category}</span>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{p.description}</p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyPreset(p.id, false);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold ${
                      isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {isSelected ? 'Thème Actif' : 'Appliquer Thème'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Customization Form */}
      <form onSubmit={handleSaveSettings} className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
          <Palette className="w-5 h-5 text-amber-400" /> Paramètres Vitrine & Textes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nom du commerce</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Slogan / Sous-titre</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Bannière d'annonce (Top barre)</label>
            <input
              type="text"
              placeholder="Ex: 🔥 -10% sur votre première commande en Click & Collect !"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <ImageDropzone
              label="Photo de Couverture (Bannière Hero)"
              value={heroImageUrl}
              onChange={setHeroImageUrl}
              onRemove={() => setHeroImageUrl('')}
              aspectRatio="banner"
              helperText="Glissez l'image de fond de votre vitrine (JPG, PNG, WebP recommandé en 16:9 ou panoramique)"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Titre de présentation (About)</label>
            <input
              type="text"
              value={aboutTitle}
              onChange={(e) => setAboutTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Couleur primaire du thème</label>
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
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Texte de présentation / Histoire</label>
            <textarea
              rows={3}
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Modifications enregistrées !
            </span>
          ) : <span />}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer le Thème'}
          </button>
        </div>
      </form>
    </div>
  );
};
