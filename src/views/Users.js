import React, { Component } from "react";
import {
  Container,
  Form
} from "react-bootstrap";
import { connect } from "react-redux";
import UserService from '../services/userService';
import DeleteConfirm from '../components/Dialogs/DeleteConfirm';
import RingLoader from "react-spinners/RingLoader";
import UserRoleService from '../services/userRoleService';
import { toast } from "react-toastify";

const mapStateToProps = (state) => ({
  users: state.users.users
});

class Users extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: "",
      sortColumn: "username",
      sortDirection: "asc",
      currentPage: 1,
      itemsPerPage: 10,
      showModal: false,
      editingUser: null,
      deleteId: null,
      loading: false,
      formData: { username: "", email: "", first_name: "", last_name: "", user_role: [], is_staff: true },
      userRoles: []
    };
  }

  componentDidMount() {    
    this.loadData();
  }

  loadData = async () => {
    const roles = await UserRoleService.fetchRoles();
    this.setState({userRoles: roles});
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
    await UserService.deleteUser(deleteId);
    this.setState({ loading: false }); 
  };

  handleShowModal = (user = null) => {
    this.setState({ showModal: true, editingUser: user, formData: user || { username: "", first_name: "", last_name: "", email: "", is_staff: true } });
  };

  handleCloseModal = () => {
    this.setState({ showModal: false, editingUser: null });
  };

  handleChange = (event) => {
    this.setState({ formData: { ...this.state.formData, [event.target.name]: event.target.value } });
  };

  handleSubmit = async (event) => {
    event.preventDefault(); 
    const { editingUser, formData } = this.state;
    const { password, password_confirm, username } = formData;
    const { users } = this.props;

    if (password !== password_confirm) {
      toast.error("Passwords do not match!");
      return;
    }

    const usernameExists = users.some(
      (user) =>
        user.username.toLowerCase() === username.toLowerCase() &&
        (!editingUser || user.id !== editingUser.id)
    );

    if (usernameExists) {
        toast.error("Username already exists!");
      return;    
    }

    this.setState({ loading: true }); 

    if (editingUser)
      await UserService.updateUser(editingUser.id,formData);
    else
      await UserService.addUser(formData);

    this.setState({ showModal: false, editingUser: null, loading: false });
  };

  getFilteredAndSortedUsers = () => {    
    const { searchQuery, sortColumn, sortDirection } = this.state;
    const { users } = this.props;
    let filtered = users
      .filter(user => user.is_staff) // ✅ Filter only staff users
      .filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return filtered.sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1;
      if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  render() {
    const { searchQuery, sortColumn, sortDirection, currentPage, itemsPerPage, showModal, formData, userRoles, editingUser } = this.state;
    const users = this.getFilteredAndSortedUsers();
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(users.length / itemsPerPage);

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
            placeholder="Search by user name or email"
            value={searchQuery}
            onChange={this.handleSearch}
            maxLength={100}
          />
          </div>
        </div>
        {currentUsers.length > 0 && (
          <React.Fragment>
            <table className="table table-bordered table-striped"  style={{ fontSize: "0.85rem" }}>
              <thead className="thead-dark">
                <tr>
                <th onClick={() => this.handleSort("email")}  style={{ cursor: "pointer" }}>Email  {sortColumn === "email" ? (sortDirection === "asc" ? "▲" : "▼") : ""}</th>
                  <th onClick={() => this.handleSort("username")} style={{ cursor: "pointer" }}>
                    Username {sortColumn === "name" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.username}</td>                
                    <td>{user.first_name}</td>      
                    <td>{user.last_name}</td>      
                    <td>{userRoles.find(role => role.id === user.user_role)?.display_name || "N/A"}</td>  
                    <td>
                      <button className="btn btn-sm btn-warning mr-2" onClick={() => this.handleShowModal(user)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => {
                        this.setState({ deleteId: user.id });
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
              message="Are you sure you want to delete this user?"
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
                      {editingUser ? "Edit User" : "Add User"}
                    </h5>
                    <button className="close" onClick={this.handleCloseModal}>
                      &times;
                    </button>
                  </div>
                  <form onSubmit={this.handleSubmit}>
                    <div className="modal-body">
                      <div className="row">
                        <div className="col-md-6">
                          <Form.Label>Username:</Form.Label> <span className="text-danger">*</span>
                          <input
                            name="username"
                            maxLength={100}
                            className="form-control mb-2"
                            placeholder="Username"
                            value={formData.username}
                            onChange={this.handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <Form.Label>Email:</Form.Label> <span className="text-danger">*</span>
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
                        </div>                         
                        <div className="col-md-6">
                          <Form.Label>First Name:</Form.Label> <span className="text-danger">*</span>
                          <input
                            name="first_name"
                            maxLength={100}
                            className="form-control mb-2"
                            placeholder="First name"
                            value={formData.first_name}
                            onChange={this.handleChange}
                            required
                          />
                        </div>                       
                        <div className="col-md-6">
                          <Form.Label>Last Name:</Form.Label> <span className="text-danger">*</span>
                          <input
                            name="last_name"
                            maxLength={100}
                            className="form-control mb-2"
                            placeholder="Last name"
                            value={formData.last_name}
                            onChange={this.handleChange}
                            required
                          />
                        </div>
                        {!editingUser && (
                          <>
                            <div className="col-md-6">
                              <Form.Label>Password:</Form.Label> <span className="text-danger">*</span>
                              <input
                                name="password"
                                type="password"
                                maxLength={100}
                                minLength={8}
                                className="form-control mb-2"
                                placeholder="Password"
                                value={formData.password}
                                onChange={this.handleChange}
                                required
                              />
                            </div>
                            <div className="col-md-6">
                              <Form.Label>Confirm Password:</Form.Label> <span className="text-danger">*</span>
                              <input
                                name="password_confirm"
                                type="password"
                                maxLength={100}
                                minLength={8}
                                className="form-control mb-2"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={this.handleChange}
                                required
                              />
                            </div>                          
                          </>
                        )}
                        <div className="col-md-12">
                          <Form.Label>Role:</Form.Label> <span className="text-danger">*</span>
                          <Form.Control
                            as="select"
                            name="user_role"
                            value={formData.user_role || ""}
                            onChange={this.handleChange}
                            required
                          >
                            <option value="">Select Role</option>
                            {userRoles.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </Form.Control>             
                        </div>
                      </div>
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

export default connect(mapStateToProps)(Users);
