import { useRef, useState } from "react";
import "./App.css";

const specialSongs = {
  nivetha: {
    tamil: "/audio/nivetha-tamil.mp3",
   
  },

  nandeta: {
    tamil: "/audio/nandeta-tamil.mp3",
    
  },

  brownie: {
    tamil: "/audio/nivetha.mp3",
   
  },
};

const specialNames = {
  nivetha: {
    displayName: "Nivetha",
    emoji: "💜",
  },

  nandeta: {
    displayName: "Nandeta",
    emoji: "✨",
  },

  brownie: {
    displayName: "Brownie",
    emoji: "🍫",
  },
};

function App() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [status, setStatus] = useState("Single");
  const [language, setLanguage] = useState("Tamil");

  const [song, setSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const audioRef = useRef(null);

  // ========================================
  // GET SPECIAL NAME
  // ========================================

  const getSpecialName = () => {
    return specialNames[
      name.trim().toLowerCase()
    ];
  };

  // ========================================
  // GENERATE SONG
  // ========================================

  const generateSong = () => {
    setError("");

    const cleanName =
      name.trim().toLowerCase();

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!age) {
      setError("Please enter your age");
      return;
    }

    if (
      Number(age) < 1 ||
      Number(age) > 100
    ) {
      setError("Please enter a valid age");
      return;
    }

    // Only special names have local songs
    if (!specialNames[cleanName]) {
      setError(
        "Try one of the special names: Nivetha, Nandeta or Brownie ❤️"
      );
      return;
    }

    if (status === "Committed") {
      setShowConfirm(true);
      return;
    }

    playSpecialSong();
  };

  // ========================================
  // PLAY SPECIAL SONG
  // ========================================

  const playSpecialSong = () => {
    const cleanName =
      name.trim().toLowerCase();

    const nameData =
      specialNames[cleanName];

    const songData =
      specialSongs[cleanName];

    if (!songData) {
      setError(
        "Special song not found."
      );
      return;
    }

    const audioFile =
      language === "Tamil"
        ? songData.tamil
        : songData.english;

    setSong({
      name: nameData.displayName,
      emoji: nameData.emoji,
      language,
      audio: audioFile,
    });

    setIsPlaying(false);

    // Wait until React renders audio
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();

        const playPromise =
          audioRef.current.play();

        if (playPromise) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch(() => {
              // Browser autoplay may block.
              setIsPlaying(false);
            });
        }
      }
    }, 150);
  };

  // ========================================
  // YES
  // ========================================

  const handleYes = () => {
    setShowConfirm(false);
    playSpecialSong();
  };

  // ========================================
  // NO
  // ========================================

  const handleNo = () => {
    setShowConfirm(false);
    setStatus("Single");
  };

  // ========================================
  // PLAY
  // ========================================

  const playAudio = () => {
    if (!audioRef.current) return;

    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(() => {
        setError(
          "Unable to play this audio file."
        );
      });
  };

  // ========================================
  // PAUSE
  // ========================================

  const pauseAudio = () => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    setIsPlaying(false);
  };

  // ========================================
  // AUDIO ENDED
  // ========================================

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // ========================================
  // AUDIO ERROR
  // ========================================

  const handleAudioError = () => {
    setIsPlaying(false);

    setError(
      "Audio file not found. Check the file name inside public/audio."
    );
  };

  const special =
    getSpecialName();

  return (
    <div className="app">

      <div className="glow glow-one"></div>
      <div className="glow glow-two"></div>

      <main className="container">

        {/* HERO */}

        <section className="hero">

          <div className="music-icon">
            🎵
          </div>

          <h1>
            AI Music
            <span> Generator</span>
          </h1>

          <p>
            Enter your details and discover
            your special song.
          </p>

        </section>

        {/* FORM */}

        <section className="card">

          <div className="section-title">
            ✨ Create Your Song
          </div>

          {/* NAME */}

          <div className="input-group">

            <label>
              Your Name
            </label>

            <input
              type="text"
              placeholder="Enter You Name "
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

          </div>

          {/* SPECIAL NAME DETECTION */}

          {special && (
            <div className="special-detected">

              <span>
                {special.emoji}
              </span>

              <div>
                <strong>
                  Special name detected!
                </strong>

                <small>
                  {special.displayName}'s
                  special song is ready 🎵
                </small>
              </div>

            </div>
          )}

          {/* AGE */}

          <div className="input-group">

            <label>
              Your Age
            </label>

            <input
              type="number"
              min="1"
              max="100"
              placeholder="Enter your age"
              value={age}
              onChange={(e) =>
                setAge(e.target.value)
              }
            />

          </div>

          {/* RELATIONSHIP */}

          <div className="input-group">

            <label>
              Relationship Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
            >

              <option value="Single">
                Single
              </option>

              <option value="Committed">
                Committed
              </option>

            </select>

          </div>

          {/* LANGUAGE */}

          <div className="input-group">

            <label>
              Choose Music Language 🎧
            </label>

            <div className="language-grid">

              <button
                type="button"
                className={
                  language === "Tamil"
                    ? "language active"
                    : "language"
                }
                onClick={() =>
                  setLanguage("Tamil")
                }
              >

                <span>
                  🇮🇳
                </span>

                <div>
                  <strong>
                    Tamil
                  </strong>

                  <small>
                    Tamil Song
                  </small>
                </div>

                {language === "Tamil" && (
                  <b>✓</b>
                )}

              </button>

              <button
                type="button"
                className={
                  language === "English"
                    ? "language active"
                    : "language"
                }
                onClick={() =>
                  setLanguage("English")
                }
              >

                <span>
                  🇬🇧
                </span>

                <div>
                  <strong>
                    English
                  </strong>

                  <small>
                    English Song
                  </small>
                </div>

                {language === "English" && (
                  <b>✓</b>
                )}

              </button>

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="error">
              ⚠️ {error}
            </div>
          )}

          {/* BUTTON */}

          <button
            className="generate-btn"
            onClick={generateSong}
          >
            🎵 Generate My Song
          </button>

        </section>

        {/* RESULT */}

        {song && (
          <section className="card result-card">

            <div className="result-title">

              <div className="result-icon">
                {song.emoji}
              </div>

              <div>

                <span>
                  SPECIAL MUSIC
                </span>

                <h2>
                  {song.name}'s Song
                </h2>

              </div>

            </div>

            <div className="song-badge">
              {song.language === "Tamil"
                ? "🇮🇳 Tamil"
                : "🇬🇧 English"}
            </div>

            {/* AUDIO */}

            <div className="audio-box">

              <div className="disc">
                🎵
              </div>

              <div className="audio-info">

                <strong>
                  {song.name}'s
                  Special Song
                </strong>

                <span>
                  {song.language} Music
                </span>

              </div>

            </div>

            <audio
              ref={audioRef}
              src={song.audio}
              controls
              onPlay={() =>
                setIsPlaying(true)
              }
              onPause={() =>
                setIsPlaying(false)
              }
              onEnded={handleAudioEnded}
              onError={handleAudioError}
            />

            {/* CONTROLS */}

            <div className="controls">

              <button
                onClick={playAudio}
                disabled={isPlaying}
              >
                ▶ Play
              </button>

              <button
                onClick={pauseAudio}
                disabled={!isPlaying}
              >
                ⏸ Pause
              </button>

            </div>

            {isPlaying && (
              <div className="playing">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>

                <p>
                  Now Playing 🎵
                </p>
              </div>
            )}

          </section>
        )}

        {/* FOOTER */}

        <footer>

          <strong>
            🎵 AI Music Generator
          </strong>

          <p>
            Special songs powered by
            your local audio files
          </p>

        </footer>

      </main>

      {/* POPUP */}

      {showConfirm && (
        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-heart">
              ❤️
            </div>

            <h2>
              Wait a second! 👀
            </h2>

            <p>
              Your BF won't get mad if I
              play the special song, right?
              👀❤️
            </p>

            <p>
              If not, click Yes and I'll
              play the song for you. 🎵
            </p>

            <div className="modal-buttons">

              <button
                className="yes"
                onClick={handleYes}
              >
                Yes ❤️
              </button>

              <button
                className="no"
                onClick={handleNo}
              >
                No 😅
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default App;