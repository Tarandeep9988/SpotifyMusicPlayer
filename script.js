let songBox = document.querySelector(".song-box");
let playPauseBtn = document.getElementById('play-pause-btn');


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

function playSong(songUrl) {
  currentSong.src = songUrl;
  currentSong.play();
}


async function main() {
    let songUrls = await getSongUrls();


    // Adding songs name to song
    for (let i = 0; i < songUrls.length; i++) {
        const songEntry = document.createElement('span');
        songEntry.innerHTML = `
                    <img src="./images/songIcon.svg" alt="song-icon" class="invert">
                    <span>${i + 1}.</span>
                    <span class="song-title">${songUrls[i].replace('http://127.0.0.1:3000/audios/', '').replaceAll('-', ' ').toUpperCase()}</span>
                    <span>Play Now</span>
                    <img src="./images/playIcon.svg" alt="play-icon" class="invert">`
        songEntry.className = "song-entry";

        songEntry.addEventListener('click', (e) => {
          playSong(songUrls[i]);
          playPauseBtn.src = "./images/pause-circle.svg"
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