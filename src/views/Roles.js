import React, { Component } from "react";
import {
  Container,
  Form
} from "react-bootstrap";
import Select from 'react-select';
import { connect } from "react-redux";
import RoleService from '../services/roleService';
import RoleSkillService from '../services/roleSkillService';
import DeleteConfirm from '../components/Dialogs/DeleteConfirm';
import RingLoader from "react-spinners/RingLoader";

const mapStateToProps = (state) => ({
  skills: state.skills.skills,
  roles: state.roles.roles,
});

class Roles extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: "",
      sortColumn: "",
      sortDirection: "asc",
      currentPage: 1,
      itemsPerPage: 10,
      showModal: false,
      editingRole: null,
      deleteId: null,
      loading: false,
      formData: { title: "", description: "", requiredSkills: [], optionalSkills: [], time_duration: "" },
    };
  }

  handleSearch = (event) => {
    this.setState({ searchQuery: event.target.value, currentPage: 1 });
  };

  handleSort = (column) => {
    const { sortColumn, sortDirection } = this.state;
    const newDirection = sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    this.setState({ sortColumn: column, sortDirection: newDirection });
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleDelete = async () => {
    const { deleteId } = this.state;
    this.setState({ loading: true }); 
    await RoleService.deleteRole(deleteId);
    this.setState({ loading: false }); 
  };

  handleShowModal = (role = null) => {

    const { skills } = this.props;
    const roleSkills = role ? role.skills.reduce((acc, skillObj) => {
      acc[skillObj.skill.id] = skillObj.is_required;
      return acc;
    }, {}) : [];

    const matchedSkills = skills
    .filter(skill => roleSkills.hasOwnProperty(skill.id))
    .map(skill => ({
        ...skill,
        is_required: roleSkills[skill.id]
    }));  

    this.setState({
      showModal: true,
      editingRole: role,
      formData: role
        ? {
            title: role.title,
            description: role.description,
            time_duration: role.time_duration,
            requiredSkills: matchedSkills.filter((s) => s.is_required).map(skill => ({
              value: skill.id,
              label: skill.name
          })),
            optionalSkills: matchedSkills.filter((s) => !s.is_required).map(skill => ({
              value: skill.id,
              label: skill.name            
          })),
          }
        : { title: "", description: "", time_duration: "", requiredSkills: [], optionalSkills: [] },
    });

  };
  handleCloseModal = () => {
    this.setState({ showModal: false, editingRole: null });
  };

  handleChange = (event) => {
    const {value, name} = event.target;
    if ((name === "time_duration") && value < 0)
      return;
    
    this.setState({ formData: { ...this.state.formData, [name]: value } });
  };

  handleSkillChange = (selectedOptions, isRequired) => {
    this.setState((prevState) => ({
      formData: {
        ...prevState.formData,
        requiredSkills: isRequired ? selectedOptions || [] : prevState.formData.requiredSkills,
        optionalSkills: !isRequired ? selectedOptions || [] : prevState.formData.optionalSkills,
      },
    }));
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    const { editingRole, formData } = this.state;
    
    this.setState({ loading: true }); 
    const roleSkills = [...formData.requiredSkills.map(skill => ({
      skill: skill.value,
      is_required: true
    })), ...formData.optionalSkills.map(skill => ({
      skill: skill.value,
      is_required: false
    }))];

    if (editingRole) {
      await RoleService.updateRole(editingRole.id, formData);
      await RoleSkillService.updateRoleSkill(editingRole.id, {skills: roleSkills});
    } else {
      const role = await RoleService.addRole(formData);
      const roleId = role.id;

      await RoleSkillService.addRoleSkill({role: roleId,skills: roleSkills});
      }

      this.setState({ showModal: false, editingSkill: null, loading: false });
  };

  getFilteredAndSortedroles = () => {
    const { searchQuery, sortColumn, sortDirection } = this.state;
    const { roles } = this.props;
    let filtered = roles.filter((role) =>
        role.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1;
      if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  getRoleSkills = (role, isrequired) => {
    const {skills} = this.props;
    return role.skills.filter(s => s.is_required === isrequired)
      .map((s) => {
        const skillObj = skills.find((skill) => skill.id === s.skill.id);
        return skillObj.name;
      })
      .join(", ");
  };

  render() {
    const { searchQuery, sortColumn, sortDirection, currentPage, itemsPerPage, showModal, formData, loading } = this.state;
    const { skills } = this.props;
    const roles = this.getFilteredAndSortedroles();
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRoles = roles.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(roles.length / itemsPerPage);
    const selectedRequiredSkillIds = formData.requiredSkills.map((s) => s.value);
    const selectedOptionalSkillIds = formData.optionalSkills.map((s) => s.value);

    return (
      <Container fluid>
        {loading && (
          <div className="spinner-overlay">
            <RingLoader color="#36D7B7" size={100} />
          </div>           
        )} 
        <div className="d-flex justify-content-between mb-3">
          <button className="btn btn-primary" onClick={() => this.handleShowModal()}>Add New</button>
        </div>
        <div className="row">
          <div className="col-md-3">
            <input
            type="text"
            className="form-control mb-3"
            placeholder="Search roles..."
            value={searchQuery}
            onChange={this.handleSearch}
            maxLength={100}
          />
          </div>
        </div>
        {currentRoles.length > 0 && (
          <React.Fragment>
            <table className="table table-bordered table-striped" style={{fontSize: "0.85rem"}}>
              <thead className="thead-dark">
                <tr>
                  <th onClick={() => this.handleSort("title")} style={{ cursor: "pointer" }}>
                    Title {sortColumn === "title" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th>Required Skills</th>
                  <th>Optional Skills</th>
                  <th>Time Duration</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentRoles.map((role) => (
                  <tr key={role.id}>
                    <td>{role.title}</td>
                    <td>
                      {this.getRoleSkills(role, true)}
                    </td>
                    <td>
                      {this.getRoleSkills(role, false)}
                    </td>
                    <td>{role.time_duration} mins</td>
                    <td>
                      <button className="btn btn-sm btn-warning mr-2" onClick={() => this.handleShowModal(role)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => {
                        this.setState({ deleteId: role.id });
                        this.deleteModal.openModal(); // Open the modal
                    }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <nav className="d-flex justify-content-center">
              <ul className="pagination">
                {[...Array(totalPages)].map((_, index) => (
                  <li key={index} className={`page-item ${currentPage === index + 1 ? "active" : ""}`}>
                    <button className="page-link" onClick={() => this.handlePageChange(index + 1)}>
                      {index + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>         
            <DeleteConfirm
              ref={(modal) => (this.deleteModal = modal)} // Ref to access modal methods
              onConfirm={this.handleDelete}
              message="Are you sure you want to delete this role?"
            />               
          </React.Fragment>
        )}
        {/* Modal Popup */}
        {showModal && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{this.state.editingRole ? "Edit Role" : "Add Role"}</h5>
                  <button className="close" onClick={this.handleCloseModal}>&times;</button>
                </div>
                <form onSubmit={this.handleSubmit}>
                <div className="modal-body">
                  <Form.Label>Title:</Form.Label> <span className="text-danger">*</span>
                  <input
                    name="title"
                    maxLength={100}
                    className="form-control mb-2"
                    placeholder="Title"
                    value={formData.title}
                    onChange={this.handleChange}
                    required
                  />
                  <Form.Label>Description:</Form.Label> <span className="text-danger">*</span>
                  <textarea
                    name="description"
                    className="form-control mb-2"
                    placeholder="Description"
                    rows="4"
                    cols="50"
                    value={formData.description}
                    onChange={this.handleChange}
                    required
                  ></textarea>
                    <Form.Label>Required Skills:</Form.Label> <span className="text-danger">*</span>
                  <Select
                    isMulti
                    name="requiredSkills"
                    options={skills
                      .filter((s) => !selectedOptionalSkillIds.includes(s.id)) // Exclude optional skills
                      .map((s) => ({ value: s.id, label: `${s.name} (${s.level})` }))}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder="Select Required Skills"
                    onChange={(options) => this.handleSkillChange(options, true)}
                    value={formData.requiredSkills}
                    required
                  />

                  <Form.Label>Optional Skills:</Form.Label>
                  <Select
                    isMulti
                    name="optionalSkills"
                    options={skills
                      .filter((s) => !selectedRequiredSkillIds.includes(s.id)) // Exclude required skills
                      .map((s) => ({ value: s.id, label: s.name }))}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder="Select Optional Skills"
                    onChange={(options) => this.handleSkillChange(options, false)}
                    value={formData.optionalSkills}
                  />
                  <Form.Label>
                    Time duration <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="time_duration"
                    className="form-control mb-2"
                    value={formData.time_duration}
                    onChange={this.handleChange}
                    placeholder="mins"
                    style={{ width: "200px" }}
                    required
                    onKeyDown={(e) => {
                      if (["e", "E", ".", "-"].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}                    
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={this.handleCloseModal}
                  >
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                </div>
              </form>
              </div>
            </div>
          </div>
        )}
      </Container>
    );
  }
}

export default connect(mapStateToProps)(Roles);
