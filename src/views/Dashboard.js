import React from "react";
import {
  Card,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import DashboardService from '../services/dashboardService';
import ReactApexChart from 'react-apexcharts';

class Dashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      invitesLast7Days: 0,
      passedLast7Days: 0,
      failedLast7Days: 0,
      unattemptedLast7Days: 0,
      percentages: 0,
      barChartSeries: [],
      barChartOptions: {
        chart: {
          type: 'bar',
          height: 350,
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            borderRadius: 5,
            borderRadiusApplication: 'end',
          },
        },
        colors: [
          "#00E396", // green
          "#FF4560", // red
          "#FEB019", // blue
        ],
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent'],
        },
        xaxis: {
          categories: [],
        },
        yaxis: {
          labels: {
            formatter: function (val) {
              return Math.floor(val); // or use Math.round(val) if preferred
            }
          }
        },
        fill: {
          opacity: 1,
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val;
            },
          },
        },
      },
      pieChartSeries: [],
      pieChartOptions: {
        chart: {
          type: 'donut',
        },
        colors: [
          "#00E396", // green
          "#FF4560", // red
          "#FEB019", // blue
        ],
        tooltip: {
          y: {
            formatter: function (val) {
              return val + '%';
            },
          },
        },
        labels: ['Passed', 'Failed', 'Unattempted'],
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200,
              },
              legend: {
                position: 'bottom',
              },
            },
          },
        ],
      }
    };
  }

    componentDidMount() {    
      this.loadData();
    }
  
    loadData = async () => {

        const stats = await DashboardService.fetchStats();
        const categories = stats.daily_breakdown.map(item => item.name);
        const passed = stats.daily_breakdown.map(item => item.passed);
        const failed = stats.daily_breakdown.map(item => item.failed);
        const unattempted = stats.daily_breakdown.map(item => item.unattempted);

        this.setState({ percentages: stats.percentages, invitesLast7Days: stats.invites_last_7d, 
          passedLast7Days: stats.passed_last_7d, failedLast7Days: stats.failed_last_7d,unattemptedLast7Days: stats.unattempted_last_7d,
          barChartSeries: [
            { name: 'Passed', data: passed },
            { name: 'Failed', data: failed },
            { name: 'Unattempted', data: unattempted }
          ],
          barChartOptions: {
            xaxis: {
              categories
            }
          },
          pieChartSeries: [stats.percentages.passed, stats.percentages.failed, stats.percentages.unattempted]
        }
        );
      
    };

    render() {

      const { invitesLast7Days, passedLast7Days, failedLast7Days, unattemptedLast7Days, barChartSeries, barChartOptions, pieChartSeries, pieChartOptions } = this.state;

      return (
        <Container fluid>
        <Row>
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-chart text-warning"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Invites</p>                      
                      <Card.Title as="h4">{invitesLast7Days }</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <div className="stats">
                  <i className="fas fa-redo mr-1"></i>
                  Last 7 days
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-light-3 text-success"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Passed</p>
                      <Card.Title as="h4">{passedLast7Days }</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <div className="stats">
                  <i className="far fa-calendar-alt mr-1"></i>
                  Last 7 days
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-vector text-danger"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Failed</p>
                      <Card.Title as="h4">{failedLast7Days }</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <div className="stats">
                  <i className="far fa-clock-o mr-1"></i>
                  Last 7 days
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-support-17 text-primary"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Unattempted</p>
                      <Card.Title as="h4">{unattemptedLast7Days}</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <div className="stats">
                  <i className="fas fa-redo mr-1"></i>
                  Last 7 days
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md="8">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Results</Card.Title>
                <p className="card-category">Last 7 days</p>
              </Card.Header>
              <Card.Body>
              <div id="chart">
              <ReactApexChart
            options={barChartOptions}
            series={barChartSeries}
            type="bar"
            height={350}
          />
        </div>
              </Card.Body>
              <Card.Footer>

              </Card.Footer>
            </Card>
          </Col>
          <Col md="4">
  <Card>
    <Card.Header>
      <Card.Title as="h4">Invite Statistics</Card.Title>
    </Card.Header>
    <Card.Body>
        <React.Fragment>
        <div id="chart">
        <ReactApexChart
            options={pieChartOptions}
            series={pieChartSeries}
            type="donut"
          />
              </div>
        </React.Fragment>
    </Card.Body>
  </Card>
</Col>
        </Row>
      </Container>
      );
    }
  }

export default Dashboard;
