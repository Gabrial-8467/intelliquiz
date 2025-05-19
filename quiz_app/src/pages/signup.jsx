import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../style/signin.css';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';

const SignupPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  // ✅ Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/'); // or navigate('/dashboard') if that's your homepage
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      alert('Account created successfully! Please log in.');
      navigate('/signin');
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'An error occurred during signup.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <h1>🧠 IntelliQuiz</h1>
        <p>Join us and start your quiz journey today!</p>
        <img
          src="https://img.freepik.com/free-vector/sign-up-concept-illustration_114360-7865.jpg"
          alt="Signup Illustration"
        />
      </div>

      <div className="auth-right">
        <div className="form-box">
          <h2>Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <FaUser />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div className="input-box">
              <FaEnvelope />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="input-box">
              <FaLock />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="submit-btn">Create Account</button>
          </form>
          <p className="signup-link">
            Already have an account? <Link to="/signin">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
