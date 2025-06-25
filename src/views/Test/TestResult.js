import React, { Component } from 'react';
import InviteService from "services/testInviteService";
import RingLoader from "react-spinners/RingLoader";
import Sidebar from "../../components/Sidebar.js";
import ReactApexChart from 'react-apexcharts';
import {
  Card,
} from "react-bootstrap";
import MonacoEditor from "@monaco-editor/react";

class TestResults extends Component {
  constructor(props) {
    super(props);
    this.state = {
      testData: [],
      activeSkills: this.props.testData?.skills.map(skill => skill.id) || [],
      isPrintMode: false,
      loading: false,
      currentQuestion: null,
      barChartSeries: [{
        data: [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380]
      }],
      barChartOptions: {
        chart: {
          type: 'bar',
          height: 380
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + '%';
            },
          },
        },
        plotOptions: {
          bar: {
            barHeight: '100%',
            distributed: true, // This makes each bar a different color
            horizontal: true,
            dataLabels: {
              position: 'center'
            },
          }
        },
        colors: ['#00E396', '#FF4560', '#FEB019', '#13d8aa', '#A5978B',
          '#2b908f', '#f9a3a4', '#90ee7e', '#f48024', '#69d2e7'],
        dataLabels: {
          enabled: true,
          textAnchor: 'start',
          style: {
            colors: ['#fff']
          },
          formatter: function (val, opt) {
            return "  " + val + "%";
          },
          offsetX: 0,
          dropShadow: {
            enabled: true
          }
        },
      },
      trustScore: 0,
      violations: null,
      screenshots: []
    };
    this.sidebarRef = React.createRef();
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = async () => {
    this.setState({ loading: true });
    const testResult = await InviteService.GetTestResult(this.props.inviteId);
    const proctoringSummary = await InviteService.getTestVoilations(this.props.inviteId);
    this.setState({ testData: testResult, loading: false, violations: proctoringSummary.violations[0], screenshots: proctoringSummary.screenshots });

    if (testResult?.skills) {
      // Create an array of { name, percentage } pairs
      const skillsWithPercentages = testResult.skills.map(skill => ({
        name: skill.name,
        percentage: skill.percentage,
        id: skill.id
      }));

      // Sort by percentage in descending order
      const sortedSkills = [...skillsWithPercentages].sort((a, b) => b.percentage - a.percentage);

      // Extract sorted arrays
      const skills = sortedSkills.map(skill => skill.name);
      const percentages = sortedSkills.map(skill => skill.percentage);
      const skillIds = sortedSkills.map(skill => skill.id);

      this.setState({
        activeSkills: skillIds,
        barChartSeries: [
          { name: '', data: percentages },
        ],
        barChartOptions: {
          ...this.state.barChartOptions,
          xaxis: {
            categories: skills
          },
          dataLabels: {
            ...this.state.barChartOptions.dataLabels,
            formatter: function (val, opt) {
              return " " + val + "%";
            }
          }
        }
      });
    }

    this.calculateTrustScore(proctoringSummary.violations[0]);
  };

  calculateTrustScore = (violations) => {

    let score = 100;

    if (violations)
    {
    // 1. Face not detected
    score -= violations.face_detect_count * 0.5; // Deduct 0.5% per interval face wasn't detected

    // 2. Tab switches
    score -= violations.tab_switch_count * 2;

    // 3. Noise detection
    if (violations.noise_detected_count) score -= 5;

    // 4. Multiple monitors
    if (violations.multiple_monitors) score -= 15;

    // 5. Multiple faces
    if (violations.multiple_faces) score -= 20;

    // 6. Exit full screen
    score -= violations.exited_fullscreen_count * 5;

    //7. Stopped screen share
    score -= violations.screen_share_stopped * 5

    score -= violations.webcam_stopped_count * 5    

    score -= violations.microphone_disabled_count * 5    

    // Clamp score to 0-100
    if (score < 0) score = 0;
    if (score > 100) score = 100;

    this.setState({ trustScore: Math.round(score) });
    }   
  };

  renderMetricCard(title, value) {
    return (
      <div className='col-md-6'>
        <Card className="card-stats text-center">
          <Card.Body style={{ color: 'dimgray' }}>
            <b>{title}</b><br></br>
            {value}
          </Card.Body>
          <Card.Footer>
          </Card.Footer>
        </Card>
      </div>
    );
  }

  toggleSkill = (skillId) => {
    this.setState(prevState => {
      if (prevState.activeSkills.includes(skillId)) {
        return { activeSkills: prevState.activeSkills.filter(id => id !== skillId) };
      } else {
        return { activeSkills: [...prevState.activeSkills, skillId] };
      }
    });
  };

  toggleAllSkills = () => {
    const { testData } = this.state;
    if (this.state.activeSkills.length === testData.skills.length) {
      // If all are open, close all
      this.setState({ activeSkills: [] });
    } else {
      // Otherwise open all
      this.setState({ activeSkills: testData.skills.map(skill => skill.id) });
    }
  };

  togglePrintMode = () => {
    this.setState(prevState => ({
      isPrintMode: !prevState.isPrintMode
    }));
  };

  getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'passed': return 'badge-success';
      case 'failed': return 'badge-danger';
      case 'evaluate': return 'badge-warning';
      default: return 'badge-secondary';
    }
  };

  getScoreClass = (percentage) => {
    if (percentage >= 75) return 'text-success';
    if (percentage >= 50) return 'text-warning';
    return 'text-danger';
  };

  openSidebar = (question, showTestResult) => {
    this.setState({ currentQuestion: question, showTestResult });
    this.sidebarRef.current.openSidebar();
  };

  render() {
    const { testData, activeSkills, isPrintMode, loading, currentQuestion, barChartSeries, barChartOptions, showTestResult, screenshots, violations } = this.state;
    const { candidate, status, score_summary, skills } = testData;
    const questionTypeLabels = {
      mcq_single: "Single Choice",
      mcq_multiple: "Multiple Choice",
      coding: "Coding"
    };

    return (

      <div className={`container-fluid py-4 ${isPrintMode ? 'print-mode' : ''}`}>
        {loading && (
          <div className="spinner-overlay">
            <RingLoader color="#36D7B7" size={100} />
          </div>
        )}
        {candidate && (
          <React.Fragment>
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white border-bottom-0">
                <div className='row'>
                  <div className="col-md-5">
                    <h3>{testData.test_name}</h3>
                    <h1 className="h4 mb-1">{candidate.name}</h1>
                    <span className={`badge ${this.getStatusClass(status)}`}>
                      {status}
                    </span>
                    {violations && (
                      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px', cursor: 'pointer' }}>
                        <div class="trust-score-badge" onClick={() => this.openSidebar(null, false)}>
                          <div class="score">{this.state.trustScore}%</div>
                          <div class="trust-label">Trust Score</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className='col-md-7'>
                    <div id="chart">
                      <ReactApexChart options={barChartOptions} series={barChartSeries} type="bar" height={350} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h2 className="h5 mb-3">Performance</h2>
                    <div className="d-flex">
                      <div>
                        <span className="text-muted small">Submitted At</span>
                        <div className="font-weight-bold">
                          {new Date(testData.submitted_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h2 className="h5 mb-3">Score Distribution</h2>
                    <div className={`h4 ${this.getScoreClass(score_summary.percentage)}`}>
                      {score_summary.total_score}/{score_summary.total_possible} ({score_summary.percentage.toFixed(1)}%)
                    </div>
                    <div className="progress mt-2" style={{ height: '8px' }}>
                      <div
                        className={`progress-bar ${this.getScoreClass(score_summary.percentage).replace('text-', 'bg-')}`}
                        role="progressbar"
                        style={{ width: `${score_summary.percentage}%` }}
                        aria-valuenow={score_summary.percentage}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                </div>
                <hr className="my-4" />
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="h5 mb-0">Questions</h2>
                  <div>
                    <button
                      className="btn btn-sm btn-outline-secondary mr-2"
                      onClick={this.toggleAllSkills}
                    >
                      {activeSkills.length === skills.length ? 'Collapse All' : 'Expand All'}
                    </button>
                  </div>
                </div>
                {skills.map((skill, skillIndex) => (
                  <div key={skill.id} className="mb-4">
                    <div className={`card ${activeSkills.includes(skill.id) ? 'border-primary' : ''}`}>
                      <div
                        className="card-header bg-light d-flex justify-content-between align-items-center"
                        onClick={() => this.toggleSkill(skill.id)}
                        style={{ cursor: 'pointer', paddingTop: '0px', paddingBottom: '15px' }}
                      >
                        <div>
                          <h3 className="h6 mb-0">
                            {skill.name} ({skill.level})
                          </h3>
                        </div>
                        <div className={`font-weight-bold ${this.getScoreClass(skill.percentage)}`}>
                          {skill.achieved_score}/{skill.total_score}
                        </div>
                      </div>

                      {activeSkills.includes(skill.id) && (
                        <div className="card-body p-0">
                          <div className="table-responsive">
                            <table className="table table-hover mb-0">
                              <thead className="thead-light">
                                <tr>
                                  <th width="5%">No.</th>
                                  <th width="45%">Name</th>
                                  <th width="20%">Skills</th>
                                  <th width="15%">Score</th>
                                  <th width="15%">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {skill.questions.map((question, qIndex) => (
                                  <tr key={question.id} onClick={() => this.openSidebar(question, true)} style={{ cursor: 'pointer' }}>
                                    <td>{qIndex + 1}</td>
                                    <td>{question.name}</td>
                                    <td>{skill.name} {skill.level}</td>
                                    <td>
                                      <span className={question.is_correct ? 'text-success' : 'text-danger'}>
                                        {question.achieved_score}/{question.score}
                                      </span>
                                    </td>
                                    <td>
                                      {question.is_correct ? (
                                        <span className="text-success">✓</span>
                                      ) : (
                                        <span className="text-danger">✗</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Sidebar
              ref={this.sidebarRef}
              title={showTestResult ? currentQuestion ? currentQuestion.name : "" : "Proctoring Summary"}
              width={600}
              onClose={() => console.log('Sidebar closed')}
            >
              {showTestResult && currentQuestion && (
                <div className="card shadow-lg border-0 question-card" style={{ minHeight: '600px' }}>
                  <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                    <span
                      className={`badge badge-pill px-3 py-2 ${currentQuestion.is_correct ? 'badge-success' : 'badge-danger'
                        }`}
                    >
                      {currentQuestion.is_correct ? 'Correct' : 'Incorrect'}
                    </span>
                  <span className="badge badge-secondary p-2">
                      {questionTypeLabels[currentQuestion.type]}
                    </span>                    
                  </div>

                  <div className="card-body">
                    <div className="question-description mb-4" dangerouslySetInnerHTML={{ __html: currentQuestion.description }} />
                    {currentQuestion.type !== 'coding' ? (
                    <fieldset disabled>
                      <div className="options-container">
                        {currentQuestion.all_choices.map(option => (
                          <div key={option.id} className="option-item mb-3" style={{ backgroundColor: option.is_correct ? '#28a745' : '' }}>
                            {currentQuestion.type === 'mcq_single' ? (
                              <div className="custom-control custom-radio">
                                <input
                                  type="radio"
                                  id={`option-${currentQuestion.id}-${option.id}`}
                                  name={`question-${currentQuestion.id}`}
                                  className="custom-control-input"
                                  checked={currentQuestion.selected_choices.map(choice => choice.id).includes(option.id)}
                                />
                                <label className="custom-control-label" style={{ color: option.is_correct ? '#FFFFFF' : '#6c757d' }} htmlFor={`option-${currentQuestion.id}-${option.id}`}>
                                  {option.text}
                                </label>
                              </div>
                            ) : (
                              <div className="custom-control custom-checkbox">
                                <input
                                  type="checkbox"
                                  id={`option-${currentQuestion.id}-${option.id}`}
                                  className="custom-control-input"
                                  checked={currentQuestion.selected_choices.map(choice => choice.id).includes(option.id)}
                                />
                                <label className="custom-control-label" style={{ color: option.is_correct ? '#FFFFFF' : '#6c757d' }} htmlFor={`option-${currentQuestion.id}-${option.id}`}>
                                  {option.text}
                                </label>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </fieldset>
                    ) : (
                          <MonacoEditor
                            height="400px"
                            defaultLanguage={'csharp'}
                            defaultValue="// Start coding here"
                            value={currentQuestion.response_text}
                            theme="vs-dark"
                          />
                    )}
                  </div>
                </div>
              )}
              {!showTestResult && (
                <div>
                  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                    <div className="text-center">
                      <div
                        className="trust-score-badge"
                      >
                        <div className="score">{this.state.trustScore}%</div>
                        <div className="trust-label">Trust Score</div>
                      </div>
                    </div>
                  </div>
                  {violations && (
                    <div className="row">
                      {this.renderMetricCard('NO FACE DETECTED', violations ? violations.face_detect_count : 0)}
                      {this.renderMetricCard('TAB SWITCHED', violations.tab_switch_count)}
                      {this.renderMetricCard('NOISE DETECTED', violations.noise_detected_count)}
                      {this.renderMetricCard('MULTIPLE MONITORS', violations.multiple_monitors ? 'Yes' : 'No')}
                      {this.renderMetricCard('MULTIPLE FACES', violations.multiple_faces ? 'Yes' : 'No')}
                      {this.renderMetricCard('EXITED FULL SCREEN', violations.exited_fullscreen_count)}
                      {this.renderMetricCard('STOPPED SCREEN SHARE', violations.screen_share_stopped  ? 'Yes' : 'No')}
                      {this.renderMetricCard('STOPPED WEB CAM', violations.webcam_stopped_count)}
                      {this.renderMetricCard('MICROPHONE DISABLED', violations.microphone_disabled_count)}
                      {this.renderMetricCard('BROWSER', violations.browser_info)}
                    </div>                    
                  )}
                  {screenshots && screenshots.length > 0 && (
                    <>
                  <hr />
                  <h5 className="mt-5 mb-3">Random Screenshots</h5>
                  <div>
                    {screenshots.map((shot, index) => (
                      <div key={index} className="row align-items-center mb-4">
                        <div className="col-6">
                          <div className="image-hover-container position-relative">
                            <img
                              src={shot.url}
                              className="img-fluid"
                              alt={`Screenshot ${index + 1}`}
                              style={{ maxHeight: '100px', objectFit: 'cover' }}
                            />
                            <img
                              src={shot.url}
                              className="hover-image"
                              alt={`Full Screenshot ${index + 1}`}
                            />
                          </div>
                        </div>
                        <div className="col-6">
                          <p className="text-center mb-0">{new Date(shot.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>                    
                    </>
                  )}
                </div>
              )}
            </Sidebar>
          </React.Fragment>
        )}

        <style jsx>{`
              .print-mode {
                max-width: 1200px;
                margin: 0 auto;
              }
              .card {
                transition: all 0.3s ease;
              }
              .card:hover {
                box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
              }
              .table th {
                border-top: none;
              }
              @media print {
                .no-print {
                  display: none;
                }
                body {
                  background: white;
                }
                .container-fluid {
                  padding: 0;
                }
                .card {
                  border: none;
                  box-shadow: none;
                }
              }
            `}</style>
      </div>
    );
  }
}

export default TestResults;