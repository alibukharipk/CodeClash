import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Sidebar extends Component {
  static propTypes = {
    width: PropTypes.number,
    title: PropTypes.string,
    onClose: PropTypes.func,
    children: PropTypes.node,
    closeOnOutsideClick: PropTypes.bool,
    closeOnEscape: PropTypes.bool
  };

  static defaultProps = {
    width: 400,
    title: 'Menu',
    closeOnOutsideClick: true,
    closeOnEscape: true
  };

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
    this.sidebarRef = React.createRef();
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (event) => {
    if (this.props.closeOnEscape && event.key === 'Escape' && this.state.isOpen) {
      this.closeSidebar();
    }
  };

  handleClickOutside = (event) => {
    if (
      this.props.closeOnOutsideClick &&
      this.state.isOpen &&
      this.sidebarRef.current &&
      !this.sidebarRef.current.contains(event.target)
    ) {
      this.closeSidebar();
    }
  };

  openSidebar = () => {
    this.setState({ isOpen: true });
    document.body.style.overflow = 'hidden'; // Prevent scrolling when sidebar is open
  };

  closeSidebar = () => {
    this.setState({ isOpen: false });
    document.body.style.overflow = ''; // Re-enable scrolling
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  toggleSidebar = () => {
    this.state.isOpen ? this.closeSidebar() : this.openSidebar();
  };

  render() {
    const { width, title, children } = this.props;
    const { isOpen } = this.state;

    return (
      <>
        {/* Sidebar Overlay */}
        <div 
          className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
          onClick={this.closeSidebar}
          role="presentation"
        />

        {/* Sidebar Container */}
        <div
          ref={this.sidebarRef}
          className="enterprise-sidebar"
          style={{
            width: `${width}px`,
            transform: isOpen ? 'translateX(0)' : `translateX(${width}px)`
          }}
          aria-hidden={!isOpen}
        >
          {/* Sidebar Header */}
          <div className="sidebar-header d-flex align-items-center justify-content-between p-3 bg-light border-bottom">
            <h3 className="sidebar-title m-0 font-weight-bold">{title}</h3>
            <button
              type="button"
              className="close"
              aria-label="Close"
              onClick={this.closeSidebar}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="sidebar-content p-3">
            {children}
          </div>
        </div>
      </>
    );
  }
}

export default Sidebar;