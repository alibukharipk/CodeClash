import React from "react";

const Loader = ({ loading }) => {
    return loading ? (
        <div className="loader-overlay">
            <div className="loader"></div>
        </div>
    ) : null;
};

export default Loader;