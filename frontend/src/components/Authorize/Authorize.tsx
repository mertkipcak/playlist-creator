import React from 'react';
import './Authorize.css'

const Authorize: React.FC = () => {
    const redirectUri: string = 'http://localhost:3000';
    const clientId: string = '6fcd0241c4d946d093407b14a038ce0a';
    const authEndpoint: string = 'https://accounts.spotify.com/authorize';
    const responseType: string = 'token';

    const scope: string = 'playlist-modify-public';

    return (
        <div className="authorize-container container">
            <h2>Authorize with Spotify</h2>
            <p>Click the button below to authorize access to your Spotify account.</p>
            <a href={`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`}>
                Authorize with Spotify
            </a>
        </div>
    );
};

export default Authorize;
