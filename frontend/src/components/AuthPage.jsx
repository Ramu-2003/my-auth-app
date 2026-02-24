import React, { useState } from 'react';
import axios from 'axios';
import './AuthPage.css';
import TermsAndConditions from './TermsAndConditions';

// Hardcoded API URL - change this to your Render backend URL
const API_URL = 'https://my-auth-app-48yw.onrender.com/api';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPass, setIsForgotPass] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const [showResetLink, setShowResetLink] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
    setIsForgotPass(false);
    clearInputs();
  };

  const handleForgotPassView = (e) => {
    e.preventDefault();
    setIsForgotPass(true);
    setIsSignUp(false);
    setShowResetLink(false);
    setResetLink('');
  };

  const goBackToLogin = () => {
    setIsForgotPass(false);
    setIsSignUp(false);
    setShowTerms(false);
    setShowResetLink(false);
    setResetLink('');
  };

  const clearInputs = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  // API Handlers
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return alert("Passwords do not match!");
    }
    try {
      const response = await axios.post(`${API_URL}/register`, {
        name,
        email,
        password
      });
      alert(response.data.message);
      setIsSignUp(false);
      clearInputs();
    } catch (err) {
      console.error('Register error:', err);
      alert(err.response?.data?.message || "Registration failed. Check console for details.");
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password
      });
      localStorage.setItem('token', response.data.token);
      setShowTerms(true);
    } catch (err) {
      console.error('Login error:', err);
      alert(err.response?.data?.message || "Login failed. Check console for details.");
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      if (response.data.resetLink) {
        setResetLink(response.data.resetLink);
        setShowResetLink(true);
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      alert(err.response?.data?.message || "Error sending reset link. Check console for details.");
    }
  };

  const handleAcceptTerms = () => {
    alert("Terms Accepted! Redirecting...");
    window.location.href = '/dashboard';
  };

  const copyResetLink = () => {
    navigator.clipboard.writeText(resetLink);
    alert("Reset link copied to clipboard!");
  };

  const openResetLink = () => {
    window.open(resetLink, '_blank');
  };

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
  );

  const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
  );

  // Show Terms and Conditions
  if (showTerms) {
    return (
      <TermsAndConditions 
        onAccept={handleAcceptTerms} 
        onDecline={goBackToLogin} 
      />
    );
  }

  // Show Reset Link
  if (showResetLink && resetLink) {
    return (
      <div className="auth-body forgot-bg">
        <div className="container" id="container" style={{ width: '900px', minHeight: '500px' }}>
          <div className="form-container" style={{ width: '100%', position: 'relative', opacity: 1, padding: '40px' }}>
            <h1 className="title-green">Password Reset Link</h1>
            <p style={{ margin: '20px 0', wordBreak: 'break-all', background: '#f0f0f0', padding: '15px', borderRadius: '8px' }}>
              {resetLink}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button className="btn-green" onClick={openResetLink}>Open Link</button>
              <button className="btn-blue" onClick={copyResetLink}>Copy Link</button>
              <button className="ghost-dark" onClick={goBackToLogin}>Back to Login</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Auth Forms
  return (
    <div className={`auth-body ${isSignUp ? 'signup-bg' : isForgotPass ? 'forgot-bg' : 'signin-bg'}`}>
      <div className={`container ${isSignUp ? "right-panel-active" : ""} ${isForgotPass ? "forgot-active" : ""}`} id="container">
        
        {/* Sign Up Form */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleSignUp}>
            <h1 className="title-red">CREATE ACCOUNT</h1>
            <input 
              type="text" 
              placeholder="Name" 
              className="input-red" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input 
              type="email" 
              placeholder="Email" 
              className="input-red" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="input-group">
                <input 
                  type={showPass ? "text" : "password"} 
                  placeholder="Password" 
                  className="input-red"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className="eye-icon" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeIcon /> : <EyeOffIcon />}
                </span>
            </div>
            <div className="input-group">
                <input 
                  type={showPass ? "text" : "password"} 
                  placeholder="Confirm Password" 
                  className="input-red"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
            </div>
            <button type="submit" className="btn-red">SIGN UP</button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleSignIn}>
            <h1 className="title-blue">SIGN IN</h1>
            <input 
              type="email" 
              placeholder="Email" 
              className="input-blue" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="input-group">
                <input 
                  type={showPass ? "text" : "password"} 
                  placeholder="Password" 
                  className="input-blue"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className="eye-icon" onClick={() => setShowPass(!showPass)}>
                   {showPass ? <EyeIcon /> : <EyeOffIcon />}
                </span>
            </div>
            <a href="#" className="forgot-link" onClick={handleForgotPassView}>Forgot Your Password?</a>
            <button type="submit" className="btn-blue">SIGN IN</button>
          </form>
        </div>

        {/* Forgot Password Form */}
        <div className="form-container forgot-container">
            <form onSubmit={handleForgotSubmit}>
                <h1 className="title-green">Forgot Your Password?</h1>
                <p className="forgot-text">No worries. We'll help you recover your account quickly.</p>
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="input-green" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn-green">ENTER</button>
                <button type="button" className="ghost-dark" onClick={goBackToLogin}>Back to Login</button>
            </form>
        </div>

        {/* Overlay Panels */}
        <div className="overlay-container">
          <div className="overlay">
            
            <div className="overlay-panel overlay-left">
              <div className="image-content lightning-img">
                <div className="overlay-text">
                      <h3>Welcome Back!</h3>
                      <p>Already have an account? Sign in to continue.</p>
                    <button className="ghost-btn blue" onClick={toggleForm}>SIGN IN</button>
                </div>
              </div>
            </div>

            <div className="overlay-panel overlay-right">
                {isForgotPass ? (
                    <div className="image-content forgot-img">
                         <div className="overlay-text">
                            <h3>Need Help Signing In?</h3>
                            <p>Reset your password and regain access in seconds.</p>
                        </div>
                    </div>
                ) : (
                  <div className="image-content robot-img">
                        <div className="overlay-text">
                              <h3>Hello, Friend!</h3>
                              <p>Don't have an account? Sign up and unlock amazing features.</p>
                            <button className="ghost-btn red" onClick={toggleForm}>SIGN UP</button>
                        </div>
                    </div>
                )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
