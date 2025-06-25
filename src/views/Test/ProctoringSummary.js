import React, { Component } from 'react';
import {
    Card,
    Container,
    Row,
    Col,
} from "react-bootstrap";

class ProctoringSummary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            faceNotDetectedCount: 10,    // Number of intervals face was NOT detected
            tabSwitchCount: 3,
            noiseDetected: true,
            multipleMonitors: false,
            multipleFaces: true,
            exitFullScreenCount: 2,
            trustScore: 100,
            };        
    }

    componentDidMount() {
        this.calculateTrustScore();
    }

    calculateTrustScore = () => {
        const {
        faceNotDetectedCount,
        tabSwitchCount,
        noiseDetected,
        multipleMonitors,
        multipleFaces,
        exitFullScreenCount,
        } = this.state;

        let score = 100;

        // 1. Face not detected
        score -= faceNotDetectedCount * 0.5; // Deduct 0.5% per interval face wasn't detected

        // 2. Tab switches
        score -= tabSwitchCount * 2;

        // 3. Noise detection
        if (noiseDetected) score -= 5;

        // 4. Multiple monitors
        if (multipleMonitors) score -= 15;

        // 5. Multiple faces
        if (multipleFaces) score -= 20;

        // 6. Exit full screen
        score -= exitFullScreenCount * 5;

        // Clamp score to 0-100
        if (score < 0) score = 0;
        if (score > 100) score = 100;

        this.setState({ trustScore: Math.round(score) });
    };    

    render() {

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
                                            <Card.Title as="h4"></Card.Title>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                            <Card.Footer>
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
                                            <Card.Title as="h4"></Card.Title>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                            <Card.Footer>
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default ProctoringSummary;