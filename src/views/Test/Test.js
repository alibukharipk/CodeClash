import React, { Component } from "react";
import { Container, Button } from "react-bootstrap";
import Settings from "./Settings";
import Questions from "./Questions";
import Candidates from "./Candidates";
import SendInvites from "./SendInvites";
import { Link } from "react-router-dom";
import { withRouter } from "react-router-dom";
import TestService from "services/testService";
import RingLoader from "react-spinners/RingLoader";

class TestQuestions extends Component {
    constructor(props) {
      super(props);
      this.state = {
        activeTab: "questions", // Default active tab
        test: null,
        loading: false
      };
    }

    componentDidMount()
    {
      this.loadData();
    }

    loadData = async () => {
      this.setState({ loading: true });
      const testId = parseInt(this.props.match.params.id, 10);
      const test = await TestService.getTest(testId);
      this.setState({test, loading: false});
    }
  
    toggleTab = (tab) => {
      if (this.state.activeTab !== tab) {
        this.setState({ activeTab: tab });
      }
    };

    publishTest  = async () => {
      this.setState({ loading: true }); 
      const updateTest = await TestService.getTest(this.state.test.id);
      updateTest.published = true;
      await TestService.updateTest(updateTest);
      this.setState({ test: updateTest, loading: false }); 
    };
  
    render() {

      const {test, loading} = this.state;
      
      return (
        <Container fluid>
        {loading && (
            <div className="spinner-overlay">
              <RingLoader color="#36D7B7" size={100} />
            </div>           
          )}            
          {(test && !test.published) && 
          <div class="text-right">
              <Button className="btn btn-success" onClick={this.publishTest}>
              Publish
              </Button>
          </div> 
          }       
          <nav>
            <div className="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
              <a 
                className={`nav-item nav-link ${this.state.activeTab === "questions" ? "active" : ""}`} 
                id="nav-home-tab" 
                data-toggle="tab" 
                role="tab" 
                aria-controls="nav-home" 
                aria-selected={this.state.activeTab === "questions"}
                onClick={() => this.toggleTab("questions")}
              >
                Questions
              </a>

              <a 
                className={`nav-item nav-link ${this.state.activeTab === "candidates" ? "active" : ""}`} 
                id="nav-profile-tab" 
                data-toggle="tab" 
                role="tab" 
                aria-controls="nav-profile" 
                aria-selected={this.state.activeTab === "candidates"}
                onClick={() => this.toggleTab("candidates")}
              >
                Candidates
              </a>

              <a 
                className={`nav-item nav-link ${this.state.activeTab === "settings" ? "active" : ""}`} 
                id="nav-contact-tab" 
                data-toggle="tab" 
                role="tab" 
                aria-controls="nav-contact" 
                aria-selected={this.state.activeTab === "settings"}
                onClick={() => this.toggleTab("settings")}
              >
                Settings
              </a>
              {(test && test.published) && (
                    <a 
                    className={`nav-item nav-link ${this.state.activeTab === "invites" ? "active" : ""}`} 
                    id="nav-contact-tab" 
                    data-toggle="tab" 
                    role="tab" 
                    aria-controls="nav-contact" 
                    aria-selected={this.state.activeTab === "invites"}
                    onClick={() => this.toggleTab("invites")}
                  >
                    Invite
                  </a>
              )}   
          </div>
        </nav>

        <div className="tab-content mt-3">
          {this.state.activeTab === "questions" && <Questions/>}
          {this.state.activeTab === "candidates" && <Candidates/>}
          {this.state.activeTab === "settings" && <Settings/>}
          {this.state.activeTab === "invites" && <SendInvites/>}
        </div>
      </Container>
      );
    }
  }
  
  export default withRouter(TestQuestions);
