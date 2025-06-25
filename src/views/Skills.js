import React, { Component } from "react";
import {
  Container,
  Form
} from "react-bootstrap";
import { connect } from "react-redux";
import SkillService from '../services/skillService';
import DeleteConfirm from '../components/Dialogs/DeleteConfirm';
import RingLoader from "react-spinners/RingLoader";

const mapStateToProps = (state) => ({
  skills: state.skills.skills
});

class Skills extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: "",
      sortColumn: "title",
      sortDirection: "asc",
      currentPage: 1,
      itemsPerPage: 10,
      showModal: false,
      editingSkill: null,
      deleteId: null,
      loading: false,
      formData: { name: "", level: "" },
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
    await SkillService.deleteSkill(deleteId);
    this.setState({ loading: false }); 
  };

  handleShowModal = (skill = null) => {
    this.setState({ showModal: true, editingSkill: skill, formData: skill || { name: "", level: ""} });
  };

  handleCloseModal = () => {
    this.setState({ showModal: false, editingSkill: null });
  };

  handleChange = (event) => {
    this.setState({ formData: { ...this.state.formData, [event.target.name]: event.target.value } });
  };

  handleSubmit = async (event) => {
    event.preventDefault(); 
    const { editingSkill, formData } = this.state;
    this.setState({ loading: true }); 

    if (editingSkill)
      await SkillService.updateSkill(editingSkill.id,formData);
    else
      await SkillService.addSkill(formData);

      this.setState({ showModal: false, editingSkill: null, loading: false });
  };

  getFilteredAndSortedskills = () => {
    const { searchQuery, sortColumn, sortDirection } = this.state;
    const { skills } = this.props;
    let filtered = skills.filter((skill) =>
        skill.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1;
      if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  render() {
    const { searchQuery, sortColumn, sortDirection, currentPage, itemsPerPage, showModal, formData, loading } = this.state;
    const skills = this.getFilteredAndSortedskills();
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentskills = skills.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(skills.length / itemsPerPage);

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
            placeholder="Search skills..."
            value={searchQuery}
            onChange={this.handleSearch}
          />
          </div>
        </div>
        {currentskills.length > 0 && (
          <React.Fragment>
            <table className="table table-bordered table-striped" style={{ fontSize: "0.85rem" }}>
              <thead className="thead-dark">
                <tr>
                  <th onClick={() => this.handleSort("name")} style={{ cursor: "pointer" }}>
                    Skill {sortColumn === "name" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th>Level</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentskills.map((skill) => (
                  <tr key={skill.id}>
                    <td>{skill.name}</td>
                    <td>{skill.level}</td>
                    <td>
                      <button className="btn btn-sm btn-warning mr-2" onClick={() => this.handleShowModal(skill)}>Edit</button>
                      <button className="btn btn-sm btn-danger"  onClick={() => {
                        this.setState({ deleteId: skill.id });
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
              message="Are you sure you want to delete this skill?"
            />                     
          </React.Fragment>          
        )}
        {/* Modal Popup */}
        {showModal && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {this.state.editingSkill ? "Edit Skill" : "Add Skill"}
                  </h5>
                  <button className="close" onClick={this.handleCloseModal}>
                    &times;
                  </button>
                </div>
                <form onSubmit={this.handleSubmit}>
                  <div className="modal-body">
                    <Form.Label>Skill:</Form.Label>
                    <input
                      name="name"
                      maxLength={100}
                      className="form-control mb-2"
                      placeholder="Skill"
                      value={formData.name}
                      onChange={this.handleChange}
                      required
                    />
                    <Form.Label>Level:</Form.Label>
                    <Form.Control
                        as="select"
                        name="level"
                        value={formData.level || ""}
                        onChange={this.handleChange}
                        required
                      >
                        <option value="">Select Level</option>
                        <option value="Basic">Basic</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </Form.Control>
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

export default connect(mapStateToProps)(Skills);
