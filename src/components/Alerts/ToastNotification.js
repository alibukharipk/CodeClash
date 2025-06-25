import React, { Component } from "react";

class ToastNotification extends Component {
    componentDidMount() {
      if (this.props.autoHide) {
        this.startAutoHideTimer();
      }
    }
  
    componentDidUpdate(prevProps) {
      if (this.props.show && !prevProps.show) {
        this.startAutoHideTimer();
      }
    }
  
    startAutoHideTimer = () => {
      if (this.props.autoHide) {
        setTimeout(() => {
          this.props.onClose();
        }, this.props.duration || 3000); // Default to 3 seconds if no duration is provided
      }
    };
  
    getToastClass = () => {
      switch (this.props.type) {
        case "success":
          return "bg-success text-white";
        case "error":
          return "bg-danger text-white";
        case "warning":
          return "bg-warning text-dark";
        default:
          return "bg-secondary text-white"; // Default gray
      }
    };
  
    render() {
      return (
        <div
          className={`toast position-fixed top-0 end-0 m-3 ${this.props.show ? "show" : ""}`}
          style={{ zIndex: 1050, right: "20px", top: "20px" }}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className={`toast-header ${this.getToastClass()}`}>
            <strong className="mr-auto">{this.props.title || "Notification"}</strong>
            <button
              type="button"
              className="ml-2 mb-1 close"
              aria-label="Close"
              onClick={this.props.onClose}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className={`toast-body ${this.getToastClass()}`}>{this.props.message}</div>
        </div>
      );
    }
  }
  
  export default ToastNotification;