import React, { Component } from 'react';
import { Link } from "react-router-dom";
import InviteService from "../services/testInviteService";
import TimerDisplay from "../components/TimerDisplay"
import RingLoader from "react-spinners/RingLoader";
import TestService from "../services/testService";
import * as faceapi from 'face-api.js';
import { Modal, Button, Form } from 'react-bootstrap';
import MonacoEditor from "@monaco-editor/react";

class TakeTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSectionIndex: 0,
      currentQuestionIndex: 0,
      answers: {},
      testTime: 2 * 60, // (mins * secs)
      testSubmitted: false,
      testEnded: false,
      blockNavigation: true,
      testSections: [],
      testId: null,
      inviteId: null,
      accessToken: null,
      loading: false,
      backNavigationWarning: false,
      testTile: '',
      step: 1, // Current step in the process
      showModal: true,
      cameras: [],
      selectedCamera: null,
      screenSources: [],
      selectedScreen: null,
      videoStream: null,
      screenStream: null,
      showFullScreenExitWarning: false,
      startTest: false,
      tabSwitchCount: 0,
      exitedFullScreenCount: 0,
      noiseDetectionCount: 0,
      currentVolume: 0,
      isLaptopWithExternalMonitor: false,
      faceModelReady: false,
      faceNotDetectedCount: 0,
      hasMultipleMonitors: false,
      screenSharedStoppedCount: false,
      multipleFaceDetected: false,
      screenshotCount: 0,
      microphoneEnabled: true,
      webcamStreamStopedCount: 0
    };

    this.timer = null;
    this.canvasRef = React.createRef();
    this.analyser = null;
    this.audioContext = null;
    this.mediaStream = null;
    this.checkInterval = null;
    this.animationFrameId = null;
    this.randomScreenshotTimestamps = [];
    this.screenshotInterval = null;
  }

  componentDidMount() {
    const navType = window.performance.getEntriesByType("navigation")[0]?.type;
    if (navType === "reload") {
      // Clear token on refresh only
      sessionStorage.removeItem('verifiedOTPAccessToken');
      this.props.history.push('/error');
    }
    else {
      this.loadData();
    }
  }

  loadData = async () => {

    this.setState({ loading: true });
    const inviteId = parseInt(this.props.match.params.id, 10);
    const testDetails = await InviteService.GetTestDetailsByInviteId(inviteId);
    if (testDetails.length === 0)
      this.props.history.push('/error');
    else {
      const accessToken = sessionStorage.getItem('verifiedOTPAccessToken');
      if (!accessToken)
        this.props.history.push('/error');
      else {
        this.testSetup();
        this.setState({
          testSections: testDetails.skills, loading: false, testId: testDetails.test.id,
          inviteId: testDetails.invite.InviteId, accessToken, testTime: testDetails.test.duration * 60, testTile: testDetails.test.test_name
        });
      }
    }
  };

  componentWillUnmount() {
    this.stopAllProctoring();
  }

  stopAllProctoring()
  {
    this.removeNavigationBlocker();
    document.removeEventListener('copy', this.preventCopy);
    document.removeEventListener('cut', this.preventCopy);
    document.removeEventListener('contextmenu', this.preventContextMenu);
    window.removeEventListener('popstate', this.handleBackNavigation);
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('blur', this.handleTabSwitch);
    //window.removeEventListener('resize', this.checkMonitorCount);

    this.stopScreenshotCapture();

    this.stopNoiseDetection();

    this.exitFullScreen();

    if (this.state.videoStream) {
      this.state.videoStream.getTracks().forEach(track => track.stop());
    }

    if (this.state.screenStream) {
      this.state.screenStream.getTracks().forEach(track => track.stop());
    }
  }

  testSetup() {
    faceapi.nets.tinyFaceDetector.loadFromUri('/facemodels').then(() => {
      this.setState({ faceModelReady: true });
    });
    this.setupNavigationBlocker();
    document.addEventListener('copy', this.preventCopy);
    document.addEventListener('cut', this.preventCopy);
    document.addEventListener('contextmenu', this.preventContextMenu);
    window.addEventListener('popstate', this.handleBackNavigation);

    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('blur', this.handleTabSwitch);
    //window.addEventListener('resize', this.checkMonitorCount);
    this.detectCameras();
  }

  handleTabSwitch = () => {
    if (this.state.startTest) {
      const { tabSwitchCount } = this.state;
      const count = tabSwitchCount;
      this.setState({ tabSwitchCount: count + 1 });
    }
  };

  handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      const count = this.state.exitedFullScreenCount;
      this.setState({ showFullScreenExitWarning: true, exitedFullScreenCount: count + 1 });
    }
  };

  handleKeyDown = (event) => {
    // Detect F11 or Escape key
    if (event.key === 'F11' || event.key === 'Escape') {
      this.setState({ showFullScreenExitWarning: true });
    }
  };

detectCameras = async () => {
  try {
    // First request permissions (this opens the permission prompt if not yet allowed)
    await navigator.mediaDevices.getUserMedia({ video: true });

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
        this.handleWebcamStream(stream);
      }
      else
      {
        this.detectCameras();
      }
    } catch (error) {
      console.error('Error starting camera:', error);
    }
  };

  startNoiseDetection = async () => {
  try {
    // 1. Check current microphone permission
    const permissionStatus = await navigator.permissions.query({ name: 'microphone' });

    if (permissionStatus.state === 'denied') {
      alert('Microphone access is currently denied. Please enable it in your browser settings for noise detection.');
    }

    // 2. Listen for permission changes
    permissionStatus.onchange = async () => {
      if (permissionStatus.state === 'granted') {
        // Start noise detection now that permission is granted
        this.setState({microphoneEnabled: true});
        this.startNoiseDetection(); // Re-attempt to start detection
      }
      else
        this.setState({microphoneEnabled: false});
    };

    // 3. Try accessing the microphone
    this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();

    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    source.connect(this.analyser);

    // Start checking volume periodically
    this.checkInterval = setInterval(() => {
      this.checkVolume();
    }, 5000); // Every 5 seconds

    // Run immediate check
    this.checkVolume();

  } catch (error) {
    console.error('Error accessing microphone:', error);

    this.setState({microphoneEnabled: false});
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      alert('Microphone access is required for noise detection. Please enable it in your browser settings.');
    } else {
      alert('An unexpected error occurred while accessing the microphone.');
    }
  }
};

  stopNoiseDetection = () => {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.setState({ isMonitoring: false });
  };

  checkVolume = () => {
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    const volume = data.reduce((a, b) => a + b) / data.length;

    this.setState({ currentVolume: volume });

    if (volume > 8) {
      this.setState(prevState => ({
        noiseDetectionCount: prevState.noiseDetectionCount + 1
      }));
    }

  };

startScreenshotCapture = () => {
  this.screenshotInterval = setInterval(this.captureScreenshot, 5000); // every 5 seconds
};

stopScreenshotCapture = () => {
  clearInterval(this.screenshotInterval);
  this.screenshotInterval = null;
};

captureScreenshot = async () => {

  try
  {
 const video = this.state.videoStream?.getVideoTracks?.()[0];
  const canvas = this.canvasRef.current;
  const count = this.state.faceNotDetectedCount;
  const { testTime, faceModelReady } = this.state;

  if (!video || !canvas || !faceModelReady) return;

  const imageCapture = new ImageCapture(video);
  const bitmap = await imageCapture.grabFrame();

  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0);

  const detections = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions());
  const faceDetected = detections.length > 0;
  const multipleFaces = detections.length > 1;

  if (this.state.screenshotCount < 10) {
      if ((!faceDetected || multipleFaces)) {
          this.setState({
            faceNotDetectedCount: !faceDetected ? count + 1 : count,
            multipleFaceDetected: multipleFaces,
          });

          this.takeAndSendScreenshot(canvas);
        } else {
          // Random screenshot condition    
            const examTimeMs = testTime  * 1000;
            const now = Date.now();

            // Store the screenshot timestamps if not already
            if (!this.randomScreenshotTimestamps || this.randomScreenshotTimestamps.length === 0) {
              this.randomScreenshotTimestamps = Array.from({ length: 10 }).map(() =>
                Date.now() + Math.floor(Math.random() * examTimeMs)
              );
              this.randomScreenshotTimestamps.sort((a, b) => a - b); // sort ascending
            }

            const nextScreenshotTime = this.randomScreenshotTimestamps[0];

            if (now >= nextScreenshotTime) {
              // Time to take a random screenshot
              this.randomScreenshotTimestamps.shift(); // remove this timestamp
              this.takeAndSendScreenshot(canvas);
            }
        }
  }
  }
  catch(err)
  {
    this.stopScreenshotCapture();
  } 
};

  blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  takeAndSendScreenshot = (canvas) => {

    canvas.toBlob(async (blob) => {
      try {
        const base64 = await this.blobToBase64(blob);
        const payload = {
          invite_id: this.state.inviteId,
          image_data: base64 ? base64.split(',')[1] : '',
        };
        await TestService.sendScreenShot(payload, this.state.accessToken);
        const count = this.state.screenshotCount;
        this.setState({screenshotCount: count + 1});
      } catch (err) {
        console.error('Error uploading screenshot', err);
      }
    }, 'image/jpeg');
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
          video: true,
          audio: false
        });

        this.setState({ screenStream: stream, step: 5 });
        this.handlerShareScreenStream(stream);
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
      this.handlerShareScreenStream(stream);

      this.setState({
        selectedScreen: sourceId,
        screenStream: stream,
        step: 5
      });
    } catch (error) {
      console.error('Error selecting screen:', error);
    }
  };

  handlerShareScreenStream = (stream) => {
    // Listen for when user stops screen sharing
    const [videoTrack] = stream.getVideoTracks();
    const count = this.state.screenSharedStoppedCount;
    videoTrack.onended = () => {
      this.setState({
        screenStream: null,
        screenSharedStoppedCount: count + 1
      });
    };

    this.setState({ screenStream: stream });
  };

  handleWebcamStream = (stream) => {
    // Listen for when user stops screen sharing
    const [videoTrack] = stream.getVideoTracks();
    const count = this.state.webcamStreamStopedCount;
    videoTrack.onended = () => {
      this.setState({
        videoStream: null,
        webcamStreamStopedCount: count + 1
      });
    };

    this.setState({ screenStream: stream });
  };


  setupNavigationBlocker = () => {
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    window.history.pushState(null, null, window.location.pathname);
  };

  removeNavigationBlocker = () => {
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  };

  handleBackNavigation = (e) => {
    if (!this.state.testEnded) {
      e.preventDefault();
      this.setState({ backNavigationWarning: true });
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
    this.setState({ step: 8, startTest: true });
    this.startScreenshotCapture();
    this.startNoiseDetection();
  };

exitFullScreen = () => {
  if (!document) return;

  if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(err => console.error('exitFullscreen error:', err));
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  } else {
    console.warn('Not in fullscreen mode');
  }
}

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
        this.checkMonitorCount();
        break;
      case 7:
        this.setState({ step: 7, startTest: true });
        break;
      default:
        break;
    }
  };

  checkMonitorCount = () => {

    if (window.screen.isExtended) {
      this.setState({ step: 6, hasMultipleMonitors: true }); // Show multi-monitor warning
    } else {
      this.setState({ step: 7, hasMultipleMonitors: false }); // Skip to fullscreen prompt
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
            <Modal.Header closeButton={false}>
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
            <Modal.Header closeButton={false}>
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
            <Modal.Header closeButton={false}>
              <Modal.Title>Camera Preview</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>This is how you'll appear during the test:</p>
              {videoStream && (
                <video
                  autoPlay
                  playsInline
                  muted
                  ref={video => {
                    if (video) video.srcObject = videoStream;
                  }}
                  style={{ width: '100%', border: '1px solid #ddd' }}
                />
              )}
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
            <Modal.Header closeButton={false}>
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
            <Modal.Header closeButton={false}>
              <Modal.Title>Screen Preview</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>This is the screen you'll be sharing:</p>
              {screenStream && (
                <video
                  autoPlay
                  playsInline
                  muted
                  ref={video => {
                    if (video) video.srcObject = screenStream;
                  }}
                  style={{ width: '100%', border: '1px solid #ddd' }}
                />
              )}
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
            <Modal.Header closeButton={false}>
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
              <Button variant="danger" onClick={() => this.setState({ step: 7, hasMultipleMonitors: true })} style={{ fontSize: '13px' }}>
                Continue with multiple monitors
              </Button>
              <Button variant="primary" onClick={this.handleNext} style={{ fontSize: '13px' }}>
                I have removed external monitor
              </Button>
            </Modal.Footer>
          </>
        );
      case 7:
        return (
          <>
            <Modal.Header closeButton={false}>
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

  handleContinueTest = () => {
    this.setState({ backNavigationWarning: false });
  };

  handleBeforeUnload = (e) => {
    if (this.state.blockNavigation && !this.state.testEnded) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return e.returnValue;
    }
  };

  preventCopy = (e) => {
    e.preventDefault();
    return false;
  };

  preventContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  handleAnswerChange = (questionId, optionId, isChecked = true) => {
    const { testSections } = this.state;
    const currentSection = testSections[this.state.currentSectionIndex];
    const question = currentSection.questions.find(q => q.id === questionId);

    this.setState(prevState => {
      const newAnswers = { ...prevState.answers };

      if (question.question_type === "mcq_single") {
        // For radio buttons (single choice), just set the selected option
        newAnswers[questionId] = [optionId];
      } else if (question.question_type === "mcq_multiple") {
        // For checkboxes (multiple choice)
        if (!newAnswers[questionId]) {
          newAnswers[questionId] = [];
        }

        if (isChecked) {
          if (!newAnswers[questionId].includes(optionId)) {
            newAnswers[questionId] = [...newAnswers[questionId], optionId];
          }
        } else {
          newAnswers[questionId] = newAnswers[questionId].filter(id => id !== optionId);
        }
      }else
      {

      }

      return { answers: newAnswers };
    });
  };

handleCodingAnswerChange = (questionId, code) => {
  this.setState(prevState => {
    const newAnswers = { ...prevState.answers };
    newAnswers[questionId] = code;
    return { answers: newAnswers };
  });
};

  changeSection = (sectionIndex) => {
    this.setState({
      currentSectionIndex: sectionIndex,
      currentQuestionIndex: 0
    });
  };

  goToNextQuestion = () => {
    const { testSections } = this.state;
    this.setState(prevState => {
      const currentSection = testSections[prevState.currentSectionIndex];
      const nextQuestionIndex = prevState.currentQuestionIndex + 1;

      if (nextQuestionIndex < currentSection.questions.length) {
        return { currentQuestionIndex: nextQuestionIndex };
      } else {
        // Move to next section if available
        const nextSectionIndex = prevState.currentSectionIndex + 1;
        if (nextSectionIndex < testSections.length) {
          return {
            currentSectionIndex: nextSectionIndex,
            currentQuestionIndex: 0
          };
        }
        return {};
      }
    });
  };

  goToPrevQuestion = () => {
    const { testSections } = this.state;
    this.setState(prevState => {
      const prevQuestionIndex = prevState.currentQuestionIndex - 1;

      if (prevQuestionIndex >= 0) {
        return { currentQuestionIndex: prevQuestionIndex };
      } else {
        // Move to previous section if available
        const prevSectionIndex = prevState.currentSectionIndex - 1;
        if (prevSectionIndex >= 0) {
          return {
            currentSectionIndex: prevSectionIndex,
            currentQuestionIndex: testSections[prevSectionIndex].questions.length - 1
          };
        }
        return {};
      }
    });
  };

  checkUnansweredQuestions = () => {
    let unansweredCount = 0;
    const { testSections } = this.state;

    testSections.forEach(section => {
      section.questions.forEach(question => {
        if (!this.state.answers[question.id] || this.state.answers[question.id].length === 0) {
          unansweredCount++;
        }
      });
    });

    return unansweredCount;
  };

  handleTimeCritical = () => {
    // Optional: Handle when time becomes critical (<= 60 seconds)
  };

  handleTimeExpired = () => {
    this.submitTest();
  };

  handleCompleteTest = () => {
    const unansweredCount = this.checkUnansweredQuestions();

    if (unansweredCount > 0) {
      const shouldSubmit = window.confirm(
        `You have ${unansweredCount} unanswered question(s). Are you sure you want to submit the test?`
      );

      if (shouldSubmit) {
        this.submitTest();
      }
    } else {
      this.submitTest();
    }
  };

  submitTest = async () => {
    const {accessToken} = this.state;    
    clearInterval(this.timer);
    this.setState({ testSubmitted: true, testEnded: true, blockNavigation: false, showFullScreenExitWarning: false });
    this.removeNavigationBlocker();
    sessionStorage.removeItem('verifiedOTPAccessToken');

    const { testId, inviteId } = this.state;
      const responses = Object.entries(this.state.answers).map(([question_id, answer]) => {
        const question = this.getQuestionById(parseInt(question_id)); // helper to retrieve question object

        return {
          question_id: parseInt(question_id),
          selected_choices: question.question_type !== 'coding' ? Array.isArray(answer) ? answer : [answer] : [],           
          response_text: question.question_type === 'coding' ? answer : ''
        };
      });

    const stats = {
      "test_invite": inviteId,
      "face_detect_count": this.state.faceNotDetectedCount,
      "multiple_faces": this.state.multipleFaceDetected,
      "tab_switch_count": this.state.tabSwitchCount,
      "noise_detected_count": this.state.noiseDetectionCount,
      "multiple_monitors": this.state.hasMultipleMonitors,
      "exited_fullscreen_count": this.state.exitedFullScreenCount,
      'screen_share_stopped': this.state.screenSharedStoppedCount,
      'webcam_stopped': this.state.webcamStreamStopedCount,
      'microphone_disabled': !this.state.microphoneEnabled,
      "browser_info": this.getBrowserInfo()
    }

    await TestService.submitTest({ test_id: testId, invite_id: inviteId, responses }, accessToken);
    await TestService.submitProctoringStats(stats, accessToken);

    this.stopAllProctoring();
  };

getQuestionById = (questionId) => {
  const { testSections } = this.state;
  for (let section of testSections) {
    const found = section.questions.find(q => q.id === questionId);
    if (found) return found;
  }
  return null;
};  

  endTestEarly = () => {
    if (window.confirm("Are you sure you want to end the test early?")) {
      this.handleCompleteTest();
    }
  };

  getBrowserInfo = () => {
    const ua = navigator.userAgent;

    if (ua.includes("Firefox/")) return "Firefox";
    if (ua.includes("Edg/")) return "Edge";
    if (ua.includes("OPR/") || ua.includes("Opera")) return "Opera";
    if (ua.includes("Chrome/") && !ua.includes("Edg/") && !ua.includes("OPR/")) return "Chrome";
    if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";

    return "Unknown";
  };


  renderQuestionNavigation = () => {
    const { currentSectionIndex, currentQuestionIndex, testSections } = this.state;
    const currentSection = testSections[currentSectionIndex];

    return (
      <div className="question-navigation-container">
        <div className="navigation-header">
          <h5 className="navigation-title">{currentSection.name}</h5>
          <div className="progress-indicator">
            <span className="completed-count">
              {Object.keys(this.state.answers).length}
            </span>
            <span className="total-count">/{currentSection.questions.length}</span>
          </div>
        </div>
        <div className="question-list">
          {currentSection.questions.map((question, index) => (
            <div
              key={question.id}
              className={`question-item 
                                ${index === currentQuestionIndex ? 'active' : ''}
                                ${this.state.answers[question.id] ? 'answered' : ''}`}
              onClick={() => this.setState({ currentQuestionIndex: index })}
            >
              <div className="question-number">Q{index + 1}</div>
              <div className="question-status">
                {this.state.answers[question.id] ? (
                  <span className="status-icon completed">✓</span>
                ) : (
                  <span className="status-icon pending">○</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  calculateProgressPercentage = (section) => {
    try {
      const { answers } = this.state;
      if (!section || !section.questions || !answers) return 0;

      const answeredCount = section.questions.filter(q => answers[q.id]).length;
      const percentage = (answeredCount / section.questions.length) * 100;

      // Ensure the value is between 0-100
      return Math.min(100, Math.max(0, percentage));
    } catch (error) {
      console.error('Progress calculation error:', error);
      return 0;
    }
  }

  renderSectionNavigation = () => {
    const { currentSectionIndex, testSections } = this.state;

    return (
      <div className="section-navigation-container ">
        <div className="navigation-header">
          <h5 className="navigation-title">Test Sections</h5>
          <div className="section-count">{testSections.length} Sections</div>
        </div>
        <div className="section-list">
          {testSections.map((section, index) => (
            <div
              key={section.id}
              className={`section-item ${index === currentSectionIndex ? 'active' : ''}`}
              onClick={() => this.changeSection(index)}
            >
              <div className="section-info">
                <div className="section-name">{section.name}</div>
                <div className="section-meta">
                  {section.questions.length} questions
                </div>
              </div>
              <div className="section-progress">
                <div
                  className="progress-bar"
                  style={{ width: `${this.calculateProgressPercentage(section)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  renderCurrentQuestion = () => {
    const { currentSectionIndex, currentQuestionIndex, answers, testSections } = this.state;
    const currentSection = testSections[currentSectionIndex];
    const question = currentSection.questions[currentQuestionIndex];
    const questionAnswers = answers[question.id] || [];
    const questionTypeLabels = {
      mcq_single: "Single Choice",
      mcq_multiple: "Multiple Choice",
      coding: "Coding"
    };

    return (
      <div className="card shadow-lg border-0 question-card" style={{ minHeight: '600px' }}>
        <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
          <h5 className="mb-0 text-primary">
            {currentSection.name} – <span className="text-dark">Question {currentQuestionIndex + 1} of {currentSection.questions.length}</span>
          </h5>
          <span className="badge badge-pill badge-secondary px-3 py-2">
            {questionTypeLabels[question.question_type]}
          </span>
        </div>

        <div className="card-body">
          <h5 className="question-text text-dark font-weight-bold mb-3">{question.name}</h5>
          <div className="question-description mb-4" dangerouslySetInnerHTML={{ __html: question.description }} />

      <div className="options-container">
        {question.question_type === 'mcq_single' || question.question_type === 'mcq_multiple' ? (
          question.choices.map(option => (
            <div key={option.id} className="option-item mb-3">
              {question.question_type === 'mcq_single' ? (
                <div className="custom-control custom-radio">
                  <input
                    type="radio"
                    id={`option-${question.id}-${option.id}`}
                    name={`question-${question.id}`}
                    className="custom-control-input"
                    checked={questionAnswers.includes(option.id)}
                    onChange={() => this.handleAnswerChange(question.id, option.id)}
                  />
                  <label className="custom-control-label text-secondary" htmlFor={`option-${question.id}-${option.id}`}>
                    {option.choice_text}
                  </label>
                </div>
              ) : (
                <div className="custom-control custom-checkbox">
                  <input
                    type="checkbox"
                    id={`option-${question.id}-${option.id}`}
                    className="custom-control-input"
                    checked={questionAnswers.includes(option.id)}
                    onChange={(e) => this.handleAnswerChange(question.id, option.id, e.target.checked)}
                  />
                  <label className="custom-control-label text-secondary" htmlFor={`option-${question.id}-${option.id}`}>
                    {option.choice_text}
                  </label>
                </div>
              )}
            </div>
          ))
        ) : question.question_type === 'coding' ? (
          <div className="coding-editor w-100">
            <MonacoEditor
              id={`monacoEditor-${question.id}`}
              height="400px"
              defaultLanguage={question.coding_language || 'javascript'}
              defaultValue="// Start coding here"
              value={this.state.answers[question.id] || "// Start coding here"}
              onChange={(value) => this.handleCodingAnswerChange(question.id, value)}
              theme="vs-dark"
            />
          </div>
        ) : null}
      </div>
        </div>
      </div>
    );
  };

  render() {
    const { loading, testEnded, currentSectionIndex, currentQuestionIndex, backNavigationWarning, testSections, testTime,
      testTile, showFullScreenExitWarning, startTest, testSubmitted } = this.state;

    return (
      <div>
        <canvas ref={this.canvasRef} style={{ display: 'none' }} />
        {startTest ?
          <div className="wrapper">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
              <span to="/home" className="navbar-brand">Code Clash</span>
              <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav">
                <span className="navbar-toggler-icon"></span>
              </button>
            </nav>

            {testSections && testSections.length > 0 && (
              (() => {
                const currentSection = testSections[currentSectionIndex];
                const isLastQuestion = currentQuestionIndex === currentSection.questions.length - 1;
                const isLastSection = currentSectionIndex === testSections.length - 1;

                if (backNavigationWarning) {
                  return (
                    <div className="container mt-5">
                      <div className="card">
                        <div className="card-header bg-warning text-dark">
                          <h2 className="text-center">Warning</h2>
                        </div>
                        <div className="card-body text-center">
                          <h4>Going back will submit your test automatically</h4>
                          <p>You have 10 seconds to continue your test before it gets submitted.</p>
                          <button
                            className="btn btn-primary"
                            onClick={this.handleContinueTest}
                            style={{ cursor: 'pointer' }}
                          >
                            Continue Test
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (testEnded) {
                  return (
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8" style={{ minHeight: '800px' }}>
                      <div className="w-full max-w-md space-y-8">
                        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                          {/* Body */}
                          <div className="px-8 py-6">
                            <div className="text-center space-y-4">

                              <h3 className="text-lg font-medium text-gray-900">Thank you for completing the assessment</h3>

                              <p className="text-sm text-gray-600">
                                Your responses have been securely submitted and recorded.
                              </p>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500 text-center">
                              Need assistance? Contact <a href="mailto:support@company.com" className="text-indigo-600 hover:text-indigo-500">ali.h@allshoretalent.com</a>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="content" style={{ minHeight: '850px' }}>
                    <div className="container-fluid mt-3" onCopy={this.preventCopy} onCut={this.preventCopy}>
                      <div className="row">
                        <div className="col-md-3">
                          <div className="sticky-top pt-3">
                            {this.renderSectionNavigation()}
                            <div className="mt-4">
                              {this.renderQuestionNavigation()}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-9">
                          <div className="row mb-3">
                            <div className="col">
                              <h3>{testTile}</h3>
                            </div>
                            <div className="col-auto">
                              <TimerDisplay
                                initialTime={testTime} // Initial time in seconds
                                onTimeCritical={this.handleTimeCritical}
                                onTimeExpired={this.handleTimeExpired}
                              />
                            </div>
                          </div>

                          {this.renderCurrentQuestion()}

                          <div className="row mt-4 mb-5">
                            <div className="col">
                              <button
                                className="btn btn-secondary"
                                onClick={this.goToPrevQuestion}
                                disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
                              >
                                Previous Question
                              </button>
                            </div>
                            <div className="col text-right">
                              {!isLastQuestion || !isLastSection ? (
                                <button
                                  className="btn btn-primary"
                                  onClick={this.goToNextQuestion}
                                  style={{ cursor: 'pointer' }}
                                >
                                  Next Question
                                </button>
                              ) : (
                                <button
                                  className="btn btn-success"
                                  onClick={this.handleCompleteTest}
                                >
                                  Complete Test
                                </button>
                              )}
                              <button
                                className="btn btn-danger ml-2"
                                onClick={this.endTestEarly}
                              >
                                End Test Early
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}

            {loading && (
              <div className="spinner-overlay">
                <RingLoader color="#36D7B7" size={100} />
              </div>
            )}
            <Modal
              show={!testSubmitted && showFullScreenExitWarning} onHide={() => this.setState({ showFullScreenExitWarning: false })}
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
            <footer className="footer text-center text-white py-3" style={{ background: "#181c20" }}>
              <p>&copy; 2025 Code Clash. All Rights Reserved.</p>
            </footer>
          </div>
          :
          <React.Fragment>
            <Modal show={this.state.showModal} onHide={() => this.setState({ showModal: false })}  show={true}
              onHide={() => {}} 
              backdrop="static"
              keyboard={false}>
              {this.renderModalContent()}
            </Modal>
          </React.Fragment>
        }
      </div>
    );
  }
}

export default TakeTest;