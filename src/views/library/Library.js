import React, { Component } from "react";
import { Form, Table, Container, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import QuestionService from "services/questionService";
import DeleteConfirm from '../../components/Dialogs/DeleteConfirm';
import RingLoader from "react-spinners/RingLoader";
import AIQuestions from "./AIQuestions";
import { questionTypeLabels } from "../../common.js"

const mapStateToProps = (state) => ({
  questions: state.questions.questions
});

class Library extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {
        name: "",
        skill: "",
      },
      currentPage: 1,
      questionsPerPage: 10,
      loading: false,
      showModal: false,
    };
    this.deleteModal = React.createRef();
  }

  handleFilterChange = (e) => {
    this.setState({
      filters: { ...this.state.filters, [e.target.name]: e.target.value },
    });
  };

  handlePageChange = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  };

  handleRowClick = (questionId) => {
    //this.props.history.push(`/admin/test/${testId}`);
    this.props.history.push(`/admin/library/questions/${questionId}`);
  };

  editQuestionClick = (questionId, event) => {
    event.stopPropagation(); 
    this.props.history.push(`/admin/library/editquestion/${questionId}`);
  };

  handleDelete = async () => {
    const { deleteId } = this.state;
    this.setState({ loading: true }); 
    await QuestionService.deleteQuestion(deleteId);
    this.setState({ loading: false }); 
  };

   handleShowModal = () => {
    this.setState({ showModal: true});
    };

    handleCloseModal = () => {
      this.setState({ showModal: false });
    };

  render() {
    const { filters, currentPage, questionsPerPage, loading , showModal } = this.state;
    const { questions} = this.props;
    const filteredQuestions = questions.filter(
      (q) =>
        q.name.toLowerCase().includes(filters.name.toLowerCase()) &&
        q.skills.some(skill => skill.name.toLowerCase().includes(filters.skill.toLowerCase()))
    );

    const indexOfLastQuestion = currentPage * questionsPerPage;
    const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
    const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
    const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

    return (
      <Container fluid>
        {loading && (
          <div className="spinner-overlay">
            <RingLoader color="#36D7B7" size={100} />
          </div>           
        )}          
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Link to="/admin/library/addquestion"  className="btn btn-primary">Create Question</Link>
          <Link to="/admin/library/aiquestions"  className="btn btn-primary">AI Questions</Link>
        </div>
        <Form className="mb-3 row">
          <div className="col-md-6">
            <Form.Control
              type="text"
              placeholder="Filter by Question Name"
              name="name"
              value={filters.name}
              onChange={this.handleFilterChange}
              maxLength={100}
            />
          </div>
          <div className="col-md-6">
            <Form.Control
              type="text"
              placeholder="Filter by Skill"
              name="skill"
              value={filters.skill}
              onChange={this.handleFilterChange}
              maxLength={100}
            />
          </div>
        </Form>

        {currentQuestions.map((q, index) => {
  
        const badgeClass = {
          easy: "badge-success",
          medium: "badge-warning",
          hard: "badge-danger",
        }[q.difficulty] || "badge-secondary"; // Default fallback

        return (
          <div className="card mb-3 shadow-sm" onClick={() => this.handleRowClick(q.id)} style={{ cursor: "pointer" }} key={q.id}>
            <div className="card-body">
              <div className="d-flex align-items-start">
                <div className="form-check mr-3 mt-1">
                  <input className="form-check-input" type="checkbox" />
                </div>

                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-2">
                    <h5 className="card-title mb-0 mr-2">{q.name}</h5>
                    <span className={`badge ${badgeClass} p-2`}>{q.difficulty}</span>
                  </div>

                  <div className="mb-2">
                    <strong className="mr-2">Skills:</strong>
                    <span key={index} className="badge badge-light text-secondary mr-1 mb-1 py-1 px-2">
                      <i className="fas fa-code-branch mr-1"></i>
                      {q.skills.map(skill => skill.name + "(" + skill.level + ")").join(", ")}
                    </span>
                  </div>

                  <div className="row mb-1">
                    <div className="col-md-3">
                      <div className="text-muted">Type: <span className="text-dark">{questionTypeLabels[q.question_type]}</span></div>
                    </div>
                    <div className="col-md-2">
                      <div className="text-muted">Score: <span className="text-dark">{q.score}</span></div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-muted">Recommended Time: <span className="text-dark">{q.recommended_time} mins</span></div>
                    </div>
                    <div className="col-md-2">
                      <button className="btn btn-sm btn-warning mr-2" onClick={(e) => this.editQuestionClick(q.id, e)}>Edit</button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          this.setState({ deleteId: q.id }, () => {
                            if (this.deleteModal.current) {
                              this.deleteModal.current.openModal();
                            }
                          });
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

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
            ref={this.deleteModal}
            onConfirm={this.handleDelete}
            message="Are you sure you want to delete this question?"
          />
      {showModal && (
        <React.Fragment>
   <div className="modal d-block" tabIndex="-1" style={{ overflowY: 'auto' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Generate AI Questions</h5>
                <button className="close" onClick={this.handleCloseModal}>
                  &times;
                </button>
              </div>

              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <AIQuestions/>
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

export default connect(mapStateToProps)(Library);
