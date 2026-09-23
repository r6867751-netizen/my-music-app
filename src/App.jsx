import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search, Home, Heart, ListMusic, Clock3, Play, Pause, SkipBack,
  SkipForward, Volume2, VolumeX, Plus, Trash2, Menu, X, ExternalLink,
  Music2, MoreHorizontal, Minimize2
} from "lucide-react";
import { fetchTrendingYouTube, searchYouTube } from "./api/youtube";

const LS_FAV = "my_music_favorites";
const LS_RECENT = "my_music_recent";
const LS_QUEUE = "my_music_queue";
const LS_PLAYLISTS = "my_music_playlists";
const SESSION_KEY = "my_music_session";
const LANGUAGE_KEY = "my_music_language";

const TRANSLATIONS = {
  en: {
    home: "Home", favorites: "Favorites", recentlyPlayed: "Recently Played", playlist: "My Playlist",
    searchPlaceholder: "Search songs, artists, videos...", queue: "Queue", personalPlayer: "YOUR PERSONAL PLAYER",
    findNext: "Find your next", favoriteSong: "favorite song.", searchDescription: "Search YouTube and play music in a clean, focused interface.",
    startSearching: "Start searching", myFavorites: "My favorites", trending: "Trending now", freshPicks: "Fresh picks", feelGood: "Feel-good", chillTag: "Chill", workout: "Workout", recommended: "RECOMMENDED FOR YOU",
    popularPicks: "Popular picks everyone is replaying", mood: "For your mood", moodSubtitle: "High-energy tracks to lift your day",
    chill: "Chill evenings", chillSubtitle: "Cool, smooth and relaxing picks", searchResults: "SEARCH RESULTS", library: "YOUR LIBRARY",
    resultsFor: "Results for", nothing: "Nothing here yet.", searching: "Searching YouTube...", similar: "More like", basedOnSearch: "BASED ON YOUR SEARCH",
    similarSubtitle: "Similar songs you may enjoy", nothingPlaying: "Nothing playing", searchSong: "Search for a song", emptyQueue: "Your queue is empty.",
    youtubePlayer: "YouTube-powered player", language: "Language", openYoutube: "Open YouTube", play: "Play", addQueue: "Queue",
    addPlaylist: "Playlist", playlistNamePrompt: "Enter a playlist name", createPlaylist: "Save to playlist", cancel: "Cancel", deletePlaylist: "Delete playlist", deletePlaylistConfirm: "Delete this playlist and all its songs?", favorite: "Favorite", previous: "Previous track", next: "Next track", mute: "Mute", unmute: "Unmute"
  },
  hi: {
    home: "होम", favorites: "पसंदीदा", recentlyPlayed: "हाल ही में चलाए गए", playlist: "मेरी प्लेलिस्ट",
    searchPlaceholder: "गाने, कलाकार, वीडियो खोजें...", queue: "कतार", personalPlayer: "आपका व्यक्तिगत प्लेयर",
    findNext: "अपना अगला", favoriteSong: "पसंदीदा गाना खोजें।", searchDescription: "YouTube पर संगीत खोजें और आसानी से सुनें।",
    startSearching: "खोजना शुरू करें", myFavorites: "मेरे पसंदीदा", trending: "अभी ट्रेंडिंग", freshPicks: "नए गाने", feelGood: "खुशनुमा", chillTag: "शांत", workout: "वर्कआउट", recommended: "आपके लिए सुझाव",
    popularPicks: "लोकप्रिय गाने जिन्हें सभी सुन रहे हैं", mood: "आपके मूड के लिए", moodSubtitle: "आपका दिन बेहतर बनाने वाले गाने",
    chill: "शांत शामें", chillSubtitle: "सुकून भरे और आरामदायक गाने", searchResults: "खोज परिणाम", library: "आपकी लाइब्रेरी",
    resultsFor: "के परिणाम", nothing: "यहां अभी कुछ नहीं है।", searching: "YouTube पर खोज रहे हैं...", similar: "इसके जैसे",
    basedOnSearch: "आपकी खोज के आधार पर", similarSubtitle: "शायद आपको ये गाने पसंद आएं", nothingPlaying: "कुछ नहीं चल रहा", searchSong: "गाना खोजें",
    emptyQueue: "आपकी कतार खाली है।", youtubePlayer: "YouTube प्लेयर", language: "भाषा", openYoutube: "YouTube खोलें", play: "चलाएं",
    addQueue: "कतार", addPlaylist: "प्लेलिस्ट", playlistNamePrompt: "प्लेलिस्ट का नाम लिखें", createPlaylist: "प्लेलिस्ट में सेव करें", cancel: "रद्द करें", deletePlaylist: "प्लेलिस्ट हटाएं", deletePlaylistConfirm: "क्या इस प्लेलिस्ट और इसके सभी गानों को हटाना है?", favorite: "पसंदीदा", previous: "पिछला गाना", next: "अगला गाना", mute: "म्यूट", unmute: "आवाज़ चालू करें"
  },
  ml: {
    home: "ഹോം", favorites: "പ്രിയപ്പെട്ടവ", recentlyPlayed: "അടുത്തിടെ പ്ലേ ചെയ്തത്", playlist: "എന്റെ പ്ലേലിസ്റ്റ്",
    searchPlaceholder: "പാട്ടുകൾ, കലാകാരന്മാർ, വീഡിയോകൾ തിരയുക...", queue: "ക്യൂ", personalPlayer: "നിങ്ങളുടെ വ്യക്തിഗത പ്ലെയർ",
    findNext: "നിങ്ങളുടെ അടുത്ത", favoriteSong: "പ്രിയപ്പെട്ട പാട്ട് കണ്ടെത്തൂ.", searchDescription: "YouTube-ൽ സംഗീതം തിരഞ്ഞ് എളുപ്പത്തിൽ കേൾക്കൂ.",
    startSearching: "തിരയാൻ തുടങ്ങുക", myFavorites: "എന്റെ പ്രിയപ്പെട്ടവ", trending: "ഇപ്പോൾ ട്രെൻഡിംഗ്", freshPicks: "പുതിയ തിരഞ്ഞെടുപ്പുകൾ", feelGood: "സന്തോഷം", chillTag: "ശാന്തം", workout: "വർക്ക്ഔട്ട്", recommended: "നിങ്ങൾക്കായി ശുപാർശകൾ",
    popularPicks: "എല്ലാവരും വീണ്ടും കേൾക്കുന്ന ജനപ്രിയ പാട്ടുകൾ", mood: "നിങ്ങളുടെ മൂഡിനായി", moodSubtitle: "നിങ്ങളുടെ ദിവസം ഉന്മേഷഭരിതമാക്കാൻ",
    chill: "ശാന്തമായ സായാഹ്നങ്ങൾ", chillSubtitle: "സുഖകരവും ശാന്തവുമായ പാട്ടുകൾ", searchResults: "തിരയൽ ഫലങ്ങൾ", library: "നിങ്ങളുടെ ലൈബ്രറി",
    resultsFor: "തിരയൽ ഫലങ്ങൾ", nothing: "ഇവിടെ ഒന്നുമില്ല.", searching: "YouTube-ൽ തിരയുന്നു...", similar: "ഇതുപോലുള്ളവ",
    basedOnSearch: "നിങ്ങളുടെ തിരയലിനെ അടിസ്ഥാനമാക്കി", similarSubtitle: "നിങ്ങൾക്ക് ഇഷ്ടപ്പെടാവുന്ന പാട്ടുകൾ", nothingPlaying: "ഒന്നും പ്ലേ ചെയ്യുന്നില്ല", searchSong: "ഒരു പാട്ട് തിരയുക",
    emptyQueue: "നിങ്ങളുടെ ക്യൂ ശൂന്യമാണ്.", youtubePlayer: "YouTube പ്ലെയർ", language: "ഭാഷ", openYoutube: "YouTube തുറക്കുക", play: "പ്ലേ",
    addQueue: "ക്യൂ", addPlaylist: "പ്ലേലിസ്റ്റ്", playlistNamePrompt: "പ്ലേലിസ്റ്റിന്റെ പേര് നൽകുക", createPlaylist: "പ്ലേലിസ്റ്റിൽ സൂക്ഷിക്കുക", cancel: "റദ്ദാക്കുക", deletePlaylist: "പ്ലേലിസ്റ്റ് നീക്കം ചെയ്യുക", deletePlaylistConfirm: "ഈ പ്ലേലിസ്റ്റും അതിലെ പാട്ടുകളും നീക്കം ചെയ്യണോ?", favorite: "പ്രിയപ്പെട്ടത്", previous: "മുമ്പത്തെ പാട്ട്", next: "അടുത്ത പാട്ട്", mute: "മ്യൂട്ട്", unmute: "ശബ്ദം ഓണാക്കുക"
  },
  ta: {
    home: "முகப்பு", favorites: "பிடித்தவை", recentlyPlayed: "சமீபத்தில் கேட்டவை", playlist: "எனது பிளேலிஸ்ட்",
    searchPlaceholder: "பாடல்கள், கலைஞர்கள், வீடியோக்களைத் தேடுங்கள்...", queue: "வரிசை", personalPlayer: "உங்கள் தனிப்பட்ட பிளேயர்",
    findNext: "உங்கள் அடுத்த", favoriteSong: "பிடித்த பாடலைக் கண்டுபிடியுங்கள்.", searchDescription: "YouTube-ல் இசையைத் தேடி எளிதாகக் கேளுங்கள்.",
    startSearching: "தேடத் தொடங்குங்கள்", myFavorites: "எனது பிடித்தவை", trending: "இப்போது பிரபலமானவை", freshPicks: "புதிய தேர்வுகள்", feelGood: "மகிழ்ச்சி", chillTag: "அமைதி", workout: "உடற்பயிற்சி", recommended: "உங்களுக்கான பரிந்துரைகள்",
    popularPicks: "அனைவரும் மீண்டும் கேட்கும் பிரபலமான பாடல்கள்", mood: "உங்கள் மனநிலைக்கு", moodSubtitle: "உங்கள் நாளை உற்சாகமாக்கும் பாடல்கள்",
    chill: "அமைதியான மாலைகள்", chillSubtitle: "மென்மையான மற்றும் நிதானமான பாடல்கள்", searchResults: "தேடல் முடிவுகள்", library: "உங்கள் நூலகம்",
    resultsFor: "தேடல் முடிவுகள்", nothing: "இங்கே எதுவும் இல்லை.", searching: "YouTube-ல் தேடுகிறது...", similar: "இதைப் போன்றவை",
    basedOnSearch: "உங்கள் தேடலின் அடிப்படையில்", similarSubtitle: "உங்களுக்கு பிடிக்கக்கூடிய பாடல்கள்", nothingPlaying: "எதுவும் இயங்கவில்லை", searchSong: "ஒரு பாடலைத் தேடுங்கள்",
    emptyQueue: "உங்கள் வரிசை காலியாக உள்ளது.", youtubePlayer: "YouTube பிளேயர்", language: "மொழி", openYoutube: "YouTube திறக்கவும்", play: "இயக்கு",
    addQueue: "வரிசை", addPlaylist: "பிளேலிஸ்ட்", playlistNamePrompt: "பிளேலிஸ்ட் பெயரை உள்ளிடவும்", createPlaylist: "பிளேலிஸ்ட்டில் சேமி", cancel: "ரத்து செய்", deletePlaylist: "பிளேலிஸ்ட்டை நீக்கு", deletePlaylistConfirm: "இந்த பிளேலிஸ்ட்டையும் அதன் பாடல்களையும் நீக்கவா?", favorite: "பிடித்தது", previous: "முந்தைய பாடல்", next: "அடுத்த பாடல்", mute: "ஒலியடக்கு", unmute: "ஒலியை இயக்கு"
  }
};

const HOME_RECOMMENDATION_SECTIONS = [
  {
    title: "Trending now",
    subtitle: "Popular picks everyone is replaying",
    songs: [
      { id: "dQw4w9WgXcQ", title: "Never Gonna Give You Up", channel: "Rick Astley", description: "A timeless pop classic.", thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg" },
      { id: "fJ9rUzIMcZQ", title: "Can't Stop the Feeling!", channel: "Justin Timberlake", description: "A feel-good anthem for every moment.", thumbnail: "https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg" },
      { id: "kJQP7kiw5Fk", title: "Despacito", channel: "Luis Fonsi", description: "A global hit full of energy.", thumbnail: "https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg" },
      { id: "2Vv-BfVoR4g", title: "Sunflower", channel: "Post Malone & Swae Lee", description: "Bright, warm and addictive.", thumbnail: "https://i.ytimg.com/vi/2Vv-BfVoR4g/hqdefault.jpg" }
    ]
  },
  {
    title: "For your mood",
    subtitle: "High-energy tracks to lift your day",
    songs: [
      { id: "3fumBcKC6RE", title: "Believer", channel: "Imagine Dragons", description: "Big vocals and a powerful hook.", thumbnail: "https://i.ytimg.com/vi/3fumBcKC6RE/hqdefault.jpg" },
      { id: "e-ORhEE9VVg", title: "Shape of You", channel: "Ed Sheeran", description: "Smooth, catchy and easy to replay.", thumbnail: "https://i.ytimg.com/vi/e-ORhEE9VVg/hqdefault.jpg" },
      { id: "YQHsXMglC9A", title: "Bohemian Rhapsody", channel: "Queen", description: "Epic and unforgettable.", thumbnail: "https://i.ytimg.com/vi/YQHsXMglC9A/hqdefault.jpg" },
      { id: "RgKAFK5djSk", title: "Locked out of Heaven", channel: "Bruno Mars", description: "Soulful rhythm with a modern groove.", thumbnail: "https://i.ytimg.com/vi/RgKAFK5djSk/hqdefault.jpg" }
    ]
  },
  {
    title: "Chill evenings",
    subtitle: "Cool, smooth and relaxing picks",
    songs: [
      { id: "xvqeSJxR-1o", title: "One Dance", channel: "Drake", description: "Easy flow and a laid-back pulse.", thumbnail: "https://i.ytimg.com/vi/xvqeSJxR-1o/hqdefault.jpg" },
      { id: "0KSOMA3QBU0", title: "Perfect", channel: "Ed Sheeran", description: "Warm, mellow and melodic.", thumbnail: "https://i.ytimg.com/vi/0KSOMA3QBU0/hqdefault.jpg" },
      { id: "5qap5aO4i9A", title: "Lo-fi beats", channel: "Chilled Studio", description: "A cozy background vibe.", thumbnail: "https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg" },
      { id: "JGwWNGJdvx8", title: "Sugar", channel: "Maroon 5", description: "A bright, polished pop favorite.", thumbnail: "https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg" }
    ]
  }
];

const RECOMMENDED_SONGS = HOME_RECOMMENDATION_SECTIONS.flatMap(section => section.songs);

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function loadSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || {}; } catch { return {}; }
}
function saveSession(value) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(value)); } catch {}
}

function App() {
  const savedSession = useRef(loadSession());
  const [language, setLanguage] = useState(() => load(LANGUAGE_KEY, "en"));
  const [view, setView] = useState(() => savedSession.current.view || "home");
  const [selectedPlaylist, setSelectedPlaylist] = useState("My Playlist");
  const [query, setQuery] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [results, setResults] = useState([]);
  const [searchRecommendations, setSearchRecommendations] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState(() => HOME_RECOMMENDATION_SECTIONS[0].songs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState(() => savedSession.current.current || null);
  const [currentTime, setCurrentTime] = useState(() => savedSession.current.currentTime || 0);
  const [duration, setDuration] = useState(() => savedSession.current.duration || 0);
  const [playing, setPlaying] = useState(() => savedSession.current.playing || false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [favorites, setFavorites] = useState(() => load(LS_FAV, []));
  const [recent, setRecent] = useState(() => load(LS_RECENT, []));
  const [queue, setQueue] = useState(() => load(LS_QUEUE, []));
  const [playlists, setPlaylists] = useState(() => load(LS_PLAYLISTS, { "My Playlist": [] }));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [volume, setVolume] = useState(() => savedSession.current.volume ?? 80);
  const [muted, setMuted] = useState(() => savedSession.current.muted || false);
  const [showQueue, setShowQueue] = useState(false);
  const [fullPlayer, setFullPlayer] = useState(false);
  const [playlistPromptSong, setPlaylistPromptSong] = useState(null);
  const [playlistNameInput, setPlaylistNameInput] = useState("");
  const playerRef = useRef(null);
  const apiReady = useRef(false);
  const queueRef = useRef(queue);
  const currentRef = useRef(current);
  const autoPlayRef = useRef(autoPlay);
  const t = key => TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
  const relatedQueueRef = useRef([]);

  queueRef.current = queue;
  currentRef.current = current;
  autoPlayRef.current = autoPlay;

  useEffect(() => {
    save(LS_FAV, favorites);
    save(LS_RECENT, recent);
    save(LS_QUEUE, queue);
    save(LS_PLAYLISTS, playlists);
  }, [favorites, recent, queue, playlists]);

  useEffect(() => {
    save(LANGUAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    saveSession({ view, current, currentTime, duration, playing, volume, muted });
  }, [view, current, currentTime, duration, playing, volume, muted]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    window.onYouTubeIframeAPIReady = () => { apiReady.current = true; };
    document.body.appendChild(script);
    return () => { delete window.onYouTubeIframeAPIReady; };
  }, []);

  useEffect(() => {
    fetchTrendingYouTube(["IN", "US", "GB", "AU", "CA"])
      .then(songs => setTrendingSongs(songs.length ? songs : HOME_RECOMMENDATION_SECTIONS[0].songs))
      .catch(() => setTrendingSongs(HOME_RECOMMENDATION_SECTIONS[0].songs));
  }, []);

  const getRelatedSongs = (song) => {
    const searchMatches = results.filter(item => item.id !== song.id);
    if (searchMatches.length) return searchMatches;

    const section = HOME_RECOMMENDATION_SECTIONS.find(group => group.songs.some(item => item.id === song.id));
    if (section) return section.songs.filter(item => item.id !== song.id);
    return RECOMMENDED_SONGS.filter(item => item.id !== song.id);
  };

  const playSong = (song, addRecent = true, seedRelated = false) => {
    setCurrent(song);
    setCurrentTime(0);
    setDuration(0);
    setPlaying(true);
    if (seedRelated) relatedQueueRef.current = getRelatedSongs(song);
    if (addRecent) {
      setRecent(prev => [song, ...prev.filter(x => x.id !== song.id)].slice(0, 30));
    }
  };

  const formatTime = (value) => {
    if (!Number.isFinite(value) || value < 0) return "0:00";
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  const updatePlayerProgress = () => {
    const player = playerRef.current;
    if (!player || typeof player.getCurrentTime !== "function") return;

    const nextTime = player.getCurrentTime?.();
    const nextDuration = player.getDuration?.();
    if (Number.isFinite(nextTime)) setCurrentTime(nextTime);
    if (Number.isFinite(nextDuration) && nextDuration > 0) setDuration(nextDuration);
  };

  const seekToTime = (time) => {
    const player = playerRef.current;
    if (!player || typeof player.seekTo !== "function") return;
    const clamped = Math.min(Math.max(time, 0), duration || time);
    player.seekTo(clamped, true);
    setCurrentTime(clamped);
  };

  const skipSeconds = (delta) => {
    if (!current) return;
    const nextValue = (currentTime || 0) + delta;
    seekToTime(nextValue);
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
            if (currentTime > 0) e.target.seekTo(currentTime, true);
            window.setTimeout(updatePlayerProgress, 250);
            if (playing) e.target.playVideo();
          },
          onStateChange: e => {
            if (window.YT?.PlayerState && e.data === window.YT.PlayerState.ENDED && autoPlayRef.current) nextSong();
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
    if (!current) return;
    updatePlayerProgress();
    const timer = setInterval(updatePlayerProgress, 1000);
    return () => clearInterval(timer);
  }, [current?.id]);

  useEffect(() => {
    playerRef.current?.setVolume?.(muted ? 0 : volume);
  }, [volume, muted]);

  const nextSong = () => {
    const activeSong = currentRef.current;
    const activeQueue = queueRef.current;
    if (!activeSong) return;
    const idx = activeQueue.findIndex(x => x.id === activeSong.id);
    if (idx >= 0 && idx < activeQueue.length - 1) {
      playSong(activeQueue[idx + 1]);
      return;
    }
    if (activeQueue.length) {
      playSong(activeQueue[0]);
      return;
    }

    if (relatedQueueRef.current.length) {
      playSong(relatedQueueRef.current.shift());
      return;
    }

    const recommendationIndex = RECOMMENDED_SONGS.findIndex(x => x.id === activeSong.id);
    const nextRecommendation = RECOMMENDED_SONGS[(recommendationIndex + 1) % RECOMMENDED_SONGS.length];
    if (nextRecommendation) playSong(nextRecommendation);
  };

  const prevSong = () => {
    if (!current || !queue.length) return;
    const idx = queue.findIndex(x => x.id === current.id);
    playSong(queue[Math.max(0, idx - 1)]);
  };

  const doSearch = async (e, selectedQuery) => {
    e?.preventDefault();
    const q = (selectedQuery ?? searchText).trim();
    if (!q) return;
    setSearchText(q);
    setShowSuggestions(false);
    setQuery(q);
    setView("search");
    setLoading(true);
    setError("");
    try {
      const [data, recommendationData] = await Promise.all([
        searchYouTube(q),
        searchYouTube(`${q} similar songs`)
      ]);
      setResults(data.items);
      setSearchRecommendations(recommendationData.items.filter(item => !data.items.some(result => result.id === item.id)));
    } catch (err) {
      setError(err.message);
      setSearchRecommendations([]);
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
    setPlaylistPromptSong(song);
    setPlaylistNameInput("");
  };

  const saveSongToNamedPlaylist = (playlistName) => {
    if (!playlistName || !playlistPromptSong) return;
    const song = playlistPromptSong;
    setSelectedPlaylist(playlistName);
    setPlaylists(prev => ({
      ...prev,
      [playlistName]: (prev[playlistName] || []).some(x => x.id === song.id)
        ? prev[playlistName]
        : [...(prev[playlistName] || []), song]
    }));
      setPlaylistPromptSong(null);
      setPlaylistNameInput("");
  };

    const saveSongToPlaylist = () => saveSongToNamedPlaylist(playlistNameInput.trim());

  const removePlaylist = (playlistName) => {
    if (playlistName === "My Playlist" || !window.confirm(t("deletePlaylistConfirm"))) return;
    setPlaylists(prev => {
      const nextPlaylists = { ...prev };
      delete nextPlaylists[playlistName];
      return nextPlaylists;
    });
    setSelectedPlaylist("My Playlist");
    setView("playlist");
  };

  const isFav = id => favorites.some(x => x.id === id);

  const homeItems = useMemo(() => {
    if (view === "favorites") return favorites;
    if (view === "recent") return recent;
    if (view === "playlist") return playlists[selectedPlaylist] || [];
    if (view === "home") return results.length ? results : RECOMMENDED_SONGS;
    return results;
  }, [view, favorites, recent, playlists, results, selectedPlaylist]);

  const searchSuggestions = useMemo(() => {
    const queryText = searchText.trim().toLowerCase();
    const pool = [...recent, ...trendingSongs, ...RECOMMENDED_SONGS];
    const uniqueSongs = pool.filter((song, index, songs) => songs.findIndex(item => item.id === song.id) === index);
    const matches = queryText
      ? uniqueSongs.filter(song => `${song.title} ${song.channel}`.toLowerCase().includes(queryText))
      : uniqueSongs;
    return matches.slice(0, 6);
  }, [searchText, recent, trendingSongs]);

  const renderSongCard = (song, sectionKey = "", listMode = false) => (
    <article className="card" key={sectionKey ? `${sectionKey}-${song.id}` : song.id} style={listMode ? { display: "flex", alignItems: "stretch" } : undefined}>
      <div className="thumb" onClick={() => playSong(song, true, true)} style={listMode ? { width: "clamp(90px, 18vw, 160px)", flexShrink: 0 } : undefined}>
        <img src={song.thumbnail} alt="" />
        <div className="playOverlay"><Play fill="currentColor"/></div>
      </div>
      <div className="cardBody" style={listMode ? { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "10px 12px" } : undefined}>
        <div className="title" title={song.title}>{song.title}</div>
        <div className="channel">{song.channel}</div>
        <div className="actions">
          <button title={t("play")} onClick={() => playSong(song, true, true)}><Play size={17}/></button>
          <button title={t("addQueue")} onClick={() => addQueue(song)}><Plus size={17}/></button>
          <button title={t("addPlaylist")} onClick={() => addPlaylist(song)}><ListMusic size={17}/></button>
          <button className={isFav(song.id) ? "liked":""} title={t("favorite")} onClick={() => toggleFavorite(song)}><Heart size={17} fill={isFav(song.id) ? "currentColor":"none"}/></button>
          <a title={t("openYoutube")} href={`https://www.youtube.com/watch?v=${song.id}`} target="_blank" rel="noreferrer"><ExternalLink size={16}/></a>
        </div>
      </div>
    </article>
  );

  return (
    <div className="app">
      <style>{`
        @media (max-width: 600px) {
          .main header { height: 64px; padding: 0 10px; gap: 8px; }
          .search { height: 42px; padding: 0 11px; }
          .queueBtn { padding: 0 2px; }
          .content { padding: 14px 12px 20px; }
          .hero { min-height: 300px; padding: 28px 20px; border-radius: 18px; }
          .hero h1 { font-size: 36px; }
          .hero p { font-size: 14px; }
          .heroActions { flex-direction: column; align-items: stretch; }
          .heroActions .primary, .heroActions .secondary { width: 100%; flex: none; margin-top: 10px; }
          .discoverBar { flex-wrap: nowrap; overflow-x: auto; margin: 18px 0 8px; padding-bottom: 3px; }
          .discoverBar span { flex: 0 0 auto; padding: 7px 10px; font-size: 10px; }
          .recommendSection { margin-top: 26px; }
          .sectionTitle { margin-bottom: 14px; }
          .sectionTitle h2 { font-size: 23px; }
          .sectionTitle small { font-size: 11px; }
          .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
          .cardBody { padding: 10px; }
          .actions button, .actions a { width: 26px; height: 26px; }
          .playerBar { height: 82px; padding: 0 8px; gap: 8px; }
          .now img, .now .miniLogo { width: 38px; height: 38px; }
          .now strong { max-width: 105px; font-size: 12px; }
          .now small { max-width: 105px; font-size: 10px; }
          .playerCenter { flex: 1.5; gap: 5px; }
          .controls { gap: 7px; }
          .controls button svg { width: 17px; }
          .playBtn { width: 36px; height: 36px; }
          .progressWrap { grid-template-columns: 30px 1fr 30px; gap: 5px; font-size: 10px; }
          .queuePanel { bottom: 88px; }
        }
      `}</style>
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="brand"><Music2 size={28}/><span>My Music</span><button className="close" onClick={() => setMobileOpen(false)}><X/></button></div>
        <nav>
          <button className={view==="home" ? "active":""} onClick={() => {setView("home");setMobileOpen(false)}}><Home/> {t("home")}</button>
          <button className={view==="favorites" ? "active":""} onClick={() => {setView("favorites");setMobileOpen(false)}}><Heart/> {t("favorites")}</button>
          <button className={view==="recent" ? "active":""} onClick={() => {setView("recent");setMobileOpen(false)}}><Clock3/> {t("recentlyPlayed")}</button>
          {Object.keys(playlists).map(playlistName => (
            <button key={playlistName} className={view === "playlist" && selectedPlaylist === playlistName ? "active" : ""} onClick={() => {setSelectedPlaylist(playlistName);setView("playlist");setMobileOpen(false)}}><ListMusic/> {playlistName}</button>
          ))}
        </nav>
        <div className="sidebar-footer">{t("youtubePlayer")}</div>
      </aside>

      {mobileOpen && <div className="overlay" onClick={() => setMobileOpen(false)}/>}

      <main className="main">
        <header>
          <button className="menu" onClick={() => setMobileOpen(true)}><Menu/></button>
          <form className="search" onSubmit={doSearch} style={{ position: "relative" }} onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}>
            <Search size={19}/>
            <input value={searchText} onFocus={() => setShowSuggestions(true)} onChange={e=>{setSearchText(e.target.value);setShowSuggestions(true)}} placeholder={t("searchPlaceholder")} />
            {showSuggestions && searchSuggestions.length > 0 && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 50, padding: "6px", background: "#151519", border: "1px solid #303038", borderRadius: "12px", boxShadow: "0 18px 40px #000" }}>
                {searchSuggestions.map(song => (
                  <button key={song.id} type="button" onMouseDown={e => e.preventDefault()} onClick={() => doSearch(undefined, song.title)} style={{ width: "100%", display: "block", padding: "10px 12px", textAlign: "left", borderRadius: "8px" }}>
                    <strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{song.title}</strong>
                    <small style={{ color: "#71717a" }}>{song.channel}</small>
                  </button>
                ))}
              </div>
            )}
          </form>
          <button className="queueBtn" onClick={() => setShowQueue(!showQueue)} title={t("queue")}><ListMusic/> <span>{queue.length}</span></button>
        </header>

        <section className="content">
          {view === "home" ? (
            <>
              <div className="hero">
                <div>
                  <span className="eyebrow">{t("personalPlayer")}</span>
                  <h1>{t("findNext")}<br/><span>{t("favoriteSong")}</span></h1>
                  <p>{t("searchDescription")}</p>
                  <div className="heroActions">
                    <button className="primary" onClick={() => document.querySelector(".search input")?.focus()}><Search/> {t("startSearching")}</button>
                    <button className="secondary" onClick={() => setView("favorites")}><Heart/> {t("myFavorites")}</button>
                  </div>
                </div>
                <div className="hero-disc"><Music2 size={90}/></div>
              </div>

              <div className="discoverBar">
                <span>{t("trending")}</span>
                <span>{t("freshPicks")}</span>
                <span>{t("feelGood")}</span>
                <span>{t("chillTag")}</span>
                <span>{t("workout")}</span>
              </div>

              {HOME_RECOMMENDATION_SECTIONS.slice(0, 2).map((section, index) => (
                <div className="recommendSection" key={section.title}>
                  <div className="sectionTitle">
                    <div>
                      <span className="eyebrow">{t("recommended")}</span>
                      <h2>{index === 0 ? t("trending") : index === 1 ? t("mood") : t("chill")}</h2>
                    </div>
                    <small>{index === 0 ? t("popularPicks") : index === 1 ? t("moodSubtitle") : t("chillSubtitle")}</small>
                  </div>
                  <div className="grid">
                    {(trendingSongs.length >= (index + 1) * 4
                      ? trendingSongs.slice(index * 4, (index + 1) * 4)
                      : section.songs
                    ).map(song => renderSongCard(song, section.title))}
                  </div>
                </div>
              ))}
              {recent.length > 0 && (
                <div className="recommendSection">
                  <div className="sectionTitle">
                    <div>
                      <span className="eyebrow">{t("library")}</span>
                      <h2>{t("recentlyPlayed")}</h2>
                    </div>
                  </div>
                  <div className="grid">
                    {recent.slice(0, 4).map(song => renderSongCard(song, "recently-played"))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="sectionTitle">
                <div><span className="eyebrow">{view === "search" ? t("searchResults") : t("library")}</span><h2>{view === "search" ? `${t("resultsFor")} “${query}”` : view === "favorites" ? t("favorites") : view === "recent" ? t("recentlyPlayed") : selectedPlaylist}</h2></div>
                {view === "playlist" && selectedPlaylist !== "My Playlist" && <button title={t("deletePlaylist")} onClick={() => removePlaylist(selectedPlaylist)}><Trash2 size={20}/></button>}
              </div>
              {loading && <div className="status">{t("searching")}</div>}
              {error && <div className="error">{error}</div>}
              {!loading && !error && homeItems.length === 0 && <div className="empty">{t("nothing")}</div>}
              <div className="grid" style={view === "search" || view === "recent" ? { gridTemplateColumns: "1fr", gap: "8px" } : undefined}>
                {homeItems.map(song => renderSongCard(song, view === "search" || view === "recent" ? `${view}-result` : "", view === "search" || view === "recent"))}
              </div>
              {view === "search" && !loading && !error && searchRecommendations.length > 0 && (
                <div className="recommendSection searchRecommendations">
                  <div className="sectionTitle">
                    <div>
                      <span className="eyebrow">{t("basedOnSearch")}</span>
                      <h2>{t("similar")} “{query}”</h2>
                    </div>
                    <small>{t("similarSubtitle")}</small>
                  </div>
                  <div className="grid">
                    {searchRecommendations.slice(0, 8).map(song => renderSongCard(song, "search-recommendations"))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <div className="playerBar">
        <div className="now">
          <div onClick={() => current && setFullPlayer(true)} role={current ? "button" : undefined} tabIndex={current ? 0 : undefined} onKeyDown={e => e.key === "Enter" && current && setFullPlayer(true)} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: current ? "pointer" : "default" }}>
            {current ? <><img src={current.thumbnail} alt=""/><div><strong>{current.title}</strong><small>{current.channel}</small></div></> : <><div className="miniLogo"><Music2/></div><div><strong>{t("nothingPlaying")}</strong><small>{t("searchSong")}</small></div></>}
          </div>
        </div>

        <div className="playerCenter">
          <div className="controls">
            <button onClick={prevSong} title={t("previous")}><SkipBack fill="currentColor"/></button>
            <button className="playBtn" onClick={() => current && setPlaying(!playing)}>{playing ? <Pause fill="currentColor"/> : <Play fill="currentColor"/>}</button>
            <button onClick={nextSong} title={t("next")}><SkipForward fill="currentColor"/></button>
          </div>

          <div className="progressWrap">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={Math.min(currentTime || 0, duration || 0)}
              onChange={(e) => seekToTime(Number(e.target.value))}
              disabled={!current || !duration}
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="volume">
          <button onClick={() => setMuted(!muted)} title={muted || volume === 0 ? t("unmute") : t("mute")}>{muted || volume === 0 ? <VolumeX/> : <Volume2/>}</button>
          <input type="range" min="0" max="100" value={muted ? 0 : volume} onChange={e=>{setMuted(false);setVolume(Number(e.target.value))}}/>
        </div>
      </div>

      {fullPlayer && current && (
        <div style={{ position: "fixed", inset: 0, zIndex: 55, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "32px", background: "radial-gradient(circle at 50% 20%, #29292f, #09090b 62%)" }}>
          <button onClick={() => setFullPlayer(false)} title="Minimize player" style={{ position: "absolute", top: "24px", right: "28px", color: "#d4d4d8" }}><Minimize2 /></button>
          <img src={current.thumbnail} alt="" style={{ width: "min(420px, 72vw)", aspectRatio: "1", objectFit: "cover", borderRadius: "16px", boxShadow: "0 30px 90px #000" }} />
          <div style={{ width: "min(680px, 100%)", marginTop: "28px", textAlign: "center" }}>
            <h2 style={{ margin: 0, fontSize: "clamp(22px, 4vw, 36px)" }}>{current.title}</h2>
            <p style={{ margin: "8px 0 24px", color: "#a1a1aa" }}>{current.channel}</p>
            <div className="progressWrap" style={{ width: "100%" }}>
              <span>{formatTime(currentTime)}</span>
              <input type="range" min="0" max={duration || 0} value={Math.min(currentTime || 0, duration || 0)} onChange={e => seekToTime(Number(e.target.value))} disabled={!duration} />
              <span>{formatTime(duration)}</span>
            </div>
            <div className="controls" style={{ marginTop: "24px", gap: "22px" }}>
              <button onClick={prevSong} title={t("previous")}><SkipBack fill="currentColor" /></button>
              <button className="playBtn" onClick={() => setPlaying(!playing)}>{playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}</button>
              <button onClick={nextSong} title={t("next")}><SkipForward fill="currentColor" /></button>
            </div>
          </div>
        </div>
      )}

      <div className="hiddenPlayer"><div id="yt-player"></div></div>

      {showQueue && (
        <aside className="queuePanel">
          <div className="queueHeader"><h3>{t("queue")}</h3><button onClick={()=>setShowQueue(false)}><X/></button></div>
          {queue.length === 0 ? <div className="empty">{t("emptyQueue")}</div> : queue.map((song,i)=>(
            <div className={`queueItem ${current?.id===song.id?"current":""}`} key={song.id}>
              <img src={song.thumbnail} alt=""/>
              <button className="qInfo" onClick={()=>playSong(song)}><strong>{song.title}</strong><small>{song.channel}</small></button>
              <button onClick={()=>removeQueue(song.id)}><Trash2 size={17}/></button>
            </div>
          ))}
        </aside>
      )}

      {playlistPromptSong && (
        <div onClick={() => setPlaylistPromptSong(null)} style={{ position: "fixed", inset: 0, zIndex: 60, display: "grid", placeItems: "center", padding: "20px", background: "rgba(0,0,0,.7)" }}>
          <form onSubmit={e => { e.preventDefault(); saveSongToPlaylist(); }} onClick={e => e.stopPropagation()} style={{ width: "min(420px, 100%)", padding: "24px", background: "#151519", border: "1px solid #303038", borderRadius: "14px", boxShadow: "0 24px 80px #000" }}>
            <h3 style={{ margin: "0 0 8px" }}>{t("createPlaylist")}</h3>
            <p style={{ margin: "0 0 16px", color: "#a1a1aa", fontSize: "13px" }}>{playlistPromptSong.title}</p>
            <div style={{ display: "grid", gap: "7px" }}>
              {Object.keys(playlists).map(playlistName => (
                <button key={playlistName} type="button" onClick={() => saveSongToNamedPlaylist(playlistName)} style={{ width: "100%", padding: "10px 12px", textAlign: "left", color: "#fff", background: "#202024", border: "1px solid #35353d", borderRadius: "8px" }}>
                  <ListMusic size={15} style={{ verticalAlign: "middle", marginRight: "8px" }} />{playlistName}
                </button>
              ))}
            </div>
            <div style={{ margin: "18px 0 10px", color: "#71717a", fontSize: "12px", textTransform: "uppercase", letterSpacing: ".08em" }}>{t("playlistNamePrompt")}</div>
            <input autoFocus={Object.keys(playlists).length === 0} value={playlistNameInput} onChange={e => setPlaylistNameInput(e.target.value)} placeholder={t("playlistNamePrompt")} style={{ width: "100%", padding: "12px", color: "#fff", background: "#0d0d10", border: "1px solid #35353d", borderRadius: "8px", outline: "none" }} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "18px" }}>
              <button type="button" onClick={() => setPlaylistPromptSong(null)}>{t("cancel")}</button>
              <button type="submit" className="primary" style={{ marginTop: 0 }}>{t("createPlaylist")}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
