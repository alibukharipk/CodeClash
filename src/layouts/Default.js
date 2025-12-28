import React, { Component } from "react";
import { Link } from "react-router-dom";
import AuthService from '../services/authService';
import { ToastContainer } from "react-toastify";

class DefaultLayout extends Component {

  render() {
    const username = localStorage.getItem("username");
     const showLinks = window.location.href.includes("login");
    return (
      <>
       <ToastContainer position="top-right" autoClose={3000} />
      <nav class="navbar navbar-expand-lg navbar-light fixed-top navbar-custom">
        <div class="container">
            <a class="navbar-brand font-weight-bold" href="/">
                <span class="mr-2">📚</span>SkillsBeat
            </a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ml-auto mr-4">
                {!showLinks ? (
                    <li className="nav-item">
                        <a className="nav-link font-weight-medium" href="#home">
                        Home
                        </a>
                    </li>
                    ) : (
                    <li className="nav-item">
                        <Link className="nav-link font-weight-medium" to="/home">
                        Home
                        </Link>
                    </li>
                    )}                  
                {!showLinks && (
                    <>
                    <li class="nav-item">
                        <a class="nav-link font-weight-medium" href="#services">Services</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link font-weight-medium" href="#pricing">Pricing</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link font-weight-medium" href="#about">About</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link font-weight-medium" href="#contact">Contact</a>
                    </li>                    
                    </>
                )}
                  {AuthService.isAuthenticated() ? (
                    <li className="nav-item"><Link to="/admin/dashboard" className="nav-link">{username}</Link></li>
                  ) : (
                    <li className="nav-item"><Link to="/login" className="nav-link">Login</Link></li>
                  )}                    
                </ul>
            </div>
        </div>
    </nav>

          {this.props.children}


<footer class="footer-custom py-5">
        <div class="container">
            <div class="row mb-5">
                <div class="col-lg-4 col-md-12 mb-4">
                    <div class="d-flex align-items-center mb-3">
                        <span class="mr-2">📚</span>
                        <h4 class="font-weight-bold mb-0">SkillsBeat</h4>
                    </div>
                    <p class="text-light mb-4">
                        Empowering professionals worldwide with cutting-edge skills and knowledge. 
                        Join thousands of learners who have transformed their careers with SkillsBeat.
                    </p>
                    <div class="d-flex">
                        <a href="#" class="social-link">📘</a>
                        <a href="#" class="social-link">🐦</a>
                        <a href="#" class="social-link">💼</a>
                        <a href="#" class="social-link">📷</a>
                    </div>
                </div>
                
                <div class="col-lg-2 col-md-4 col-6 mb-4">
                    <h5 class="font-weight-bold mb-3">Courses</h5>
                    <ul class="list-unstyled">
                        <li class="mb-2"><a href="#" class="text-light">Programming</a></li>
                        <li class="mb-2"><a href="#" class="text-light">Digital Marketing</a></li>
                        <li class="mb-2"><a href="#" class="text-light">Data Science</a></li>
                        <li class="mb-2"><a href="#" class="text-light">Leadership</a></li>
                        <li class="mb-2"><a href="#" class="text-light">Certification Programs</a></li>
                    </ul>
                </div>
                
                <div class="col-lg-2 col-md-4 col-6 mb-4">
                    <h5 class="font-weight-bold mb-3">Resources</h5>
                    <ul class="list-unstyled">
                        <li class="mb-2"><a href="#" class="text-light">Blog</a></li>
                        <li class="mb-2"><a href="#" class="text-light">Career Guide</a></li>
                        <li class="mb-2"><a href="#" class="text-light">Success Stories</a></li>
                        <li class="mb-2"><a href="#" class="text-light">Free Resources</a></li>
                        <li class="mb-2"><a href="#" class="text-light">Help Center</a></li>
                    </ul>
                </div>
                
                <div class="col-lg-2 col-md-4 col-6 mb-4">
                    <h5 class="font-weight-bold mb-3">Company</h5>
                    <ul class="list-unstyled">
                        <li class="mb-2"><a href="#" class="text-light">About Us</a></li>
                        <li class="mb-2"><a href="#" class="text-light">Careers</a></li>
                        <li class="mb-2"><a href="#" class="text-light">Press</a></li>
                        <li class="mb-2"><a href="#" class="text-light">Partners</a></li>
                        <li class="mb-2"><a href="#" class="text-light">Contact</a></li>
                    </ul>
                </div>
            </div>
            
            <hr class="border-secondary"/>
            
            <div class="row pt-4 align-items-center">
                <div class="col-md-6">
                    <p class="text-light mb-md-0">&copy; 2025 SkillsBeat. All rights reserved.</p>
                </div>
                <div class="col-md-6 text-md-right">
                    <a href="#" class="text-light mr-3">Privacy</a>
                    <a href="#" class="text-light mr-3">Terms</a>
                    <a href="#" class="text-light">Cookies</a>
                </div>
            </div>
        </div>
    </footer>    
      </>
    );
  }
}

export default DefaultLayout;