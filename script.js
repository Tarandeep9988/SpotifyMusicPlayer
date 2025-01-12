let songBox = document.querySelector(".song-box");
let playPauseBtn = document.getElementById("play-pause-btn");
let currentSongTitleBox = document.querySelector(".current-song-title");
let curTimeBox = document.querySelector(".cur-time");
let totalTimeBox = document.querySelector(".total-time");
let seekBar = document.querySelector(".seekbar");
let thumb = document.querySelector(".thumb");
let volumeBar = document.getElementById("volume");
let volumeIcon = document.getElementById("volume-icon");
let cardContainer = document.querySelector(".card-container");

var currentSong = new Audio();
var songIndex = null;
let preVol = 0.5;
currentSong.volume = preVol;

async function getSongUrls(folder) {
  return fetch(`./database/audios/${folder}`)
    .then((res) => res.text())
    .then((songsPage) => {
      let div = document.createElement("div");
      div.innerHTML = songsPage;
      let as = div.getElementsByTagName("a");
      let songs = [];
      for (let i = 0; i < as.length; i++) {
        if (as[i].href.endsWith(".mp3")) {
          songs.push(as[i].href);
        }
      }
      return songs;
    })
    .catch((e) => {
      console.log(e);
      throw e;
    });
}

function formatTime(time) {
  let sec = Math.floor(time);
  let min = Math.floor(sec / 60);
  sec = sec % 60;
  // console.log(min, sec);

  return `${min.toString().padStart(2, "0")}:${sec
    .toString()
    .padStart(2, "0")}`;
}

function getNameFromUrl(songUrl) {  
  return songUrl
    .split("/").at(-1)
    .replaceAll("-", " ")
    .replaceAll("%20", " ")
    .replaceAll("_", " ");
}
function playSong(songUrl) {
  currentSong.src = songUrl;
  currentSong.load();
  currentSong.play();
  playPauseBtn.src = "./images/pause-circle.svg";
  currentSongTitleBox.innerHTML = getNameFromUrl(songUrl);
  curTimeBox.innerHTML = "00:00";

  // time update logic
  currentSong.addEventListener("loadedmetadata", (e) => {
    currentSong.addEventListener("timeupdate", (e) => {
      curTimeBox.innerHTML = formatTime(currentSong.currentTime);
      thumb.style.left = `${
        (currentSong.currentTime * 100) / currentSong.duration
      }%`;
    });
    totalTimeBox.innerHTML = formatTime(currentSong.duration);
  });
}

async function fetchPlaylist() {
  fetch("./database/playlists.json")
    .then((res) => res.json())
    .then((playLists) => {
      for (let i = 0; i < playLists.length; i++) {
        const playlist = playLists[i];
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
                        <img src="./database/coverPics/${playlist.coverPic}">
                        <button class="play-button">
                            <img src="./images/playIcon.svg" alt="playIcon">
                        </button>
                        <h3>${playlist.title}</h3>
                        <p>${playlist.description}</p>
      `;
        cardContainer.appendChild(card);
        // adding click event listener to card
        card.addEventListener('click', () => {
          loadPlayList(playlist.songsFolder, i);
        })  
      }
    })
    .catch((err) => {
      console.error("Error while reading playlist.json file", err);
      throw e;
    });
}


async function loadPlayList(songsFolder, playlistNumber) {
    var songUrls = await getSongUrls(songsFolder);

    songBox.innerHTML = "";
  // Adding songs name to song
  for (let i = 0; i < songUrls.length; i++) {
      const songUrl = songUrls[i];
      const songName = getNameFromUrl(songUrl, songsFolder);
      const songEntry = document.createElement('span');
      songEntry.innerHTML = `
                  <img src="./images/songIcon.svg" alt="song-icon" class="invert">
                  <span>${i + 1}.</span>
                  <span class="song-title">${songName}</span>
                  <span>Play Now</span>
                  <img src="./images/playIcon.svg" alt="play-icon" class="invert">`
      songEntry.className = "song-entry";

      songEntry.addEventListener('click', (e) => {
        playSong(songUrls[i]);
        songIndex = i;
      })
      songBox.appendChild(songEntry);
  }
}


async function main() {
  await fetchPlaylist();



  // Songs play-pause logic
  playPauseBtn.addEventListener('click', (e) => {
    if (currentSong.src) {
      if (currentSong.paused) {
        currentSong.play();
        playPauseBtn.src = "./images/pause-circle.svg"
      }
      else {
        currentSong.pause();
        playPauseBtn.src = "./images/play-circle.svg"
      }
    }
    else {
      alert("Select a song from library")
    }
  })

  // Code for pre and next song
  const preSongBtn = document.getElementById('pre-song-btn');
  const nextSongBtn = document.getElementById('next-song-btn');

  preSongBtn.onclick = () => {
    if (songIndex - 1 >= 0) {
      songIndex--;
      playSong(songUrls[songIndex]);
    }
  }
  nextSongBtn.onclick = () => {
    if (songIndex + 1 < songUrls.length) {
      songIndex++;
      playSong(songUrls[songIndex]);
    }
  }

  // volume logic
  volumeBar.addEventListener('input', () => {
    let vol = volumeBar.value;
    if (vol == 0) {
      volumeIcon.src = './images/volumeMin.svg';
    }
    else if (vol < 50) {
      volumeIcon.src = './images/volumeAvg.svg';
    }
    else {
      volumeIcon.src = './images/volumeMax.svg';
    }
    currentSong.volume = parseInt(vol) / 100;
  })
  // song mute/unmute logic
  volumeIcon.addEventListener('click', () => {
    if (currentSong.volume) {
      preVol = currentSong.volume;
      currentSong.volume = 0;
      volumeIcon.src = './images/volumeMin.svg';
    }
    else {
      volumeBar.value = preVol * 100;
      volumeBar.dispatchEvent(new Event('input'));
    }
  })

  // seekbar logic
  seekBar.onclick = (e) => {
    if (currentSong.src) {
      const width = e.currentTarget.offsetWidth;
      const xOffset = e.offsetX + 3

      currentSong.currentTime = currentSong.duration * xOffset / width;
    }
  }

  // listening of song ending
  currentSong.addEventListener('ended', (e) => {
    currentSong.currentTime = 0;
    songIndex = (songIndex + 1) % songUrls.length;
    playSong(songUrls[songIndex]);
  })

  // spacebar play pause
  document.addEventListener('keydown', (e) =>{
    e.preventDefault();
    if (e.key = ' ') {
      playPauseBtn.dispatchEvent(new Event('click'));
    }
  });
}

main();

// code for hamburger functionality
const sideBar = document.querySelector(".left");
const hamburgerBtn = document.getElementById("hamburger-icon");
const closeBtn = document.getElementById("close-icon");

closeBtn.onclick = () => {
  sideBar.style.transform = "translateX(-100%)";
};
hamburgerBtn.onclick = () => {
  sideBar.style.transform = "translateX(0)";
};
window.addEventListener("resize", () => {
  if (window.innerWidth > 1250) {
    sideBar.style.transform = "translateX(0)";
    sideBar.style.width = "25vw";
    sideBar.style.position = "static";
  } else {
    sideBar.style.transform = "translateX(-100%)";
    sideBar.style.width = "100vw";
    sideBar.style.position = "absolute";
  }
});
