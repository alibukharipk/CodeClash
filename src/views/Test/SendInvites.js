import React, { Component } from "react";
import Papa from "papaparse";
import { Button, Modal, Form, Badge, Container } from "react-bootstrap";
import { FaUpload } from "react-icons/fa";
import TestService from "services/testService";
import InviteService from "services/testInviteService";
import { withRouter } from "react-router-dom";
import RingLoader from "react-spinners/RingLoader";
import { connect } from "react-redux";
import { toast } from "react-toastify";

const mapStateToProps = (state) => ({
  userId: state.auth.userId
});

class SendInvites extends Component {
  constructor(props) {
  super(props);
    this.state = {
      toEmails: [],
      subject: "",
      testHeading: "",
      description: "",
      showModal: false,
      emailInput: "",
      emailMessage: "",
      loading: false,
      duration: null
    };
 }

  handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (result) => {
        const newEmails = result.data
          .map((row) => row[0])
          .filter((email) => email.includes("@"));
        
        this.setState((prevState) => {
          const existingEmails = new Set(prevState.toEmails);
          const uniqueEmails = newEmails.filter((email) => !existingEmails.has(email));

          return {
            toEmails: [...prevState.toEmails, ...uniqueEmails],
            showModal: false,
          };
        });
      },
    });
  };

  handleEmailChange = (event) => {
    this.setState({ emailInput: event.target.value });
  };

  addEmail = (e) => {
    if (['Enter', ' ', ',', ';'].includes(e.key)) {
      e.preventDefault();
      const { emailInput, toEmails } = this.state;
      const trimmedEmail = emailInput.trim();
  
      // Email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
      if (!trimmedEmail) return; // Ignore empty input
      if (!emailRegex.test(trimmedEmail)) {
        alert("Invalid email format! Please enter a valid email.");
        return;
      }
      if (toEmails.includes(trimmedEmail)) {
        alert("This email is already added.");
        return;
      }
  
      this.setState((prevState) => ({
        toEmails: [...prevState.toEmails, trimmedEmail],
        emailInput: ""
      }));
    }
  };

  sendInvite = async () => {
    const { toEmails } = this.state;
    if (toEmails.length === 0)
    {
      toast.error(`Email address is required!`);
      return;
    }       

    const testId = parseInt(this.props.match.params.id, 10);
    const currentDate = new Date();
    const expiryDate = new Date(currentDate);
    expiryDate.setDate(currentDate.getDate() + 5);    
    const currentDateTime = currentDate.toISOString();
    const expiryDateTime = expiryDate.toISOString();

    const candidates = toEmails.map(email => ({ name: email, email }));
    this.setState({ loading: true }); 
    await InviteService.sendInvites({test_id: testId, invited_by: this.props.userId, invitedOn: currentDateTime, 
      LinkExpiry: expiryDateTime, TimeLine: "Invite Sent", candidates, InviteStatus: 'Invited' });

    this.setState({ loading: false, emailInput: "", toEmails: [] }); 
  
  };    

  handleCloseModal = () => {
    this.setState({ showModal: false, editingSkill: null });
  };

  removeEmail = (index) => {
    this.setState((prevState) => ({
      toEmails: prevState.toEmails.filter((_, i) => i !== index),
    }));
  };

  componentDidMount() {    
    this.loadData();
  }

  loadData = async () => {
      this.setState({ loading: true }); 
      const testId = parseInt(this.props.match.params.id, 10);
      const test = await TestService.getTest(testId);
      this.setState({subject: test.test_name + " invitation",
        testHeading: test.test_name,
        description: `You have been invited to attend the challenge ${test.test_name}. We wish you all the best!`,
        duration: test.duration
      });
      this.setState({ loading: false }); 
  };


  render() {
    const { loading } = this.state;
    return (
      <Container fluid>
        {loading && (
          <div className="spinner-overlay">
            <RingLoader color="#36D7B7" size={100} />
          </div>           
        )}            
        <div className="card p-4">
        <div className="form-group">
          <label>To:</label>
          <div className="d-flex align-items-center justify-content-between border p-2 rounded" style={{ minHeight: "40px" }}>
            <div className="d-flex flex-wrap align-items-center" style={{ flex: 1 }}>
              {this.state.toEmails.map((email, index) => (
                <Badge pill variant="light" key={index} className="badge-warning text-secondary mr-1 mb-1 py-1 px-2 email-bage">
                  {email}{" "}
                  <span style={{ color: "red", marginLeft: "5px", cursor: "pointer" }} onClick={() => this.removeEmail(index)}>
                    ×
                  </span>
                </Badge>
              ))}
              <input
                type="text"
                className="form-control border-0 p-0"
                style={{ outline: "none", boxShadow: "none", flex: "1" }}
                placeholder="Enter email and press Enter, Space, semicolon or comma"
                value={this.state.emailInput}
                onChange={this.handleEmailChange}
                onKeyDown={this.addEmail}
              />
            </div>
            <FaUpload size={24} style={{ cursor: "pointer", marginLeft: "10px" }} onClick={() => this.setState({ showModal: true })} />
          </div>
        </div>
          <div className="form-group">
            <label>Subject:</label>
            <input type="text" className="form-control mb-3" value={this.state.subject} maxLength={200} />
          </div>          

          <div className="border p-4 rounded" style={{ background: "#f9f9f9" }}>
            <h3 className="text-center">{this.state.testHeading}</h3>
            <p className="text-center text-muted">Powered by CodeClash</p>            
            <p><textarea id="w3review" name="description"  className="form-control mb-3" rows="4" cols="50" value={this.state.description}></textarea></p>
            <p className="text-center"><strong>Duration:</strong> {this.state.duration}</p>
            <div className="text-center">
              <Button variant="success" className="px-4 py-2">Start Test</Button>
            </div>
            <p className="text-center mt-3">
              You can also use this <a href="#">test link</a> to access the test at any time.
            </p>
          </div>

          <div className="text-muted text-center mt-3">

            For any technical queries, please refer to <a href="#">FAQ</a> or contact <a href="#">support</a>. For other inquiries, reply to this email.
          </div>

          <div className="d-flex justify-content-end mt-3">
            <Button variant="success" onClick={this.sendInvite}>
              Send {this.state.toEmails.length} Invite(s)
            </Button>
          </div>
        </div>

             {this.state.showModal && (
                  <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">
                          Upload CSV
                          </h5>
                        </div>
                          <div className="modal-body">
                          <p>Upload a CSV file with candidate emails and names.</p>
                          <p>Sample format:</p>
                          <table className="table table-bordered table-striped" style={{fontSize: "0.85rem"}}>
                            <thead className="thead-dark">
                              <tr>
                                <th>Email</th>
                                <th>Name</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>john@example.com</td>
                                <td>John Doe</td>
                              </tr>
                              <tr>
                                <td>jane@example.com</td>
                                <td>Jane Smith</td>
                              </tr>
                            </tbody>
                          </table>
                          </div>
                          <div className="modal-footer">
                            <Button variant="secondary" onClick={() => this.setState({ showModal: false })}>Close</Button>
                            <input type="file" id="csvUpload" style={{ display: "none" }} onChange={this.handleCSVUpload} />
                            <Button variant="primary" onClick={() => document.getElementById("csvUpload").click()}>
                              Upload CSV
                            </Button>
                          </div>
                      </div>
                    </div>
                  </div>
                )}
      </Container>
    );
  }
}

export default connect(mapStateToProps)(withRouter(SendInvites));
