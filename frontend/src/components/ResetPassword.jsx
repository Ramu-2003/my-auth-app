import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuthPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) return alert("Passwords do not match");

        try {
            await axios.post(`${API_URL}/reset-password/${token}`, { password });
            alert("Password updated successfully!");
            navigate('/');
        } catch (err) {
            alert(err.response.data.message);
        }
    };

    return (
        <div className="auth-body forgot-bg">
            <div className="container" id="container" style={{ width: '900px', minHeight: '500px' }}>
                <div className="form-container" style={{ width: '50%', position: 'relative', opacity: 1 }}>
                    <form onSubmit={handleSubmit}>
                        <h1 className="title-blue" style={{ color: '#2c3e50', fontSize: '2.5rem' }}>CONFIRM PASS</h1>
                        <div className="input-group">
                            <input 
                                type={showPass ? "text" : "password"} 
                                placeholder="Password" 
                                className="input-blue"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input 
                                type={showPass ? "text" : "password"} 
                                placeholder="Confirm Password" 
                                className="input-blue"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-blue" style={{ backgroundColor: '#3d5a5a', borderRadius: '20px' }}>
                            SUBMIT
                        </button>
                    </form>
                </div>
                <div className="overlay-container" style={{ left: '50%', width: '50%' }}>
                    <div className="image-content forgot-img" style={{ backgroundImage: "url('/assets/GRIM-REAPER.png')" }}>
                        {/* This corresponds to your Grim Reaper image */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
