import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OAuth from "../components/OAuth";
import { apiFetch } from "../utils/api";

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const shine = {
  hidden: { opacity: 0, x: "-120%" },
  visible: {
    opacity: 1,
    x: "120%",
    transition: { duration: 1.4, ease: "easeInOut" },
  },
};

const buttonVariants = {
  hover: {
    scale: 1.04,
    boxShadow: "0 0 20px rgba(64, 196, 255, 0.8)",
    transition: { duration: 0.25 },
  },
  tap: { scale: 0.98 },
};

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      if (!formData.username || !formData.email || !formData.password) {
        setLoading(false);
        setError("Username, email, and password are required");
        return;
      }
      const data = await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setLoading(false);
      if (data.success === false) {
        setError(data.message || "Something went wrong!");
        return;
      }
      navigate("/sign-in");
    } catch (err) {
      setLoading(false);
      setError(err.message || "Something went wrong!");
    }
  };

  return (
    <motion.div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07111f] px-4 py-12"
      initial="hidden"
      animate="visible"
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5 } } }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(64,196,255,0.12),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(255,77,77,0.15),_transparent_30%)]" />

      <motion.div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-slate-900/75 p-8 shadow-[0_0_40px_rgba(64,196,255,0.15)] backdrop-blur-xl"
        variants={cardVariants}
        animate={{ y: [0, -8, 0], boxShadow: ['0 0 25px rgba(64,196,255,0.12)', '0 0 40px rgba(64,196,255,0.22)', '0 0 25px rgba(64,196,255,0.12)'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent blur-2xl"
          variants={shine}
          animate="visible"
        />

        <div className="relative z-10">
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-accent">Create account</p>
            <motion.h1
              className="mt-3 text-4xl font-black text-white"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              Join <span className="text-neon-blue">AuraKey</span>
            </motion.h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <motion.div variants={cardVariants}>
              <input
                type="text"
                placeholder="Username"
                id="username"
                required
                autoComplete="username"
                className="w-full rounded-2xl border border-slate-600 bg-slate-950/60 p-3.5 text-white placeholder:text-slate-400 focus:border-neon-blue focus:outline-none"
                onChange={handleChange}
              />
            </motion.div>
            <motion.div variants={cardVariants}>
              <input
                type="email"
                placeholder="Email"
                id="email"
                required
                autoComplete="email"
                className="w-full rounded-2xl border border-slate-600 bg-slate-950/60 p-3.5 text-white placeholder:text-slate-400 focus:border-neon-blue focus:outline-none"
                onChange={handleChange}
              />
            </motion.div>
            <motion.div variants={cardVariants}>
              <input
                type="password"
                placeholder="Password"
                id="password"
                required
                autoComplete="new-password"
                className="w-full rounded-2xl border border-slate-600 bg-slate-950/60 p-3.5 text-white placeholder:text-slate-400 focus:border-neon-blue focus:outline-none"
                onChange={handleChange}
              />
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-neon-blue to-sky-500 p-3.5 text-sm font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:brightness-110 disabled:opacity-60"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {loading ? "Loading..." : "Sign Up"}
            </motion.button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-slate-500">
            <span className="h-px flex-1 bg-white/10" />
            or
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <OAuth />

          <motion.div className="mt-6 flex justify-center gap-2 text-sm text-slate-300" variants={cardVariants}>
            <p>Have an account?</p>
            <Link to="/sign-in">
              <span className="font-semibold text-neon-blue transition hover:text-gold-accent">Sign in</span>
            </Link>
          </motion.div>

          {error && (
            <motion.p
              className="mt-5 text-center text-sm text-red-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
