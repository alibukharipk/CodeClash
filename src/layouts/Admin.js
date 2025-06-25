import React, { Component } from "react";
import { useLocation, Route, Switch } from "react-router-dom";

import AdminNavbar from "components/Navbars/AdminNavbar";
import Footer from "components/Footer/Footer";
import Sidebar from "components/Sidebar/Sidebar";
import SkillService from '../services/skillService';
import CandidateService from '../services/candidateService';
import UserService from '../services/userService';
import RoleService from '../services/roleService';
import QuestionService from '../services/questionService';
import routes from "routes.js";
import sidebarImage from "assets/img/sidebar-3.jpg";
import { ToastContainer } from "react-toastify";
import ErrorScreen from "../errorscreen";
import AuthService from '../services/authService';

class Admin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      image: sidebarImage,
      color: "black",
      hasImage: true,
    };
    this.mainPanel = React.createRef();
  }

  getRoutes = (routes) => {
    return routes.flatMap((prop, key) => {
      let routeList = [];

      // Parent route (if it has a component)
      if (prop.component) {
        routeList.push(
          <Route
            exact
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        );
      }

      // Child routes
      if (prop.children) {
        prop.children.forEach((child, childKey) => {
          routeList.push(
            <Route
              exact
              path={prop.layout + child.path}
              component={child.component}
              key={`${key}-${childKey}`}
            />
          );
        });
      }

      return routeList;
    });
  };

  componentDidMount() {

    const token = localStorage.getItem('accessToken');
    if (!token || AuthService.isTokenExpired()) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';  // Redirect to login
    }
    else
    {
      AuthService.initInactivityTimer();
    }

    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    if (this.mainPanel.current) {
      this.mainPanel.current.scrollTop = 0;
    }
    if (
      window.innerWidth < 993 &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      document.documentElement.classList.toggle("nav-open");
      var element = document.getElementById("bodyClick");
      if (element) {
        element.parentNode.removeChild(element);
      }
    }

    SkillService.fetchSkills();
    CandidateService.fetchCandidates();  
    RoleService.fetchRoles();
    QuestionService.fetchQuestions();
    UserService.fetchUsers();
    
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      document.documentElement.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
      if (this.mainPanel.current) {
        this.mainPanel.current.scrollTop = 0;
      }
    }
  }

  render() {
    return (
      <div className="wrapper">
        <ToastContainer position="top-right" autoClose={3000} />
        <Sidebar color={this.state.color} image={this.state.hasImage ? this.state.image : ""} routes={routes} />
        <div className="main-panel" ref={this.mainPanel}>
          <AdminNavbar />
          <div className="content">
            
              <Switch>
                {this.getRoutes(routes)}
                <Route path="/error" component={ErrorScreen} />
              </Switch>
            
          </div>
          <Footer />
        </div>
      </div>
    );
  }
}

export default Admin;
