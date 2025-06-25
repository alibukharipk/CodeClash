import React, { Component } from 'react';

class TimerDisplay extends Component {
    constructor(props) {
      super(props);
      this.state = {
        timeLeft: props.initialTime
      };
      this.timer = null;
    }
  
    componentDidMount() {
      this.startTimer();
    }
  
    componentWillUnmount() {
      clearInterval(this.timer);
    }
  
    startTimer = () => {
      this.timer = setInterval(() => {
        this.setState(prevState => {
          const newTime = prevState.timeLeft - 1;
          
          // Notify parent when time reaches critical level or zero
          if (newTime <= 60) {
            this.props.onTimeCritical();
          }
          if (newTime <= 0) {
            this.props.onTimeExpired();
            clearInterval(this.timer);
          }
          
          return { timeLeft: newTime };
        });
      }, 1000);
    };
  
    formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
  
    render() {
      const { timeLeft } = this.state;
      const timerAlertClass = timeLeft <= 60 ? 'timer-alert' : 'timer-normal';
      
      return (
        <div className={timerAlertClass}>
          <strong>Time Remaining: </strong> {this.formatTime(timeLeft)}
        </div>
      );
    }
  }

  export default TimerDisplay;