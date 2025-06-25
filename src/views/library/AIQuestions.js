import React, { Component } from 'react';
import { connect } from "react-redux";
import { Container, Accordion, Form } from "react-bootstrap";
import QuestionService from '../../services/questionService';
import RingLoader from "react-spinners/RingLoader";
import { toast } from "react-toastify";

const mapStateToProps = (state) => ({
    skills: state.skills.skills
  });

class AIQuestions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            skills: ['Select Skill'],
            difficulties: ['Easy', 'Medium', 'Hard'],
            
            selectedSkill: 'Select Skill',
            selectedDifficulty: 'hard',
            selectedQuestionType: 'mcq_single',
            query: '',
            questions: [],
            selectedQuestions: {},
            error: null,
            hasMore: true,
            loading: false,
        };
    }

    handleDropdownChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    handleInputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    validateSelections = () => {
        const { selectedSkill, selectedQuestionType } = this.state;
        return (
            selectedSkill !== 'Select Skill' &&
            selectedQuestionType !== 'Select Question Type'
        );
    };

    fetchQuestions = async(reset = false) => {        

        if (!this.validateSelections()) {
            this.setState({ error: 'Please select all filters before generating questions' });
            return;
        }

        this.setState({ loading: true, error: null });

        const { selectedSkill, selectedDifficulty, selectedQuestionType, questions, query } = this.state;
        const params = {
            skill_id: selectedSkill,
            difficulty: selectedDifficulty,
            question_type: selectedQuestionType,
            user_query: query,
            offset: reset ? 0 : questions.length
        };

        const newQuestions = await QuestionService.getAIQuestions(params);
        this.setState({
            questions: reset ? newQuestions.questions : [...questions, ...newQuestions.questions],
            loading: false,
            hasMore: newQuestions.questions.length > 0
        });

        if (newQuestions.questions.length === 0)
            toast.error("No data found, please try again!");

    };

    handleGenerateClick = () => {
        this.fetchQuestions(true);
    };

    handleLoadMore = () => {
        this.fetchQuestions();
    };

    handleQuestionSelect = (questionId) => (e) => {
        const { selectedQuestions } = this.state;
        const newSelectedQuestions = { ...selectedQuestions };
        
        if (e.target.checked) {
            newSelectedQuestions[questionId] = {
                selected: true,
                score: 5, // Default score
                time: 5   // Default time in minutes
            };
        } else {
            delete newSelectedQuestions[questionId];
        }

        this.setState({ selectedQuestions: newSelectedQuestions });
    };

    handleScoreChange = (questionId) => (e) => {
        const value = parseInt(e.target.value) || 0;
        this.setState(prevState => ({
            selectedQuestions: {
                ...prevState.selectedQuestions,
                [questionId]: {
                    ...prevState.selectedQuestions[questionId],
                    score: value
                }
            }
        }));
    };

    handleTimeChange = (questionId) => (e) => {
        const value = parseInt(e.target.value) || 0;
        this.setState(prevState => ({
            selectedQuestions: {
                ...prevState.selectedQuestions,
                [questionId]: {
                    ...prevState.selectedQuestions[questionId],
                    time: value
                }
            }
        }));
    };

    handleSaveQuestions = async() => {
        const { selectedQuestions, questions, selectedSkill, selectedDifficulty, selectedQuestionType } = this.state;
        const selectedQuestionIds = Object.keys(selectedQuestions).filter(id => selectedQuestions[id].selected);
        
        if (selectedQuestionIds.length === 0) {
            this.setState({ error: 'Please select at least one question to save' });
            return;
        }

        this.setState({ loading: true }); 
        
        const requestData = questions
            .filter(q => selectedQuestionIds.includes(q.question))
            .map(q => ({
                name: q.question,
                description: q.question,
                skills: selectedSkill,
                difficulty: selectedDifficulty,
                question_type: q.question_type,
                score: selectedQuestions[q.question].score,
                recommendedTime: selectedQuestions[q.question].time,
                choices: q.options.map(option => ({
                    choice_text: option.text,
                    is_correct: option.is_correct
                  })),
                interviewer_guidelines: q.explanation
            }));            

            await QuestionService.addBulkQuestions(requestData);

            this.setState(prevState => ({
                questions: prevState.questions.filter(q => !selectedQuestionIds.includes(q.question)),
                selectedQuestions: Object.keys(prevState.selectedQuestions)
                    .filter(id => !selectedQuestionIds.includes(id))
                    .reduce((acc, id) => {
                        acc[id] = prevState.selectedQuestions[id];
                        return acc;
                    }, {}),
                error: null
            }));

            this.setState({ loading: false }); 

            toast.success("Questions Added Successfully!");

    };

    renderOptions = (question, isMultiple) => {
        return question.options.map((option, idx) => (
            <div key={idx} className="mb-2">
                <input
                    className="form-check-input"
                    type={isMultiple ? "checkbox" : "radio"}
                    name={`question-${question.question}`}
                    id={`option-${question.question}-${idx}`}
                    checked={option.is_correct}
                    disabled
                />
                <label className="form-check-label" htmlFor={`option-${question.question}-${idx}`} style={{paddingLeft: '20px'}}>
                    {option.text}
                </label>
            </div>
        ));
    };

    renderQuestionAccordion = (question, index) => {
        const isMultiple = question.options.filter(opt => opt.is_correct).length > 1;
        const isSelected = this.state.selectedQuestions[question.question]?.selected || false;
        const score = this.state.selectedQuestions[question.question]?.score || 5;
        const time = this.state.selectedQuestions[question.question]?.time || 5;
        
        return (
            <div className="d-flex align-items-start mb-2" style={{ gap: '10px' }}>
                <div className="d-flex align-items-center" style={{marginTop: '20px'}}>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={this.handleQuestionSelect(question.question)}
                        style={{ marginTop: '0' }}
                    />
                </div>
                <div className="flex-grow-1">
                    <Accordion>
                        <Accordion.Item eventKey={String(index)}>
                            <Accordion.Header style={{margin: '0px'}}>
                                <div style={{ 
                                    textAlign: 'left',
                                    width: '100%',
                                    paddingLeft: '10px',
                                    fontSize: 'large'
                                }}>
                                    {question.question}
                                </div>
                            </Accordion.Header>
                            <Accordion.Body style={{ padding: "15px" }}>
                                {this.renderOptions(question, isMultiple)}
                                {question.explanation && (
                                    <div className="alert alert-info mt-3">
                                        <strong>Explanation:</strong> {question.explanation}
                                    </div>
                                )}
                                <div className="row mt-3">
                                    <div className="col-md-6">
                                        <Form.Group controlId={`score-${question.question}`}>
                                            <Form.Label>Score</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                value={score}
                                                onChange={this.handleScoreChange(question.question)}
                                            />
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-6">
                                        <Form.Group controlId={`time-${question.question}`}>
                                            <Form.Label>Recommended Time (minutes)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                value={time}
                                                onChange={this.handleTimeChange(question.question)}
                                            />
                                        </Form.Group>
                                    </div>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </div>
            </div>
        );
    };


        // Toggle accordion
        toggleAccordion = (index) => {
            this.setState(prevState => ({
                activeAccordion: prevState.activeAccordion === index ? null : index
            }));
        };

    render() {
        const {
            selectedSkill,
            selectedDifficulty,
            selectedQuestionType,
            questions,
            loading,
            error,
            hasMore,
            query
        } = this.state;

        return (
            <Container fluid>
                {loading && (
                <div className="spinner-overlay">
                    <RingLoader color="#36D7B7" size={100} />
                </div>           
                )}                    
                <div className="card">
                    <div className="card-body">
    <div className="row mb-3">
        <div className="col-md-4">
            <div className="form-group">
                <label htmlFor="skillSelect">Skill</label>
                <select
                    className="form-control"
                    name="selectedSkill"
                    value={selectedSkill}
                    onChange={this.handleDropdownChange}
                    required
                >
                    <option value="">Select Skill</option>
                    {this.props.skills.map(s => (
                        <option key={s.id} value={s.id}>
                            {s.name} ({s.level})
                        </option>
                    ))}
                </select>
            </div>
        </div>

        <div className="col-md-4">
            <div className="form-group">
                <label htmlFor="difficultySelect">Difficulty Level</label>
                <select
                    className="form-control"
                    name="selectedDifficulty"
                    value={selectedDifficulty}
                    onChange={this.handleDropdownChange}
                    required
                >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
            </div>
        </div>

        <div className="col-md-4">
            <div className="form-group">
                <label htmlFor="typeSelect">Question Type</label>
                <select
                    id="typeSelect"
                    className="form-control"
                    name="selectedQuestionType"
                    value={selectedQuestionType}
                    onChange={this.handleDropdownChange}
                >
                    <option value="mcq_single">Single Choice</option>
                    <option value="mcq_multiple">Multiple Choice</option>
                    <option value="both">Both</option>
                </select>
            </div>
        </div>
    </div>

    {/* Second Row: textarea and button */}
    <div className="row">
        <div className="col-md-9">
            <div className="form-group">
                <label htmlFor="queryInput">Query</label>
                <textarea
                    className="form-control"
                    id="queryInput"
                    name="query"
                    value={query}
                    onChange={this.handleInputChange}
                    placeholder="Enter your query"
                    rows={3}
                />
            </div>
        </div>

        <div className="col-md-3 d-flex align-items-end">
            <div className="form-group w-100">
                <button
                    className="btn btn-primary btn-block"
                    onClick={this.handleGenerateClick}
                    disabled={loading}
                >
                    Generate AI Questions
                </button>
            </div>
        </div>
    </div>

                        {error && (
                            <div className="alert alert-danger">
                                {error}
                            </div>
                        )}

                        {questions.length > 0 && (
                            <>
                                <div 
                                    id="questionsAccordion" 
                                    className="mb-3"
                                >
                                    {questions.map((question, index) => 
                                        this.renderQuestionAccordion(question, index)
                                    )}
                                </div>

                                <div className="d-flex justify-content-between">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={this.handleLoadMore}
                                        didissabled={loading || !hasMore}
                                    >
                                        Load More
                                    </button>
                                    {Object.keys(this.state.selectedQuestions).length > 0 && (
                                    <button
                                        className="btn btn-success"
                                        onClick={this.handleSaveQuestions}
                                    >
                                        Save Selected Questions
                                    </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </Container>
        );
    }
}

export default connect(mapStateToProps)(AIQuestions);