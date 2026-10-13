import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'
import { assets } from '../../assets/assets'
import './Navbar.css'

const Navbar = () => {
    const {
        setLoginPopUp,
        setCurrState,
        token,
        setToken,
        setSearchBar,
        adminURL,
        cartCount,
        clearRentalBasket,
    } = useContext(StoreContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const navMenuRef = useRef(null);
    const menuTriggerRef = useRef(null);
    const wasMenuOpen = useRef(false);
    const location = useLocation();
    const navigate = useNavigate();

    const closeMenus = () => {
        setMenuOpen(false);
        setAccountOpen(false);
    };

    useEffect(() => {
        if (!menuOpen) {
            if (wasMenuOpen.current) menuTriggerRef.current?.focus();
            wasMenuOpen.current = false;
            return undefined;
        }
        wasMenuOpen.current = true;
        navMenuRef.current?.querySelector('a[href], button:not([disabled])')?.focus();
        const onKeyDown = event => {
            if (event.key === "Escape") {
                setMenuOpen(false);
                return;
            }
            if (event.key !== "Tab" || !navMenuRef.current) return;
            const focusable = [...navMenuRef.current.querySelectorAll('a[href], button:not([disabled])')];
            if (!focusable.length) return;
            if (event.shiftKey && document.activeElement === focusable[0]) {
                event.preventDefault();
                focusable[focusable.length - 1].focus();
            } else if (!event.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
                event.preventDefault();
                focusable[0].focus();
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [menuOpen]);

    const logout = () => {
        localStorage.removeItem("token");
        setToken("");
        clearRentalBasket();
        closeMenus();
        navigate("/");
    };

    const navLinks = [
        { label: "Home", to: "/" },
        { label: "Rentals", to: "/products" },
        { label: "About", to: "/about" },
        { label: "Contact", to: "/contact" },
    ];

    return (
        <header className="navbar">
            <nav className="nav" aria-label="Main navigation">
                <button
                    ref={menuTriggerRef}
                    className="menu-toggle"
                    type="button"
                    aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={menuOpen}
                    aria-controls="storefront-navigation-menu"
                    onClick={() => setMenuOpen(open => !open)}
                >
                    <i className={menuOpen ? "bx bx-x" : "bx bx-menu"} aria-hidden="true"></i>
                </button>

                <Link className="brand" to="/" onClick={closeMenus} aria-label="RentEase home">
                    <span className="brand-mark" aria-hidden="true">R</span>
                    <span className="brand-copy">
                        <strong>RentEase</strong>
                        <small>Furniture & appliance rentals</small>
                    </span>
                </Link>

                <button
                    className={`nav-scrim${menuOpen ? " is-open" : ""}`}
                    type="button"
                    aria-label="Close navigation menu"
                    onClick={closeMenus}
                    tabIndex={menuOpen ? 0 : -1}
                />
                <div ref={navMenuRef} id="storefront-navigation-menu" className={`nav-links${menuOpen ? " is-open" : ""}`}>
                    <div className="mobile-nav-heading">
                        <span>Explore RentEase</span>
                        <button type="button" onClick={closeMenus} aria-label="Close navigation menu">
                            <i className="bx bx-x" aria-hidden="true"></i>
                        </button>
                    </div>
                    {navLinks.map(({ label, to }) => {
                        const active = to === "/"
                            ? location.pathname === "/"
                            : location.pathname === to || location.pathname.startsWith(`${to}/`);
                        return (
                            <Link
                                key={to}
                                to={to}
                                className={`nav-link${active ? " is-active" : ""}`}
                                aria-current={active ? "page" : undefined}
                                onClick={closeMenus}
                            >
                                {label}
                            </Link>
                        );
                    })}
                    <button className="nav-link mobile-search-link" type="button" onClick={() => { setSearchBar(true); closeMenus(); }}>Search rentals</button>
                    {token && (
                        <Link className="mobile-account-link" to="/myorders" onClick={closeMenus}>
                            My rentals
                        </Link>
                    )}
                </div>

                <div className="nav-actions">
                    <a className="admin-link" href={adminURL} target="_blank" rel="noopener noreferrer">Admin</a>
                    <button
                        className="nav-icon-button search-button"
                        type="button"
                        aria-label="Search rentals"
                        onClick={() => { setSearchBar(true); closeMenus(); }}
                    >
                        <img src={assets.search_icon} alt="" />
                    </button>
                    <button
                        className="nav-icon-button cart-button"
                        type="button"
                        aria-label={`Rental basket${cartCount > 0 ? `, ${cartCount} items` : ""}`}
                        onClick={() => { closeMenus(); navigate('/cart'); }}
                    >
                        <img src={assets.cart_icon} alt="" />
                        {cartCount > 0 && <span className="cart-count">{cartCount > 99 ? "99+" : cartCount}</span>}
                    </button>
                    {token ? (
                        <div className="account-menu">
                            <button
                                className={`account-button${accountOpen ? " is-open" : ""}`}
                                type="button"
                                aria-label="Account menu"
                                aria-expanded={accountOpen}
                                onClick={() => setAccountOpen(open => !open)}
                            >
                                <img src={assets.profile_icon} alt="" />
                                <span>Account</span>
                                <i className="bx bx-chevron-down" aria-hidden="true"></i>
                            </button>
                            {accountOpen && (
                                <div className="account-dropdown">
                                    <Link to="/myorders" onClick={closeMenus}>My rentals</Link>
                                    <button type="button" onClick={logout}>Sign out</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button className="sign-in-button" type="button" onClick={() => { closeMenus(); setCurrState("log in"); setLoginPopUp(true); }}>
                            Sign in
                        </button>
                    )}
                </div>
            </nav>
        </header>
    )
}

export default Navbar
