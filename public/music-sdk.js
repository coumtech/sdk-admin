(function (global) {
    class MusicSDK {
      constructor(publicKey, elementId, options = {}) {
        this.publicKey = publicKey; // Public key for identifying the user
        this.elementId = elementId; // Element ID where the player will be initialized
        this.apiEndpoint = options.apiEndpoint || 'https://api.example.com/getMusicData'; // Default API endpoint if not provided
        this.volume = options.volume || 1; // Default volume for the player
        this.musicList = [];
        this.adLink = null;
        this.likedTracks = [];
        this.startTime = null;
        this.player = null; // Initialize the player as null
        this.currentTrackIndex = 0;
        this.isPlaying = false;
  
        // Fetch music and initialize the player within the given element
        this.init();
      }
  
      // Fetch music and ad data from the external API using the public key
      async fetchMusicAndAds() {
        try {
          const response = await fetch(`${this.apiEndpoint}?publicKey=${this.publicKey}`);
          const data = await response.json();
  
          if (data.musicList && data.adLink) {
            this.musicList = data.musicList;  // List of music URLs
            this.adLink = data.adLink;        // Ad link URL
          } else {
            console.error('Error: Music list or Ad link missing from API response.');
          }
        } catch (error) {
          console.error('Error fetching music and ads:', error);
        }
      }
  
      // Initialize the SDK player
      async init() {
        await this.fetchMusicAndAds(); // Fetch music and ads before initializing the player
        this.initPlayerInElement();
      }
  
      // Initialize the player in the specified element by element ID
      initPlayerInElement() {
        const container = document.getElementById(this.elementId);
        if (!container) {
          console.error(`Element with ID ${this.elementId} not found`);
          return;
        }
  
        // Create player UI inside the element
        container.innerHTML = `
          <div className="music-sdk-player">
            <button className="play-pause-btn">Play/Pause</button>
            <button className="skip-btn">Skip</button>
            <div className="volume-control">
              <label>Volume:</label>
              <input type="range" className="volume-slider" min="0" max="1" step="0.1" value="${this.volume}">
            </div>
            <div id="adBanner-${this.elementId}" className="ad-banner">Click for more info</div>
          </div>
        `;
  
        // Initialize audio player with first track
        this.player = new Audio(this.musicList[this.currentTrackIndex]);
        this.player.volume = this.volume;
  
        // Attach event listeners for the player controls
        container.querySelector('.play-pause-btn').addEventListener('click', () => this.togglePlay());
        container.querySelector('.skip-btn').addEventListener('click', () => this.skip());
        container.querySelector('.volume-slider').addEventListener('input', (event) => this.setVolume(event.target.value));
        container.querySelector(`#adBanner-${this.elementId}`).addEventListener('click', () => this.handleAdClick());
      }
  
      // Play or pause the current track
      togglePlay() {
        if (this.isPlaying) {
          this.player.pause();
          this.isPlaying = false;
        } else {
          this.player.play();
          this.isPlaying = true;
          this.startTime = Date.now(); // Track start time for like/dislike
        }
      }
  
      // Skip to the next song
      nextSong() {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.musicList.length;
        this.loadTrack(this.currentTrackIndex);
      }
  
      // Skip the current song (like/dislike logic)
      skip() {
        const playTime = (Date.now() - this.startTime) / 1000;
        if (playTime < 30) {
          console.log('Track Disliked');
        } else {
          console.log('Track Liked');
          this.likedTracks.push(this.musicList[this.currentTrackIndex]);
        }
        this.nextSong();
      }
  
      // Load a new track
      loadTrack(index) {
        this.player.src = this.musicList[index];
        this.player.play();
        this.isPlaying = true;
        this.startTime = Date.now();
      }
  
      // Adjust volume
      setVolume(level) {
        this.volume = level;
        this.player.volume = this.volume;
      }
  
      // Handle ad banner click
      handleAdClick() {
        if (this.adLink) {
          window.open(this.adLink, '_blank');
        } else {
          console.error('No ad link provided');
        }
      }
  
      // Display liked songs at the end of a session
      getLikedSongs() {
        return this.likedTracks;
      }
    }
  
    // Expose the SDK to global scope
    global.MusicSDK = MusicSDK;
  })(window);
  
  // Example Usage:
//   const musicSDK1 = new MusicSDK('PUBLIC_KEY_1', 'music-player-1'); // Without options, defaults used
//   const musicSDK2 = new MusicSDK('PUBLIC_KEY_2', 'music-player-2', { apiEndpoint: 'https://api.example.com/getMusicData', volume: 0.8 }); // With custom options
  