import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, LogIn, User as UserIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                // 1. Sign Up Route -> POST /api/users
                const res = await fetch('http://localhost:8080/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, name })
                });

                if (!res.ok) {
                    throw new Error('Failed to create account. Email might already be in use.');
                }

                toast.success('Account created successfully! Please sign in.');
                setIsSignUp(false); // Switch back to sign in
                setPassword(''); // Clear password field for security
            } else {
                // 2. Sign In Route -> POST /auth/login
                const res = await fetch('http://localhost:8080/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (!res.ok) {
                    throw new Error('Invalid email or password.');
                }

                const data = await res.json();
                login(data, data.token); // Use AuthContext to save user globally
                toast.success('Successfully logged in!');
                navigate('/'); // Redirect to dashboard
            }
        } catch (err) {
            toast.error(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">

                {/* Header Section */}
                <div className="login-header">
                    <div className="logo-container">
                        <Leaf className="logo-icon" size={32} />
                    </div>
                    <h1 className="login-title">Carbon Credit <br /> Management System</h1>
                    <p className="login-subtitle">{isSignUp ? 'Create a new account' : 'Login to continue'}</p>
                </div>

                {/* Form Section */}
                <form onSubmit={handleAuth} className="login-form">

                    {isSignUp && (
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <div className="input-wrapper">
                                <UserIcon className="input-icon" size={18} />
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Jane Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required={isSignUp}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-options">
                        <label className="remember-me">
                            <input type="checkbox" disabled={loading} />
                            <span>Remember me</span>
                        </label>
                        {!isSignUp && <a href="#" className="forgot-password">Forgot Password?</a>}
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        <LogIn size={18} />
                        {loading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <div className="toggle-mode" style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--eco-text-secondary)' }}>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    </span>
                    <button
                        type="button"
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setErrorMsg(null);
                            setSuccessMsg(null);
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--eco-primary)', fontWeight: '600', cursor: 'pointer', marginLeft: '0.5rem' }}
                    >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
