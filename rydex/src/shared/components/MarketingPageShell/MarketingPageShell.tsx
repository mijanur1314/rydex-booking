"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import Nav from "@/shared/components/Nav/Nav";
import Footer from "@/shared/components/Footer/Footer";

type HeroStat = {
  label: string;
  value: string;
};

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type Detail = {
  title: string;
  description: string;
};

type MarketingPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  heroStats: HeroStat[];
  features: Feature[];
  detailsTitle: string;
  details: Detail[];
  ctaTitle: string;
  ctaDescription: string;
};

export default function MarketingPageShell({
  eyebrow,
  title,
  description,
  heroStats,
  features,
  detailsTitle,
  details,
  ctaTitle,
  ctaDescription,
}: MarketingPageShellProps) {
  return (
    <div className="min-h-screen bg-white text-black">
      <Nav />

      <main className="overflow-hidden">
        <section className="relative isolate bg-black px-4 pb-16 pt-32 text-white sm:px-6 md:pb-20 lg:px-8 lg:pt-36">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_40%),linear-gradient(135deg,_rgba(255,255,255,0.08),_transparent_55%)]" />
          <div className="relative mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="grid gap-8 lg:gap-10 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-center"
            >
              <div className="max-w-3xl xl:max-w-[760px]">
                <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                  {eyebrow}
                </span>
                <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[0.98] sm:text-5xl lg:text-[3.5rem] xl:text-[4.25rem]">
                  {title}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
                  {description}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1 xl:self-stretch">
                {heroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-3xl border border-white/10 bg-white/8 p-5 backdrop-blur xl:min-h-[132px]"
                  >
                    <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                      {stat.label}
                    </p>
                    <p className="mt-3 text-3xl font-bold text-white">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-7 lg:grid-cols-3 lg:gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.35, delay: index * 0.08 }}
                    whileHover={{ y: -6 }}
                    className="group relative flex h-full min-h-[300px] flex-col rounded-[32px] border border-zinc-200 bg-white p-7 sm:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.10)] transition-shadow duration-300"
                  >
                    <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

                    <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-black text-white shadow-[0_18px_36px_rgba(0,0,0,0.18)]">
                      <Icon size={22} />
                    </div>
                    <h2 className="mt-7 text-[1.75rem] font-black leading-[1.05] tracking-tight text-black sm:text-[1.9rem]">
                      {feature.title}
                    </h2>
                    <p className="mt-4 max-w-[32ch] text-base leading-8 text-zinc-600">
                      {feature.description}
                    </p>

                    <div className="mt-auto pt-8">
                      <div className="h-px w-full bg-zinc-100" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-6xl rounded-[36px] bg-zinc-50 p-8 sm:p-10 lg:p-12">
            <div className="grid gap-10 xl:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                  Why Rydex
                </p>
                <h2 className="mt-4 text-3xl font-black text-black sm:text-4xl">
                  {detailsTitle}
                </h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {details.map((detail, index) => (
                  <motion.div
                    key={detail.title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.35, delay: index * 0.06 }}
                    className="rounded-3xl border border-black/8 bg-white p-6"
                  >
                    <h3 className="text-lg font-semibold text-black">
                      {detail.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">
                      {detail.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl rounded-[36px] bg-black px-8 py-12 text-white sm:px-10">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/55">
                Next Step
              </p>
              <h2 className="mt-4 text-3xl font-black sm:text-4xl">
                {ctaTitle}
              </h2>
              <p className="mt-4 text-sm leading-6 text-white/70 sm:text-base">
                {ctaDescription}
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
