import React, { Component } from "react";
import {
  Container,
  Form
} from "react-bootstrap";
import { connect } from "react-redux";
import TestService from "services/testService";
import RingLoader from "react-spinners/RingLoader";
import { withRouter } from "react-router-dom";

const mapStateToProps = (state) => ({
  roles: state.roles.roles,
  userId: state.auth.userId
});

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      testName: "",
      description: "",
      jobDescriptionLink: "",
      role: "",
      workExperience: "",
      duration: "",
      loading: false
    };
  }

    componentDidMount() {    
      this.LoadData();
    }
  
    LoadData = async () => {
        this.setState({ loading: true }); 
        const testId = parseInt(this.props.match.params.id, 10);
        const test = await TestService.getTest(testId);
        this.setState({
          testId: test.id,
          testName: test.test_name || "",
          jobDescriptionLink: test.job_description_link || "",
          role: test.role || "",
          workExperience: test.work_experience || "",
          duration: test.duration || "",
          description: test.description
        });
        this.setState({ loading: false }); 
    };

  handleChange = (event) => {
    const {value, name} = event.target;
    if ((name === "duration") && value < 0)
    return;

    this.setState({ [name]: value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    const { testName,description, jobDescriptionLink, workExperience,role, duration } = this.state;
    const testId = parseInt(this.props.match.params.id, 10);
    const requestData = {
      id: testId,
      test_name: testName,
      description,
      job_description_link: jobDescriptionLink,
      work_experience: workExperience,
      role,
      duration,
      description,
      created_by: this.props.userId
    };
    
    this.setState({ loading: true }); 
    await TestService.updateTest(requestData);
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
        <form onSubmit={this.handleSubmit}>
          <div className="row form-group">
            <div className="col-md-5">
              <label>Test Name <span className="text-danger">*</span></label>
                <input
                type="text"
                className="form-control"
                name="testName"
                value={this.state.testName}
                onChange={this.handleChange}
                required
                />
            </div>
          </div>
          <div className="row from-group">
            <div className="col-md-5">
              <label>Description</label>
              <textarea
                    name="description"
                    className="form-control"
                    placeholder="Description"
                    rows="4"
                    cols="50"
                    value={this.state.description}
                    onChange={this.handleChange}
                    required
                  ></textarea>              
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-5">
              <label>Job Description Link</label>
                <input
                type="text"
                className="form-control"
                name="jobDescriptionLink"
                value={this.state.jobDescriptionLink}
                onChange={this.handleChange}
                />
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-5">
              <label>Role</label>
              <Form.Control
                as="select"
                name="role"
                value={this.state.role}
                onChange={this.handleChange}
                required
              >
                <option value="">Select Role</option>
                {this.props.roles.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </Form.Control>
            </div>
          </div>
          <div className="row form-group">
          <div className="col-md-3">
              <label>Work Experience</label>
              <Form.Control
                  as="select"
                  name="workExperience"
                  value={this.state.workExperience}
                  onChange={this.handleChange}
                  required
                >
                <option value="">Select Experience Level</option>
                <option value="intern">Intern</option>
                <option value="new_graduate">New Graduate</option>
                <option value="0-2_years">0-2 years</option>
                <option value="2-5_years">2-5 years</option>
                <option value="5_plus">5+ years</option>
                <option value="all_levels">All Experience Levels</option>
                </Form.Control>              
            </div>
            <div className="col-md-1">
              <label>Duration</label>
              <input
                type="number"
                className="form-control"
                name="duration"
                value={this.state.duration}
                onChange={this.handleChange}
                onKeyDown={(e) => {
                  if (["e", "E", ".", "-"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}                
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Save</button>
        </form>
      </Container>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Settings));