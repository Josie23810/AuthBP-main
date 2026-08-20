import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { app, isFirebaseConfigured } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInFailure, signInStart, signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { apiFetch } from '../utils/api';

function isPopupCancelled(err) {
  const code = err?.code || '';
  const message = err?.message || '';
  return (
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request' ||
    code === 'auth/popup-blocked' ||
    message.includes('popup-closed-by-user') ||
    message.includes('cancelled-popup-request')
  );
}

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(
    isFirebaseConfigured
      ? null
      : 'Google sign-in needs Firebase keys in client/.env (copy client/.env.example).'
  );
  const [loading, setLoading] = useState(false);

  const handleGoogleClick = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isFirebaseConfigured || !app) {
        const message =
          'Google sign-in is not configured. Add your Firebase web app keys to client/.env, enable the Google provider in Firebase Authentication, then restart the Vite client.';
        setError(message);
        return;
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);

      dispatch(signInStart());

      const data = await apiFetch('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      });

      if (data.success === false) {
        dispatch(signInFailure(data));
        setError(data.message || 'Google sign-in failed');
        return;
      }

      dispatch(signInSuccess(data));
      navigate('/');
    } catch (err) {
      if (isPopupCancelled(err)) {
        setError(null);
        return;
      }
      const message = err.message || 'Could not sign in with Google';
      dispatch(signInFailure({ message }));
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
        className="rounded-2xl bg-red-700 p-3.5 text-sm font-bold uppercase tracking-[0.18em] text-white hover:opacity-95 disabled:opacity-60"
      >
        {loading ? 'Signing in...' : 'Continue with Google'}
      </button>
      {error && <p className="text-center text-sm text-red-400">{error}</p>}
    </div>
  );
}
