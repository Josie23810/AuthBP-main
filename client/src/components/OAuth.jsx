import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { app, isFirebaseConfigured } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInFailure, signInStart, signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { apiFetch } from '../utils/api';

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleClick = async () => {
    try {
      setLoading(true);
      setError(null);
      dispatch(signInStart());

      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);

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
        className="rounded-lg bg-red-700 p-3 uppercase text-white hover:opacity-95 disabled:opacity-60"
      >
        {loading ? 'Signing in...' : 'Continue with google'}
      </button>
      {error && <p className="text-center text-sm text-red-400">{error}</p>}
    </div>
  );
}
