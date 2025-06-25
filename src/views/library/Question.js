import React, { Component, Fragment } from "react";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";
import JoditEditor from 'jodit-react';
import { connect } from "react-redux";
import QuestionService from '../../services/questionService';
import { toast } from "react-toastify";

const mapStateToProps = (state) => ({
  skills: state.skills.skills,
  questions: state.questions.questions
});

class Question extends Component {
  constructor(props) {
    super(props);
    this.state = {
      questionId: null,
      questiontype: "mcq_single",
      questionName: "",
      questionDescription: "",
      interviewerGuidelines: "",
      score: '',
      time: '',
      difficulty: 'easy',
      skill: null,
      codingLanguage: 'csharp',
      options: [
        { id: 1, choice_text: "", is_correct: false },
        { id: 2, choice_text: "", is_correct: false },
        { id: 3, choice_text: "", is_correct: false },
        { id: 4, choice_text: "", is_correct: false }
      ],
      submitting: false
    };
    this.editorQD = React.createRef();
    this.editorIG = React.createRef();
  }

  componentDidMount()
  {
    const qid = parseInt(this.props.match.params.id, 10);
    this.setState({questionId: qid});
    
    const existingQuestion = this.props.questions.find(q => q.id === qid);

    if (existingQuestion) {
      this.setState({
        questiontype: existingQuestion.question_type,
        questionName: existingQuestion.name,
        questionDescription: existingQuestion.description,
        interviewerGuidelines: existingQuestion.interviewer_guidelines,
        score: existingQuestion.score,
        time: existingQuestion.recommended_time,
        difficulty: existingQuestion.difficulty,
        options: existingQuestion.choices,
        skill: existingQuestion.skills ? existingQuestion.skills[0].id : "",
        codingLanguage: existingQuestion.coding_language
      });
    }
    
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;
  
    if ((name === "score" || name === "time") && value < 0) {
      return; // don't allow negative
    }
  
    this.setState({ [name]: value });
  };

  handleOptionChange = (id, text) => {
    const options = this.state.options.map(option =>
      option.id === id ? { ...option, choice_text: text } : option
    );
    this.setState({ options });
  };

  handleCorrectChange = (id) => {
    const { questiontype, options } = this.state;
    let updatedOptions;
    
    if (questiontype === "mcq_single") {
      updatedOptions = options.map(option => ({
        ...option,
        is_correct: option.id === id
      }));
    } else {
      updatedOptions = options.map(option =>
        option.id === id ? { ...option, is_correct: !option.is_correct } : option
      );
    }
    this.setState({ options: updatedOptions });
  };

  addOption = () => {
    this.setState((prevState) => ({
      options: [...prevState.options, { id: Date.now(), choice_text: "", is_correct: false }]
    }));
  };

  removeOption = (id) => {
    this.setState((prevState) => ({
      options: prevState.options.filter(option => option.id !== id)
    }));
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ submitting: true});

    const { questionName, questionDescription, questiontype, options, interviewerGuidelines, skill, score, time, difficulty, questionId, codingLanguage } = this.state;
    const selectedOptions = options.filter(option => option.is_correct);
    
    if (questiontype !== "coding" && selectedOptions.length === 0) {
      toast.error("Please select at least one correct answer!");
      return;
    }

    const choices  = options.filter(option => option.choice_text.trim() !== "").map(choice => ({
      choice_text: choice.choice_text,
      is_correct: choice.is_correct
    }));

    const requestData = {
      name: questionName,
      description: questionDescription,
      skills: [parseInt(skill)],
      recommended_time: time,
      score,
      interviewer_guidelines: interviewerGuidelines,
      question_type: questiontype,
      difficulty,
      coding_language: questiontype === "coding" ? codingLanguage : null
    };
    
    if (questionId)
    {
      await QuestionService.updateQuestion(questionId, requestData);
      await QuestionService.addAnswerChoices({question_id: questionId, choices}); 
      toast.success('Question updated successfully!');
    }      
    else
    {
      const qid = await QuestionService.addQuestion(requestData);  
      if (qid > 0)
      {
        await QuestionService.addAnswerChoices({question_id: qid, choices});  
        toast.success('Question added successfully!');
      }        
      else
        return;
    }           

    this.props.history.push("/admin/library");
  };

  render() {
    const { questionName, questionDescription, questiontype, options, interviewerGuidelines, score, time, difficulty, skill, codingLanguage } = this.state;
    const { skills } = this.props;
    const config = {
      askBeforePasteFromWord: false,
      askBeforePasteHTML: false,
      height: 300,
    }

    return (
      <Container fluid>
        <Form onSubmit={this.handleSubmit}>
          <Card>
              <Card.Header>
                <Card.Title as="h4">Problem Details</Card.Title>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3" >
                  <Form.Label>Question Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              type="text"
                              name="questionName"
                              value={questionName}
                              onChange={this.handleInputChange}
                              required
                              maxLength={300}
                            />
                  </Form.Group>

                  <Form.Group className="mb-3" >
                    <Form.Label>Question Description <span className="text-danger">*</span></Form.Label>
                      <JoditEditor
                      name="questionDescription"
                        ref={this.editorQD}
                        value={questionDescription}
                        config={config}
                        tabIndex={1} // tabIndex of textarea
                        onBlur={newContent => this.setState({ questionDescription: newContent })} // preferred to use only this option to update the content for performance reasons
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" >
                        <Form.Label>Skills <span className="text-danger">*</span></Form.Label>
                        <select
                          className="form-control"
                          name="skill"
                          onChange={this.handleInputChange}
                          value={skill}
                          required
                        >
                          <option value="">Select Skill</option>
                          {skills.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.level})
                            </option>
                          ))}
                        </select>
                  </Form.Group>    

                    <Form.Group className="mb-3" >
                        <Form.Label>Difficulty <span className="text-danger">*</span></Form.Label>
                        <select
                          className="form-control"
                          name="difficulty"
                          onChange={this.handleInputChange}
                          value={difficulty}
                          required
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                  </Form.Group>                                    

                  <Form.Group className="mb-3" >
                  <Form.Label>Question Type <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              as="select"
                              name="questiontype"
                              value={questiontype}
                              onChange={this.handleInputChange}
                              required
                            >
                              <option value="mcq_single">Single Correct Answer</option>
                              <option value="mcq_multiple">Multiple Correct Answers</option>
                              <option value="coding">Coding</option>
                            </Form.Control>
                  </Form.Group>
                  {questiontype === "coding" && (
                  <Form.Group className="mb-3" >
                  <Form.Label>Coding Language <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              as="select"
                              name="codingLanguage"
                              value={codingLanguage}
                              onChange={this.handleInputChange}
                              style={{width: '400px'}}
                              required
                            >
                             <option value="plaintext">plaintext</option>
                              <option value="abap">abap</option>
                              <option value="apex">apex</option>
                              <option value="azcli">azcli</option>
                              <option value="bat">bat</option>
                              <option value="bicep">bicep</option>
                              <option value="cameligo">cameligo</option>
                              <option value="clojure">clojure</option>
                              <option value="coffeescript">coffeescript</option>
                              <option value="c">c</option>
                              <option value="cpp">cpp</option>
                              <option value="csharp">csharp</option>
                              <option value="csp">csp</option>
                              <option value="css">css</option>
                              <option value="cypher">cypher</option>
                              <option value="dart">dart</option>
                              <option value="dockerfile">dockerfile</option>
                              <option value="ecl">ecl</option>
                              <option value="elixir">elixir</option>
                              <option value="flow9">flow9</option>
                              <option value="fsharp">fsharp</option>
                              <option value="freemarker2">freemarker2</option>
                              <option value="freemarker2.tag-angle.interpolation-dollar">freemarker2.tag-angle.interpolation-dollar</option>
                              <option value="freemarker2.tag-bracket.interpolation-dollar">freemarker2.tag-bracket.interpolation-dollar</option>
                              <option value="freemarker2.tag-angle.interpolation-bracket">freemarker2.tag-angle.interpolation-bracket</option>
                              <option value="freemarker2.tag-bracket.interpolation-bracket">freemarker2.tag-bracket.interpolation-bracket</option>
                              <option value="freemarker2.tag-auto.interpolation-dollar">freemarker2.tag-auto.interpolation-dollar</option>
                              <option value="freemarker2.tag-auto.interpolation-bracket">freemarker2.tag-auto.interpolation-bracket</option>
                              <option value="go">go</option>
                              <option value="graphql">graphql</option>
                              <option value="handlebars">handlebars</option>
                              <option value="hcl">hcl</option>
                              <option value="html">html</option>
                              <option value="ini">ini</option>
                              <option value="java">java</option>
                              <option value="javascript">javascript</option>
                              <option value="julia">julia</option>
                              <option value="kotlin">kotlin</option>
                              <option value="less">less</option>
                              <option value="lexon">lexon</option>
                              <option value="lua">lua</option>
                              <option value="liquid">liquid</option>
                              <option value="m3">m3</option>
                              <option value="markdown">markdown</option>
                              <option value="mdx">mdx</option>
                              <option value="mips">mips</option>
                              <option value="msdax">msdax</option>
                              <option value="mysql">mysql</option>
                              <option value="objective-c">objective-c</option>
                              <option value="pascal">pascal</option>
                              <option value="pascaligo">pascaligo</option>
                              <option value="perl">perl</option>
                              <option value="pgsql">pgsql</option>
                              <option value="php">php</option>
                              <option value="pla">pla</option>
                              <option value="postiats">postiats</option>
                              <option value="powerquery">powerquery</option>
                              <option value="powershell">powershell</option>
                              <option value="proto">proto</option>
                              <option value="pug">pug</option>
                              <option value="python">python</option>
                              <option value="qsharp">qsharp</option>
                              <option value="r">r</option>
                              <option value="razor">razor</option>
                              <option value="redis">redis</option>
                              <option value="redshift">redshift</option>
                              <option value="restructuredtext">restructuredtext</option>
                              <option value="ruby">ruby</option>
                              <option value="rust">rust</option>
                              <option value="sb">sb</option>
                              <option value="scala">scala</option>
                              <option value="scheme">scheme</option>
                              <option value="scss">scss</option>
                              <option value="shell">shell</option>
                              <option value="sol">sol</option>
                              <option value="aes">aes</option>
                              <option value="sparql">sparql</option>
                              <option value="sql">sql</option>
                              <option value="st">st</option>
                              <option value="swift">swift</option>
                              <option value="systemverilog">systemverilog</option>
                              <option value="verilog">verilog</option>
                              <option value="tcl">tcl</option>
                              <option value="twig">twig</option>
                              <option value="typescript">typescript</option>
                              <option value="typespec">typespec</option>
                              <option value="vb">vb</option>
                              <option value="wgsl">wgsl</option>
                              <option value="xml">xml</option>
                              <option value="yaml">yaml</option>
                              <option value="json">json</option>
                            </Form.Control>
                  </Form.Group>
                  )}
                  {questiontype !== 'coding' && (
                    <>
                      <Form.Group className="mb-3" >
                        <Form.Label>Options <span className="text-danger">*</span></Form.Label>
                                  {options.map((option, index) => (
                              <Row key={option.id} className="align-items-center mb-2">
                              <Col xs="auto" className="pr-2">
                                {questiontype === "mcq_single" ? (
                                  <input
                                    type="radio"
                                    name="correctOption"
                                    checked={option.is_correct}
                                    onChange={() => this.handleCorrectChange(option.id)}
                                  />
                                ) : (
                                  <input
                                    type="checkbox"
                                    checked={option.is_correct}
                                    onChange={() => this.handleCorrectChange(option.id)}
                                  />
                                )}
                              </Col>
                              <Col>
                                <Form.Control
                                  type="text"
                                  value={option.choice_text}
                                  onChange={(e) => this.handleOptionChange(option.id, e.target.value)}
                                  required
                                />
                              </Col>
                              <Col xs="auto">
                                <Button variant="danger" onClick={() => this.removeOption(option.id)}>Delete</Button>
                              </Col>
                            </Row>
                                  ))}
                      </Form.Group>
                      <Form.Group className="mb-3" >
                          <Button variant="secondary" onClick={this.addOption} className="mb-3">Add Another Choice</Button>
                      </Form.Group>                     
                    </>
                  )}                            
              </Card.Body>
          </Card> 
          <Card>
              <Card.Header>
                <Card.Title as="h4">Question Properties</Card.Title>
              </Card.Header>
              <Card.Body>
                    <Row>
                      <Col md={2}>
                        <Form.Group className="mb-3" >
                          <Form.Label>Score <span className="text-danger">*</span></Form.Label>
                              <Form.Control
                                type="number"
                                name="score"
                                value={score}
                                onChange={this.handleInputChange}
                                placeholder="scores"
                                required
                                onKeyDown={(e) => {
                                  if (["e", "E", ".", "-"].includes(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                              />
                         </Form.Group>                              
                      </Col>
                      <Col md={2}>
                        <Form.Group className="mb-3" >
                          <Form.Label>Recommended Time <span className="text-danger">*</span></Form.Label>
                              <Form.Control
                                type="number"
                                name="time"
                                value={time}
                                onChange={this.handleInputChange}
                                placeholder="mins"
                                required
                                onKeyDown={(e) => {
                                  if (["e", "E", ".", "-"].includes(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                              />
                         </Form.Group>                        
                      </Col>
                    </Row>
              </Card.Body>                          
          </Card>
          <Card>
              <Card.Header>
                <Card.Title as="h4">Interviewer Guidlines(Optional)</Card.Title>
                Notes are not shown to the candidate. They are visible to you and your team members in this section as well as in the candidate report.
              </Card.Header>
              <Card.Body>
                <br></br>
              <Form.Group className="mb-3" >
                      <JoditEditor
                        name="interviewerGuidelines"
                        ref={this.editorIG}
                        value={interviewerGuidelines}
                        config={config}
                        tabIndex={1} // tabIndex of textarea
                        onBlur={newContent => this.setState({ interviewerGuidelines: newContent })} // preferred to use only this option to update the content for performance reasons
                        required
                      />
                    </Form.Group>
              </Card.Body>                          
          </Card>      
          <Form.Group className="mb-3 text-right" >
              <Button variant="primary" type="submit">Save Question</Button>
          </Form.Group>     
        </Form>
      </Container>
    );
  }
}

export default connect(mapStateToProps)(Question);
