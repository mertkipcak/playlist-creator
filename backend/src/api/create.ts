import {Request, Response} from 'express';
import {Configuration, OpenAIApi} from "openai";
import {HTTPRequest} from "./base";
import {constants as HTTPStatus} from "http2";

import SpotifyWebApi = require('spotify-web-api-node');


export class CreatePostRequest extends HTTPRequest {
    protected schema: object = {
        type: 'object',
        properties: {
            playlistDescription: { type: 'string' },
            numberOfSongs: { type: 'integer' },
            playlistName: { type: 'string' },
            accessToken: { type: 'string' },
        },
        required: ['playlistDescription', 'numberOfSongs', 'playlistName', 'accessToken'],
        additionalProperties: false,
    };

    private static configuration: Configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });

    private static openai: OpenAIApi = new OpenAIApi(this.configuration);

    private spotifyApi: SpotifyWebApi = new SpotifyWebApi();

    private async testSpotifyAuthorization() {
        try {
            const response = await this.spotifyApi.getMe();
            if (response && response.statusCode === HTTPStatus.HTTP_STATUS_OK) {
                return true;
            }
        } catch (error) {
            if (this.isErrorWithStatusCode(error) && error.statusCode === HTTPStatus.HTTP_STATUS_UNAUTHORIZED) {
                return false;
            } else {
                console.error('Error checking Spotify access token:', error);
            }
        }

        return false;
    }

    private async getPlaylistSongs(playlistDescription: string, numberOfSongs: number) {
        const completion = await CreatePostRequest.openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    "role": "system",
                    "content": "You are a song suggester that can only reply with answer with the following structure" +
                        "\nSo what; Miles Davis\n Another brick in the wall; Pink Floyd\n" +
                        `Answer each question with ${numberOfSongs} song-artist pairs, don't say anything else, just list`
                },
                {
                    "role": "assistant",
                    "content": "What kind of music would you like to listen to?"
                },
                {
                    "role": "user",
                    "content": playlistDescription
                }
            ]
        });

        if (completion.status == HTTPStatus.HTTP_STATUS_OK) {
            const content = completion.data.choices[0]?.message?.["content"];

            if (content) {
                return content;
            } else {
                throw new Error("Unable to obtain the content from the API response.");
            }
        } else {
            throw new Error("API request failed with status: " + completion.status);
        }
    }

    private parseSongs(songsString: string): string[][] {
        // Split the input string into an array of song-artist pairs
        let pairs: string[] = songsString.split('\n').filter(x => x);

        // Map over the pairs, splitting each pair into a [song, artist] array
        return pairs.map(pair => {
            let [song, artist] = pair.split(';').map(s => s.trim());
            return [song, artist];
        });
    }

    private getMostPopularTrack(tracks: SpotifyApi.TrackObjectFull[]): SpotifyApi.TrackObjectFull {
        let popularTrack: SpotifyApi.TrackObjectFull = tracks[0];
        let highest_popularity: number = 0;
        for (const track of tracks) {
            if (track.popularity > highest_popularity) {
                highest_popularity = track.popularity;
                popularTrack = track;
            }
        }
        return popularTrack;
    }

    private async fetchTracks(songsArray: string[][]): Promise<SpotifyApi.TrackObjectFull[]> {
        try {
            const promises: Promise<any>[] = songsArray.map(async ([song, artist]) => {
                const response = await this.spotifyApi.searchTracks(`track:${song} artist:${artist}`);
                let trackObject: SpotifyApi.TrackObjectFull[] = response?.body?.tracks?.items! as SpotifyApi.TrackObjectFull[];
                return this.getMostPopularTrack(trackObject); // return the first match's ID
            });
            // Remove undefined values
            return (await Promise.all(promises)).filter(track => track !== undefined && track.id !== '') as SpotifyApi.TrackObjectFull[];
        } catch (error) {
            console.error('Something went wrong when fetching songs!', error);
            throw error
        }
        return []
    }

    private async createUserPlaylist(trackIDs: string[], playlistName: string) {
        try {
            // Get the user's ID
            const meResponse = await this.spotifyApi.getMe();
            const userId = meResponse.body.id;

            // Create the playlist
            const createPlaylistResponse = await this.spotifyApi.createPlaylist(playlistName);
            const playlistId = createPlaylistResponse.body.id;

            // Add the tracks to the playlist
            await this.spotifyApi.addTracksToPlaylist(playlistId, trackIDs.map(id => `spotify:track:${id}`));

            console.log(`Created playlist '${playlistName}' and added ${trackIDs.length} tracks.`);
        } catch (error) {
            console.error('Error creating playlist and adding tracks:', error);
            throw error
        }
    }

    private async createPlaylist(
        playlistDescription: string,
        numberOfSongs: number,
        playlistName: string,
    ) {
        let songsString = await this.getPlaylistSongs(playlistDescription, numberOfSongs);

        const songsArray = this.parseSongs(songsString);

        const tracks = await this.fetchTracks(songsArray);

        const trackIDs = tracks.map(track => track.id)

        await this.createUserPlaylist(trackIDs, playlistName);

        return tracks
    }

    public async handleRequest(req: Request, res: Response) {
        super.handleRequest(req, res);

        // Set all the data from the request
        const playlistDescription = req.body.playlistDescription;
        const numberOfSongs = req.body.numberOfSongs;
        const playlistName = req.body.playlistName;
        const spotifyAccessToken = req.body.accessToken;
        this.spotifyApi.setAccessToken(spotifyAccessToken);

        if (!await this.testSpotifyAuthorization()) {
            res.status(HTTPStatus.HTTP_STATUS_UNAUTHORIZED).json("Bad Spotify Credentials");
            return
        }

        const tracks = await this.createPlaylist(playlistDescription, numberOfSongs, playlistName);

        res.status(HTTPStatus.HTTP_STATUS_OK).json(tracks);
    }
}
