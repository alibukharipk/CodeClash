import React, { Component } from 'react';

class DeleteConfirm extends Component {
  state = {
    isOpen: this.props.isOpen || false, // Initialize with prop or default to false
  };

  // Open the modal
  openModal = () => {
    this.setState({ isOpen: true });
  };

  // Close the modal
  closeModal = () => {
    this.setState({ isOpen: false });
    if (this.props.onClose) {
      this.props.onClose(); // Call the onClose callback if provided
    }
  };

  // Handle confirmed deletion
  handleConfirm = () => {
    if (this.props.onConfirm) {
      this.props.onConfirm(); // Call the onConfirm callback if provided
    }
    this.closeModal(); // Close the modal after confirmation
  };

  // Update state if the `isOpen` prop changes
  componentDidUpdate(prevProps) {
    if (prevProps.isOpen !== this.props.isOpen) {
      this.setState({ isOpen: this.props.isOpen });
    }
  }

  render() {
    const { isOpen } = this.state;
    const { message } = this.props;

    if (!isOpen) return null;

    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <p>{message || 'Are you sure you want to delete this item?'}</p>
          <div style={styles.buttonContainer}>
            <button style={styles.confirmButton} onClick={this.handleConfirm}>
              Confirm
            </button>
            <button style={styles.cancelButton} onClick={this.closeModal}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
}

// Inline styles for the modal
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: '20px',
  },
  confirmButton: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '10px',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default DeleteConfirm;