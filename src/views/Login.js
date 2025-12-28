import React, { Component } from "react";
import AuthService from '../services/authService';
import { connect } from "react-redux";

const mapStateToProps = (state) => ({
  loginError: state.auth.error
});

class Login extends Component {
  state = { username: "", password: "", email: "", password:"" };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value, error: "" });
  };

    handleSubmit = async (e) => {
        e.preventDefault();
        const { email, password } = this.state;
          await AuthService.login({username: email, password});
      };

  render() {
    const { loginError } = this.props;
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="card shadow-lg p-4" style={{ width: "400px" }}>
          <div className="card-body">
            <h3 className="text-center mb-4">Login</h3>
            {loginError && <div className="alert alert-danger">Invalid credentials</div>}
            <form onSubmit={this.handleSubmit}>
              <div className="form-group">
                <label>Email address</label>
                <input
                  type="text"
                  className="form-control"
                  name="email"
                  value={this.state.email}
                  onChange={this.handleChange}
                  placeholder="Enter email"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={this.state.password}
                  onChange={this.handleChange}
                  placeholder="Enter password"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block">Login</button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Login);