import { motion } from "motion/react";
import { SectionHeader } from "./LayoutElements";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const currentSponsors = [
  {
    name: "Amazon Web Services",
    tier: "Cloud Partner",
    logo: "/AWS_logo1.png",
    logoClass: "h-18 sm:h-32",
  },
  {
    name: "ARIF",
    tier: "Community Partner",
    logo: "/ARIF-white.png",
    logoClass: "h-24 sm:h-24",
  },
  {
    name: "AWS Builder",
    tier: "Technology Partner",
    logo: "/AWS_Builder.png",
    logoClass: "h-14 sm:h-28",
  },
];

export const ConstructorsSection = () => {
  return (
    <section className="relative z-20 bg-[#050505] px-4 py-16 sm:px-12 sm:py-24 lg:px-24">
      {/* Header */}
      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeader
          title="Meet Our Sponsors"
          subtitle="Our valued partners who make AWS Student Community Day Dhule 2026 possible. Join them in supporting the next generation of cloud innovators."
          sysId="11.SPNS"
        />

        <div className="pb-2 sm:pb-8">
          <Link
            to="/sponsors"
            className="inline-flex skew-x-[-12deg] bg-f1-red px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
          >
            <span className="flex items-center gap-2 skew-x-[12deg]">
              <span>Become a Sponsor</span>
              <ArrowUpRight size={16} />
            </span>
          </Link>
        </div>
      </div>

      {/* Sponsor Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {currentSponsors.map((sponsor, i) => (
          <motion.div
            key={sponsor.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="group relative flex min-h-[220px] flex-col items-center justify-center overflow-hidden border border-white/5 bg-[#111] p-6 transition-all duration-500 hover:border-white/20 sm:p-8"
          >
            {/* Hover glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {/* Tier badge */}
            <div className="absolute right-4 top-4 font-mono text-[10px] uppercase tracking-[0.2em] text-orange-400 opacity-60 transition-opacity group-hover:opacity-100">
              {sponsor.tier}
            </div>

            {/* Logo */}
            <div className="relative z-10 mb-4 flex items-center justify-center">
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                className={`w-auto object-contain opacity-60 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105 ${sponsor.logoClass}`}
              />
            </div>

            {/* Name */}
            <h3 className="relative z-10 text-center font-sans text-lg font-black uppercase tracking-tight text-white/80 transition-colors group-hover:text-white">
              {sponsor.name}
            </h3>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-12 flex flex-col items-start justify-between gap-6 border border-white/5 bg-gradient-to-r from-[#111] to-[#0a0a0a] p-6 sm:flex-row sm:items-center sm:p-10"
      >
        <div>
          <h3 className="mb-2 text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
            Want to sponsor this event?
          </h3>

          <p className="max-w-lg text-sm text-white/60">
            Explore our sponsorship tiers and apply to become a partner. Help us
            power the next generation of cloud innovators.
          </p>
        </div>

        <Link
          to="/sponsors"
          className="inline-flex shrink-0 skew-x-[-12deg] border border-white/20 px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-white/10"
        >
          <span className="flex items-center gap-2 skew-x-[12deg]">
            <span>View Tiers & Apply</span>
            <ArrowUpRight size={16} />
          </span>
        </Link>
      </motion.div>
    </section>
  );
};
