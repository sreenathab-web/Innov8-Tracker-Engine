import React, { useState, useEffect } from 'react';
import { User } from '../types';
import App from '../App';
import { LogoIcon, EyeIcon, EyeOffIcon } from './icons';

const userStorage = {
  getUsers: (): User[] => {
    try {
      const users = localStorage.getItem('innov8-users');
      return users ? JSON.parse(users) : [];
    } catch (e) {
      return [];
    }
  },
  saveUsers: (users: User[]) => {
    localStorage.setItem('innov8-users', JSON.stringify(users));
  },
};

const AuthPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
     try {
        const user = sessionStorage.getItem('innov8-currentUser');
        return user ? JSON.parse(user) : null;
     } catch (e) {
        return null;
     }
  });
  const [isLoginView, setIsLoginView] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
        sessionStorage.setItem('innov8-currentUser', JSON.stringify(currentUser));
    } else {
        sessionStorage.removeItem('innov8-currentUser');
    }
  }, [currentUser]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const users = userStorage.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser({name: user.name, email: user.email});
    } else {
      setError('Invalid email or password.');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!name || !email || !password) {
        setError('All fields are required.');
        return;
    }
    const users = userStorage.getUsers();
    if (users.some(u => u.email === email)) {
      setError('A user with this email already exists.');
      return;
    }
    const newUser = { name, email, password };
    userStorage.saveUsers([...users, newUser]);
    setMessage('Signup successful! Please log in.');
    setIsLoginView(true);
    setPassword('');
    setName('');
  };
  
  const handleForgotPassword = () => {
    setError('');
    setMessage('');
    if (!email) {
        setError('Please enter your email address to reset password.');
        return;
    }
    const users = userStorage.getUsers();
    const user = users.find(u => u.email === email);
    if (user) {
        alert(`Password recovery for ${email}:\nYour password is "${user.password}"`);
        setMessage('Password recovery information has been shown.');
    } else {
        setError('No account found with that email address.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (currentUser) {
    return <App currentUser={currentUser} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-indigo-900/30 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-base-900/5 via-transparent to-transparent animate-gradient-bg bg-[size:200%_200%]" />
        
        <div className="flex items-center gap-3 mb-8 z-10">
          <LogoIcon />
          <h1 className="text-3xl font-bold text-base-content">Innov8 Tracker Engine</h1>
        </div>

      <div className="w-full max-w-md bg-base-800/50 backdrop-blur-xl border border-base-700/50 p-8 rounded-lg shadow-2xl z-10 animate-fade-in">
        <h2 className="text-2xl font-bold text-center text-base-content mb-6">
          {isLoginView ? 'Welcome Back' : 'Create an Account'}
        </h2>
        
        {error && <p className="bg-red-500/10 text-red-400 p-3 rounded-md mb-4 text-sm">{error}</p>}
        {message && <p className="bg-emerald-500/10 text-emerald-400 p-3 rounded-md mb-4 text-sm">{message}</p>}

        <form onSubmit={isLoginView ? handleLogin : handleSignup} className="space-y-6">
          {!isLoginView && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-base-content-secondary">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="mt-1 block w-full bg-base-700 border-base-600 rounded-md shadow-sm p-3 text-base-content focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-base-content-secondary">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="mt-1 block w-full bg-base-700 border-base-600 rounded-md shadow-sm p-3 text-base-content focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-base-content-secondary">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={isLoginView ? "current-password" : "new-password"}
                required
                className="mt-1 block w-full bg-base-700 border-base-600 rounded-md shadow-sm p-3 text-base-content pr-10 focus:ring-brand-primary focus:border-brand-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-base-content-secondary hover:text-base-content"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          
          {isLoginView && (
            <div className="text-right text-sm">
                <button type="button" onClick={handleForgotPassword} className="font-medium text-brand-secondary hover:text-brand-primary">
                    Forgot your password?
                </button>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-800 focus:ring-brand-primary transition-all duration-300 transform hover:scale-105"
            >
              {isLoginView ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-base-content-secondary">
          {isLoginView ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setIsLoginView(!isLoginView); setError(''); setMessage(''); }} className="font-medium text-brand-secondary hover:text-brand-primary">
            {isLoginView ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;