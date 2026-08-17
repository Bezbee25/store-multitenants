import React, { useState, useEffect } from 'react';
import { Sparkles, Check, ChevronRight, ChevronLeft, Store, Palette, ImageIcon, Type, Eye } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import { PRESET_OPTIONS } from '../../presets/presets';
import { ImageDropzone } from '../../components/ImageDropzone';

type SetupStep = 'template' | 'identity' | 'visuals' | 'colors' | 'preview';

export const CmsThemePage: React.FC = () => {
  const { tenant, setTenant } = useTenant();
  const { token } = useAuth();

  const [step, setStep] = useState<SetupStep>('template');
  const [selectedPreset, setSelectedPreset] = useState(tenant?.themePreset || '');
  const [name, setName] = useState(tenant?.name || '');
  const [tagline, setTagline] = useState(tenant?.tagline || '');
  const [description, setDescription] = useState(tenant?.description || '');
  const [heroImageUrl, setHeroImageUrl] = useState(tenant?.heroImageUrl || '');
  const [logoUrl, setLogoUrl] = useState(tenant?.logoUrl || '');
  const [primaryColor, setPrimaryColor] = useState(tenant?.themeConfig?.primaryColor || '#EA580C');
  const [announcement, setAnnouncement] = useState(tenant?.cmsConfig?.announcement || '');
  const [aboutTitle, setAboutTitle] = useState(tenant?.cmsConfig?.aboutTitle || '');
  const [aboutText, setAboutText] = useState(tenant?.cmsConfig?.aboutText || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const steps: { id: SetupStep; label: string; icon: React.ReactNode }[] = [
    { id: 'template', label: 'Type de magasin', icon: <Store className="w-4 h-4" /> },
    { id: 'identity', label: 'Nom & description', icon: <Type className="w-4 h-4" /> },
    { id: 'visuals', label: 'Photos', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'colors', label: 'Couleurs', icon: <Palette className="w-4 h-4" /> },
    { id: 'preview', label: 'Publier', icon: <Eye className="w-4 h-4" /> },
  ];

  const currentIdx = steps.findIndex((s) => s.id === step);
  const canNext = () => {
    if (step === 'template') return !!selectedPreset;
    if (step === 'identity') return name.trim().length > 0;
    return true;
  };

  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = PRESET_OPTIONS.find((p) => p.id === presetId);
    if (preset) {
      setPrimaryColor(preset.themeConfig.primaryColor);
      if (!heroImageUrl) setHeroImageUrl(preset.heroImageUrl);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    setSavedSuccess(false);

    const updatedThemeConfig = {
      ...(tenant?.themeConfig || {}),
      primaryColor,
    };
    const updatedCmsConfig = {
      ...(tenant?.cmsConfig || {}),
      announcement,
      aboutTitle,
      aboutText,
    };

    try {
      // Apply preset first
      if (selectedPreset) {
        await fetch('/api/manager/preset/apply', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'X-Tenant-Slug': tenant?.subdomain || '',
          },
          body: JSON.stringify({ presetId: selectedPreset, replaceProducts: false }),
        });
      }

      // Then save custom settings
      const res = await fetch('/api/manager/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Tenant-Slug': tenant?.subdomain || '',
        },
        body: JSON.stringify({
          name,
          tagline,
          description,
          heroImageUrl,
          logoUrl,
          themeConfig: updatedThemeConfig,
          cmsConfig: updatedCmsConfig,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setTenant(updated);
        setSavedSuccess(true);
      }
    } catch {
      // handled
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 px-4">
      {/* Progress Bar */}
      <div className="flex items-center gap-1 mb-8">
        {steps.map((s, idx) => (
          <React.Fragment key={s.id}>
            <button
              type="button"
              onClick={() => setStep(s.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                step === s.id
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                  : idx < currentIdx
                  ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {idx < currentIdx ? <Check className="w-3.5 h-3.5" /> : s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {idx < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      {/* ─── Step 1: Template ─── */}
      {step === 'template' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold font-heading text-stone-900 dark:text-stone-100">
              Quel type de magasin créez-vous ?
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Choisissez le modèle le plus proche de votre activité. Tout sera personnalisable ensuite.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PRESET_OPTIONS.map((p) => {
              const isActive = selectedPreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p.id)}
                  className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                    isActive
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-400'
                  }`}
                >
                  <div className="aspect-[3/2] rounded-lg overflow-hidden mb-2.5 bg-stone-100 dark:bg-stone-800">
                    <img src={p.heroImageUrl} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{p.name}</p>
                  <p className="text-[11px] text-stone-500">{p.category}</p>
                  {isActive && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Step 2: Identity ─── */}
      {step === 'identity' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold font-heading text-stone-900 dark:text-stone-100">
              Présentez votre commerce
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Ces informations apparaîtront sur votre vitrine en ligne.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Nom de votre magasin *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: La Petite Boulangerie de Marie"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Phrase d'accroche (optionnel)
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Ex: Pains au levain et viennoiseries pur beurre depuis 2018"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Décrivez votre activité en quelques lignes (optionnel)
              </label>
              <textarea
                rows={3}
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                placeholder="Racontez votre histoire, vos valeurs, ce qui rend votre commerce unique..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Bandeau d'annonce en haut de page (optionnel)
              </label>
              <input
                type="text"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="Ex: ✨ Ouverture le 1er septembre — Click & Collect disponible !"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── Step 3: Visuals ─── */}
      {step === 'visuals' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold font-heading text-stone-900 dark:text-stone-100">
              Ajoutez vos photos
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Glissez-déposez vos images ou cliquez pour les sélectionner depuis votre ordinateur ou téléphone.
            </p>
          </div>

          <div className="space-y-5">
            <ImageDropzone
              label="Logo de votre magasin"
              value={logoUrl}
              onChange={setLogoUrl}
              onRemove={() => setLogoUrl('')}
              aspectRatio="square"
              helperText="Format carré recommandé (PNG avec fond transparent idéal)"
            />

            <ImageDropzone
              label="Photo de couverture (bannière principale)"
              value={heroImageUrl}
              onChange={setHeroImageUrl}
              onRemove={() => setHeroImageUrl('')}
              aspectRatio="banner"
              helperText="Photo de votre boutique, de vos produits ou de votre équipe"
            />
          </div>
        </div>
      )}

      {/* ─── Step 4: Colors ─── */}
      {step === 'colors' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold font-heading text-stone-900 dark:text-stone-100">
              Choisissez votre couleur
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Cette couleur sera utilisée pour les boutons et les accents de votre boutique.
            </p>
          </div>

          {/* Quick Color Presets */}
          <div className="space-y-3">
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">Couleurs populaires</label>
            <div className="flex flex-wrap gap-2.5">
              {[
                { color: '#EA580C', label: 'Orange' },
                { color: '#059669', label: 'Vert' },
                { color: '#2563EB', label: 'Bleu' },
                { color: '#DC2626', label: 'Rouge' },
                { color: '#D97706', label: 'Ambre' },
                { color: '#7C3AED', label: 'Violet' },
                { color: '#DB2777', label: 'Rose' },
                { color: '#0891B2', label: 'Cyan' },
                { color: '#1C1917', label: 'Noir' },
              ].map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => setPrimaryColor(c.color)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-xs font-medium ${
                    primaryColor === c.color
                      ? 'border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-800'
                      : 'border-stone-200 dark:border-stone-700 hover:border-stone-400'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">Ou choisissez une couleur personnalisée</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-12 h-10 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-28 px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Live Preview */}
          <div className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3">
            <p className="text-xs font-medium text-stone-500">Aperçu de votre bouton principal :</p>
            <button
              type="button"
              className="px-6 py-2.5 rounded-lg text-white text-sm font-medium transition-all"
              style={{ backgroundColor: primaryColor }}
            >
              Commander en Click & Collect
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 5: Preview & Publish ─── */}
      {step === 'preview' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold font-heading text-stone-900 dark:text-stone-100">
              Récapitulatif de votre boutique
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Vérifiez les informations puis publiez. Vous pourrez tout modifier à tout moment.
            </p>
          </div>

          {/* Summary Card */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden">
            {heroImageUrl && (
              <div className="aspect-[21/9] overflow-hidden">
                <img src={heroImageUrl} alt="Couverture" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                {logoUrl && <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />}
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 font-heading">{name || 'Nom du magasin'}</h3>
                  {tagline && <p className="text-xs text-stone-500">{tagline}</p>}
                </div>
              </div>
              {aboutText && <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">{aboutText}</p>}
              {announcement && (
                <div className="text-xs bg-stone-100 dark:bg-stone-800 rounded-lg p-2.5 text-stone-600 dark:text-stone-400">
                  Bandeau : {announcement}
                </div>
              )}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-stone-500">Couleur :</span>
                <div className="w-5 h-5 rounded-full border border-stone-200" style={{ backgroundColor: primaryColor }} />
                <span className="text-xs font-mono text-stone-500">{primaryColor}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">Template :</span>
                <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                  {PRESET_OPTIONS.find((p) => p.id === selectedPreset)?.name || 'Aucun'}
                </span>
              </div>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 text-sm font-medium flex items-center gap-2">
              <Check className="w-4 h-4" /> Votre boutique est publiée ! Vous pouvez maintenant ajouter vos produits.
            </div>
          )}

          <button
            type="button"
            onClick={handlePublish}
            disabled={saving}
            className="w-full py-3 rounded-xl text-white font-medium text-sm transition-colors disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}
          >
            {saving ? 'Publication en cours...' : savedSuccess ? '✓ Boutique publiée' : 'Publier ma boutique'}
          </button>
        </div>
      )}

      {/* ─── Navigation ─── */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-200 dark:border-stone-800">
        {currentIdx > 0 ? (
          <button
            type="button"
            onClick={() => setStep(steps[currentIdx - 1].id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Précédent
          </button>
        ) : (
          <div />
        )}

        {currentIdx < steps.length - 1 && (
          <button
            type="button"
            onClick={() => canNext() && setStep(steps[currentIdx + 1].id)}
            disabled={!canNext()}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors disabled:opacity-40"
          >
            Suivant <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
