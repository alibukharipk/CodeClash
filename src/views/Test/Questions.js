import React, { Component } from "react";
import { Accordion, Card, Button, Table, Form, Container } from "react-bootstrap";
import { Pencil, CheckCircle, XCircle, Clock } from "react-bootstrap-icons";
import TestService from "services/testService";
import { withRouter } from "react-router-dom";
import RingLoader from "react-spinners/RingLoader";

class Questions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      questions: [],
      duration: null,
      isEditing: false,
      loading: false,
      tempDuration: null,
      selectedQuestions: new Set(), // Initialize as empty Set
      selectedQuestionsTime: 0,
      error: null,
      showModal: false,
      testQuestions: [],
      previewQuestion: null
    };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = async () => {
    this.setState({ loading: true });
    const testId = parseInt(this.props.match.params.id, 10);
    const questions = await TestService.getAllQuestions(testId);
    const testQuestions = await TestService.getTestOnlyQuestions(testId);

    this.setState({
      questions,
      loading: false,
      tempDuration: questions.test.duration ? questions.test.duration : questions.role.time_duration,
      role: questions.role.id,
      selectedTest: questions.test,
      selectedQuestions: new Set(testQuestions.questions.map(q => q.id)), // Convert to Set here
      selectedQuestionsTime: testQuestions.questions.reduce((total, question) => total + question.recommended_time, 0),
      testQuestions
    });
  };

  handleEdit = () => {
    this.setState({ isEditing: true, tempDuration: this.state.tempDuration });
  };

  handleChange = (e) => {
    const { value } = e.target;
    if (value < 0)
      return;

    this.setState({ tempDuration: value });
  };

  handleSave = async () => {
    const { questions, tempDuration } = this.state;
    questions.test.duration = tempDuration;
    await TestService.updateTest(questions.test);
    this.setState({ duration: this.state.tempDuration, isEditing: false });
  };

  handleCancel = () => {
    this.setState({ isEditing: false });
  };

  handleCheckboxChange = (questionId, isChecked, recommendedTime) => {
    const { tempDuration } = this.state;
    this.setState({ error: null });

    this.setState((prevState) => {
      const updatedSelection = new Set(prevState.selectedQuestions);
      let updatedTime = prevState.selectedQuestionsTime;

      if (isChecked) {
        if (updatedTime + recommendedTime <= tempDuration) {
          updatedSelection.add(questionId);
          updatedTime += recommendedTime;
        } else {
          this.setState({ error: "Questions selection you have made exceeds overall test time limit!" });
          return null;
        }
      } else {
        updatedSelection.delete(questionId);
        updatedTime -= recommendedTime;
      }

      return {
        selectedQuestions: updatedSelection,
        selectedQuestionsTime: updatedTime
      };
    });
  };

  handleSaveTest = async () => {
    this.setState({ loading: true });
    const testId = parseInt(this.props.match.params.id, 10);
    const selectedQuestions = Array.from(this.state.selectedQuestions); // Convert Set to array
    await TestService.addQuestions({ test_id: testId, question_ids: selectedQuestions });
    this.loadData();
    this.setState({ loading: false, error: '' });
  };

  getSectionTimeRange = (questions) => {

    if (questions.length === 0)
      return "";
    else if (questions.length === 1) {
      return `${questions[0].recommended_time} mins`;
    }

    const times = questions.map(q => q.recommended_time);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    return `${minTime} - ${maxTime} mins`;
  };

  handleShowModal = (q = null) => {
    const question = this.findQuestionById(q.id);
    this.setState({ showModal: true, previewQuestion: question });
  };

  findQuestionById = (id) => {
    const { questions } = this.state;

    for (let skill of questions.skills) {
      const foundQuestion = skill.questions.find(q => q.id === id);
      if (foundQuestion) {
        return {
          question: foundQuestion,
          skill: skill.name
        };
      }
    }
  };

  handleCloseModal = () => {
    this.setState({ showModal: false });
  };

  render() {
    const { loading, tempDuration, error, selectedQuestions, showModal, previewQuestion, questions } = this.state;
    const selectedRole = questions.role;

    return (
      <Container fluid>
        {loading && (
          <div className="spinner-overlay">
            <RingLoader color="#36D7B7" size={100} />
          </div>
        )}
        <Card className="p-3">
          <div className="d-flex align-items-center">
            <span className="mr-2">Test duration:</span>
            {this.state.isEditing ? (
              <>
                <input
                  type="number"
                  className="form-control"
                  name="timeDuration"
                  value={tempDuration}
                  onChange={this.handleChange}
                  style={{ width: "100px" }}
                />
                <span className="mr-2">mins</span>
                <CheckCircle className="text-success cursor-pointer mr-2" size={24} onClick={this.handleSave} style={{ cursor: 'pointer' }} />
                <XCircle className="text-danger cursor-pointer" size={24} onClick={this.handleCancel} style={{ cursor: 'pointer' }} />
              </>
            ) : (
              <>
                <span className="font-weight-bold mr-2">{tempDuration} mins</span>
                <Pencil className="text-primary cursor-pointer" size={20} onClick={this.handleEdit} style={{ cursor: 'pointer' }} />
              </>
            )}
          </div>
        </Card>
        {questions.skills && (
          <React.Fragment>
            <h4>Sections({questions.skills.length})</h4>
            <div className="row">
              <div className="col-md-9">
                <Card style={{ padding: "10px" }}>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <Accordion alwaysOpen>
                    {questions.skills.map((skill, idx) => (
                      <Accordion.Item eventKey={String(idx)} key={idx}>
                        <Accordion.Header style={{ margin: '0px' }}>
                          <div className="row">
                            <div className="col-md-10" style={{ textAlign: 'left' }}>
                              {"> "} <img
                                src="https://img.icons8.com/ios-filled/50/000000/puzzle.png"
                                alt="icon"
                                className="mr-2"
                                width="24"
                                height="24"
                              /> <span style={{ fontSize: "20px" }}>{skill.name + " (" + skill.level + ")"}</span>
                            </div>
                            <div className="col-md-2" style={{ fontSize: 'smaller' }}>
                              {this.getSectionTimeRange(skill.questions)}
                            </div>
                          </div>
                        </Accordion.Header>
                        <Accordion.Body style={{ padding: "10px" }}>
                          <table className="table table-bordered table-striped" style={{ fontSize: "0.85rem" }}>
                            <thead className="thead-dark">
                              <tr>
                                <th>
                                  <input
                                    type="checkbox"
                                    onChange={(e) => {
                                      const questionIds = skill.questions.map(q => q.id);
                                      const totalTimeForSkill = skill.questions.reduce(
                                        (sum, q) => sum + (q.recommended_time || 0),
                                        0
                                      );

                                      // Calculate first before setState
                                      const willExceedLimit =
                                        this.state.selectedQuestionsTime + totalTimeForSkill >
                                        this.state.tempDuration;

                                      if (e.target.checked && willExceedLimit) {
                                        // Set error state first
                                        this.setState({
                                          error: "Selecting all questions in this section would exceed the test time limit!"
                                        });
                                        return; // Exit early
                                      }

                                      // Proceed with selection update
                                      this.setState(prevState => {
                                        const newSelectedQuestions = new Set(prevState.selectedQuestions);
                                        const timeChange = e.target.checked ? totalTimeForSkill : -totalTimeForSkill;

                                        if (e.target.checked) {
                                          questionIds.forEach(id => newSelectedQuestions.add(id));
                                        } else {
                                          questionIds.forEach(id => newSelectedQuestions.delete(id));
                                        }

                                        return {
                                          selectedQuestions: newSelectedQuestions,
                                          selectedQuestionsTime: prevState.selectedQuestionsTime + timeChange,
                                          error: null // Clear any previous error
                                        };
                                      });
                                    }}
                                    checked={skill.questions.every(q => this.state.selectedQuestions.has(q.id))}
                                  />
                                  <span className="ml-2">Select All</span>
                                </th>
                                <th>Questions ({skill.questions ? skill.questions.length : ""})</th>
                                <th>Skill</th>
                                <th>Time</th>
                                <th>Score</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {skill.questions.map((q) => (
                                <tr key={q.id}>
                                  <td style={{ width: '120px' }}>
                                    <input
                                      checked={this.state.selectedQuestions.has(q.id)}
                                      type="checkbox"
                                      onChange={(e) => this.handleCheckboxChange(q.id, e.target.checked, q.recommended_time)}
                                    />
                                  </td>
                                  <td style={{ width: '600px' }}>{q.name}</td>
                                  <td>{skill.name + " (" + skill.level + ")"}</td>
                                  <td>{q.recommended_time}</td>
                                  <td>{q.score}</td>
                                  <td>
                                    <i
                                      className="fas fa-info-circle"
                                      onClick={() => this.handleShowModal(q)}
                                      style={{ cursor: 'pointer' }}
                                      title="Preview Question"
                                    ></i>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                  <div className="text-right mt-3">
                    <Button className="btn btn-primary" onClick={this.handleSaveTest}>
                      Save Questions
                    </Button>
                  </div>
                </Card>
              </div>
              <div className="col-md-3">
                <div className="card p-3">
                  Role
                  <b className="mb-3">{selectedRole ? selectedRole.title : ""}</b>
                  <h6 className="font-weight-bold">Core skills <i className="fas fa-info-circle"></i></h6>
                  {questions.skills
                    .filter(skill => skill.is_required)
                    .map(skill => (
                      <div className="mb-2" key={skill.id}>
                        <span className="badge badge-warning text-secondary mr-1 mb-1 py-1 px-2">
                          <i className="fas fa-code-branch mr-1"></i>
                          {skill.name} ({skill.level})
                        </span>
                      </div>
                    ))}
                  <h6 className="font-weight-bold mt-3">Optional skills <i className="fas fa-info-circle"></i></h6>
                  {questions.skills
                    .filter(skill => !skill.is_required)
                    .map(skill => (
                      <div key={skill.id} className="mb-2">
                        <span className="badge badge-secondary text-light mr-1 mb-1 py-1 px-2">
                          <i className="fas fa-lightbulb mr-1"></i>
                          {skill.name} ({skill.level})
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </React.Fragment>
        )}
        {showModal && (
          <div className="modal d-block" tabIndex="-1" style={{ overflowY: 'auto' }}>
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Question</h5>
                  <button className="close" onClick={this.handleCloseModal}>
                    &times;
                  </button>
                </div>

                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <div className="col-md-12">
                    <h3>{previewQuestion.question.name}</h3>

                    {/* Meta Info */}
                    <div className="d-flex justify-content-between align-items-center my-3">
                      <span><strong>Recommended Time:</strong> {previewQuestion.question.recommended_time} min</span>
                      <span><strong>Points:</strong> {previewQuestion.question.score}</span>
                    </div>

                    {/* Skills */}
                    <div className="d-flex justify-content-between mb-3">
                      <span className="badge badge-info p-2">
                        {previewQuestion.question.question_type === "mcq_single" ? "Single Choice" : "Multiple Choice"}
                      </span>
                      <span className="badge badge-warning p-2">
                        Skill: {previewQuestion.skill}
                      </span>
                    </div>

                    {/* Description */}
                    <div dangerouslySetInnerHTML={{ __html: previewQuestion.question.description }} />

                    {/* Choices */}
                    <h4>Answer choices</h4>
                    {previewQuestion.question.choices.map((choice, index) => (
                      <div key={index} style={{ padding: "5px" }}>
                        <input
                          type={previewQuestion.question.question_type === "mcq_single" ? "radio" : "checkbox"}
                          name={`question-${previewQuestion.question.id}`}
                          checked={choice.is_correct}
                          className="form-check-input"
                          disabled
                        />
                        <label className="form-check-label" style={{ paddingLeft: "20px" }}>
                          {choice.choice_text}
                        </label>
                      </div>
                    ))}

                    {/* Guidelines */}
                    <h4>Interviewer Guidelines:</h4>
                    <div dangerouslySetInnerHTML={{ __html: previewQuestion.question.interviewer_guidelines }} />
                  </div>
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
        )}
      </Container>
    );
  }
}

export default withRouter(Questions);
