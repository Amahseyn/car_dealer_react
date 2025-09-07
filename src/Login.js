import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './forms.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const phone_number = e.target.phone_number.value;
        const password = e.target.password.value;

        try {
            await login(phone_number, password);
            navigate('/'); // Redirect to home page after login
        } catch (error) {
            alert('شماره تلفن یا رمز عبور اشتباه است.');
        }
    };

    return (
        <div className="form-container">
            <h2>ورود به سامانه</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="phone_number" placeholder="شماره تلفن" required />
                <input type="password" name="password" placeholder="رمز عبور" required />
                <button type="submit" className="form-button">ورود</button>
            </form>
        </div>
    );
};

export default Login;