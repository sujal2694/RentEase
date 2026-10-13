import React, { useContext, useEffect } from 'react'
import './LoginPage.css'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import toast from 'react-hot-toast';

const LoginPage = () => {
    const { currState, setCurrState, setLoginPopUp, url, setUserData, userData, setToken } = useContext(StoreContext);
    const isSignUp = currState === "sign up";

    const closeDialog = () => setLoginPopUp(false);

    useEffect(() => {
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setLoginPopUp(false);
        };
        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [setLoginPopUp]);

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setUserData(current => ({ ...current, [name]: value }));
    }

    const onLogin = async (event) => {
        event.preventDefault();
        const endpoint = isSignUp ? "/api/user/register" : "/api/user/login";

        try {
            const response = await axios.post(url + endpoint, userData);
            if (response.data.success) {
                setToken(response.data.token)
                localStorage.setItem("token", response.data.token);
                closeDialog();
                setUserData({ name: "", email: "", password: "" })
                toast.success(isSignUp ? "Registration successful" : "Login successful");
            } else {
                toast.error(response.data.message || "Unable to authenticate");
            }
        } catch (error) {
            console.error("Authentication request failed", error);
            toast.error(error.response?.data?.message || "Unable to authenticate. Please try again.");
        }
    }

    return (
        <div className="login-page" onMouseDown={event => { if (event.target === event.currentTarget) closeDialog(); }}>
            <section className="login-form" role="dialog" aria-modal="true" aria-labelledby="login-title">
                <div className="login-welcome">
                    <span className="login-brand-mark" aria-hidden="true">R</span>
                    <span>RentEase</span>
                    <p>A little more room to live.</p>
                    <div className="login-welcome-note">
                        <i className="bx bx-home-heart" aria-hidden="true"></i>
                        <span>Find your next home essentials, on your terms.</span>
                    </div>
                </div>

                <div className="login-content">
                    <button className="login-close" type="button" onClick={closeDialog} aria-label="Close account dialog">
                        <i className="bx bx-x" aria-hidden="true"></i>
                    </button>
                    <span className="login-eyebrow">{isSignUp ? "Get started" : "Welcome back"}</span>
                    <h2 id="login-title">{isSignUp ? "Create your account" : "Sign in to RentEase"}</h2>
                    <p className="login-intro">{isSignUp ? "Create an account to save your basket and manage your bookings." : "Sign in to continue to your rental basket and bookings."}</p>

                    <form onSubmit={onLogin}>
                        <div className="login-input-box">
                            {isSignUp && (
                                <div className="login-input">
                                    <label htmlFor="login-username">Your name</label>
                                    <input type="text" onChange={onChangeHandler} name="name" value={userData.name} placeholder="Alex Morgan" id="login-username" autoComplete="name" required />
                                </div>
                            )}
                            <div className="login-input">
                                <label htmlFor="login-email">Email address</label>
                                <input type="email" onChange={onChangeHandler} name="email" value={userData.email} placeholder="you@example.com" id="login-email" autoComplete="email" required />
                            </div>
                            <div className="login-input">
                                <label htmlFor="login-password">Password</label>
                                <input type="password" onChange={onChangeHandler} name="password" value={userData.password} placeholder="At least 8 characters" id="login-password" autoComplete={isSignUp ? "new-password" : "current-password"} required minLength="8" />
                            </div>
                        </div>
                        <button className="login-submit-btn" type="submit">{isSignUp ? "Create account" : "Sign in"} <span aria-hidden="true">→</span></button>
                    </form>

                    <p className="login-switch">
                        {isSignUp ? "Already have an account?" : "New to RentEase?"}
                        <button type="button" onClick={() => setCurrState(isSignUp ? "log in" : "sign up")}>{isSignUp ? "Sign in" : "Create an account"}</button>
                    </p>
                    <p className="login-terms">Your account helps you keep track of your rental basket and bookings.</p>
                </div>
            </section>
        </div>
    )
}

export default LoginPage
