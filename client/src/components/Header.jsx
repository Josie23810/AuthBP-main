import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Avatar from './Avatar';

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <header className='sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl'>
      <div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6'>
        <Link to={currentUser ? '/profile' : '/'} className='flex items-center gap-2'>
          <Avatar
            src={currentUser?.profilePicture}
            name={currentUser?.username || 'AuraKey'}
            alt='profile'
            className='h-8 w-8 text-sm'
          />
          <h1 className='text-lg font-black tracking-[0.18em] text-white'>AURAKEY</h1>
        </Link>

        <nav className='flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 p-1.5 shadow-lg shadow-slate-950/30'>
          <Link to='/' className='rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5 hover:text-white'>Home</Link>
          <Link to='/about' className='rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5 hover:text-white'>About</Link>
          <Link to='/admin/sign-in' className='rounded-full px-4 py-2 text-sm font-medium text-gold-accent transition hover:bg-white/5'>Admin</Link>
          <Link to='/profile' className='flex items-center justify-center rounded-full px-3 py-2 transition hover:bg-white/5'>
            {currentUser ? (
              <Avatar
                src={currentUser.profilePicture}
                name={currentUser.username}
                alt='profile'
                className='h-8 w-8 text-sm'
              />
            ) : (
              <span className='text-sm font-medium text-slate-100'>Sign In</span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
