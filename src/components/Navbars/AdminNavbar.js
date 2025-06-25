import React, { Component } from "react";
import { useLocation, useHistory, Link } from "react-router-dom";
import { Navbar, Container, Nav, Dropdown, Button } from "react-bootstrap";
import AuthService from '../../services/authService';
import { Breadcrumb } from "react-bootstrap";
import routes from "routes.js";

function Header() {
  const location = useLocation();
  const history = useHistory();
  const mobileSidebarToggle = (e) => {
    e.preventDefault();
    document.documentElement.classList.toggle("nav-open");
    var node = document.createElement("div");
    node.id = "bodyClick";
    node.onclick = function () {
      this.parentElement.removeChild(this);
      document.documentElement.classList.toggle("nav-open");
    };
    document.body.appendChild(node);
  };

  const getBrandText = () => {
    const currentPath = location.pathname;
  
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
  
      // Check for exact match with parent route
      if (currentPath === (route.layout + route.path)) {
        return route.name;
      }
  
      // Check for children routes
      if (route.children) {
        for (let j = 0; j < route.children.length; j++) {
          const childRoute = route.children[j];
  
          if (childRoute.path.startsWith("/tests/create")) {
            const dynamicPattern = new RegExp(`^${childRoute.layout}/tests/[^/]+$`);
            if (dynamicPattern.test(currentPath)) {
              return "Setup Test";  // Return "Setup Test" for any ID
            }
          }
          
          if (childRoute.path.startsWith("/tests/invites")) {
            const dynamicPattern = new RegExp(`^${childRoute.layout}/tests/invites/[^/]+$`);
            if (dynamicPattern.test(currentPath)) {
              return "Send Invites";  
            }
          }

          if (childRoute.path.startsWith("/tests/invite")) {
            const dynamicPattern = new RegExp(`^${childRoute.layout}/tests/invite/[^/]+/result$`);
            if (dynamicPattern.test(currentPath)) {
              return "Test Result";  // Set appropriate name for this route
            }
          }

          if (childRoute.path.startsWith("/library/questions")) {
            const dynamicPattern = new RegExp(`^${childRoute.layout}/library/questions/[^/]+$`);
            if (dynamicPattern.test(currentPath)) {
              return "Question";  
            }
          }

          if (childRoute.path.startsWith("/library")) {
          
            const dynamicPattern1 = new RegExp(`^${childRoute.layout}/library/addquestion`);
            const dynamicPattern2 = new RegExp(`^${childRoute.layout}/library/editquestion/[^/]+$`);
            if (dynamicPattern1.test(currentPath) || dynamicPattern2.test(currentPath)) {
              return "Question";  
            }
          }
  
          // Exact match for other child routes
          if (currentPath === (childRoute.layout + childRoute.path)) {
            return childRoute.name;
          }
        }
      }
    }
  
    return "Brand"; // Default title
  };
  

  const handleLogout = () => {
    AuthService.logout();
    history.push("/");
  };

  const getBreadcrumbs = () => {
    const currentPath = location.pathname;
    const breadcrumbs = [{ name: "Home", path: "/admin/dashboard" }]; // Home breadcrumb
  
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
  
      if (currentPath === (route.layout + route.path)) {
        breadcrumbs.push({ name: route.name, path: route.layout + route.path });
        break;
      }
  
      if (route.children) {
        for (let j = 0; j < route.children.length; j++) {
          const childRoute = route.children[j];
  
          // Handle dynamic route for "/tests/create/:id"
          if (childRoute.path.startsWith("/tests/create")) {
            const dynamicPattern = new RegExp(`^${childRoute.layout}/tests/[^/]+$`);
            if (dynamicPattern.test(currentPath)) {
              breadcrumbs.push({ name: route.name, path: route.layout + route.path });
              breadcrumbs.push({ name: "Setup Test", path: currentPath });
              return breadcrumbs;
            }
          }

          if (childRoute.path.startsWith("/tests/invites")) {
            const dynamicPattern = new RegExp(`^${childRoute.layout}/tests/invites/[^/]+$`);
            if (dynamicPattern.test(currentPath)) {
              breadcrumbs.push({ name: route.name, path: route.layout + route.path });
              breadcrumbs.push({ name: "Send Invites", path: currentPath });
              return breadcrumbs;
            }
          }

          if (childRoute.path.startsWith("/library/questions")) {
            const dynamicPattern = new RegExp(`^${childRoute.layout}/library/questions/[^/]+$`);
            if (dynamicPattern.test(currentPath)) {
              breadcrumbs.push({ name: route.name, path: route.layout + route.path });
              breadcrumbs.push({ name: "Question", path: currentPath });
              return breadcrumbs;
            }
          }

          if (childRoute.path.startsWith("/library/editquestion")) {
            const dynamicPattern = new RegExp(`^${childRoute.layout}/library/editquestion/[^/]+$`);
            if (dynamicPattern.test(currentPath)) {
              breadcrumbs.push({ name: route.name, path: route.layout + route.path });
              breadcrumbs.push({ name: "Edit Question", path: currentPath });
              return breadcrumbs;
            }
          }
  
          if (currentPath === (childRoute.layout + childRoute.path)) {
            breadcrumbs.push({ name: route.name, path: route.layout + route.path });
            breadcrumbs.push({ name: childRoute.name, path: childRoute.layout + childRoute.path });
            return breadcrumbs;
          }
        }
      }
    }
  
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
<Navbar bg="light" expand="lg">
  <Container fluid>
    <div className="d-flex align-items-center ml-2 ml-lg-0">
      <Button
        variant="dark"
        className="d-lg-none btn-fill d-flex justify-content-center align-items-center rounded-circle p-2"
        onClick={mobileSidebarToggle}
      >
        <i className="fas fa-ellipsis-v"></i>
      </Button>

      {/* Brand Text and Breadcrumbs Wrapper */}
      <div className="d-flex flex-column">
        {/* Brand Text */}
        <Navbar.Brand className="mb-0">{getBrandText()}</Navbar.Brand>

        {/* Breadcrumbs */}
        <Breadcrumb className="mb-0">
          {breadcrumbs.map((crumb, index) => (
            <Breadcrumb.Item
              key={index}
              active={index === breadcrumbs.length - 1}
              linkAs={index !== breadcrumbs.length - 1 ? Link : undefined}
              linkProps={index !== breadcrumbs.length - 1 ? { to: crumb.path } : undefined}
            >
              {crumb.name}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      </div>
    </div>

    <Navbar.Toggle aria-controls="basic-navbar-nav" className="mr-2">
      <span className="navbar-toggler-bar burger-lines"></span>
      <span className="navbar-toggler-bar burger-lines"></span>
      <span className="navbar-toggler-bar burger-lines"></span>
    </Navbar.Toggle>

    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="ml-auto" navbar>
        <Nav.Item>
          <Nav.Link className="m-0" href="#pablo" onClick={handleLogout}>
            <span className="no-icon">Log out</span>
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </Navbar.Collapse>
  </Container>
</Navbar>
  );
}

export default Header;
