const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PlAYER_STORAGE_KEY = "F8_PLAYER";

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
let audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");
const catList = $(".cat-list");
const catBtn = $(".cat-btn");
const searchBox = $("#searchBox");
const searchIcon = $("#searchBox .search-icon");
const timeLeft = $(".time.left");
const timeRight = $(".time.right");

const app = {
  categories: [
    {
      name: "Vpop",
      key: "LmxnTZmadJinJlhtHybmZGyLhJHNkHHsx",
    },
    {
      name: "Usuk",
      key: "kGJntZGsdJRncWiyGybnLnykCJmNbAAHJ",
    },
    {
      name: "Kpop",
      key: "ZGJHyknaBJininJtHtvnLHyLgcmabJdaQ",
    },
    {
      name: "Rap",
      key: "kmcHyLnNdJimxzRymyFmZHyZgJmaDclSZ",
    },
  ],
  // searchEndPoint:
  //   "http://ac.mp3.zing.vn/complete?type=artist,song,key,code&num=500&query=",
  endpoint: "https://mp3.zing.vn/xhr/media/get-source?type=album&key=",
  currentIndex: 0,
  catIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: {},
  // (1/2) Uncomment the line below to use localStorage
  // config: JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},
  setConfig: function (key, value) {
    this.config[key] = value;
    // (2/2) Uncomment the line below to use localStorage
    // localStorage.setItem(PlAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  songs: [],
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    catList.onclick = async function (e) {
      e.stopPropagation();
      if (e.target.matches(".cate-item")) {
        _this.catIndex = +e.target.dataset.catId;
        await _this.getMusic(_this.categories[_this.catIndex].key);
        _this.render();
        _this.loadCurrentSong();
      }
    };

    // searchBox.querySelector("input").onkeydown = async function (e) {
    //   if (e.target.value !== "") {
    //     console.log(e.target.value);
    //     await _this.searchMusic();
    //     _this.render();
    //     // _this.loadCurrentSong();
    //   } else {
    //     await _this.getMusic(_this.categories[_this.catIndex].key);
    //     _this.render();
    //     _this.loadCurrentSong();
    //   }
    // };

    // audio.onloadedmetadata = function () {
    //   audio.ontimeupdate = () => {
    //     let currentTime = audio.currentTime;
    //     let min = Math.floor(currentTime / 60);
    //     let sec = Math.floor(currentTime % 60);
    //     if (min < 10) min = "0" + min;
    //     if (sec < 10) sec = "0" + sec;
    //     timeLeft.innerText = `${min}:${sec}`;
    //   };
    // };

    catBtn.onclick = function () {
      catList.classList.toggle("active");
    };

    searchIcon.onclick = function () {
      searchBox.classList.toggle("active");
    };

    // Xử lý CD quay / dừng
    // Handle CD spins / stops
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000, // 10 seconds
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    // Xử lý phóng to / thu nhỏ CD
    // Handles CD enlargement / reduction
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // Xử lý khi click play
    // Handle when click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // Khi song được play
    // When the song is played
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    // Khi song bị pause
    // When the song is pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    // Khi tiến độ bài hát thay đổi
    // When the song progress changes
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
      let currentTime = audio.currentTime;
      let min = Math.floor(currentTime / 60);
      let sec = Math.floor(currentTime % 60);
      if (min < 10) min = "0" + min;
      if (sec < 10) sec = "0" + sec;
      timeLeft.innerText = `${min}:${sec}`;
    };

    // Xử lý khi tua song
    // Handling when seek
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };

    // Khi next song
    // When next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Khi prev song
    // When prev song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Xử lý bật / tắt random song
    // Handling on / off random song
    randomBtn.onclick = function (e) {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    // Xử lý lặp lại một song
    // Single-parallel repeat processing
    repeatBtn.onclick = function (e) {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    // Xử lý next song khi audio ended
    // Handle next song when audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };
    // Lắng nghe hành vi click vào playlist
    // Listen to playlist clicks
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");

      if (songNode || e.target.closest(".option")) {
        // Xử lý khi click vào song
        // Handle when clicking on the song
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }

        // Xử lý khi click vào song option
        // Handle when clicking on the song option
        if (e.target.closest(".option")) {
        }
      }
    };
  },
  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 300);
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.album.thumbnail_medium}')`;
    audio.src = this.currentSong.source["128"];
    let time = this.currentSong.duration;
    timeRight.textContent = `${Math.floor(time / 60)}:${time % 60}`;
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },
  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);

    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  getMusic: async function (key = "LmxnTZmadJinJlhtHybmZGyLhJHNkHHsx") {
    const response = await fetch(`${this.endpoint}${key}`);
    const data = await response.json();
    this.songs = data.data.items;
  },
  // searchMusic: async function (key = "gió") {
  //   const response = await fetch(`${this.searchEndPoint}${key}`);
  //   const data = await response.json();
  // this.songs = data.data.items;
  //   console.log(data);
  // },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
                        <div class="song ${
                          index === this.currentIndex ? "active" : ""
                        }" data-index="${index}">
                            <div class="thumb"
                                style="background-image: url('${
                                  song.thumbnail
                                }')">
                            </div>
                            <div class="body">
                                <h3 class="title">${song.name}</h3>
                                <p class="author">${song.artists_names}</p>
                            </div>
                            <div class="option">
                                <i class="fas fa-ellipsis-h"></i>
                            </div>
                        </div>
                    `;
    });
    playlist.innerHTML = htmls.join("");
    const cats = this.categories.map((cat, index) => {
      return `
      <div data-cat-id="${index}" class="cate-item ${
        index === this.catIndex ? "active" : ""
      }">${cat.name}</div>
      `;
    });
    catList.innerHTML = cats.join("");
  },
  start: async function () {
    await this.getMusic();
    // Gán cấu hình từ config vào ứng dụng
    // Assign configuration from config to application
    this.loadConfig();

    // Định nghĩa các thuộc tính cho object
    // Defines properties for the object
    this.defineProperties();

    // Lắng nghe / xử lý các sự kiện (DOM events)
    // Listening / handling events (DOM events)
    this.handleEvents();

    // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    // Load the first song information into the UI when running the app
    this.loadCurrentSong();

    // Render playlist
    this.render();

    // Hiển thị trạng thái ban đầu của button repeat & random
    // Display the initial state of the repeat & random button
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  },
};

window.addEventListener("DOMContentLoaded", function () {
  app.start();
});
