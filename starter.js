const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const player = $(".player");
const playList = $(".playlist");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const playBtn = $(".btn-toggle-play");
const range = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");

const app = {
  currentIndex: 0,
  isPlaying: false,
  songs: [
    {
      name: "Đám Cưới Nha?",
      singer: "HỒNG THANH X MIE",
      path: "./files/Dam Cuoi Nha_ - Hong Thanh_ DJ Mie.mp3",
      image: "https://data.chiasenhac.com/data/cover/158/157878.jpg",
    },
    {
      name: "Rồi Nâng Cái Ly",
      singer: "Nal",
      path: "./files/Rồi Nâng Cái Ly - Nal _ Official Music Video _ Hit Tết 2022.mp3",
      image: "https://i.ytimg.com/vi/jPO17W-_r1M/maxresdefault.jpg",
    },
    {
      name: "Yêu Đương Khó Quá Thì Chạy Về Khóc Với Anh",
      singer: "Erik",
      path: "./files/Yeu Duong Kho Qua Thi Chay Ve Khoc Voi A.mp3",
      image: "https://i.ytimg.com/vi/EBpp2VTSI2Q/maxresdefault.jpg",
    },
    {
      name: "Ngày Đầu Tiên",
      singer: "Đức Phúc",
      path: "./files/Ngay Dau Tien - Duc Phuc.mp3",
      image: "https://data.chiasenhac.com/data/cover/155/154910.jpg",
    },
    {
      name: "Bao Tiền Một Mớ Bình Yên?",
      singer: "14 Casper; Bon",
      path: "./files/Bao Tien Mot Mo Binh Yen_ - 14 Casper_ B.mp3",
      image: "https://data.chiasenhac.com/data/cover/134/133355.jpg",
    },
    {
      name: "Tình Ca Tình Ta ",
      singer: "Kis",
      path: "./files/Tinh Ca Tinh Ta - Kis.mp3",
      image: "https://i.ytimg.com/vi/zCJuQYX-sL4/maxresdefault.jpg",
    },
    {
      name: "There's No One At All",
      singer: "Sơn Tùng M-TP",
      path: "./files/There_s No One At All - Son Tung M-TP.mp3",
      image: "https://data.chiasenhac.com/data/cover/162/161424.jpg",
    },
  ],
  render: function () {
    const htmls = this.songs.map((song) => {
      return `
          <div class="song">
        <div class="thumb" style="background-image: url('${song.image}')">
        </div>
        <div class="body">
          <h3 class="title">${song.name}</h3>
          <p class="author">${song.singer}</p>
        </div>
        <div class="option">
          <i class="fas fa-ellipsis-h"></i>
        </div>
      </div>
          `;
    });
    // playList.innerHtml = htmls.join("");
    playList.insertAdjacentHTML("beforeend", htmls.join(""));
  },
  defindeProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  handleEvents: function () {
    const cdWidth = cd.offsetWidth;
    const _this = this;
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = `${newCdWidth > 0 ? newCdWidth : 0}px`;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };
    //
    const cdThumbAnimate = cdThumb.animate(
      [
        {
          transform: "rotate(360deg)",
        },
      ],
      {
        duration: 10000,
        iterations: Infinity,
      }
    );
    cdThumbAnimate.pause();
    //
    audio.onpause = function () {
      _this.isPlaying = false;
      audio.pause();
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };
    audio.onplay = function () {
      _this.isPlaying = true;
      audio.play();
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    nextBtn.onclick = function () {
      _this.nextSong();
      audio.play();
    };

    audio.ontimeupdate = function () {
      if (isNaN(audio.duration)) return 0;
      range.value = Math.floor((audio.currentTime / audio.duration) * 100);
    };
    range.onchange = function (event) {
      audio.currentTime = Math.floor(
        (audio.duration / 100) * event.target.value
      );
    };
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
    audio.src = this.currentSong.path;
    // audio.setAttribute("src", `${this.currentSong.path}`);
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  start: function () {
    this.defindeProperties();
    this.handleEvents();
    // this.currentSong();
    this.loadCurrentSong();
    this.render();
  },
};

app.start();
