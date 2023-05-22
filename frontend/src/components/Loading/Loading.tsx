import React from 'react';
import './Loading.css'; // Importing the CSS styles

const Loading = () => {
    return (
        <div className="loading-container container">
            <div className="loader" title="Hey, I'm spinning. Hover over me!">
                <div></div>
                <div></div>
                <div></div>
            </div>
            <h2>Loading</h2>
            <p>Loading please wait...</p>
        </div>
    );
};

export default Loading;
