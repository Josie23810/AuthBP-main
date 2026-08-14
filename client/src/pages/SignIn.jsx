import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import OAuth from "../components/OAuth";

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
    boxShadow: "0 0 20px rgba(255, 77, 77, 0.7)",
    transition: { duration: 0.25 },
  },
  tap: { scale: 0.98 },
};

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailure(data));
        return;
      }
      dispatch(signInSuccess(data));
      navigate("/");
    } catch (error) {
      dispatch(signInFailure(error));
    }
  };

  return (
    <motion.div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07111f] px-4 py-12"
      initial="hidden"
      animate="visible"
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5 } } }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(64,196,255,0.13),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(255,77,77,0.16),_transparent_30%)]" />

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
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neon-blue">Welcome back</p>
            <motion.h1
              className="mt-3 text-4xl font-black text-white"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              Sign in to <span className="text-neon-blue">AuraKey</span>
            </motion.h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <motion.div variants={cardVariants}>
              <input
                type="email"
                placeholder="Email"
                id="email"
                className="w-full rounded-2xl border border-slate-600 bg-slate-950/60 p-3.5 text-white placeholder:text-slate-400 focus:border-neon-blue focus:outline-none"
                onChange={handleChange}
              />
            </motion.div>
            <motion.div variants={cardVariants}>
              <input
                type="password"
                placeholder="Password"
                id="password"
                className="w-full rounded-2xl border border-slate-600 bg-slate-950/60 p-3.5 text-white placeholder:text-slate-400 focus:border-neon-blue focus:outline-none"
                onChange={handleChange}
              />
            </motion.div>

            <motion.button
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-neon-red to-red-500 p-3.5 text-sm font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:brightness-110 disabled:opacity-60"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {loading ? "Loading..." : "Sign In"}
            </motion.button>

            <OAuth />
          </form>

          <motion.div className="mt-6 flex justify-center gap-2 text-sm text-slate-300" variants={cardVariants}>
            <p>Don't have an account?</p>
            <Link to="/sign-up">
              <span className="font-semibold text-neon-blue transition hover:text-gold-accent">Create one</span>
            </Link>
          </motion.div>

          {error && (
            <motion.p
              className="mt-5 text-center text-sm text-red-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error.message || "Something went wrong!"}
            </motion.p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
