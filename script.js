let songBox = document.querySelector(".song-box");
let playPauseBtn = document.getElementById('play-pause-btn');
let currentSongTitleBox = document.querySelector('.current-song-title');
let curTimeBox = document.querySelector('.cur-time');
let totalTimeBox = document.querySelector('.total-time');
let thumb = document.querySelector('.thumb');

var currentSong = new Audio();


async function getSongUrls() {
    return fetch("http://127.0.0.1:3000/audios/")
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
  sec = sec % 60
  // console.log(min, sec);
  
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function playSong(songUrl) {
  currentSong.src = songUrl;
  currentSong.load();
  currentSong.play();
  playPauseBtn.src = "./images/pause-circle.svg"
  currentSongTitleBox.innerHTML = songUrl.split('/audios/')[1].replaceAll('-', ' ');
  curTimeBox.innerHTML = '00:00';
  
  // time update logic
  currentSong.addEventListener('loadedmetadata', (e) => {
    currentSong.addEventListener('timeupdate', (e) => {
      curTimeBox.innerHTML = formatTime(currentSong.currentTime);
      thumb.style.left = `${currentSong.currentTime * 100 / currentSong.duration}%`;
    });
    totalTimeBox.innerHTML = formatTime(currentSong.duration);
  })
}


async function main() {
    let songUrls = await getSongUrls();


    // Adding songs name to song
    for (let i = 0; i < songUrls.length; i++) {
        const songUrl = songUrls[i];
        const songName = songUrl.split('/audios/')[1].replaceAll('-', ' ');
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
        })

        songBox.appendChild(songEntry);
    }
    
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
}

main();






// code for hamburger functionality
const sideBar = document.querySelector('.left');
const hamburgerBtn = document.getElementById('hamburger-icon');
const closeBtn = document.getElementById('close-icon');

closeBtn.onclick = () => {
  sideBar.style.transform = 'translateX(-100%)';
}
hamburgerBtn.onclick = () => {
  sideBar.style.transform = 'translateX(0)';
}
window.addEventListener('resize', () => {
  if (window.innerWidth > 1250) {
    sideBar.style.transform = 'translateX(0)';
    sideBar.style.width = '25vw';
    sideBar.style.position = 'static';
  }
  else {
    sideBar.style.transform = 'translateX(-100%)';
    sideBar.style.width = '100vw';
    sideBar.style.position = 'absolute';
  }
});