import React from 'react';
import { Link } from "react-router-dom";
import InviteService from "../services/testInviteService";
import { withRouter } from "react-router-dom";
import RingLoader from "react-spinners/RingLoader";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import TestService from "../services/testService";
import { formatDuration } from "common.js"

class Test extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          otp: '',
          inviteDetail: null,
          data: null,
          loading: false,
          buttonText: 'START TEST',
          buttonClass: 'btn-success'
        };
      }

      componentDidMount() {    
        this.loadData();
      }

      loadData = async () => {
          this.setState({ loading: true }); 
          const inviteId = parseInt(this.props.match.params.id, 10);
          const testDetails = await InviteService.GetTestDetailsByInviteId(inviteId);
          if(testDetails.length === 0)
            this.props.history.push('/error');
          this.setState({ data: testDetails, loading: false});
      };      
    
      handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value.toUpperCase(), buttonClass: 'btn-success', buttonText: 'START TEST' });
      };
    
      handleSubmit = async  (e) => {
        e.preventDefault();
      
        const { data, otp } = this.state;
      
        this.setState({
          buttonText: 'Verifying...',
          buttonClass: 'btn-secondary'
        });

        const currentDateTime = new Date();
        const linkExpiryDateTime = new Date(data.invite.LinkExpiry);
        if (currentDateTime > linkExpiryDateTime)
          toast.error(`Error: Test link has expired!`);
        else
        {
          const verifyOTP = await TestService.verifyOTP({invite_id: data.invite.InviteId, otp});   

          setTimeout(() => {
            if (!verifyOTP.access) {
              toast.error(`Error: Invalid OTP!`);
              this.setState({
                buttonText: 'Invalid OTP',
                buttonClass: 'btn-danger'
              });
            } else {
              sessionStorage.setItem('verifiedOTPAccessToken', verifyOTP.access);
              this.setState({
                buttonText: 'Verified ✔️',
                buttonClass: 'btn-success'
              });
        
              setTimeout(() => {
                this.setState({
                  buttonText: 'Moving to the test...',
                  buttonClass: 'btn-outline-light' // neutral background
                });
        
                setTimeout(() => {
                  this.props.history.push(`/take-test/${data.invite.InviteId}`);
                }, 1000);
              }, 1000);
            }
          }, 1000);
        }
      };      
    
      render() {

        const { loading, data } = this.state;

        return (
          <div className="wrapper">
            <ToastContainer position="top-right" autoClose={3000} />
            {loading && (
              <div className="spinner-overlay">
                <RingLoader color="#3a86ff" size={100} />
              </div>           
            )}   
          <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <a class="navbar-brand font-weight-bold" href="/home">
                <span class="mr-2">📚</span>SkillsBeat
            </a>                
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
            </nav>
            
            <div className="container py-4" style={{ minHeight: '800px'}}>
              <div className="card border-0 shadow-lg">
                <div className="card-header" style={{ 
                  background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
                  borderBottom: 'none'
                }}>
                  <h2 className="text-center text-white mb-0 py-3" style={{ fontWeight: 500 }}>Assessment Instructions</h2>
                </div>                
                <div className="card-body px-4 py-4">
                  {data && (
                    (() => {
                      const { candidate, role, test, skills } = this.state.data;
                      if (!candidate || !role || !test || !skills) return null;
                      
                      const totalQuestions = skills.reduce((acc, skill) => acc + skill.questions.length, 0);
                      const testDurationFormatted = formatDuration(test.duration);

                      return (
                        <React.Fragment>
                        <div className="row">
                          {/* Left Side - Candidate Info */}
                          <div className="col-lg-5 pr-lg-4 border-right">
                            <div className="mb-4">
                              <h4 style={{ color: '#2d3748', fontWeight: 500 }}>Welcome, <span style={{ fontWeight: 600 }}>{candidate.name}</span></h4>
                              <p className="text-muted">Please review your assessment details</p>
                            </div>
                            
                            <div className="mb-4">
                              <div className="d-flex align-items-center mb-2">
                                <div className="icon-circle bg-blue-100 mr-3" style={{ width: '36px', height: '36px' }}>
                                  <i className="fas fa-briefcase text-blue-600" style={{ fontSize: '1rem' }}></i>
                                </div>
                                <div>
                                  <h5 className="mb-0" style={{ color: '#4a5568', fontWeight: 500 }}>Position</h5>
                                  <p className="h5 font-weight-bold" style={{ color: '#1a365d' }}>{role.title}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="row">
                              <div className="col-md-6 mb-3">
                                <div className="p-3 rounded-lg" style={{ backgroundColor: '#f7fafc', borderLeft: '4px solid #4299e1' }}>
                                  <div className="text-sm font-weight-medium text-gray-600">Test Duration</div>
                                  <div className="h5 font-weight-bold" style={{ color: '#2b6cb0' }}>{testDurationFormatted}</div>
                                </div>
                              </div>
                              <div className="col-md-6 mb-3">
                                <div className="p-3 rounded-lg" style={{ backgroundColor: '#f7fafc', borderLeft: '4px solid #4299e1' }}>
                                  <div className="text-sm font-weight-medium text-gray-600">Total Questions</div>
                                  <div className="h5 font-weight-bold" style={{ color: '#2b6cb0' }}>{totalQuestions}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <h5 className="mb-3" style={{ color: '#4a5568', fontWeight: 500 }}>Assessment Overview</h5>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="d-flex align-items-center mb-2">
                                  <div className="bg-blue-100 rounded-full p-1 mr-2">
                                    <i className="fas fa-check-circle text-blue-600" style={{ fontSize: '0.8rem' }}></i>
                                  </div>
                                  <span className="text-sm">Multiple Choice Questions</span>
                                </div>
                                <div className="d-flex align-items-center mb-2">
                                  <div className="bg-blue-100 rounded-full p-1 mr-2">
                                    <i className="fas fa-code text-blue-600" style={{ fontSize: '0.8rem' }}></i>
                                  </div>
                                  <span className="text-sm">Coding Challenges</span>
                                </div>
                                <div className="d-flex align-items-center">
                                  <div className="bg-blue-100 rounded-full p-1 mr-2">
                                    <i className="fas fa-project-diagram text-blue-600" style={{ fontSize: '0.8rem' }}></i>
                                  </div>
                                  <span className="text-sm">Scenario-based Problems</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Right Side - Instructions */}
                          <div className="col-lg-7 pl-lg-4">
                            <div className="mb-4">
                              <h4 className="mb-3" style={{ color: '#2d3748', fontWeight: 500 }}>
                                <i className="fas fa-info-circle text-blue-600 mr-2"></i>
                                Assessment Guidelines
                              </h4>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <ul className="list-unstyled mb-0">
                                  <li className="mb-2 d-flex">
                                    <i className="fas fa-chevron-right text-blue-500 mt-1 mr-2" style={{ fontSize: '0.7rem' }}></i>
                                    <span>Read all questions carefully before answering</span>
                                  </li>
                                  <li className="mb-2 d-flex">
                                    <i className="fas fa-chevron-right text-blue-500 mt-1 mr-2" style={{ fontSize: '0.7rem' }}></i>
                                    <span>Navigation between questions is sequential and cannot be reversed</span>
                                  </li>
                                  <li className="mb-2 d-flex">
                                    <i className="fas fa-chevron-right text-blue-500 mt-1 mr-2" style={{ fontSize: '0.7rem' }}></i>
                                    <span>The assessment will auto-submit when time expires</span>
                                  </li>
                                  <li className="mb-2 d-flex">
                                    <i className="fas fa-chevron-right text-blue-500 mt-1 mr-2" style={{ fontSize: '0.7rem' }}></i>
                                    <span>External resources are strictly prohibited</span>
                                  </li>
                                  <li className="d-flex">
                                    <i className="fas fa-chevron-right text-blue-500 mt-1 mr-2" style={{ fontSize: '0.7rem' }}></i>
                                    <span>Ensure stable internet connectivity throughout</span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <h4 className="mb-3" style={{ color: '#2d3748', fontWeight: 500 }}>
                                <i className="fas fa-layer-group text-blue-600 mr-2"></i>
                                Assessment Structure
                              </h4>
                              <div className="table-responsive">
                                <table className="table table-borderless" style={{ border: '1px solid #e2e8f0' }}>
                                  <thead style={{ backgroundColor: '#f7fafc' }}>
                                    <tr>
                                      <th style={{ color: 'white', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Section</th>
                                      <th style={{ color: 'white', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }} className="text-right">Questions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {skills.map((skill) => (
                                      <tr key={skill.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ color: '#2d3748' }}>{skill.name}</td>
                                        <td  style={{ color: '#4a5568' }}>{skill.questions.length}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-5 pt-4">
                          <div className="text-center">
                            <h4 className="mb-4" style={{ color: '#2d3748', fontWeight: 500 }}>Verification Required</h4>
                            <p className="text-muted mb-4">For security purposes, please enter the verification code sent to your registered email</p>
                            
                            <form onSubmit={this.handleSubmit} className="mx-auto" style={{ maxWidth: '400px' }}>
                              <div className="form-group mb-4">
                                <div className="otp-input-container mx-auto">
                                  <input 
                                    type="text" 
                                    className="form-control form-control-lg text-center font-weight-bold border-2" 
                                    id="otp" 
                                    name="otp"
                                    value={this.state.otp}
                                    onChange={this.handleInputChange}
                                    required 
                                    maxLength={6}
                                    placeholder="••••••"
                                    style={{
                                      letterSpacing: '8px',
                                      fontSize: '1.5rem',
                                      color: '#2d3748',
                                      borderColor: '#cbd5e0',
                                      borderRadius: '8px',
                                      height: '60px',
                                      textTransform: 'uppercase'
                                    }}
                                  />
                                  <small className="form-text text-gray-500 mt-2">Check your email for the 6-digit verification code</small>
                                </div>
                              </div>
                              <button
                                      type="submit"
                                      className={`btn btn-lg px-4 py-2 font-weight-bold ${this.state.buttonClass}`}
                                      disabled={this.state.buttonText !== 'START TEST' && this.state.buttonText !== 'Invalid OTP'}
                                      style={{
                                        color: this.state.buttonText === 'Moving to the test...' ? '#28a745' : ''
                                      }}
                                    >
                                      <i className="fas fa-play mr-2"></i>
                                      {this.state.buttonText}
                                    </button>
                            </form>
                          </div>
                        </div>                          
                        </React.Fragment>
                      );
                    })()
                  )}
                </div>
              </div>
            </div>
            
            <footer className="footer text-center text-white py-3" style={{ background: "#181c20" }}>
                <p>&copy; 2025 SkillsBeat. All Rights Reserved.</p>
            </footer>
          </div>
        );
      }
}

export default withRouter(Test);