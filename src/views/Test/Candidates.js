import React, { Component } from "react";
import {
  Container
} from "react-bootstrap";
import InviteService from "services/testInviteService";
import { withRouter } from "react-router-dom";
import RingLoader from "react-spinners/RingLoader";
import DeleteConfirm from '../../components/Dialogs/DeleteConfirm';
import TestResult from "./TestResult";
import { toast } from "react-toastify";

class Candidates extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: "",
      sortColumn: "",
      sortDirection: "asc",
      currentPage: 1,
      itemsPerPage: 10,
      candidates: [],
      loading: false,
      showModal: false,
      inviteId: null
    };
  }

  componentDidMount() {
    this.LoadData();
  }

  LoadData = async () => {
    const testId = parseInt(this.props.match.params.id, 10);
    this.setState({ loading: true });
    const data = await InviteService.getInvitedCandidates(testId);
    const candidates = data.invites.map(invite => ({
      inviteId: invite.InviteId,
      name: invite.CandidateId.name,
      inviteStatus: invite.InviteStatus,
      invitedOn: invite.InvitedOn.split('T')[0],
      linkExpiry: invite.LinkExpiry.split('T')[0],
      timeline: invite.Timeline,
      invitedBy: invite.InvitedBy ? invite.InvitedBy.username : "",
      score: invite.results ? invite.results.overall_percentage : 0,
      results: invite.results
    }));
    this.setState({ candidates });
    this.setState({ loading: false });
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


  getFilteredAndSortedCandidates = () => {
    const { searchQuery, sortColumn, sortDirection, candidates } = this.state;
    let filtered = candidates.filter((candidate) =>
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1;
      if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  handleDelete = async () => {
    const { deleteId } = this.state;
    this.setState({ loading: true });
    await InviteService.deleteInvite(deleteId);
    this.LoadData();
    this.setState({ loading: false });
  };

  handleShowModal = async (candidate) => {
    if (candidate.inviteStatus !== "Invited")
      this.setState({ showModal: true, inviteId: candidate.inviteId });
    else
      toast.info(`Candidate hasn't given test yet!`);
  };

  handleCloseModal = () => {
    this.setState({ showModal: false });
  };

  render() {
    const { searchQuery, sortColumn, sortDirection, currentPage, itemsPerPage, loading, showModal } = this.state;
    const candidates = this.getFilteredAndSortedCandidates();
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCandidates = candidates.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(candidates.length / itemsPerPage);

    return (
      <Container fluid>
        {loading && (
          <div className="spinner-overlay">
            <RingLoader color="#36D7B7" size={100} />
          </div>
        )}
        <div className="row">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Search by candidate name"
              value={searchQuery}
              onChange={this.handleSearch}
            />
          </div>
        </div>
        {currentCandidates.length > 0 && (
          <React.Fragment>
            <table className="table table-bordered table-striped" style={{ fontSize: "0.85rem" }}>
              <thead className="thead-dark">
                <tr>
                  <th onClick={() => this.handleSort("name")}  style={{ cursor: "pointer" }}>
                    Name {sortColumn === "name" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Invited By</th>
                  <th>Invited On</th>
                  <th>Expiry Date</th>
                  <th>Timeline</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentCandidates.map((candidate) => (
                  <tr key={candidate.inviteId}>
                    <td onClick={() => this.handleShowModal(candidate)} style={{ cursor: 'pointer' }}>{candidate.name}</td>
                    <td onClick={() => this.handleShowModal(candidate)} style={{ cursor: 'pointer' }}>{candidate.results ? candidate.results.overall_percentage >= 80 ? <span className={`badge badge-success p-2`}>Passed</span> : <span className={`badge badge-danger p-2`}>Failed</span> : candidate.inviteStatus}</td>
                    <td onClick={() => this.handleShowModal(candidate)} style={{ cursor: 'pointer' }}>{candidate.score}%</td>
                    <td onClick={() => this.handleShowModal(candidate)} style={{ cursor: 'pointer' }}>{candidate.invitedBy}</td>
                    <td onClick={() => this.handleShowModal(candidate)} style={{ cursor: 'pointer' }}>{candidate.invitedOn}</td>
                    <td onClick={() => this.handleShowModal(candidate)} style={{ cursor: 'pointer' }}>{candidate.linkExpiry}</td>
                    <td onClick={() => this.handleShowModal(candidate)} style={{ cursor: 'pointer' }}>{candidate.timeline}</td>
                    <td>
                      <button className="btn btn-sm btn-danger" onClick={() => {
                        this.setState({ deleteId: candidate.inviteId });
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
        {showModal && (
          <React.Fragment>
            <div className="modal d-block" tabIndex="-1" style={{ overflowY: 'auto' }}>
              <div className="modal-dialog modal-xl modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Test Result</h5>
                    <button className="close" onClick={this.handleCloseModal}>
                      &times;
                    </button>
                  </div>

                  <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <TestResult inviteId={this.state.inviteId} />
                  </div>

                  {/* Footer with right-aligned button */}
                  <div className="modal-footer justify-content-end">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={this.handleCloseModal}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        )}
      </Container>
    );
  }
}

export default withRouter(Candidates);
