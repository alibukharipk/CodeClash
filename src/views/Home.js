import React from "react";
import RingLoader from "react-spinners/RingLoader";
import EmailService from '../services/emailService';
import { toast } from "react-toastify";

class Home extends React.Component {
      constructor(props) {
            super(props);
            this.state = {
            name: "",
            email: "",
            subject: "",
            message: "",
            loading: false
            };
        }

        handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

      componentDidMount() {
    // Smooth scroll for navigation links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  }

  // Handle form submission
  handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, subject, message } = this.state;

    if(message && message.length < 10)
    {
      toast.error("Message length is too short!");
      return;
    }

    this.setState({ loading: true});

    await EmailService.SendEmail({name, email, subject, message});

     this.setState({ loading: false});
     toast.success("Email sent successfully, admin will contact you soon!");
     
  };

    render() {
         const { name, email, subject, message, loading, success, error } = this.state;
      return (
        <>
        <section id="home" class="hero-section">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6 col-md-12 mb-5 mb-lg-0">
                    <h1 class="hero-title mb-4">
                        Hire the Right Developer, Faster and Affordably.
                    </h1>
                    <p class="lead text-muted mb-4">
                        One platform for coding skills and problem-solving assessments. Designed by engineers, powered by AI.  
                    </p>
                    <div class="d-flex flex-column flex-md-row">
                        <a href="#services" class="btn btn-custom-primary btn-lg mb-3 mb-md-0 mr-md-3">
                            Services →
                        </a>
                        <a href="#pricing" class="btn btn-custom-secondary btn-lg">
                            Pricing
                        </a>
                    </div>
                </div>
                <div class="col-lg-6 col-md-12">
                    <img src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg" 
                         alt="Person learning on laptop" 
                         class="img-fluid rounded shadow-lg"/>
                </div>
            </div>
        </div>
    </section>
<section id="services" class="py-5 bg-white text-center">
        <div class="container">
            <div class="text-center mb-5">
                <h2 class=" font-weight-bold text-dark">The Smarter Way to Hire Technical Talent</h2>
                <p class="lead text-muted mx-auto" style={{maxWidth: '500px'}}>
                    Assess real-world skills with a dual-format platform designed for accuracy, speed, and fairness.
                </p>
            </div>
            <div class="row">
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card service-card border h-100 text-left">
                        <div class="card-body p-4">
                            <div class="service-icon mb-3">
                                <span style={{fontSize: '24px', color: '#2563eb'}}>💻</span>
                            </div>
                            <h4 class="card-title font-weight-bold">Dual Assessment Formats</h4>
                            <p class="card-text text-muted">Combine MCQs and coding challenges in a single test to evaluate both theoretical knowledge and practical skills.</p>
                        </div>
                    </div>
                </div>

                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card service-card border h-100 text-left">
                        <div class="card-body p-4">
                            <div class="service-icon mb-3">
                                <span style={{fontSize: '24px', color: '#2563eb'}}>🎯</span>
                            </div>
                            <h4 class="card-title font-weight-bold">AI-Assisted Question Creation</h4>
                            <p class="card-text text-muted">Build role-specific tests in minutes with AI-generated questions and tasks tailored to your requirements.</p>
                        </div>
                    </div>
                </div>

                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card service-card border h-100 text-left">
                        <div class="card-body p-4">
                            <div class="service-icon mb-3">
                                <span style={{fontSize: '24px', color: '#2563eb'}}>👥</span>
                            </div>
                            <h4 class="card-title font-weight-bold">Bias-Free, Objective Scoring</h4>
                            <p class="card-text text-muted">Automated grading and standardised scoring ensure fair evaluations across all candidates.</p>
                        </div>
                    </div>
                </div>

                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card service-card border h-100 text-left">
                        <div class="card-body p-4">
                            <div class="service-icon mb-3">
                                <span style={{fontSize: '24px', color: '#2563eb'}}>🏆</span>
                            </div>
                            <h4 class="card-title font-weight-bold">Skill Benchmarking
</h4>
                            <p class="card-text text-muted">Compare candidate results to industry standards for clear, data-driven hiring decisions.</p>
                        </div>
                    </div>
                </div>

                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card service-card border h-100 text-left">
                        <div class="card-body p-4">
                            <div class="service-icon mb-3">
                                <span style={{fontSize: '24px', color: '#2563eb'}}>📊</span>
                            </div>
                            <h4 class="card-title font-weight-bold">HR System Integration</h4>
                            <p class="card-text text-muted">Planned integrations with leading HR tools for smooth workflow management.</p>
                        </div>
                    </div>
                </div>

                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card service-card border h-100 text-left">
                        <div class="card-body p-4">
                            <div class="service-icon mb-3">
                                <span style={{fontSize: '24px', color: '#2563eb'}}>⚡</span>
                            </div>
                            <h4 class="card-title font-weight-bold">Custom Branding (coming soon)</h4>
                            <p class="card-text text-muted">Give candidates a seamless experience with your own logo, colors, and messaging.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <a href="#features" class="btn btn-custom-primary btn-lg">Features</a>
    </section>    
<section id="pricing" class="py-5" style={{backgroundColor: '#f9fafb'}}>
        <div class="container">
            <div class="text-center mb-5">
                <h2 class=" font-weight-bold text-dark">Choose Your Learning Path</h2>
                <p class="lead text-muted mx-auto" style={{maxWidth: '600px'}}>
                    Flexible pricing plans designed to fit your learning goals and budget. 
                    Start your journey with our free plan or accelerate your growth with premium features.
                </p>
            </div>
            <div class="row">
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card pricing-card h-100">
                        <div class="card-body text-center p-4">
                            <h4 class="card-title font-weight-bold mb-3">Basic</h4>
                            <p class="card-text text-muted mb-4">Perfect for getting started with essential skills</p>
                            <div class="mb-4">
                                <span class="h2 font-weight-bold">$</span>
                                <span class="price-display">0</span>
                                <span class="text-muted">/month</span>
                            </div>
                            <ul class="list-unstyled text-left mb-4">
                                <li class="mb-2"><span class="text-success font-weight-bold">✓</span> Access to 5 basic courses</li>
                                <li class="mb-2"><span class="text-success font-weight-bold">✓</span> Community forum access</li>
                                <li class="mb-2"><span class="text-success font-weight-bold">✓</span> Basic progress tracking</li>
                                <li class="mb-2"><span class="text-success font-weight-bold">✓</span> Mobile app access</li>
                                <li class="mb-2"><span class="text-success font-weight-bold">✓</span> Email support</li>
                            </ul>
                            <a href="#contact" class="btn btn-outline-primary btn-block">Get Started Free</a>
                        </div>
                    </div>
                </div>

                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card pricing-card featured h-100 position-relative">
                        <div class="pricing-badge">Most Popular</div>
                        <div class="card-body text-center p-4">
                            <h4 class="card-title font-weight-bold mb-3">Pro</h4>
                            <p class="card-text text-muted mb-4">Ideal for professionals seeking comprehensive learning</p>
                            <div class="mb-4">
                                <span class="h2 font-weight-bold">$</span>
                                <span class="price-display">29</span>
                                <span class="text-muted">/month</span>
                            </div>
                            <ul class="list-unstyled text-left mb-4">
                                <li class="mb-2"><span class="text-success font-weight-bold">✓</span> Access to all 200+ courses</li>
                                <li class="mb-2"><span class="text-success font-weight-bold">✓</span> Live expert sessions</li>
                                <li class="mb-2"><span class="text-success font-weight-bold">✓</span> Personalized learning paths</li>
                                <li class="mb-2"><span class="text-success font-weight-bold">✓</span> Project-based assessments</li>
                                <li class="mb-2"><span class="text-success font-weight-bold">✓</span> Certificate of completion</li>
                                <li class="mb-2"><span class="text-success font-weight-bold">✓</span> Priority support</li>
                                <li class="mb-2"><span class="text-success font-weight-bold">✓</span> Offline content access</li>
                            </ul>
                            <a href="#contact" class="btn btn-custom-primary btn-block">Start Pro Trial</a>
                        </div>
                    </div>
                </div>

                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card pricing-card h-100">
                        <div class="card-body text-center p-4">
                            <h4 class="card-title font-weight-bold mb-3">Enterprise</h4>
                            <p class="card-text text-muted mb-4">Comprehensive solution for teams and organizations</p>
                            <div class="mb-4">
                                <span class="h2 font-weight-bold">$</span>
                                <span class="price-display">99</span>
                                <span class="text-muted">/month</span>
                            </div>
                            <ul class="list-unstyled text-left mb-4">
                                <li class="mb-2"><span class="text-success font-weight-bold">✓</span> Everything in Pro</li>
                                <li class="mb-2"><span class="text-success font-weight-bold">✓</span> Team management dashboard</li>
                                <li class="mb-2"><span class="text-success font-weight-bold">✓</span> Custom learning tracks</li>
                                <li class="mb-2"><span class="text-success font-weight-bold">✓</span> Advanced analytics</li>
                                <li class="mb-2"><span class="text-success font-weight-bold">✓</span> Dedicated account manager</li>
                                <li class="mb-2"><span class="text-success font-weight-bold">✓</span> API access</li>
                                <li class="mb-2"><span class="text-success font-weight-bold">✓</span> White-label options</li>
                            </ul>
                            <a href="#contact" class="btn btn-outline-primary btn-block">Contact Sales</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>   
<section id="features">
            <div class="container">
                            <div class="text-center mb-5">
                <h2 class=" font-weight-bold text-dark">Code Clash outperforms other platforms</h2>
                <p class="lead text-muted mx-auto" style={{maxWidth: '600px'}}>
                   All the features and the speed you need, at the price you want.
                </p>
            </div>
            <div class="row">
<div class="table-responsive">
    <table class="table table-bordered">
      <thead>
        <tr>
          <th class="feature-col">Feature / Capability</th>
          <th class="brand-purple">Code Clash</th>
          <th class="brand-purple">HxxxxxxRank</th>
          <th class="brand-purple">Codxxxxx</th>
          <th class="brand-purple">TestGxxxxx</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="feature-col">Assessment Formats</td>
          <td>MCQs + Coding Tasks in One Test</td>
          <td>Mostly coding challenges, limited MCQs</td>
          <td>Coding + some MCQs</td>
          <td>MCQs + various non-coding tests</td>
        </tr>
        <tr>
          <td class="feature-col">Pre-Built Role-Based Tests</td>
          <td><i class="fas fa-check text-success"></i> Yes</td>
          <td><i class="fas fa-check text-success"></i> Yes</td>
          <td><i class="fas fa-check text-success"></i> Yes</td>
          <td><i class="fas fa-check text-success"></i> Yes</td>
        </tr>
        <tr>
          <td class="feature-col">Bias-Free Objective Scoring</td>
          <td><i class="fas fa-check text-success"></i> Automated scoring + standardized metrics</td>
          <td><i class="fas fa-check text-success"></i> Automated</td>
          <td><i class="fas fa-check text-success"></i> Automated</td>
          <td><i class="fas fa-check text-success"></i> Automated</td>
        </tr>
        <tr>
          <td class="feature-col">ATS Integrations</td>
          <td><i class="fas fa-check text-success"></i> Yes</td>
          <td><i class="fas fa-check text-success"></i> Yes</td>
          <td><i class="fas fa-check text-success"></i> Yes</td>
          <td><i class="fas fa-check text-success"></i> Yes</td>
        </tr>
        <tr>
          <td class="feature-col">Custom Branding</td>
          <td><i class="fas fa-check text-success"></i> Yes</td>
          <td><i class="fas fa-exclamation-triangle text-warning"></i> Limited</td>
          <td><i class="fas fa-times text-danger"></i> No</td>
          <td><i class="fas fa-check text-success"></i> Yes</td>
        </tr>
        <tr>
          <td class="feature-col">AI-Assisted Question Creation</td>
          <td><i class="fas fa-check text-success"></i> Yes, role-specific, tailored</td>
          <td><i class="fas fa-times text-danger"></i> No</td>
          <td><i class="fas fa-times text-danger"></i> No</td>
          <td><i class="fas fa-exclamation-triangle text-warning"></i> Limited AI suggestion</td>
        </tr>
        <tr>
          <td class="feature-col">Skill Benchmarking Against Industry Standards</td>
          <td><i class="fas fa-check text-success"></i> Yes</td>
          <td><i class="fas fa-times text-danger"></i> No</td>
          <td><i class="fas fa-times text-danger"></i> No</td>
          <td><i class="fas fa-times text-danger"></i> No</td>
        </tr>
        <tr>
          <td class="feature-col">Pricing Simplicity</td>
          <td><i class="fas fa-check text-success"></i> Simple 3-tier plans</td>
          <td><i class="fas fa-exclamation-triangle text-warning"></i> Complex per-candidate pricing</td>
          <td><i class="fas fa-times text-danger"></i> Custom quotes only</td>
          <td><i class="fas fa-exclamation-triangle text-warning"></i> Multiple plans, per-test pricing</td>
        </tr>
      </tbody>
    </table>
  </div>
            </div>
  </div>
    </section>       
<section id="about"  class="py-5">
            <div class="container">
                            <div class="text-center mb-5">
                <h2 class=" font-weight-bold text-dark">About Us</h2>
                <p class="lead text-muted mx-auto" style={{maxWidth: '600px'}}>
                   Powered by Allshore Talent
                </p>
                <img src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg" 
                         alt="Person learning on laptop" 
                         class="img-fluid rounded shadow-lg" width={600} height={600}/>
            </div>
  </div>
    </section>   
<section id="contact" class="py-5" style={{backgroundColor: '#f9fafb'}}>
        <div class="container">
            <div class="text-center mb-5">
                <h2 class=" font-weight-bold text-dark">Get in Touch</h2>
                <p class="lead text-muted mx-auto" style={{maxWidth: '600px'}}>
                    Ready to start your learning journey? We're here to help you choose the perfect path 
                    for your career goals.
                </p>
            </div>
            <div class="row">
                <div class="col-lg-4 col-md-12 mb-4">
                    <div class="card h-100">
                        <div class="card-body p-4">
                            <h4 class="card-title font-weight-bold mb-4">Contact Information</h4>
                            
                            <div class="d-flex align-items-start mb-4">
                                <div class="contact-icon">
                                    <span style={{color: '#2563eb;'}}>✉️</span>
                                </div>
                                <div>
                                    <h6 class="font-weight-bold mb-1">Email Us</h6>
                                    <p class="mb-1">admin@skillsbeat.com</p>
                                    <small class="text-muted">We respond within 24 hours</small>
                                </div>
                            </div>
                            
                            <div class="d-flex align-items-start mb-4">
                                <div class="contact-icon">
                                    <span style={{color: '#2563eb;'}}>📞</span>
                                </div>
                                <div>
                                    <h6 class="font-weight-bold mb-1">Call Us</h6>
                                    <p class="mb-1">+1 (555) 123-4567</p>
                                    <small class="text-muted">Mon-Fri, 9am-6pm EST</small>
                                </div>
                            </div>
                            
                            <div class="d-flex align-items-start">
                                <div class="contact-icon">
                                    <span style={{color: '#2563eb;'}}>📍</span>
                                </div>
                                <div>
                                    <h6 class="font-weight-bold mb-1">Visit Us</h6>
                                    <p class="mb-1">123 Innovation Drive</p>
                                    <small class="text-muted">San Francisco, CA 94105</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        {loading && (
          <div className="spinner-overlay">
            <RingLoader color="#36D7B7" size={100} />
          </div>           
        )}                  
<div className="col-lg-8 col-md-12">
        <div className="card">
          <div className="card-body p-4">
            <h4 className="card-title font-weight-bold mb-4">Send us a Message</h4>

            <form onSubmit={this.handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="font-weight-medium">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={name}
                      onChange={this.handleChange}
                      maxLength={100}
                      required
                      placeholder="Your full name"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="font-weight-medium">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={email}
                      onChange={this.handleChange}
                      required
                      maxLength={100}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="font-weight-medium">Subject</label>
                <select
                  className="form-control"
                  name="subject"
                  value={subject}
                  onChange={this.handleChange}
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="courses">Course Information</option>
                  <option value="pricing">Pricing Plans</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>

              <div className="form-group">
                <label className="font-weight-medium">Message</label>
                <textarea
                  className="form-control"
                  name="message"
                  rows="5"
                  value={message}
                  onChange={this.handleChange}
                  maxLength={1000}
                  minLength={10}
                  required
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                className="btn btn-custom-primary btn-lg btn-block"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"} <span className="ml-2">📤</span>
              </button>

              {success && <p className="text-success mt-3">{success}</p>}
              {error && <p className="text-danger mt-3">{error}</p>}
            </form>
          </div>
        </div>
      </div>
            </div>
        </div>
    </section>   
        </>
      );
    }
  }
  
  export default Home;