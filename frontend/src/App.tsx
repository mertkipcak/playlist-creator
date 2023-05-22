import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Authorize from './components/Authorize/Authorize';
import Form from './components/Form/Form';
import Loading from './components/Loading/Loading';
import Results from './components/Results/Results';

function App() {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);

    useEffect(() => {
        const hashParams = getUrlHashParameters();
        if ('access_token' in hashParams) {
            setAccessToken(hashParams.access_token);
            console.log(hashParams.access_token);
        }
    });

    const handleFormSubmit = async (
        playlistDescription: string,
        playlistName: string,
        numberOfSongs: number
    ) => {
        setLoading(true);
        const response = await axios.post('/create', {
            "playlistDescription": playlistDescription,
            "numberOfSongs": numberOfSongs,
            "playlistName": playlistName,
            "accessToken": accessToken
        });
        console.log(response);
        setResults(12);
        setLoading(false);
    };

    if (accessToken === null) {
        return (<Authorize />);
    } else if (loading) {
        return (<Loading />);
    } else if (results === null) {
        return (<Form onFormSubmit={handleFormSubmit} />);
    } else {
        return (<Results />);
    }
}

function getUrlHashParameters(): Record<string, string> {
    const hash = window.location.hash.substring(1);
    return hash.split('&').reduce((params: Record<string, string>, param: string) => {
        const [key, value] = param.split('=');
        params[key] = decodeURIComponent(value || '');
        return params;
    }, {});
}

export default App;