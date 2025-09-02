import React, { Component } from "react";
import { NavLink, withRouter } from "react-router-dom";
import { Nav } from "react-bootstrap";
import { connect } from "react-redux";

class Sidebar extends Component {
  activeRoute(routeName) {
    const { location } = this.props;
    return location.pathname.indexOf(routeName) > -1 ? "active" : "";
  }

  render() {
    const { color, image, routes } = this.props;
    const role = localStorage.getItem("role");

    return (
      <div className="sidebar" data-image={image} data-color={color}>
        <div
          className="sidebar-background"
          style={{
            backgroundImage: "url(" + image + ")",
          }}
        />
        <div className="sidebar-wrapper">
          <div className="logo d-flex align-items-center justify-content-start">
            <a
              href="https://www.creative-tim.com?ref=lbd-sidebar"
              className="simple-text logo-mini mx-1"
            >
              <div className="logo-img">
                <img src={require("assets/img/reactlogo.png")} alt="..." />
              </div>
            </a>
            <a className="simple-text" href="/">
              Code Clash
            </a>
          </div>
          <Nav>
            {routes.map((prop, key) => {
              const isUsersRoute = prop.name?.toLowerCase() === "users";

              if (!prop.redirect && !(role !== "admin" && isUsersRoute)) {
                return (
                  <li className={this.activeRoute(prop.layout + prop.path)} key={key}>
                    <NavLink
                      to={prop.layout + prop.path}
                      className="nav-link"
                      activeClassName="active"
                    >
                      <i className={prop.icon} />
                      <p>{prop.name}</p>
                    </NavLink>
                  </li>
                );
              }

              return null;
            })}
          </Nav>
        </div>
      </div>
    );
  }
}

export default withRouter(Sidebar);