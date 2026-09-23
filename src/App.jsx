import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search, Home, Heart, ListMusic, Clock3, Play, Pause, SkipBack,
  SkipForward, Volume2, VolumeX, Plus, Trash2, Menu, X, ExternalLink,
  Music2, MoreHorizontal
} from "lucide-react";
import { searchYouTube } from "./api/youtube";

const LS_FAV = "my_music_favorites";
const LS_RECENT = "my_music_recent";
const LS_QUEUE = "my_music_queue";
const LS_PLAYLISTS = "my_music_playlists";

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function App() {
  const [view, setView] = useState("home");
  const [query, setQuery] = useState("");
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [favorites, setFavorites] = useState(() => load(LS_FAV, []));
  const [recent, setRecent] = useState(() => load(LS_RECENT, []));
  const [queue, setQueue] = useState(() => load(LS_QUEUE, []));
  const [playlists, setPlaylists] = useState(() => load(LS_PLAYLISTS, { "My Playlist": [] }));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const playerRef = useRef(null);
  const apiReady = useRef(false);

  useEffect(() => {
    save(LS_FAV, favorites);
    save(LS_RECENT, recent);
    save(LS_QUEUE, queue);
    save(LS_PLAYLISTS, playlists);
  }, [favorites, recent, queue, playlists]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    window.onYouTubeIframeAPIReady = () => { apiReady.current = true; };
    document.body.appendChild(script);
    return () => { delete window.onYouTubeIframeAPIReady; };
  }, []);

  const playSong = (song, addRecent = true) => {
    setCurrent(song);
    setPlaying(true);
    if (addRecent) {
      setRecent(prev => [song, ...prev.filter(x => x.id !== song.id)].slice(0, 30));
    }
  };

  useEffect(() => {
    if (!current || !window.YT?.Player) return;
    if (!playerRef.current) {
      playerRef.current = new window.YT.Player("yt-player", {
        videoId: current.id,
        playerVars: { autoplay: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: e => {
            e.target.setVolume(volume);
            if (playing) e.target.playVideo();
          },
          onStateChange: e => {
            if (window.YT?.PlayerState && e.data === window.YT.PlayerState.ENDED) nextSong();
          }
        }
      });
    } else {
      playerRef.current.loadVideoById(current.id);
    }
  }, [current?.id]);

  useEffect(() => {
    if (!playerRef.current) return;
    if (playing) playerRef.current.playVideo?.();
    else playerRef.current.pauseVideo?.();
  }, [playing]);

  useEffect(() => {
    playerRef.current?.setVolume?.(muted ? 0 : volume);
  }, [volume, muted]);

  const nextSong = () => {
    if (!current) return;
    const idx = queue.findIndex(x => x.id === current.id);
    if (idx >= 0 && idx < queue.length - 1) playSong(queue[idx + 1]);
    else if (queue.length) playSong(queue[0]);
  };

  const prevSong = () => {
    if (!current || !queue.length) return;
    const idx = queue.findIndex(x => x.id === current.id);
    playSong(queue[Math.max(0, idx - 1)]);
  };

  const doSearch = async (e) => {
    e?.preventDefault();
    const q = searchText.trim();
    if (!q) return;
    setQuery(q);
    setView("search");
    setLoading(true);
    setError("");
    try {
      const data = await searchYouTube(q);
      setResults(data.items);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const toggleFavorite = (song) => {
    setFavorites(prev => prev.some(x => x.id === song.id)
      ? prev.filter(x => x.id !== song.id)
      : [song, ...prev]);
  };

  const addQueue = (song) => {
    setQueue(prev => prev.some(x => x.id === song.id) ? prev : [...prev, song]);
  };

  const removeQueue = (id) => setQueue(prev => prev.filter(x => x.id !== id));

  const addPlaylist = (song) => {
    setPlaylists(prev => ({
      ...prev,
      "My Playlist": prev["My Playlist"].some(x => x.id === song.id)
        ? prev["My Playlist"]
        : [...prev["My Playlist"], song]
    }));
  };

  const isFav = id => favorites.some(x => x.id === id);

  const homeItems = useMemo(() => {
    if (view === "favorites") return favorites;
    if (view === "recent") return recent;
    if (view === "playlist") return playlists["My Playlist"] || [];
    return results;
  }, [view, favorites, recent, playlists, results]);

  return (
    <div className="app">
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="brand"><Music2 size={28}/><span>My Music</span><button className="close" onClick={() => setMobileOpen(false)}><X/></button></div>
        <nav>
          <button className={view==="home" ? "active":""} onClick={() => {setView("home");setMobileOpen(false)}}><Home/> Home</button>
          <button className={view==="favorites" ? "active":""} onClick={() => {setView("favorites");setMobileOpen(false)}}><Heart/> Favorites</button>
          <button className={view==="recent" ? "active":""} onClick={() => {setView("recent");setMobileOpen(false)}}><Clock3/> Recently Played</button>
          <button className={view==="playlist" ? "active":""} onClick={() => {setView("playlist");setMobileOpen(false)}}><ListMusic/> My Playlist</button>
        </nav>
        <div className="sidebar-footer">YouTube-powered player</div>
      </aside>

      {mobileOpen && <div className="overlay" onClick={() => setMobileOpen(false)}/>}

      <main className="main">
        <header>
          <button className="menu" onClick={() => setMobileOpen(true)}><Menu/></button>
          <form className="search" onSubmit={doSearch}>
            <Search size={19}/>
            <input value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="Search songs, artists, videos..." />
          </form>
          <button className="queueBtn" onClick={() => setShowQueue(!showQueue)}><ListMusic/> <span>{queue.length}</span></button>
        </header>

        <section className="content">
          {view === "home" && !results.length ? (
            <div className="hero">
              <div>
                <span className="eyebrow">YOUR PERSONAL PLAYER</span>
                <h1>Find your next<br/><span>favorite song.</span></h1>
                <p>Search YouTube and play music in a clean, focused interface.</p>
                <button className="primary" onClick={() => document.querySelector(".search input")?.focus()}><Search/> Start searching</button>
              </div>
              <div className="hero-disc"><Music2 size={90}/></div>
            </div>
          ) : (
            <>
              <div className="sectionTitle">
                <div><span className="eyebrow">{view === "search" ? "SEARCH RESULTS" : "YOUR LIBRARY"}</span><h2>{view === "search" ? `Results for “${query}”` : view === "favorites" ? "Favorites" : view === "recent" ? "Recently Played" : "My Playlist"}</h2></div>
              </div>
              {loading && <div className="status">Searching YouTube…</div>}
              {error && <div className="error">{error}</div>}
              {!loading && !error && homeItems.length === 0 && <div className="empty">Nothing here yet.</div>}
              <div className="grid">
                {homeItems.map(song => (
                  <article className="card" key={song.id}>
                    <div className="thumb" onClick={() => playSong(song)}>
                      <img src={song.thumbnail} alt="" />
                      <div className="playOverlay"><Play fill="currentColor"/></div>
                    </div>
                    <div className="cardBody">
                      <div className="title" title={song.title}>{song.title}</div>
                      <div className="channel">{song.channel}</div>
                      <div className="actions">
                        <button title="Play" onClick={() => playSong(song)}><Play size={17}/></button>
                        <button title="Queue" onClick={() => addQueue(song)}><Plus size={17}/></button>
                        <button title="Playlist" onClick={() => addPlaylist(song)}><ListMusic size={17}/></button>
                        <button className={isFav(song.id) ? "liked":""} title="Favorite" onClick={() => toggleFavorite(song)}><Heart size={17} fill={isFav(song.id) ? "currentColor":"none"}/></button>
                        <a title="Open YouTube" href={`https://www.youtube.com/watch?v=${song.id}`} target="_blank" rel="noreferrer"><ExternalLink size={16}/></a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      <div className="playerBar">
        <div className="now">
          {current ? <><img src={current.thumbnail} alt=""/><div><strong>{current.title}</strong><small>{current.channel}</small></div></> : <><div className="miniLogo"><Music2/></div><div><strong>Nothing playing</strong><small>Search for a song</small></div></>}
        </div>
        <div className="controls">
          <button onClick={prevSong}><SkipBack fill="currentColor"/></button>
          <button className="playBtn" onClick={() => current && setPlaying(!playing)}>{playing ? <Pause fill="currentColor"/> : <Play fill="currentColor"/>}</button>
          <button onClick={nextSong}><SkipForward fill="currentColor"/></button>
        </div>
        <div className="volume">
          <button onClick={() => setMuted(!muted)}>{muted || volume === 0 ? <VolumeX/> : <Volume2/>}</button>
          <input type="range" min="0" max="100" value={muted ? 0 : volume} onChange={e=>{setMuted(false);setVolume(Number(e.target.value))}}/>
        </div>
      </div>

      <div className="hiddenPlayer"><div id="yt-player"></div></div>

      {showQueue && (
        <aside className="queuePanel">
          <div className="queueHeader"><h3>Queue</h3><button onClick={()=>setShowQueue(false)}><X/></button></div>
          {queue.length === 0 ? <div className="empty">Your queue is empty.</div> : queue.map((song,i)=>(
            <div className={`queueItem ${current?.id===song.id?"current":""}`} key={song.id}>
              <img src={song.thumbnail} alt=""/>
              <button className="qInfo" onClick={()=>playSong(song)}><strong>{song.title}</strong><small>{song.channel}</small></button>
              <button onClick={()=>removeQueue(song.id)}><Trash2 size={17}/></button>
            </div>
          ))}
        </aside>
      )}
    </div>
  );
}

export default App;
