import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Check,
  Store,
  Palette,
  ImageIcon,
  Type,
  Eye,
  MapPin,
  Phone,
  Mail,
  Clock,
  LayoutTemplate,
  MessageSquareQuote,
  HelpCircle,
  Save
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import { PRESET_OPTIONS } from '../../presets/presets';
import { ImageDropzone } from '../../components/ImageDropzone';

type TabKey = 'content' | 'footer' | 'visuals' | 'colors' | 'template' | 'preview';

export const CmsThemePage: React.FC = () => {
  const { tenant, setTenant } = useTenant();
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>('content');

  // Identité & Haut de page
  const [name, setName] = useState(tenant?.name || '');
  const [tagline, setTagline] = useState(tenant?.tagline || '');
  const [announcement, setAnnouncement] = useState(tenant?.cmsConfig?.announcement || '');
  const [heroCtaText, setHeroCtaText] = useState(tenant?.cmsConfig?.heroCtaText || '');

  // Coordonnées
  const [address, setAddress] = useState(tenant?.address || '');
  const [contactPhone, setContactPhone] = useState(tenant?.contactPhone || '');
  const [contactEmail, setContactEmail] = useState(tenant?.contactEmail || '');

  // Section À Propos
  const [aboutTitle, setAboutTitle] = useState(tenant?.cmsConfig?.aboutTitle || '');
  const [aboutText, setAboutText] = useState(tenant?.cmsConfig?.aboutText || '');

  // Bannière CTA bas de page
  const [ctaTitle, setCtaTitle] = useState(tenant?.cmsConfig?.ctaTitle || '');
  const [ctaText, setCtaText] = useState(tenant?.cmsConfig?.ctaText || '');
  const [ctaButtonText, setCtaButtonText] = useState(tenant?.cmsConfig?.ctaButtonText || '');

  // Pied de page (Footer)
  const [footerDescription, setFooterDescription] = useState(tenant?.cmsConfig?.footerDescription || '');
  const [footerHoursTitle, setFooterHoursTitle] = useState(tenant?.cmsConfig?.footerHoursTitle || '');
  const [footerHoursCustomText, setFooterHoursCustomText] = useState(tenant?.cmsConfig?.footerHoursCustomText || '');
  const [footerCopyright, setFooterCopyright] = useState(tenant?.cmsConfig?.footerCopyright || '');
  const [footerBottomText, setFooterBottomText] = useState(tenant?.cmsConfig?.footerBottomText || '');

  // Visuels & Thème
  const [heroImageUrl, setHeroImageUrl] = useState(tenant?.heroImageUrl || '');
  const [logoUrl, setLogoUrl] = useState(tenant?.logoUrl || '');
  const [primaryColor, setPrimaryColor] = useState(tenant?.themeConfig?.primaryColor || '#EA580C');
  const [selectedPreset, setSelectedPreset] = useState(tenant?.themePreset || '');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state if tenant changes
  useEffect(() => {
    if (tenant) {
      setName(tenant.name || '');
      setTagline(tenant.tagline || '');
      setAddress(tenant.address || '');
      setContactPhone(tenant.contactPhone || '');
      setContactEmail(tenant.contactEmail || '');
      setHeroImageUrl(tenant.heroImageUrl || '');
      setLogoUrl(tenant.logoUrl || '');
      setSelectedPreset(tenant.themePreset || '');
      if (tenant.themeConfig?.primaryColor) {
        setPrimaryColor(tenant.themeConfig.primaryColor);
      }
      if (tenant.cmsConfig) {
        setAnnouncement(tenant.cmsConfig.announcement || '');
        setHeroCtaText(tenant.cmsConfig.heroCtaText || '');
        setAboutTitle(tenant.cmsConfig.aboutTitle || '');
        setAboutText(tenant.cmsConfig.aboutText || '');
        setCtaTitle(tenant.cmsConfig.ctaTitle || '');
        setCtaText(tenant.cmsConfig.ctaText || '');
        setCtaButtonText(tenant.cmsConfig.ctaButtonText || '');
        setFooterDescription(tenant.cmsConfig.footerDescription || '');
        setFooterHoursTitle(tenant.cmsConfig.footerHoursTitle || '');
        setFooterHoursCustomText(tenant.cmsConfig.footerHoursCustomText || '');
        setFooterCopyright(tenant.cmsConfig.footerCopyright || '');
        setFooterBottomText(tenant.cmsConfig.footerBottomText || '');
      }
    }
  }, [tenant]);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = PRESET_OPTIONS.find((p) => p.id === presetId);
    if (preset) {
      setPrimaryColor(preset.themeConfig.primaryColor);
      if (!heroImageUrl) setHeroImageUrl(preset.heroImageUrl);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);

    const updatedThemeConfig = {
      ...(tenant?.themeConfig || {}),
      primaryColor,
    };

    const updatedCmsConfig = {
      ...(tenant?.cmsConfig || {}),
      announcement,
      heroCtaText,
      aboutTitle,
      aboutText,
      ctaTitle,
      ctaText,
      ctaButtonText,
      footerDescription,
      footerHoursTitle,
      footerHoursCustomText,
      footerCopyright,
      footerBottomText,
    };

    try {
      if (selectedPreset && selectedPreset !== tenant?.themePreset) {
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
          address,
          contactPhone,
          contactEmail,
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
        setTimeout(() => setSavedSuccess(false), 4000);
      }
    } catch {
      // Handled
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: TabKey; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'content', label: 'Textes & Accueil', icon: <Type className="w-4 h-4" /> },
    { id: 'footer', label: 'Pied de page (Footer)', icon: <LayoutTemplate className="w-4 h-4" /> },
    { id: 'visuals', label: 'Photos & Logo', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'colors', label: 'Couleurs & Style', icon: <Palette className="w-4 h-4" /> },
    { id: 'template', label: 'Modèle Métier', icon: <Store className="w-4 h-4" /> },
    { id: 'preview', label: 'Aperçu & Publication', icon: <Eye className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-bold font-heading text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Palette className="w-6 h-6 text-orange-500" />
            Personnalisation du Site (CMS & Textes)
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Modifiez ici chaque texte de votre vitrine en ligne, vos coordonnées et l'intégralité de votre pied de page (Footer).
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Enregistrement...' : savedSuccess ? '✓ Enregistré !' : 'Enregistrer les modifications'}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>Vos modifications ont été enregistrées avec succès et sont visibles en direct sur votre boutique !</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-stone-200 dark:border-stone-800">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 1: TEXTES DU SITE (ACCUEIL, BANNIÈRE, À PROPOS, CTA)
         ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'content' && (
        <div className="space-y-6">

          {/* Section 1: En-tête & Haut de Page (Hero) */}
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-4">
            <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400">
                  En-tête & Accueil Haut
                </span>
              </div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 font-heading mt-1">
                Identité principale & Bannière d'accueil
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Ces informations constituent le titre principal, le sous-titre et le bandeau visible dès l'arrivée sur votre site.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Nom officiel du magasin *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: La Boulangerie Artisanale"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Apparaît dans la barre de menu en haut, dans le grand titre de l'accueil et dans le pied de page.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Phrase d'accroche (Slogan de bienvenue)
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Ex: Pains au levain et viennoiseries pur beurre depuis 2018"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  S'affiche en grand texte juste en dessous du nom du magasin sur la page d'accueil.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Bandeau d'annonce (Tout en haut du site)
                </label>
                <input
                  type="text"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="Ex: ✨ Click & Collect disponible en 15 min !"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Bandeau sombre affiché tout en haut de chaque page. Laissez vide pour le masquer.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Texte du bouton d'action principal
                </label>
                <input
                  type="text"
                  value={heroCtaText}
                  onChange={(e) => setHeroCtaText(e.target.value)}
                  placeholder="Commander maintenant"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Bouton coloré situé à côté de la bannière sur la page d'accueil (défaut : "Commander maintenant").
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Coordonnées du Magasin */}
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-4">
            <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400">
                  Coordonnées · À Propos & Footer
                </span>
              </div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 font-heading mt-1">
                Coordonnées de la boutique
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Ces informations sont affichées dans la section de présentation et dans la colonne "Contact" du pied de page (Footer).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  Adresse physique du magasin
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: 14 Rue des Gourmets, 75002 Paris"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-orange-500" />
                  Numéro de téléphone
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Ex: 01 23 45 67 89"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-orange-500" />
                  Email de contact
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Ex: contact@maboutique.fr"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Bloc À Propos / Histoire */}
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-4">
            <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                  Section Histoire · Page d'accueil
                </span>
              </div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 font-heading mt-1">
                Section "À propos" & Histoire
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Ce bloc se trouve sur la page d'accueil au milieu de page, accompagné d'une photo et de vos coordonnées.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Titre du bloc "À propos"
                </label>
                <input
                  type="text"
                  value={aboutTitle}
                  onChange={(e) => setAboutTitle(e.target.value)}
                  placeholder="Ex: Bienvenue dans notre boutique"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Texte complet de présentation
                </label>
                <textarea
                  rows={4}
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  placeholder="Racontez l'histoire de votre commerce, vos valeurs, vos matières premières, ce qui rend vos produits uniques..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Bannière d'incitation (CTA bas de page) */}
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-4">
            <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400">
                  Bannière Finale · Avant Footer
                </span>
              </div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 font-heading mt-1">
                Bannière d'action "Prêt à commander ?"
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Bannière sombre placée en fin de page d'accueil pour inciter les clients à parcourir le catalogue.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Titre de la bannière
                </label>
                <input
                  type="text"
                  value={ctaTitle}
                  onChange={(e) => setCtaTitle(e.target.value)}
                  placeholder="Prêt à commander ?"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Texte du bouton
                </label>
                <input
                  type="text"
                  value={ctaButtonText}
                  onChange={(e) => setCtaButtonText(e.target.value)}
                  placeholder="Découvrir nos produits"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Sous-titre explicatif
                </label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Choisissez vos articles, sélectionnez votre créneau et récupérez votre commande en boutique."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 2: PIED DE PAGE (FOOTER) — DÉDIÉ ET ULTRA EXPLICITE
         ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'footer' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-6">
            <div className="border-b border-stone-100 dark:border-stone-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
                  Pied de page (Footer)
                </span>
              </div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-heading mt-1">
                Configuration complète des textes du Footer
              </h2>
              <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                Le pied de page est affiché en bas de toutes les pages de votre boutique. Chaque bloc ci-dessous correspond exactement à une colonne ou une ligne de votre footer.
              </p>
            </div>

            {/* Colonne 1 du Footer */}
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">1</span>
                  Description sous le logo (Colonne de gauche)
                </label>
                <span className="text-[10px] text-stone-400 font-mono">[Footer · Col 1]</span>
              </div>
              <textarea
                rows={2}
                value={footerDescription}
                onChange={(e) => setFooterDescription(e.target.value)}
                placeholder="Ex: Commandez en ligne et récupérez vos articles en magasin. Simple, rapide et sécurisé."
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              <p className="text-[11px] text-stone-500">
                Ce court texte s'affiche juste en dessous du nom et du logo de votre boutique.
              </p>
            </div>

            {/* Colonne 2 du Footer: Horaires */}
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">2</span>
                  Horaires d'ouverture (Colonne Horaires)
                </label>
                <span className="text-[10px] text-stone-400 font-mono">[Footer · Col 2]</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Titre de la section
                </label>
                <input
                  type="text"
                  value={footerHoursTitle}
                  onChange={(e) => setFooterHoursTitle(e.target.value)}
                  placeholder="Horaires"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Texte libre personnalisé pour les horaires (Optionnel)
                </label>
                <textarea
                  rows={4}
                  value={footerHoursCustomText}
                  onChange={(e) => setFooterHoursCustomText(e.target.value)}
                  placeholder={"Ex:\nLun – Ven : 11h30 – 22h30\nSamedi : 12h00 – 23h30\nDimanche : 12h00 – 22h00"}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  💡 <strong>Astuce :</strong> Si vous laissez ce champ vide, le footer affichera automatiquement les horaires réels que vous avez configurés dans l'onglet <strong>Créneaux</strong>.
                </p>
              </div>
            </div>

            {/* Colonne 3 du Footer: Rappel Coordonnées */}
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">3</span>
                  Colonne Contact & Coordonnées
                </label>
                <span className="text-[10px] text-stone-400 font-mono">[Footer · Col 3]</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                La colonne contact affiche automatiquement votre <strong>adresse</strong> ({address || 'non renseignée'}), votre <strong>téléphone</strong> ({contactPhone || 'non renseigné'}) et votre <strong>email</strong> ({contactEmail || 'non renseigné'}).
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className="text-xs text-orange-600 dark:text-orange-400 font-medium hover:underline inline-flex items-center gap-1"
              >
                Modifier mes coordonnées dans l'onglet Textes & Accueil →
              </button>
            </div>

            {/* Colonne 4 du Footer: Navigation */}
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">4</span>
                  Colonne Navigation
                </label>
                <span className="text-[10px] text-stone-400 font-mono">[Footer · Col 4]</span>
              </div>
              <p className="text-xs text-stone-500">
                Génère automatiquement les liens vers l'accueil, le catalogue de produits, le panier et l'espace de connexion.
              </p>
            </div>

            {/* Bas de page: Copyright & Mention */}
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">5</span>
                  Ligne tout en bas du site (Copyright & Mentions)
                </label>
                <span className="text-[10px] text-stone-400 font-mono">[Footer · Bas]</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                    Texte de Copyright (Bas Gauche)
                  </label>
                  <input
                    type="text"
                    value={footerCopyright}
                    onChange={(e) => setFooterCopyright(e.target.value)}
                    placeholder={`© ${new Date().getFullYear()} ${name || 'Mon Magasin'}. Tous droits réservés.`}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                    Mention de bas de page (Bas Droite)
                  </label>
                  <input
                    type="text"
                    value={footerBottomText}
                    onChange={(e) => setFooterBottomText(e.target.value)}
                    placeholder="Propulsé par WoxxApp"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 3: PHOTOS & LOGO
         ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'visuals' && (
        <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-6">
          <div>
            <h2 className="text-base font-bold font-heading text-stone-900 dark:text-stone-100">
              Logo & Photos de votre commerce
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Téléversez vos propres images ou insérez un lien d'image direct.
            </p>
          </div>

          <div className="space-y-6">
            <ImageDropzone
              label="Logo de votre magasin"
              value={logoUrl}
              onChange={setLogoUrl}
              onRemove={() => setLogoUrl('')}
              aspectRatio="square"
              helperText="Format carré recommandé (PNG avec fond transparent idéal). S'affiche dans la barre de navigation et le footer."
            />

            <ImageDropzone
              label="Photo de couverture principale (Bannière Accueil)"
              value={heroImageUrl}
              onChange={setHeroImageUrl}
              onRemove={() => setHeroImageUrl('')}
              aspectRatio="banner"
              helperText="Photo de votre boutique, de vos produits ou de votre vitrine."
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 4: COULEURS & STYLE
         ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'colors' && (
        <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-6">
          <div>
            <h2 className="text-base font-bold font-heading text-stone-900 dark:text-stone-100">
              Couleur principale de votre boutique
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Cette couleur est appliquée sur tous les boutons d'action, les badges et les accents graphiques.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">Couleurs populaires</label>
            <div className="flex flex-wrap gap-2.5">
              {[
                { color: '#EA580C', label: 'Orange' },
                { color: '#059669', label: 'Vert Émeraude' },
                { color: '#2563EB', label: 'Bleu Royal' },
                { color: '#DC2626', label: 'Rouge' },
                { color: '#D97706', label: 'Ambre' },
                { color: '#7C3AED', label: 'Violet' },
                { color: '#DB2777', label: 'Rose' },
                { color: '#0891B2', label: 'Cyan' },
                { color: '#1C1917', label: 'Noir Élégant' },
              ].map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => setPrimaryColor(c.color)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-xs font-medium ${
                    primaryColor === c.color
                      ? 'border-stone-900 dark:border-stone-100 bg-stone-100 dark:bg-stone-800'
                      : 'border-stone-200 dark:border-stone-700 hover:border-stone-400'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.label}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Ou saisissez un code couleur personnalisé
              </label>
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
                  className="w-28 px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 space-y-2">
              <p className="text-xs font-medium text-stone-500">Aperçu direct du bouton avec cette couleur :</p>
              <button
                type="button"
                className="px-6 py-2.5 rounded-xl text-white text-xs font-semibold shadow-sm transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                {heroCtaText || 'Commander maintenant'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 5: MODÈLE MÉTIER (PRESET)
         ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'template' && (
        <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-6">
          <div>
            <h2 className="text-base font-bold font-heading text-stone-900 dark:text-stone-100">
              Modèle Métier de départ
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Sélectionnez le modèle le plus proche de votre domaine. Cela pré-configure les typographies et les styles.
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
                  <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">{p.name}</p>
                  <p className="text-[10px] text-stone-500">{p.category}</p>
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

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 6: APERÇU COMPLET & PUBLICATION
         ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-6">
            <div>
              <h2 className="text-base font-bold font-heading text-stone-900 dark:text-stone-100">
                Aperçu synthétique de votre vitrine
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Vérifiez ci-dessous le rendu de vos différents textes et validez la publication.
              </p>
            </div>

            {/* Bannière Hero Preview */}
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden bg-stone-50 dark:bg-stone-800/40">
              {heroImageUrl && (
                <div className="aspect-[21/9] overflow-hidden relative">
                  <img src={heroImageUrl} alt="Couverture" className="w-full h-full object-cover" />
                  {announcement && (
                    <div className="absolute top-0 inset-x-0 bg-stone-900/90 text-white text-[11px] py-1 text-center font-medium">
                      {announcement}
                    </div>
                  )}
                </div>
              )}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  {logoUrl && <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />}
                  <div>
                    <h3 className="font-bold text-stone-900 dark:text-stone-100 font-heading text-base">{name || 'Nom de votre magasin'}</h3>
                    {tagline && <p className="text-xs text-stone-500">{tagline}</p>}
                  </div>
                </div>

                {aboutText && (
                  <div className="pt-2 border-t border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-400">
                    <strong className="text-stone-800 dark:text-stone-200">{aboutTitle || 'À propos'} :</strong> {aboutText}
                  </div>
                )}

                <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex flex-wrap gap-4 text-xs text-stone-500">
                  {address && <span>📍 {address}</span>}
                  {contactPhone && <span>📞 {contactPhone}</span>}
                  {contactEmail && <span>✉️ {contactEmail}</span>}
                </div>

                <div className="pt-2 border-t border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-900 p-3 rounded-lg text-xs space-y-1">
                  <p className="font-semibold text-stone-700 dark:text-stone-300">Pied de page (Footer) :</p>
                  <p className="text-stone-500">{footerDescription || 'Description par défaut active'}</p>
                  <p className="text-[11px] text-stone-400">
                    {footerCopyright || `© ${new Date().getFullYear()} ${name || 'Boutique'}. Tous droits réservés.`} · {footerBottomText || 'Propulsé par WoxxApp'}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              {saving ? 'Publication en cours...' : savedSuccess ? '✓ Modifications enregistrées et publiées' : 'Publier ma boutique'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
