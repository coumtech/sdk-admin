```markdown
# Coum SDK

The Coum SDK allows you to embed a customizable music player into your website with exclusive access to music tracks. It includes features like playback control, volume adjustment, and support for ads.

## How to Use the Coum SDK

### 1. Include the SDK in your HTML file

You can include the SDK by referencing the `coum-sdk.js` file in your HTML:

```html
<script src="/coum-sdk/coum-sdk.js"></script>
```

### 2. Initialize the SDK

After including the SDK, you need to initialize it by passing a **`publicKey`** and the **`elementId`** of the HTML element where the player will be embedded. Optionally, you can pass an `options` object to customize the player.

```javascript
const musicSDK = new MusicSDK('YOUR_PUBLIC_KEY', 'element-id');
```

### 3. Optional `options` Object

You can pass an optional `options` object to customize certain aspects of the player. Below are the available options:

- **`apiEndpoint`** (string): The API endpoint to fetch the music and ad data. Default is `'https://api.example.com/getMusicData'`.
- **`volume`** (number): The initial volume of the player. Must be a number between 0 and 1. Default is `1`.
  
Example:
```javascript
const musicSDK = new MusicSDK('YOUR_PUBLIC_KEY', 'element-id', {
  apiEndpoint: 'https://your-api.com/music-data',
  volume: 0.7
});
```

## Available Options

| Option       | Type    | Default Value                               | Description                                                |
|--------------|---------|---------------------------------------------|------------------------------------------------------------|
| `apiEndpoint`| string  | `'https://api.example.com/getMusicData'`     | The API URL to fetch music and ads.                         |
| `volume`     | number  | `1`                                         | Initial volume setting (between 0 and 1).                   |

## Example Usage

### Using Coum SDK in Standard JavaScript

Here is an example of how to use the Coum SDK in a standard HTML/JavaScript project:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coum SDK Example</title>
</head>
<body>

  <h1>Music Player</h1>
  <div id="music-player"></div>

  <script src="/coum-sdk/coum-sdk.js"></script>
  <script>
    // Initialize the SDK with your public key and target element ID
    const musicSDK = new MusicSDK('YOUR_PUBLIC_KEY', 'music-player');

    // Optional: Pass options to customize the SDK behavior
    // const musicSDK = new MusicSDK('YOUR_PUBLIC_KEY', 'music-player', {
    //   apiEndpoint: 'https://your-api.com/music-data',
    //   volume: 0.7
    // });
  </script>

</body>
</html>
```

### Using Coum SDK in Next.js

Here is an example of how to dynamically load the SDK and initialize it in a Next.js project:

```javascript
import { useEffect } from 'react';

const MusicPage = () => {
  useEffect(() => {
    // Dynamically load the Coum SDK script
    const script = document.createElement('script');
    script.src = '/coum-sdk/coum-sdk.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // Initialize the SDK once the script is loaded
      const musicSDK = new MusicSDK('YOUR_PUBLIC_KEY', 'music-player');
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      <h1>Music Player</h1>
      <div id="music-player"></div>
    </div>
  );
};

export default MusicPage;
```

## Features

- **Embed Music Player**: Embed a music player into your website using your own custom music library.
- **Playback Controls**: Users can play, pause, skip, and adjust the volume.
- **Ad Integration**: The SDK supports banner ads that link out to external URLs.
- **Like/Dislike Mechanism**: Users can like/dislike tracks based on the time they listen to a song.

## Functionality

1. **Play/Pause**: The music player supports basic play and pause functionality.
2. **Skip Track**: Users can skip to the next track. If a track is skipped within 30 seconds, it is marked as disliked; otherwise, it is liked.
3. **Volume Control**: Adjust the volume using the player's volume slider.
4. **Banner Ad**: A clickable banner ad is shown with each track, which can redirect users to an external link.

## Example API Response

To work with the Coum SDK, your backend API should return a JSON object like this:

```json
{
  "musicList": [
    "https://your-music-url.com/song1.mp3",
    "https://your-music-url.com/song2.mp3"
  ],
  "adLink": "https://your-ad-url.com"
}
```

- **`musicList`**: An array of URLs pointing to the music tracks.
- **`adLink`**: The URL for the banner ad associated with the music player.

## License

This SDK is provided as-is under the MIT License.
```

### Documentation Updates:
1. **Detailed Options**: All the options (e.g., `apiEndpoint`, `volume`) are described clearly in a table.
2. **Example Usage**: Two examples are provided:
   - **Standard JavaScript** for use in a simple HTML/JavaScript setup.
   - **Next.js** for use in a Next.js project where the SDK is dynamically loaded.
3. **API Response Example**: Explains the structure of the response expected from your API (e.g., `musicList` and `adLink`).
4. **Features & Functionality**: Lists all major features and functionality of the SDK, including playback, volume control, and ad integration.

This **README.md** provides clear documentation for users on how to integrate and use the Coum SDK in different environments. You can copy this file to your **`/public/coum-sdk`** folder for distribution.

Let me know if you need further customization or clarifications!