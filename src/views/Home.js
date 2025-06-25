import React from "react";

class Home extends React.Component {
    render() {
      return (
        <>
        <div>
            <section className="hero text-center text-white" style={{ background: "#0c1015", padding: "100px 0" }}>
                <div className="container">
                    <h1>Practice Coding. Prepare for Interviews.</h1>
                    <p>Join millions of developers on the best online coding platform.</p>
                    <a href="#" className="btn btn-success btn-lg">Get Started</a>
                </div>
            </section>

            <section className="feature bg-light text-center py-5">
                <div className="container">
                    <h2>Features</h2>
                    <div className="row">
                        <div className="col-md-4">
                            <h4>Practice Coding</h4>
                            <p>Enhance your skills with hands-on coding challenges.</p>
                        </div>
                        <div className="col-md-4">
                            <h4>Compete</h4>
                            <p>Join global coding contests and prove your skills.</p>
                        </div>
                        <div className="col-md-4">
                            <h4>Get Hired</h4>
                            <p>Showcase your talent and get hired by top companies.</p>
                        </div>
                    </div>
                </div>
            </section>

  
        </div>
        </>
      );
    }
  }
  
  export default Home;