import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { Tilt } from "react-tilt";

const highlightItems = [
  "Secure JWT authentication",
  "Google OAuth-ready flow",
  "Modern React dashboard UX",
  "Scalable MERN architecture",
];

const values = [
  {
    title: "Built for trust",
    text: "AuraKey keeps user identity protected with clean, secure patterns designed for real products.",
  },
  {
    title: "Built for momentum",
    text: "From onboarding to profile access, each step is streamlined to feel confident and effortless.",
  },
  {
    title: "Built for growth",
    text: "The platform is ready for expansion, with a foundation that supports new features and bigger ideas.",
  },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: index * 0.08, ease: "easeOut" },
  }),
};

export default function About() {
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  return (
    <motion.div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07111f] px-4 py-12"
      initial="hidden"
      animate="visible"
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6 } } }}
      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          particles: {
            number: { value: 48, density: { enable: true, value_area: 900 } },
            color: { value: ["#FF4D4D", "#40C4FF", "#FFD700"] },
            shape: { type: "circle" },
            opacity: { value: 0.35, random: true },
            size: { value: 2, random: true },
            move: {
              enable: true,
              speed: 1.1,
              direction: "none",
              random: true,
              out_mode: "out",
            },
          },
          interactivity: {
            events: {
              onhover: { enable: true, mode: "repulse" },
              onclick: { enable: true, mode: "push" },
            },
          },
          retina_detect: true,
        }}
        className="absolute inset-0 z-0"
      />

      <Tilt options={{ max: 8, scale: 1.005, perspective: 1000 }}>
        <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/75 p-6 shadow-[0_0_32px_rgba(64,196,255,0.12)] backdrop-blur-xl sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(64,196,255,0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(255,77,77,0.10),_transparent_32%)]" />

          <div className="relative">
            <motion.div
              className="mb-8 text-center"
              custom={0}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neon-blue">About AuraKey</p>
              <motion.h1
                className="mt-4 text-4xl font-bold text-white sm:text-5xl"
                style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                Security with a brighter edge
              </motion.h1>
            </motion.div>

            <motion.div
              className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]"
              custom={1}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="space-y-6 text-slate-300">
                <motion.p
                  className="text-lg leading-8 text-slate-200"
                  whileHover={{ x: 4, color: '#f8fafc' }}
                  transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                >
                  AuraKey combines secure authentication with a refined product experience, giving people a sign-in flow that feels trustworthy, smooth, and thoughtfully crafted for real users.
                </motion.p>

                <motion.p
                  className="text-lg leading-8 text-slate-300"
                  whileHover={{ x: 4, color: '#dbeafe' }}
                  transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                >
                  Built on a <span className="font-bold text-neon-red">MERN</span> foundation, it brings protected routes, clean onboarding, and a reliable interface that keeps identity management simple and elegant.
                </motion.p>

                <div className="grid gap-3 pt-2 sm:grid-cols-2">
                  {highlightItems.map((item) => (
                    <motion.div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                      whileHover={{ y: -2, borderColor: "rgba(64,196,255,0.35)" }}
                    >
                      {item}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Core values</span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-300">Live</span>
                </div>

                <div className="space-y-4">
                  {values.map((value, index) => (
                    <motion.div
                      key={value.title}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                      variants={sectionVariants}
                      initial="hidden"
                      animate="visible"
                      custom={index + 2}
                      whileHover={{ y: -2, backgroundColor: "rgba(255,255,255,0.04)" }}
                    >
                      <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>{value.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{value.text}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              className="mt-10 text-center"
              custom={5}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
            >
              <Link
                to="/sign-up"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-neon-blue to-neon-red px-7 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-[0_0_18px_rgba(64,196,255,0.22)] transition duration-300 hover:-translate-y-0.5"
              >
                Join AuraKey
              </Link>
            </motion.div>
          </div>
        </div>
      </Tilt>
    </motion.div>
  );
}
