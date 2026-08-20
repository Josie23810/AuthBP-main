import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOut,
} from '../redux/user/userSlice';
import { apiFetch } from '../utils/api';
import ProfilePhotoPicker from '../components/ProfilePhotoPicker';

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

const buttonVariants = {
  hover: {
    scale: 1.04,
    boxShadow: '0 0 20px rgba(64, 196, 255, 0.7)',
    transition: { duration: 0.25 },
  },
  tap: { scale: 0.98 },
};

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const { currentUser, loading, error } = useSelector((state) => state.user);

  if (!currentUser) return null;

  const previewPicture = formData.profilePicture || currentUser.profilePicture;

  const handleChange = (e) => {
    setUpdateSuccess(false);
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      setUpdateSuccess(false);
      setStatusMessage('');

      const payload = { ...formData };
      if (!payload.password) {
        delete payload.password;
      }

      const data = await apiFetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (data.success === false) {
        dispatch(updateUserFailure(data));
        return;
      }

      dispatch(updateUserSuccess(data));
      setFormData({});
      setUpdateSuccess(true);
      setStatusMessage('Profile updated.');
    } catch (err) {
      dispatch(updateUserFailure({ message: err.message || 'Could not update profile' }));
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete this account permanently?')) return;

    try {
      dispatch(deleteUserStart());
      const data = await apiFetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      if (data.success === false) {
        dispatch(deleteUserFailure(data));
        return;
      }
      dispatch(deleteUserSuccess(data));
      navigate('/sign-in');
    } catch (err) {
      dispatch(deleteUserFailure({ message: err.message || 'Could not delete account' }));
    }
  };

  const handleSignOut = async () => {
    try {
      await apiFetch('/api/auth/signout', { method: 'GET' });
      dispatch(signOut());
      navigate('/sign-in');
    } catch (err) {
      dispatch(signOut());
      navigate('/sign-in');
    }
  };

  const errorMessage =
    typeof error === 'string' ? error : error?.message;

  return (
    <motion.div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07111f] px-4 py-12"
      initial="hidden"
      animate="visible"
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5 } } }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(64,196,255,0.13),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(255,77,77,0.16),_transparent_30%)]" />

      <motion.div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/75 p-8 shadow-[0_0_40px_rgba(64,196,255,0.15)] backdrop-blur-xl"
        variants={cardVariants}
        animate={{
          y: [0, -8, 0],
          boxShadow: [
            '0 0 25px rgba(64,196,255,0.12)',
            '0 0 40px rgba(64,196,255,0.22)',
            '0 0 25px rgba(64,196,255,0.12)',
          ],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="relative z-10">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neon-blue">Your identity</p>
            <motion.h1
              className="mt-3 text-4xl font-black text-white"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              AuraKey <span className="text-neon-blue">Profile</span>
            </motion.h1>
            <p className="mt-3 text-sm text-slate-300">
              Update your details, password, and photo. Changes persist after you save.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
              <ProfilePhotoPicker
                value={previewPicture}
                name={currentUser.username}
                sizeClassName="h-28 w-28 text-3xl"
                onChange={(profilePicture) => {
                  setUpdateSuccess(false);
                  setFormData((prev) => ({ ...prev, profilePicture }));
                  setStatusMessage('Photo ready. Click Save changes to keep it.');
                }}
              />
              <div className="text-center sm:text-left">
                <p className="text-lg font-semibold text-white">{currentUser.username}</p>
                <p className="text-sm text-slate-400">{currentUser.email}</p>
              </div>
            </div>

            <input
              defaultValue={currentUser.username}
              type="text"
              id="username"
              placeholder="Username"
              autoComplete="username"
              className="w-full rounded-2xl border border-slate-600 bg-slate-950/60 p-3.5 text-white placeholder:text-slate-400 focus:border-neon-blue focus:outline-none"
              onChange={handleChange}
            />
            <input
              defaultValue={currentUser.email}
              type="email"
              id="email"
              placeholder="Email"
              autoComplete="email"
              className="w-full rounded-2xl border border-slate-600 bg-slate-950/60 p-3.5 text-white placeholder:text-slate-400 focus:border-neon-blue focus:outline-none"
              onChange={handleChange}
            />
            <input
              type="password"
              id="password"
              placeholder="New password (leave blank to keep current)"
              autoComplete="new-password"
              className="w-full rounded-2xl border border-slate-600 bg-slate-950/60 p-3.5 text-white placeholder:text-slate-400 focus:border-neon-blue focus:outline-none"
              onChange={handleChange}
            />

            <motion.button
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-neon-blue to-sky-500 p-3.5 text-sm font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:brightness-110 disabled:opacity-60"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {loading ? 'Saving...' : 'Save changes'}
            </motion.button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="font-semibold text-neon-red transition hover:text-red-300"
            >
              Delete account
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="font-semibold text-slate-300 transition hover:text-gold-accent"
            >
              Sign out
            </button>
          </div>

          {errorMessage && (
            <p className="mt-5 text-center text-sm text-red-400">{errorMessage}</p>
          )}
          {updateSuccess && (
            <p className="mt-5 text-center text-sm text-emerald-400">{statusMessage || 'Profile updated.'}</p>
          )}
          {!updateSuccess && statusMessage && (
            <p className="mt-5 text-center text-sm text-cyan-300">{statusMessage}</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
