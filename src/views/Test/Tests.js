import React, { Component } from "react";
import { Form, Table, Container, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import TestService from "services/testService";
import DeleteConfirm from '../../components/Dialogs/DeleteConfirm';
import RingLoader from "react-spinners/RingLoader";
import { connect } from "react-redux";
import { formatDuration } from "../../common.js"

const mapStateToProps = (state) => ({
  roles: state.roles.roles
});

class Tests extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tests: [],
      filters: {
        test_name: "",
        role: "",
      },
      loading: false,
      currentPage: 1,
      testsPerPage: 10,
      sortColumn: "test_name",
      sortOrder: "asc",
      deleteId: null,
    };
  }

  componentDidMount() {    
    this.loadData();
  }

  loadData = async () => {    
    this.setState({ loading: true });
    const response = await TestService.fetchTests();
    this.setState({tests: response});
    this.setState({ loading: false });
  }

  handleFilterChange = (e) => {
    this.setState({
      filters: { ...this.state.filters, [e.target.name]: e.target.value },
    });
  };

  handlePageChange = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  };

  handleSort = (column) => {
    this.setState((prevState) => {
      const newOrder = prevState.sortColumn === column && prevState.sortOrder === "asc" ? "desc" : "asc";
      return { sortColumn: column, sortOrder: newOrder };
    });
  };

getSortedTests = () => {
  const { tests, filters, sortColumn, sortOrder } = this.state;
  const { roles } = this.props;

  // Apply filters
  const isFiltering =
    filters.test_name.trim() !== "" || filters.role.trim() !== "";

  let filteredTests = tests;

  if (isFiltering) {
    filteredTests = tests.filter((t) => {
      const roleTitle = roles.find((role) => role.id === t.role)?.title || "";
      return (
        t.test_name.toLowerCase().includes(filters.test_name.toLowerCase()) &&
        roleTitle.toLowerCase().includes(filters.role.toLowerCase())
      );
    });
  }

  // Apply sorting only if filtering is on or sort column is explicitly selected
  if (isFiltering || sortColumn !== "test_name" || sortOrder !== "asc") {
    return [...filteredTests].sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      // For string comparison, use localeCompare for better results
      if (typeof valA === "string" && typeof valB === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      // For number comparison
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }

  return filteredTests; // No filters, no sorting — return as is
};

  handleDelete = async () => {
    const { deleteId } = this.state;
    this.setState({ loading: true }); 
    await TestService.deleteTest(deleteId);
    this.setState({ loading: false }); 
    this.loadData();
  };

  handleRowClick = (testId) => {
    this.props.history.push(`/admin/tests/${testId}`);
  };

  render() {
    const { currentPage, testsPerPage, sortColumn, sortOrder, loading } = this.state;
    const { roles } = this.props;
    const sortedTests = this.getSortedTests();
    const indexOfLastTest = currentPage * testsPerPage;
    const indexOfFirstTest = indexOfLastTest - testsPerPage;
    const currentTests = sortedTests.slice(indexOfFirstTest, indexOfLastTest);
    const totalPages = Math.ceil(sortedTests.length / testsPerPage);

    return (
      <Container fluid>
        {loading && (
          <div className="spinner-overlay">
            <RingLoader color="#36D7B7" size={100} />
          </div>           
        )}          
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Link to="/admin/tests/create" className="btn btn-primary">Create Test</Link>
        </div>

        <Form className="mb-3 row">
          <div className="col-md-6">
            <Form.Control
              type="text"
              placeholder="Filter by Test Name"
              name="test_name"
              value={this.state.filters.test_name}
              onChange={this.handleFilterChange}
            />
          </div>
          <div className="col-md-6">
            <Form.Control
              type="text"
              placeholder="Filter by Role"
              name="role"
              value={this.state.filters.role}
              onChange={this.handleFilterChange}
            />
          </div>
        </Form>

        {currentTests.length > 0 && (
          <React.Fragment>
            <table className="table table-bordered table-striped" style={{fontSize: "0.85rem"}}>
            <thead className="thead-dark">
                <tr>
                  <th onClick={() => this.handleSort("test_name")} style={{ cursor: "pointer" }}>Test Name {sortColumn === "test_name" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</th>
                  <th>Role</th>
                  <th>Duration</th>
                  <th>Not Attempted</th>
                  <th>Completed</th>
                  <th>To Evaluate</th>
                  <th>Invite</th>
                  <th>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentTests.map((test, index) => (
                  <tr key={index}>
                    <td onClick={() => this.handleRowClick(test.id)} style={{cursor: 'pointer'}}>{test.test_name}</td>
                    <td onClick={() => this.handleRowClick(test.id)} style={{cursor: 'pointer'}}>
                      {roles.length > 0 && roles.find((role) => role.id === test.role)?.title}
                    </td>
                    <td onClick={() => this.handleRowClick(test.id)} style={{cursor: 'pointer'}}>{formatDuration(test.duration)}</td>
                    <td onClick={() => this.handleRowClick(test.id)} style={{cursor: 'pointer'}}>{test.not_attempted_count}</td>
                    <td onClick={() => this.handleRowClick(test.id)} style={{cursor: 'pointer'}}>{test.completed_count}</td>
                    <td onClick={() => this.handleRowClick(test.id)} style={{cursor: 'pointer'}}>{test.to_evaluate_count}</td>        
                    <td>
                      {test.published ? (
                        <button
                        className="btn btn-sm btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          this.props.history.push(`/admin/tests/invites/${test.id}`);
                        }}
                      >
                        Invite
                      </button>
                      ) : ""}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          this.setState({ deleteId: test.id });
                          this.deleteModal.openModal();
                        }}
                      >
                        Delete
                      </button>
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
              message="Are you sure you want to delete this test?"
            />            
          </React.Fragment>
        )}
      </Container>
    );
  }
}

export default connect(mapStateToProps)(Tests);