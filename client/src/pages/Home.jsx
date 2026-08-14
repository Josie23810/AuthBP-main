import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const featureCards = [
  {
    title: 'Secure Access',
    description:
      'Protect every session with JWT-based authentication and secure user flows designed for real-world apps.',
    accent: 'text-neon-red',
  },
  {
    title: 'Fast UX',
    description:
      'Enjoy a clean React experience with smooth navigation, modern styling, and clear user-centric screens.',
    accent: 'text-neon-blue',
  },
  {
    title: 'Ready to Scale',
    description:
      'Built on the MERN stack so you can extend features, connect APIs, and grow from prototype to production.',
    accent: 'text-gold-accent',
  },
];

const stats = [
  { label: 'Secure logins', value: '24/7' },
  { label: 'Auth methods', value: '3+' },
  { label: 'Built for scale', value: 'MERN' },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: index * 0.12,
      ease: 'easeOut',
    },
  }),
};

const floatingGlow = {
  animate: {
    y: [0, -12, 0],
    rotate: [0, 3, -2, 0],
    transition: { duration: 8, ease: 'easeInOut', repeat: Infinity },
  },
};

export default function Home() {
  return (
    <div className='home-shell relative min-h-screen overflow-hidden bg-[#07111f] text-white'>
      <div className='aurora-grid absolute inset-0 opacity-60' />
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(64,196,255,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(255,77,77,0.18),_transparent_35%)]' />
      <motion.div className='absolute -left-24 top-20 h-72 w-72 rounded-full bg-neon-blue/20 blur-3xl' variants={floatingGlow} animate='animate' />
      <motion.div className='absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-neon-red/20 blur-3xl' variants={floatingGlow} animate='animate' />

      <main className='relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20'>
        <motion.section
          className='grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]'
          initial='hidden'
          animate='visible'
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.7, staggerChildren: 0.1 } },
          }}
        >
          <div>
            <motion.div
              className='mb-6 inline-flex items-center rounded-full border border-cyan-400/30 bg-slate-900/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.15)]'
              custom={0}
              variants={fadeInUp}
              animate={{ boxShadow: ['0 0 20px rgba(34,211,238,0.18)', '0 0 30px rgba(34,211,238,0.32)', '0 0 20px rgba(34,211,238,0.18)'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              A secure auth experience
            </motion.div>

            <motion.h1
              className='max-w-xl text-4xl font-black tracking-[-0.04em] sm:text-5xl lg:text-6xl'
              style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '-0.05em' }}
              custom={1}
              variants={fadeInUp}
              animate={{ scale: [1, 1.01, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className='text-slate-100'>Welcome to</span>{' '}
              <span className='inline-block bg-gradient-to-r from-sky-300 via-cyan-200 to-violet-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(125,211,252,0.45)]'>AuraKey</span>
            </motion.h1>

            <motion.p
              className='mt-6 max-w-xl text-lg leading-8 text-slate-300/90'
              custom={2}
              variants={fadeInUp}
            >
              Create a modern authentication flow with a sleek MERN stack foundation—secure, fast, and built to give users confidence from the very first click.
            </motion.p>

            <motion.div
              className='mt-8 flex flex-col gap-4 sm:flex-row'
              custom={3}
              variants={fadeInUp}
            >
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to='/sign-up'
                  className='inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white shadow-[0_0_25px_rgba(244,63,94,0.35)] transition duration-300 hover:brightness-110'
                >
                  Get started
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to='/about'
                  className='inline-flex items-center justify-center rounded-full border border-slate-600/80 bg-slate-900/40 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-100 transition duration-300 hover:border-cyan-400 hover:text-cyan-300'
                >
                  Learn more
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className='mt-10 grid max-w-lg grid-cols-3 gap-4'
              custom={4}
              variants={fadeInUp}
            >
              {stats.map((stat) => (
                <div key={stat.label} className='rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm'>
                  <div className='text-xl font-bold text-white'>{stat.value}</div>
                  <div className='mt-1 text-xs uppercase tracking-[0.12em] text-slate-400'>{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            className='relative'
            custom={2}
            variants={fadeInUp}
          >
            <div className='absolute inset-0 rounded-3xl bg-gradient-to-br from-neon-blue/20 via-transparent to-neon-red/20 blur-2xl' />
            <motion.div
              className='relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-sky-950/40 backdrop-blur-xl'
              animate={{ y: [0, -8, 0], boxShadow: ['0 0 25px rgba(64,196,255,0.1)', '0 0 35px rgba(64,196,255,0.18)', '0 0 25px rgba(64,196,255,0.1)'] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className='mb-5 flex items-center justify-between'>
                <span className='text-sm uppercase tracking-[0.18em] text-slate-300'>System status</span>
                <span className='inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300'>
                  <span className='h-2 w-2 rounded-full bg-emerald-400' />
                  Active
                </span>
              </div>

              <div className='rounded-2xl border border-white/10 bg-slate-950/70 p-5'>
                <div className='mb-4 flex items-center justify-between'>
                  <span className='text-sm text-slate-400'>Authentication Stack</span>
                  <span className='text-xs uppercase tracking-[0.18em] text-neon-blue'>MERN</span>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-center justify-between rounded-xl bg-slate-800/80 px-3 py-2'>
                    <span className='text-slate-300'>JWT</span>
                    <span className='text-neon-blue'>Secure</span>
                  </div>
                  <div className='flex items-center justify-between rounded-xl bg-slate-800/80 px-3 py-2'>
                    <span className='text-slate-300'>MongoDB</span>
                    <span className='text-gold-accent'>Live</span>
                  </div>
                  <div className='flex items-center justify-between rounded-xl bg-slate-800/80 px-3 py-2'>
                    <span className='text-slate-300'>React Router</span>
                    <span className='text-neon-red'>Smooth</span>
                  </div>
                </div>
              </div>

              <div className='mt-6 grid grid-cols-2 gap-3 text-sm text-slate-300'>
                <motion.div whileHover={{ scale: 1.04, y: -2 }} className='rounded-xl border border-white/10 bg-white/5 p-3'>
                  <div className='text-xs uppercase tracking-[0.18em] text-slate-400'>OAuth</div>
                  <div className='mt-2 text-xl font-bold text-white'>Google</div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04, y: -2 }} className='rounded-xl border border-white/10 bg-white/5 p-3'>
                  <div className='text-xs uppercase tracking-[0.18em] text-slate-400'>Profile</div>
                  <div className='mt-2 text-xl font-bold text-white'>User</div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>

        <motion.section
          className='mt-20'
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
          }}
        >
          <motion.div className='mb-8 text-center' variants={fadeInUp}>
            <p className='text-sm font-medium uppercase tracking-[0.22em] text-neon-blue'>Why teams choose it</p>
            <h2 className='mt-3 text-3xl font-bold text-white'>Everything you need for a polished auth experience</h2>
          </motion.div>

          <div className='grid gap-6 md:grid-cols-3'>
            {featureCards.map((feature, index) => (
              <motion.article
                key={feature.title}
                className='rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-950/30 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-neon-blue/50'
                variants={fadeInUp}
                custom={index}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  boxShadow: '0 0 28px rgba(64, 196, 255, 0.18)',
                }}
              >
                <div className={`mb-4 inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${feature.accent}`}>
                  {feature.title}
                </div>
                <p className='text-base leading-7 text-slate-300'>{feature.description}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
