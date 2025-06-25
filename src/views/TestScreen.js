import React, { Component } from 'react';
import { Modal, Button, ProgressBar, Form } from 'react-bootstrap';

class TestScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1, // Current step in the process
      showModal: true,
      cameras: [],
      selectedCamera: null,
      screenSources: [],
      selectedScreen: null,
      hasMultipleMonitors: false,
      videoStream: null,
      screenStream: null,
      showFullScreenExitWarning: false
    };
    this.videoRef = React.createRef();
    this.screenRef = React.createRef();
  }

  componentDidMount() {
    this.detectCameras();
        // Listen for fullscreen change
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    // Listen for keydown events
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    this.stopStreams();
      document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    window.removeEventListener('keydown', this.handleKeyDown);
  }

   handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      this.setState({ showFullScreenExitWarning: true });
    }
  };

  handleKeyDown = (event) => {
    // Detect F11 or Escape key
    if (event.key === 'F11' || event.key === 'Escape') {
      this.setState({ showFullScreenExitWarning: true });
    }
  };

  stopStreams = () => {
    if (this.state.videoStream) {
      this.state.videoStream.getTracks().forEach(track => track.stop());
    }
    if (this.state.screenStream) {
      this.state.screenStream.getTracks().forEach(track => track.stop());
    }
  };

  detectCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      this.setState({ cameras });

      if (cameras.length === 1) {
        this.setState({ selectedCamera: cameras[0].deviceId });
      }
    } catch (error) {
      console.error('Error detecting cameras:', error);
    }
  };

  startCameraPreview = async () => {
    try {
      if (this.state.selectedCamera) {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: this.state.selectedCamera },
          });
        
        this.setState({ videoStream: stream, step: 3 });
      }
    } catch (error) {
      console.error('Error starting camera:', error);
    }
  };

  requestScreenShare = async () => {
    try {
      // Note: This API may differ based on your Electron version or browser extensions
      const sources = await window.electron?.desktopCapturer.getSources({
        types: ['screen', 'window']
      });
      
      if (sources) {
        this.setState({ screenSources: sources, step: 4 });
      } else {
        // Fallback for browser implementation
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });    
        
        this.setState({ screenStream: stream, step: 5 });
      }
    } catch (error) {
      console.error('Error requesting screen share:', error);
    }
  };

  selectScreen = async (sourceId) => {
    try {
      const constraints = {
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId
          }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      this.setState({ 
        selectedScreen: sourceId,
        screenStream: stream,
        step: 5 
      });
    } catch (error) {
      console.error('Error selecting screen:', error);
    }
  };

  checkMonitorCount = () => {
    
    if (this.state.monitorCount > 1) {
      this.setState({ step: 6 }); // Show multi-monitor warning
    } else {
      this.setState({ step: 7 }); // Skip to fullscreen prompt
    }
  };

  enterFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
    this.setState({ step: 8 });
    //this.props.history.push(`/take-test/130`);
  };

  handleNext = () => {
    switch (this.state.step) {
      case 1:
        if (this.state.cameras.length > 1) {
          this.setState({ step: 2 });
        } else {
          this.startCameraPreview();
        }
        break;
      case 2:
        this.startCameraPreview();
        break;
      case 3:
        this.requestScreenShare();
        break;
      case 4:
        // Screen already selected via selectScreen
        break;
      case 5:
        this.checkMonitorCount();
        break;
      case 6:
        case 7:
        this.setState({ step: 7 });
        break;
      default:
        break;
    }
  };

  handleCameraChange = (e) => {
    this.setState({ selectedCamera: e.target.value });
  };

  handleScreenChange = (e) => {
    this.selectScreen(e.target.value);
  };

  renderModalContent() {
    const { step, cameras, selectedCamera, screenSources, hasMultipleMonitors, videoStream, screenStream } = this.state;

    switch (step) {
      case 1:
        return (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Webcam Access</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Please allow access to your webcam to continue with the test.</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={this.handleNext}>
                Next
              </Button>
            </Modal.Footer>
          </>
        );
      case 2:
        return (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Select Webcam</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>We detected {cameras.length} cameras. Please select one to continue.</p>
              <Form.Select onChange={this.handleCameraChange} value={selectedCamera || ''}>
                <option value="">Select a camera</option>
                {cameras.map(camera => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </Form.Select>
            </Modal.Body>
            <Modal.Footer>
              <Button 
                variant="primary" 
                onClick={this.handleNext}
                disabled={!selectedCamera}
              >
                Next
              </Button>
            </Modal.Footer>
          </>
        );
      case 3:
        return (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Camera Preview</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>This is how you'll appear during the test:</p>
              <video
            autoPlay
            playsInline
            ref={video => {
              if (video && videoStream) {
                video.srcObject = videoStream;
              }
            }}
            style={{ width: "100%", maxWidth: "500px", border: "2px solid #ccc", borderRadius: "10px" }}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={this.handleNext}>
                Continue to Screen Sharing
              </Button>
            </Modal.Footer>
          </>
        );
      case 4:
        return (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Screen Sharing</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Please select which screen or window to share:</p>
              <Form.Select onChange={this.handleScreenChange}>
                <option value="">Select a screen</option>
                {screenSources.map(source => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </Form.Select>
            </Modal.Body>
            <Modal.Footer>
              <Button 
                variant="primary" 
                onClick={this.handleNext}
                disabled={!this.state.selectedScreen}
              >
                Next
              </Button>
            </Modal.Footer>
          </>
        );
      case 5:
        return (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Screen Preview</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>This is the screen you'll be sharing:</p>
              <video 
                ref={video => {
                    if (video && screenStream) {
                    video.srcObject = screenStream;
                    }
                }}
                autoPlay 
                playsInline 
                style={{ width: '100%', backgroundColor: '#000' }}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={this.handleNext}>
                Next
              </Button>
            </Modal.Footer>
          </>
        );
      case 6:
        return (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Multiple Monitors Detected</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>We detected multiple monitors. For best results, please:</p>
              <ul>
                <li>Disconnect any external monitors</li>
                <li>Use only your primary display</li>
              </ul>
              <p>If you can't remove external monitors, you may continue, but some features may be limited.</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => this.setState({ step: 7 })}>
                Continue with multiple monitors
              </Button>
              <Button variant="primary" onClick={this.handleNext}>
                I've removed external monitor
              </Button>
            </Modal.Footer>
          </>
        );
      case 7:
        return (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Full Screen Mode Required</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>You must take this test in full screen mode. Don't exit or escape this mode during the test.</p>
              <p>Any attempts to leave full screen mode may result in test termination.</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={this.enterFullScreen}>
                Go Full Screen
              </Button>
            </Modal.Footer>
          </>
        );
      default:
        return null;
    }
  }

  render() {
    const { step } = this.state;
  
    return (
      <div className="container mt-5">
        
        {/* Main setup modal */}
        <Modal show={this.state.showModal} onHide={() => this.setState({ showModal: false })}>
          {this.renderModalContent()}
        </Modal>

        <Modal
          show={this.state.showFullScreenExitWarning} onHide={() => this.setState({ showFullScreenExitWarning: false })}
        >
          <Modal.Header>
            <Modal.Title>Don't Exit Full Screen</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>You are not allowed to exit full screen mode during the test.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={() => {
                this.setState({ showFullScreenExitWarning: false });
                const elem = document.documentElement;
                if (elem.requestFullscreen) {
                  elem.requestFullscreen();
                }
              }}
            >
              OK
            </Button>
          </Modal.Footer>
        </Modal>
  
        {step === 8 && (
          <div className="text-center mt-4">
            <h3>Setup Complete!</h3>
            <p>You can now begin your test.</p>
          </div>
        )}
      </div>
    );
  }
}

export default TestScreen;