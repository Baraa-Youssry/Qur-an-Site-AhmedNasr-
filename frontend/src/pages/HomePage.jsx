import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import {
  getSettings,
  getClips,
  getSocialLinks,
  getSurahs,
} from "../services/api";
import ClipCard from "../components/clips/ClipCard";
import {
  FaYoutube,
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaTiktok,
  FaTelegram,
} from "react-icons/fa";
import { FiBookOpen, FiPlay, FiAward } from "react-icons/fi";
import reciterImg from "../imgs/561757969_1135356858662777_2336006452127057088_n-removebg-preview.jpeg";
import coverSound from "../imgs/cover-sound.jpeg";

const platformIcons = {
  youtube: FaYoutube,
  instagram: FaInstagram,
  facebook: FaFacebook,
  twitter: FaTwitter,
  tiktok: FaTiktok,
  telegram: FaTelegram,
};

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
    staleTime: 10 * 60 * 1000,
  });

  const { data: clips = [] } = useQuery({
    queryKey: ["clips"],
    queryFn: getClips,
    staleTime: 10 * 60 * 1000,
  });

  const { data: socialLinks = [] } = useQuery({
    queryKey: ["social-links"],
    queryFn: getSocialLinks,
    staleTime: 10 * 60 * 1000,
  });

  const { data: surahs = [] } = useQuery({
    queryKey: ["surahs"],
    queryFn: getSurahs,
    staleTime: 5 * 60 * 1000,
  });

  const name =
    i18n.language === "ar"
      ? settings?.reciter_name_ar
      : settings?.reciter_name_en;
  const bio = i18n.language === "ar" ? settings?.bio_ar : settings?.bio_en;

  const stats = [
    {
      icon: FiBookOpen,
      value: surahs.length || "114",
      label: t("admin.total_surahs"),
    },
    { icon: FiPlay, value: clips.length || "0", label: t("admin.total_clips") },
    {
      icon: FiAward,
      value: settings?.years_of_experience || "10+",
      label: i18n.language === "ar" ? "سنوات خبرة" : "Years Experience",
    },
  ];

  return (
    <>
      <Helmet>
        <title>
          {name || "Ahmed Abdelrazek Nasr"} - {t("home.hero_subtitle")}
        </title>
        <meta
          property="og:title"
          content={`${name || "Ahmed Abdelrazek Nasr"} - ${t("home.hero_subtitle")}`}
        />
        <meta property="og:description" content={bio || ""} />
      </Helmet>

      <section
        className="relative min-h-[85vh] flex items-center justify-center overflow-hidden cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute inset-0">
          <img
            src={coverSound}
            alt=""
            className={`w-full h-full object-cover transition-all duration-700 ${
              isHovered ? "scale-105 blur-sm" : "scale-100 blur-0"
            }`}
          />
          <div
            className={`absolute inset-0 transition-opacity duration-700 ${
              isHovered
                ? "bg-gradient-to-b from-parchment/80 via-white/70 to-parchment/90 dark:from-navy/90 dark:via-navy-light/85 dark:to-navy/95"
                : "bg-transparent"
            }`}
          />
        </div>

        <div
          className={`absolute inset-0 opacity-10 transition-opacity duration-700 ${
            isHovered ? "opacity-30" : "opacity-0"
          }`}
        >
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald rounded-full blur-[96px]" />
        </div>

        <div
          className={`relative z-10 text-center px-4 max-w-3xl transition-all duration-500 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="w-36 h-36 rounded-full overflow-hidden ring-2 ring-gold/30 shadow-2xl shadow-gold/10 mx-auto mb-8">
            <img
              src={reciterImg}
              alt={name || ""}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy/40 dark:bg-white/5 backdrop-blur mb-8">
            <div className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
            <span className="text-sm text-gray-600 dark:text-gray-300 font-heading">
              {t("home.hero_subtitle")}
            </span>
          </div>

          <h1 className="font-arabic text-5xl md:text-7xl font-bold mb-4 text-gradient leading-tight">
            {t("home.hero_title")}
          </h1>

          {bio && (
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed">
              {bio.length > 200 ? `${bio.substring(0, 200)}...` : bio}
            </p>
          )}

          <Link
            to="/library"
            className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
          >
            <span>{t("home.hero_cta")}</span>
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>

          {socialLinks.length > 0 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              {socialLinks.map((link) => {
                const Icon = platformIcons[link.platform?.toLowerCase()];
                if (!Icon) return null;
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-navy/40 dark:bg-white/5 hover:bg-gold/10 hover:text-gold transition-all duration-300 text-gray-400 dark:text-gray-400"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="glass-card text-center p-5">
                <Icon className="w-6 h-6 text-gold mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-heading mt-1">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {clips.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl font-bold text-white dark:text-white text-gray-900">
                {t("home.recent_clips")}
              </h2>
            </div>
            <Link
              to="/clips"
              className="text-sm text-gold hover:text-gold-light transition-colors font-heading"
            >
              {t("home.view_all")} &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clips.slice(0, 3).map((clip) => (
              <ClipCard key={clip.id} clip={clip} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
