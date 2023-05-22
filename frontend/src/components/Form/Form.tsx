import React, { useState } from 'react';
import './Form.css'

interface FormProps {
    onFormSubmit: (playlistDescription: string, playlistName: string, numberOfSongs: number) => void;
}

const Form: React.FC<FormProps> = ({ onFormSubmit }) => {
    const [playlistDescription, setPlaylistDescription] = useState('');
    const [playlistName, setPlaylistName] = useState('');
    const [numberOfSongs, setNumberOfSongs] = useState(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFormSubmit(playlistDescription, playlistName, numberOfSongs);
    };

    return (
        <div className="form-container container">
            <h2>Create Playlist</h2>
            <form onSubmit={handleSubmit} autoComplete="off">
                <div>
                    <label htmlFor="playlist-name">Playlist Name</label>
                    <input
                    type="text"
                    id="playlist-name"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    required
                    />
                </div>
                <div>
                    <label htmlFor="number-of-songs">Number of Songs:</label>
                    <div className="number-div">
                        <input
                            className="number-box"
                            type="number"
                            id="number-display"
                            value={numberOfSongs}
                            readOnly
                        />
                        <input
                            type="range"
                            id="number-of-songs"
                            min="1"
                            max="30"
                            value={numberOfSongs}
                            onChange={(e) => setNumberOfSongs(parseInt(e.target.value))}
                            required
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="playlist-description">Playlist Description</label>
                    <textarea
                        className="description"
                        placeholder="Jazz in the background for a weeknight dinner..."
                        id="playlist-description"
                        value={playlistDescription}
                        onChange={(e) => setPlaylistDescription(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default Form;
