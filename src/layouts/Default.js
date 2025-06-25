import React from "react";
import { Link } from "react-router-dom";
import AuthService from '../services/authService';

const DefaulLayout = ({ children }) => {
    return (
    <div className="wrapper">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <Link to="/home" className="navbar-brand">Code Clash</Link>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ml-auto">
                    <li className="nav-item"><Link to="/home" className="nav-link">Home</Link></li>
                    {AuthService.isAuthenticated() ? <li className="nav-item"><Link to="/admin/dashboard" className="nav-link">Admin</Link></li> : <li className="nav-item"><Link to="/login" className="nav-link">Login</Link></li>}                        
                    </ul>
                </div>
            </nav>
                <div className="content">
            {children}
          </div>
            <footer className="footer text-center text-white py-3" style={{ background: "#181c20" }}>
                <p>&copy; 2025 Code Clash. All Rights Reserved.</p>
            </footer>
      </div>
    );
  };

export default DefaulLayout;
