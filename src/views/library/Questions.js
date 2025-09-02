import React, { Component } from "react";
import { Container, Card } from "react-bootstrap";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { questionTypeLabels } from "../../common.js"

const mapStateToProps = (state) => ({
  questions: state.questions.questions
});

class Questions extends Component {
  state = {
    selectedQuestionId: null,
    skillQuestions: [],
    answers: {}
  };

  handleQuestionClick = (id) => {
    this.setState({ selectedQuestionId: id });
  };

  componentDidMount()
  {
    const questionId = parseInt(this.props.match.params.id, 10);
    const { questions }  = this.props;

    const selectedQuestion = questions.find(q => q.id === questionId);

    if (selectedQuestion && selectedQuestion.skills && selectedQuestion.skills.length > 0) {
      const selectedSkillId = selectedQuestion.skills[0].id;

      // Filter all questions that have this skill ID
      const filtered = questions.filter(q =>
        q.skills.some(skill => skill.id === selectedSkillId)
      );

      this.setState({ skillQuestions: filtered });
    }

    this.setState({selectedQuestionId: questionId});
  }
  

  render() {
    const { questions } = this.props;
    const { selectedQuestionId, skillQuestions, question_type } = this.state;
    const selectedQuestion = skillQuestions.find(q => q.id === selectedQuestionId) || questions[0];

    return (
      <Container fluid>
        <Card className="p-3" style={{ minHeight: "750px" }}>
          <div className="row">
            {/* Left Panel: Question List */}
            <div className="col-md-4" style={{ minHeight: "400px", overflowY: "auto" }}>
              <ul className="list-group" style={{ border: "1px solid rgba(0,0,0,.125)", borderRadius: "5px" }}>
              {skillQuestions.map(q => {
                  const badgeClass = {
                    easy: "badge-success",
                    medium: "badge-warning",
                    hard: "badge-danger",
                  }[q.difficulty] || "badge-secondary";

                  return (
                    <li
                      key={q.id}
                      className={`list-group-item ${selectedQuestionId === q.id ? "active" : ""}`}
                      onClick={() => this.handleQuestionClick(q.id)}
                      style={{ cursor: "pointer", borderBottom: "solid 1px lightgray" }}
                    >
                      <b>{q.name}</b> 
                      <span className={`badge ${badgeClass} p-2`}>{q.difficulty}</span>
                      <p>{questionTypeLabels[q.question_type]}</p>
                      <p>{q.recommended_time} mins</p>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Right Panel: Question Details */}
            <div className="col-md-8">
              <h3>{selectedQuestion.name}
                <div className="text-right">
                  <Link to={`/admin/library/editquestion/${selectedQuestionId}`} className="btn btn-sm btn-warning mr-2">Edit</Link>
                </div>
              </h3>
              
              {/* Meta Info */}
              <div className="d-flex justify-content-between align-items-center my-3">
                <span><strong>Recommended Time:</strong> {selectedQuestion.recommended_time} min</span>
                <span><strong>Points:</strong> {selectedQuestion.score}</span>
              </div>

              {/* Skills */}
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="badge badge-info p-2">
                    {questionTypeLabels[selectedQuestion.question_type]}
                  </span>
                  {selectedQuestion.question_type === "coding" && (
                    <span className="badge badge-secondary p-2">
                      {selectedQuestion.coding_language}
                    </span>
                  )}
                </div>

                {selectedQuestion.skills.length > 0 && (
                  <span className="badge badge-warning p-2 mt-2 mt-md-0">
                    Skill: {selectedQuestion.skills.map(s => s.name).join(", ")}
                  </span>
                )}
              </div>

              {/* Description */}
              <div dangerouslySetInnerHTML={{ __html: selectedQuestion.description }} />

              {/* Choices */}
              {selectedQuestion.question_type !== "coding" && (
                <>
                  <h4>Answer choices</h4>
                  {selectedQuestion.choices.map((choice, index) => (
                    <div key={index} style={{ padding: "5px" }}>
                      <input
                        type={selectedQuestion.question_type === "mcq_single" ? "radio" : "checkbox"}
                        name={`question-${selectedQuestion.id}`}
                        checked={choice.is_correct}
                        className="form-check-input"
                        disabled
                      />
                      <label className="form-check-label" style={{ paddingLeft: "20px" }}>
                        {choice.choice_text}
                      </label>
                    </div>
                  ))}                
                </>
              )}
                <h4>Interviewer Guidelines:</h4>
                <div dangerouslySetInnerHTML={{ __html: selectedQuestion.interviewer_guidelines }} />
            </div>
          </div>
        </Card>
      </Container>
    );
  }
}

export default connect(mapStateToProps)(Questions);