import { useState } from "react";

import {
  Music2,
  Sparkles,
  User,
  Heart,
  Languages,
  Play,
  Search,
  Loader2,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://ai-song-backend.onrender.com";

function App() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [relationship, setRelationship] =
    useState("Single");
  const [language, setLanguage] =
    useState("Tamil");

  const [result, setResult] = useState(null);
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] =
    useState(null);

  const [specialSong, setSpecialSong] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [songLoading, setSongLoading] =
    useState(false);

  const [error, setError] = useState("");

  // ============================================
  // BROWNIE SPECIAL SONG
  // Only "Brownie" gets local song
  // ============================================
  const getBrownieSong = (selectedLanguage) => {
    if (selectedLanguage === "Tamil") {
      return {
        title: "Brownie Tamil Special Song",
        channel: "Brownie Special",
        audio: "/audio/brownie-tamil.mp3",
      };
    }

    return {
      title: "Brownie English Special Song",
      channel: "Brownie Special",
      audio: "/audio/brownie-english.mp3",
    };
  };

  // ============================================
  // GENERATE MUSIC
  // ============================================
  const generateSong = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);
    setSongs([]);
    setSelectedSong(null);
    setSpecialSong(null);

    // -----------------------------
    // Validation
    // -----------------------------
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!age) {
      setError("Please enter your age.");
      return;
    }

    if (
      Number(age) < 1 ||
      Number(age) > 100
    ) {
      setError("Please enter a valid age.");
      return;
    }

    const cleanName = name.trim();

    // ============================================
    // BROWNIE SPECIAL CASE
    // ============================================
    if (
      cleanName.toLowerCase() ===
      "brownie"
    ) {
      const brownieSong =
        getBrownieSong(language);

      setResult({
        success: true,
        name: cleanName,
        age: Number(age),
        relationship,
        language,
        data: {
          vibe:
            language === "Tamil"
              ? "Brownie Tamil Vibe 🍫🎵"
              : "Brownie English Vibe 🍫🎵",

          description:
            "This is a special music experience created only for Brownie. Enjoy the special song! 🎶",

          songSearch:
            "Brownie Special Song",

          reason:
            "Brownie has a special local song assigned to this name.",
        },
      });

      setSpecialSong(brownieSong);

      return;
    }

    // ============================================
    // NORMAL USERS
    // Gemini + YouTube
    // ============================================
    setLoading(true);

    try {
      // -----------------------------
      // 1. Gemini
      // -----------------------------
      const response = await fetch(
        `${API_URL}/api/generate-song`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: cleanName,
            age: Number(age),
            relationship,
            language,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to generate song vibe."
        );
      }

      setResult(data);

      // -----------------------------
      // 2. Get YouTube search query
      // -----------------------------
      const searchQuery =
        data?.data?.songSearch;

      if (!searchQuery) {
        throw new Error(
          "Gemini did not generate a song search query."
        );
      }

      // -----------------------------
      // 3. YouTube Search
      // -----------------------------
      setSongLoading(true);

      const youtubeResponse =
        await fetch(
          `${API_URL}/api/music/search?name=${encodeURIComponent(
            searchQuery
          )}&language=${encodeURIComponent(
            language
          )}`
        );

      const youtubeData =
        await youtubeResponse.json();

      if (!youtubeResponse.ok) {
        throw new Error(
          youtubeData?.message ||
            "YouTube song search failed."
        );
      }

      const songList =
        youtubeData?.data || [];

      setSongs(songList);

      if (songList.length > 0) {
        setSelectedSong(
          songList[0]
        );
      }
    } catch (err) {
      console.error(
        "Generate error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
      setSongLoading(false);
    }
  };

  // ============================================
  // PLAY YOUTUBE SONG
  // ============================================
  const playSong = (song) => {
    setSelectedSong(song);

    setSpecialSong(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ============================================
  // RESET
  // ============================================
  const resetApp = () => {
    setName("");
    setAge("");
    setRelationship("Single");
    setLanguage("Tamil");

    setResult(null);
    setSongs([]);
    setSelectedSong(null);
    setSpecialSong(null);

    setError("");
    setLoading(false);
    setSongLoading(false);
  };

  return (
    <div className="app">

      {/* ==========================================
          HEADER
      ========================================== */}
      <header className="header">

        <div className="logo">

          <div className="logo-icon">
            <Music2 size={24} />
          </div>

          <div>
            <h1>AI Music</h1>
            <span>Generator</span>
          </div>

        </div>

        <div className="header-badge">
          <Sparkles size={16} />

          Gemini + YouTube
        </div>

      </header>

      {/* ==========================================
          MAIN
      ========================================== */}
      <main className="container">

        {/* ========================================
            HERO
        ======================================== */}
        <section className="hero">

          <div className="hero-icon">
            <Music2 size={38} />
          </div>

          <h2>
            Find Your Perfect
            <span> Music Vibe</span>
          </h2>

          <p>
            Tell us a little about yourself.
            Our AI will create a fictional
            music vibe and find matching
            songs on YouTube.
          </p>

        </section>

        {/* ========================================
            FORM
        ======================================== */}
        <section className="card form-card">

          <div className="section-title">

            <Sparkles size={20} />

            <div>

              <h3>
                Create Your Music Vibe
              </h3>

              <p>
                Enter your details below
              </p>

            </div>

          </div>

          <form onSubmit={generateSong}>

            <div className="form-grid">

              {/* NAME */}
              <div className="form-group">

                <label>
                  <User size={16} />
                  Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                />

              </div>

              {/* AGE */}
              <div className="form-group">

                <label>
                  <User size={16} />
                  Age
                </label>

                <input
                  type="number"
                  placeholder="Enter your age"
                  min="1"
                  max="100"
                  value={age}
                  onChange={(e) =>
                    setAge(
                      e.target.value
                    )
                  }
                />

              </div>

              {/* RELATIONSHIP */}
              <div className="form-group">

                <label>
                  <Heart size={16} />
                  Relationship
                </label>

                <select
                  value={relationship}
                  onChange={(e) =>
                    setRelationship(
                      e.target.value
                    )
                  }
                >

                  <option value="Single">
                    Single
                  </option>

                  <option value="In a relationship">
                    In a relationship
                  </option>

                  <option value="Married">
                    Married
                  </option>

                  <option value="Complicated">
                    Complicated
                  </option>

                  <option value="Just having fun">
                    Just having fun
                  </option>

                </select>

              </div>

              {/* LANGUAGE */}
              <div className="form-group">

                <label>
                  <Languages size={16} />
                  Music Language
                </label>

                <select
                  value={language}
                  onChange={(e) =>
                    setLanguage(
                      e.target.value
                    )
                  }
                >

                  <option value="Tamil">
                    Tamil
                  </option>

                  <option value="English">
                    English
                  </option>

                </select>

              </div>

            </div>

            {/* ERROR */}
            {error && (
              <div className="error">
                {error}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              className="generate-btn"
              disabled={
                loading ||
                songLoading
              }
            >

              {loading ? (
                <>
                  <Loader2
                    size={20}
                    className="spin"
                  />

                  Creating Your Vibe...
                </>
              ) : (
                <>
                  <Sparkles size={20} />

                  Generate My Music
                </>
              )}

            </button>

          </form>

        </section>

        {/* ========================================
            RESULT
        ======================================== */}
        {result && (

          <section className="result-section">

            {/* ====================================
                VIBE CARD
            ==================================== */}
            <div className="card vibe-card">

              <div className="result-header">

                <div>

                  <span className="result-label">
                    AI GENERATED VIBE
                  </span>

                  <h2>
                    {result?.data?.vibe ||
                      "Feel Good"}
                  </h2>

                </div>

                <div className="vibe-icon">
                  <Music2 size={28} />
                </div>

              </div>

              <p className="description">
                {result?.data?.description}
              </p>

              <div className="reason">

                <Sparkles size={17} />

                <span>
                  {result?.data?.reason}
                </span>

              </div>

              <div className="search-query">

                <Search size={16} />

                <span>
                  YouTube search:
                </span>

                <strong>
                  {result?.data?.songSearch}
                </strong>

              </div>

            </div>

            {/* ====================================
                BROWNIE LOCAL PLAYER
            ==================================== */}
            {specialSong && (

              <div className="card player-card">

                <div className="player-header">

                  <div>

                    <span>
                      BROWNIE SPECIAL 🎵
                    </span>

                    <h3>
                      {specialSong.title}
                    </h3>

                    <p>
                      {specialSong.channel}
                    </p>

                  </div>

                  <Music2 size={24} />

                </div>

                <div
                  className="audio-wrapper"
                  style={{
                    padding: "20px",
                  }}
                >

                  <audio
                    controls
                    autoPlay
                    style={{
                      width: "100%",
                    }}
                    src={
                      specialSong.audio
                    }
                  >
                    Your browser does not
                    support the audio element.
                  </audio>

                </div>

              </div>

            )}

            {/* ====================================
                YOUTUBE PLAYER
                Only normal names
            ==================================== */}
            {!specialSong &&
              selectedSong && (

                <div className="card player-card">

                  <div className="player-header">

                    <div>

                      <span>
                        NOW PLAYING
                      </span>

                      <h3>
                        {selectedSong.title}
                      </h3>

                      <p>
                        {selectedSong.channel}
                      </p>

                    </div>

                    <Music2 size={24} />

                  </div>

                  <div className="video-wrapper">

                    <iframe
                      src={`https://www.youtube.com/embed/${selectedSong.videoId}?autoplay=1&rel=0`}
                      title={
                        selectedSong.title
                      }
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />

                  </div>

                  <a
                    className="youtube-link"
                    href={`https://www.youtube.com/watch?v=${selectedSong.videoId}`}
                    target="_blank"
                    rel="noreferrer"
                  >

                    <ExternalLink
                      size={17}
                    />

                    Open on YouTube

                  </a>

                </div>

              )}

            {/* ====================================
                RECOMMENDED SONGS
                Hidden for Brownie
            ==================================== */}
            {!specialSong && (

              <div className="songs-section">

                <div className="songs-header">

                  <div>

                    <span className="result-label">
                      RECOMMENDED SONGS
                    </span>

                    <h2>
                      Songs For You
                    </h2>

                  </div>

                  <span className="count">
                    {songs.length} songs
                  </span>

                </div>

                {/* SONG LOADING */}
                {songLoading ? (

                  <div className="loading-box">

                    <Loader2
                      size={28}
                      className="spin"
                    />

                    <p>
                      Searching YouTube...
                    </p>

                  </div>

                ) : (

                  <div className="songs-grid">

                    {songs.map(
                      (song) => (

                        <div
                          className={`song-card ${
                            selectedSong
                              ?.videoId ===
                            song.videoId
                              ? "active"
                              : ""
                          }`}
                          key={
                            song.videoId
                          }
                        >

                          {/* THUMBNAIL */}
                          <div
                            className="thumbnail"
                            onClick={() =>
                              playSong(
                                song
                              )
                            }
                          >

                            <img
                              src={
                                song.thumbnail
                              }
                              alt={
                                song.title
                              }
                            />

                            <div className="play-overlay">

                              <Play
                                size={24}
                                fill="currentColor"
                              />

                            </div>

                          </div>

                          {/* SONG INFO */}
                          <div className="song-info">

                            <h3
                              title={
                                song.title
                              }
                            >
                              {song.title}
                            </h3>

                            <p>
                              {song.channel}
                            </p>

                            <button
                              className="play-btn"
                              onClick={() =>
                                playSong(
                                  song
                                )
                              }
                            >

                              <Play
                                size={16}
                                fill="currentColor"
                              />

                              Play

                            </button>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

                {/* EMPTY */}
                {!songLoading &&
                  songs.length ===
                    0 && (

                    <div className="empty-box">

                      <Music2 size={32} />

                      <p>
                        No songs found.
                      </p>

                    </div>

                  )}

              </div>

            )}

            {/* ====================================
                RESET
            ==================================== */}
            <button
              className="reset-btn"
              onClick={resetApp}
            >

              <RotateCcw size={17} />

              Create Another Music Vibe

            </button>

          </section>

        )}

      </main>

      {/* ==========================================
          FOOTER
      ========================================== */}
      <footer>

        <p>
          AI-generated music recommendations
          powered by Gemini & YouTube.
        </p>

      </footer>

    </div>
  );
}

export default App;