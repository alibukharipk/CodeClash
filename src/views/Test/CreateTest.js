import React, { Component } from "react";
import { Container } from "react-bootstrap";
import { connect } from "react-redux";
import TestService from "services/testService"

const mapStateToProps = (state) => ({
  roles: state.roles.roles,
  userId: state.auth.userId
});

class CreateTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: "",  
      selectedRole: null,
    };
  }

  handleSearchChange = (event) => {
    this.setState({ searchTerm: event.target.value });
  };

  filterRoles = () => {
    const { searchTerm } = this.state;
    const { roles } = this.props;
    return roles.filter((role) =>
      role.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  selectRole = (role) => {
    this.setState({ selectedRole: role });
  };

  handleCreateTest = async () => {
    const { selectedRole } = this.state;
    const test = await TestService.addTest({role: selectedRole.id, test_name: selectedRole.title, description: selectedRole.description, created_by: this.props.userId, duration: selectedRole.time_duration});
    this.props.history.push(`/admin/tests/${test.id}`);
  }

  render() {
    const filteredRoles = this.filterRoles();
    const { selectedRole } = this.state;
    const { roles } = this.props;
    const requiredSkills = selectedRole ? selectedRole.skills
    .filter(skill => skill.is_required)
    .map(skill => ({
      name: skill.skill.name,
      level: skill.skill.level
    })) : [];
    const optionalSkills = selectedRole ? selectedRole.skills
    .filter(skill => !skill.is_required)
    .map(skill => ({
      name: skill.skill.name,
      level: skill.skill.level
    })) : [];
    
    return (
      <Container fluid>
        <div className="row">
          <div className="col-md-8">
            <h4>Select Role</h4>
            <input
              type="text"
              className="form-control my-3"
              placeholder="Search for roles..."
              value={this.state.searchTerm}
              onChange={this.handleSearchChange}
            />
            <div>
            Roles ({ roles.length })
            </div>
            <div className="list-group" style={{ maxHeight: "600px", overflowY: "auto" }}>
              {filteredRoles.map((role) => (
                <div 
                  key={role.id} 
                  className="list-group-item list-group-item-action"
                  onClick={() => this.selectRole(role)}
                  style={{ cursor: "pointer", backgroundColor: selectedRole && selectedRole.id === role.id ? 'lightgray' : '' }}
                >
                  <h5 className="mb-1"><b>{role.title}</b></h5>
                  <p className="mb-0 text-muted">
                    {role.skills.filter(s => s.is_required === true).map(skill => skill.skill.name + "(" + skill.skill.level + ")").join(", ")}
                    {role.skills.filter(s => s.is_required === false).length > 0 ? "," + role.skills.filter(s => s.is_required === false).map(skill => skill.skill.name + "(" + skill.skill.level + ")").join(", ") : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>          
          {/* Preview Section */}
          <div className="col-md-4">
              <div className="card p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4>Test Preview</h4>
                  {selectedRole && (
                    <button className="btn btn-primary" onClick={this.handleCreateTest}>
                    Create Test
                  </button>
                  )}
                </div>
                {selectedRole ? (
                  <React.Fragment>
                    <b class="mb-3">{selectedRole ? selectedRole.title  : ""}</b>
                    <h6 class="font-weight-bold">Core skills <i class="fas fa-info-circle"></i></h6>                    
                    {requiredSkills.map(skill => (
                      <div className="mb-2">
                        <span key={skill.id} className="badge badge-warning text-secondary mr-1 mb-1 py-1 px-2">
                          <i className="fas fa-code-branch mr-1"></i>
                          {skill.name} ({skill.level})
                        </span>
                      </div>
                  ))}
                      <h6 className="font-weight-bold mt-3">Optional skills <i className="fas fa-info-circle"></i></h6>
                      {optionalSkills.map(skill => (
                        <div key={skill.id} className="mb-2">
                          <span className="badge badge-secondary text-light mr-1 mb-1 py-1 px-2">
                            <i className="fas fa-lightbulb mr-1"></i>
                            {skill.name} ({skill.level})
                          </span>
                        </div>
                      ))}
                  </React.Fragment>                  
                ) : (
                  <React.Fragment>
                    <b>Select or search for a role to preview the test</b>
                  </React.Fragment> 
                )}                                
              </div>
          </div>
        </div>
      </Container>
    );
  }
}

export default connect(mapStateToProps)(CreateTest);