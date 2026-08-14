import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <header className='sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl'>
      <div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6'>
        <Link to='/' className='flex items-center gap-2'>
          <span className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-red text-sm font-black text-white shadow-[0_0_20px_rgba(64,196,255,0.4)]'>A</span>
          <h1 className='text-lg font-black tracking-[0.18em] text-white'>AURAKEY</h1>
        </Link>

        <nav className='flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 p-1.5 shadow-lg shadow-slate-950/30'>
          <Link to='/' className='rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5 hover:text-white'>Home</Link>
          <Link to='/about' className='rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5 hover:text-white'>About</Link>
          <Link to='/profile' className='flex items-center justify-center rounded-full px-3 py-2 transition hover:bg-white/5'>
            {currentUser ? (
              <img src={currentUser.profilePicture} alt='profile' className='h-8 w-8 rounded-full border border-white/10 object-cover' />
            ) : (
              <span className='text-sm font-medium text-slate-100'>Sign In</span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
