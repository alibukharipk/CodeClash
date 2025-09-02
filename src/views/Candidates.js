import React, { Component } from "react";
import {
  Badge,
  Button,
  Card,
  Navbar,
  Nav,
  Table,
  Container,
  Row,
  Col,
  Form
} from "react-bootstrap";
import { connect } from "react-redux";
import CandidateService from '../services/candidateService';
import DeleteConfirm from '../components/Dialogs/DeleteConfirm';
import RingLoader from "react-spinners/RingLoader";

const mapStateToProps = (state) => ({
  candidates: state.candidates.candidates
});

class Candidates extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: "",
      sortColumn: "name",
      sortDirection: "asc",
      currentPage: 1,
      itemsPerPage: 10,
      showModal: false,
      editingCandidate: null,
      deleteId: null,
      loading: false,
      formData: { name: "", age: "", experience: "" },
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
    await CandidateService.deleteCandidate(deleteId);
    this.setState({ loading: false }); 
  };

  handleShowModal = (candidate = null) => {
    this.setState({ showModal: true, editingCandidate: candidate, formData: candidate || { name: "", age: "", experience: "" } });
  };

  handleCloseModal = () => {
    this.setState({ showModal: false, editingCandidate: null });
  };

  handleChange = (event) => {
    this.setState({ formData: { ...this.state.formData, [event.target.name]: event.target.value } });
  };

  handleSubmit = async (event) => {
    event.preventDefault(); 
    const { editingCandidate, formData } = this.state;
    this.setState({ loading: true }); 

    if (editingCandidate)
      await CandidateService.updateCandidate(editingCandidate.id,formData);
    else
      await CandidateService.addCandidate(formData);

      this.setState({ showModal: false, editingCandidate: null, loading: false });
  };

  getFilteredAndSortedCandidates = () => {    
    const { searchQuery, sortColumn, sortDirection } = this.state;
    const { candidates } = this.props;
    let filtered = candidates.filter((candidate) =>
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1;
      if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  render() {
    const { searchQuery, sortColumn, sortDirection, currentPage, itemsPerPage, showModal, formData } = this.state;
    const candidates = this.getFilteredAndSortedCandidates();
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCandidates = candidates.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(candidates.length / itemsPerPage);

    return (
      <Container fluid>
        {this.state.loading && (
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
            placeholder="Search by candidate name or email"
            value={searchQuery}
            onChange={this.handleSearch}
            maxLength={100}
          />
          </div>
        </div>
        {currentCandidates.length > 0 && (
          <React.Fragment>
            <table className="table table-bordered table-striped"  style={{ fontSize: "0.85rem" }}>
              <thead className="thead-dark">
                <tr>
                <th onClick={() => this.handleSort("email")}  style={{ cursor: "pointer" }}>Email  {sortColumn === "email" ? (sortDirection === "asc" ? "▲" : "▼") : ""}</th>
                  <th onClick={() => this.handleSort("name")} style={{ cursor: "pointer" }}>
                    Name {sortColumn === "name" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th>Experience</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentCandidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <td>{candidate.email}</td>
                    <td>{candidate.name}</td>                
                    <td>{candidate.experience}</td>
                    <td>
                      <button className="btn btn-sm btn-warning mr-2" onClick={() => this.handleShowModal(candidate)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => {
                        this.setState({ deleteId: candidate.id });
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
              message="Are you sure you want to delete this candidate?"
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
                    {this.state.editingCandidate ? "Edit Candidate" : "Add Candidate"}
                  </h5>
                  <button className="close" onClick={this.handleCloseModal}>
                    &times;
                  </button>
                </div>
                <form onSubmit={this.handleSubmit}>
                  <div className="modal-body">
                    <Form.Label>Name:</Form.Label>
                    <input
                      name="name"
                      maxLength={100}
                      className="form-control mb-2"
                      placeholder="Name"
                      value={formData.name}
                      onChange={this.handleChange}
                      required
                    />
                    <Form.Label>Email:</Form.Label>
                    <input
                      name="email"
                      type="email"
                      maxLength={100}
                      className="form-control mb-2"
                      placeholder="Email"
                      value={formData.email}
                      onChange={this.handleChange}
                      required
                    />
                    <Form.Label>Experience:</Form.Label>
                    <input
                      name="experience"
                      type="number"
                      min={1}
                      max={50}
                      className="form-control mb-2"
                      placeholder="Experience"
                      value={formData.experience}
                      onChange={this.handleChange}
                      required
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

export default connect(mapStateToProps)(Candidates);
