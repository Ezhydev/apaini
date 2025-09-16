/* ====== Config / Limits ====== */
const LIMITS = { maxSparkles: 28, maxFW: 42, maxBalloons: 18, fwCooldown: 320 };

/* ====== Utilities ====== */
const fx = document.getElementById('fx');
function rand(min, max) { return Math.random() * (max - min) + min; }

/* ====== Typing (surat cinta) ====== */
const typingEl = document.getElementById('typing');
const loveLines = [
  "Selamat ulang tahun, semoga hari harimu tetap bahagia.",
  "Walau kita berbeda jalan, aku selalu mendoakan kebahagiaanmu.",
  "Terima kasih atas kenangan yang manis — tetaplah bersinar bintang."
];
let lineIdx = 0, tInt = null;
function startTyping() {
  clearInterval(tInt);
  typingEl.textContent = "";
  const s = loveLines[lineIdx];
  let i = 0;
  tInt = setInterval(() => {
    typingEl.textContent += s.charAt(i) || "";
    i++;
    if (i >= s.length) { clearInterval(tInt); lineIdx = (lineIdx + 1) % loveLines.length; setTimeout(startTyping, 1400); }
  }, 48);
}
document.getElementById('retype').addEventListener('click', () => { lineIdx = 0; startTyping(); });
startTyping();

/* ====== Mouse sparkles (soft hearts) ====== */
let sparkleCount = 0;
document.addEventListener('mousemove', e => {
  if (sparkleCount >= LIMITS.maxSparkles) return;
  sparkleCount++;
  const sp = document.createElement('div');
  sp.className = 'spark';
  sp.style.left = (e.pageX - 6) + 'px';
  sp.style.top = (e.pageY - 6) + 'px';
  sp.style.background = 'radial-gradient(circle, rgba(255,200,230,1) 0%, rgba(255,120,170,1) 60%)';
  sp.style.boxShadow = '0 6px 18px rgba(255,120,170,0.18)';
  fx.appendChild(sp);
  sp.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.2)' }], { duration: 700, easing: 'ease-out' });
  setTimeout(() => { sp.remove(); sparkleCount--; }, 720);
});

/* ====== Heart Emoji Rain ====== */
const heartBtn = document.getElementById('heartRainBtn');
const hearts = ['❤️', '💖', '💕', '💘', '💞'];
function rainHearts(n = 40) {
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'heart-emoji';
      el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      el.style.left = (rand(2, 95) + 'vw');
      el.style.fontSize = Math.floor(rand(18, 46)) + 'px';
      fx.appendChild(el);
      setTimeout(() => el.remove(), 5200);
    }, i * 70);
  }
}
heartBtn.addEventListener('click', () => rainHearts(36));

/* ====== Butterflies (Auto Spawn) ====== */
function createButterfly() {
  const b = document.createElement("div");
  b.className = "butterfly";
  b.style.left = rand(5, 90) + "vw";
  b.style.top = rand(70, 95) + "vh";
  fx.appendChild(b);

  // Random arah terbang
  const xMove = rand(-40, 40);
  const yMove = rand(-80, -120);
  b.animate([
    { transform: "translate(0,0) scale(1)" },
    { transform: `translate(${xMove}vw, ${yMove}vh) scale(1.2)` }
  ], {
    duration: 5000 + Math.random() * 2000,
    easing: "ease-in-out",
    fill: "forwards"
  });

  setTimeout(() => { if (b.parentNode) b.remove(); }, 7000);
}

// Auto spawn kupu-kupu tiap 1,5 detik
setInterval(() => {
  createButterfly();
}, 1500);

/* ====== Music selector & safe play ====== */
const audio = document.getElementById("bg-music");
const selector = document.getElementById("musicSel");

// Ensure audio context for visualizer is created on user interaction
let audioContext = null; // Initialize to null
let analyser = null;
let source = null;
const canvas = document.getElementById('visualizer');
const canvasCtx = canvas ? canvas.getContext('2d') : null; // Check if canvas exists
let animationFrameId = null;

function initAudioVisualizer() {
  if (!canvasCtx) {
    console.warn("Canvas context for visualizer not found.");
    return;
  }
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256; // Fast Fourier Transform size

    // Disconnect previous source if any, before creating a new one
    // This is important if initAudioVisualizer is called multiple times without closing context
    if (source) {
      source.disconnect();
    }
    source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      animationFrameId = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        let barHeight = dataArray[i] / 2; // Scale down for better visualization

        // Gradient for bars
        canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 150)`;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    }
    draw();
  } else {
    // If context already exists, just ensure the source is connected if it changed
    if (!source || source.mediaElement !== audio) { // Check if source needs reconnection
      if (source) source.disconnect();
      source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
    }
    if (!animationFrameId) { // Restart draw if it was stopped
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      function draw() {
        animationFrameId = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          let barHeight = dataArray[i] / 2;
          canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 150)`;
          canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      }
      draw();
    }
  }
}


selector.addEventListener("change", () => {
  const selectedSrc = selector.value;
  audio.src = selectedSrc;

  if (selectedSrc) {
    // Only attempt to play and initialize visualizer if a song is selected
    audio.play().then(() => {
      initAudioVisualizer();
      showLyrics(selectedSrc);
    }).catch(error => {
      console.error("Error playing audio:", error);
      // Fallback for autoplay restrictions
      alert("Peramban Anda mungkin memblokir pemutaran otomatis. Silakan klik tombol play jika musik tidak mulai.");
      showLyrics(selectedSrc); // Still show lyrics even if audio fails to play immediately
    });
  } else {
    // If "Matikan Music" is selected
    audio.pause();
    audio.currentTime = 0;
    showLyrics(null); // Clear lyrics
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId); // Stop visualizer
      animationFrameId = null;
      if (canvasCtx) canvasCtx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    }
    // It's generally better to reuse AudioContext for performance
    // rather than closing it completely every time, but for simplicity
    // in this example, we can close and reopen.
    // For production, consider pausing/resuming the context instead.
    // if (audioContext) {
    //     audioContext.close().then(() => {
    //         audioContext = null;
    //         source = null;
    //         analyser = null;
    //     });
    // }
  }
});

/* ====== Secret Mail (multi-stage) ====== */
const secretModal = document.getElementById('secretModal');
const secretText = document.getElementById('secretText');
let secretStage = 0;

// Corrected: use 'openSecretBtn' from header to open the modal
document.getElementById('openSecretBtn').addEventListener('click', () => {
  secretModal.style.display = 'flex';
  // Reset stage when modal is newly opened
  secretStage = 0;
  secretText.textContent = "ini ada beberapa Pesan pesanku untuk kamu."; // Initial message
});
document.getElementById('modalCloseBtn').addEventListener('click', () => { secretModal.style.display = 'none'; });

// This button is *inside* the modal to advance the messages
document.getElementById('modalOpenBtn').addEventListener('click', () => {
  secretStage++;
  if (secretStage === 1) secretText.textContent = "Pesan 1: Jaga Kesehatan ya, prioritasin diri kamu, buktiin ke aku klo kmu bsaa💖.";
  else if (secretStage === 2) secretText.textContent = "Pesan 2: Mungkin aku masihh belum cocok untuk orng yang sebaik, seimut, seindah kamu, jadi cari yang lebih cocok lagii yaa, ingat jodohmu menunggumu di depan sana, jadi melangkah lah, proud of you💖.";
  else { secretText.textContent = "Pesan 3: Makasih untuk semua kenangan yang kita ukir bersama, namamu masih terukir abadi disni, jalanin semuanya sesuai kemampuan kita💖"; secretStage = 0; } // Reset to stage 0 after last message
});
// Remove the redundant document.getElementById('readSecretBtn').addEventListener that causes confusion
// document.getElementById('readSecretBtn').addEventListener('click', () => {
//     secretStage = (secretStage + 1) % 3;
//     document.getElementById('modalOpenBtn').click();
// });


/* ====== Scroll story (IntersectionObserver) ====== */
const stories = document.querySelectorAll('.story');
const obs = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) en.target.classList.add('visible'); });
}, { threshold: 0.25 });
stories.forEach(s => obs.observe(s));


// ===== Lyrics Auto-Scroll =====

// data lirik
const lyricData = {
  "assets/song/sempurna.mp3": {
    title: "Sempurna",
    artist: "Andra & The Backbone",
    text: `Janganlah kau tinggalkan diriku
Takkan mampu menghadapi semua
Hanya bersamamu ku akan bisa
Kau adalah darahku
Kau adalah jantungku
Kau adalah hidupku
Lengkapi diriku
Oh sayangku kau begitu, Sempurna...`
  },
  "assets/song/surat-cinta.mp3": {
    title: "Surat Cinta untuk Starla",
    artist: "Virgoun",
    text: `Bila habis sudah waktu ini
  tak lagi berpijak pada dunia
Telah aku habiskan sisa hidupku hanya untukmu
Dan tlah habis sudah cinta ini
tak lagi tersisa untuk dunia
Karena tlah ku habiskan sisa cintaku hanya untukmu....`
  },
  "assets/song/jadiKekasihkuSaja.mp3": {
    title: "Jadi Kekasihku Saja",
    artist: "keisya Levronka",
    text: `Katakan cinta bila kau cinta
Hati ini meminta
Kau lebih dari teman berbagi
Jadi kekasihku saja
Cinta katakan cinta
Hati ini meminta
Kau lebih dari teman berbagi
Jadilah kekasihku...`
  },
  "assets/song/to the bone.mp3": {
    title: "To The Bone",
    artist: "Pamungkas",
    text: `Take me home, I'm fallin'
Love me long, I'm rollin'
Losing control, body and soul
Mind too for sure, I'm already yours
Walk you down, I'm all in
Hold you tight, you call and
I'll take control, body and soul
Mind too for sure, I'm already yours...`
  },
  "assets/song/terlalu lama.mp3": {
    title: "Terlalu Lama",
    artist: "vierra",
    text: `Hari ini ku akan menyatakan cinta nyatakan cinta
Aku tak mau menunggu terlalu lama terlalu lama
Hari ini ku akan menyatakan cinta nyatakan cinta
Aku tak mau menunggu terlalu lama terlalu lama
Hari ini ku akan menyatakan cinta nyatakan cinta
Aku tak mau menunggu terlalu lama terlalu lama`
  },
  "assets/song/tiba tiba.mp3": {
    title: "Tiba Tiba Cinta Datang",
    artist: "Maudy Ayunda",
    text: `Tiba-tiba cinta datang kepadaku
Saat ku mulai mencari cinta
Tiba-tiba cinta datang kepadaku
Kuharap dia rasakan yang sama
Kuharap dia (saat ku mulai mencari cinta)..`
  },
  "assets/song/januari.mp3": {
    title: "Januari",
    artist: "Glenn Fredly",
    text: `Kasihku
Sampai disini kisah kita
Jangan tangisi keadaannya
Bukan karena kita berbeda
Dengarkan
Dengarkan lagu lagu ini
Melodi rintihan hati ini
Kisah kita
Berakhir di Januari..`
  },
  "assets/song/rasa ini.mp3": {
    title: "Rasa Ini",
    artist: "Vierra",
    text: `Ku suka dirinya mungkin aku sayang
Namun apakah mungkin kau menjadi milikku
Kau pernah menjadi menjadi miliknya
Namun salahkah aku bila ku pendam rasa ini...`
  },
  "assets/song/dan....mp3": {
    title: "Dan...",
    artist: "Sheila On 7",
    text: `Lupakanlah saja diriku
Bila itu bisa membuatmu
Kembali bersinar dan berpijar
Seperti dulu kala
Caci-maki saja diriku
Bila itu bisa membuatmu
Kembali bersinar dan berpijar
Seperti dulu kala...`
  }
};

let lyricScrollRAF = null; // Declare at a higher scope

function showLyrics(src) {
  const titleEl = document.getElementById("lyricSongTitle");
  const artistEl = document.getElementById("lyricArtist");
  const textEl = document.getElementById("lyricText");
  const inner = document.getElementById("lyricInner");
  const box = document.getElementById("lyricBox");

  stopLyricScroll(); // Stop any existing scroll animation

  if (!src || !lyricData[src]) {
    titleEl.textContent = "Tidak ada lirik";
    artistEl.textContent = "";
    textEl.textContent = "Pilih musik untuk menampilkan lirik 🎵";
    box.classList.add("empty");
    return;
  }

  const data = lyricData[src];
  titleEl.textContent = data.title;
  artistEl.textContent = data.artist;
  textEl.textContent = data.text;
  box.classList.remove("empty");

  inner.scrollTop = 0; // Reset scroll position for new lyrics
  startLyricScroll(inner, textEl, data.text.length);
}

function startLyricScroll(inner, textEl, length) {
  stopLyricScroll();

  const totalScroll = textEl.scrollHeight - inner.clientHeight;
  if (totalScroll <= 0) return; // No need to scroll if content fits

  // durasi dinamis, sesuaikan untuk lirik yang lebih panjang
  // Minimum 10 detik, maksimum 60 detik, scaled by content length
  const duration = Math.min(60000, Math.max(10000, length * 150));
  const start = performance.now();

  function step(now) {
    const progress = Math.min(1, (now - start) / duration);
    inner.scrollTop = totalScroll * progress;
    if (progress < 1) {
      lyricScrollRAF = requestAnimationFrame(step);
    } else {
      // Optionally reset to top or stop when done scrolling
      inner.scrollTop = 0; // Reset to top after scroll
    }
  }
  lyricScrollRAF = requestAnimationFrame(step);
}

function stopLyricScroll() {
  if (lyricScrollRAF) {
    cancelAnimationFrame(lyricScrollRAF);
    lyricScrollRAF = null;
  }
}

// Hubungkan ke player
// No explicit change needed here for the ReferenceError,
// as the declaration of lyricScrollRAF is now at a higher scope.

if (musicSel && audio) { // Changed audioEl to audio for consistency
  // Show lyrics when a new song is selected
  // The actual call to showLyrics is now inside the selector's change listener
  // after audio.play() is attempted, which correctly triggers it.

  // Stop lyric scroll when audio ends
  audio.addEventListener("ended", () => {
    stopLyricScroll();
    // Optionally, reset lyrics display or show a "music ended" message
    // showLyrics(null); // Uncomment to clear lyrics when music ends
  });

  // Initial load: display "Pilih musik" for lyrics
  document.addEventListener("DOMContentLoaded", () => {
    showLyrics(null);
  });
}

// Quiz Section (Existing code, ensure it doesn't conflict)
const quizData = [
  {
    question: "Saat pertama ketemu, aku pake hero apa?",
    options: ["ling", "yin", "franco", "cecillion"],
    answer: "yin",
  },
  {
    question: "siapa yang pertama naik ke mitik mawi?",
    options: ["Bintang", "Ezy", "bareng", "ga tau"],
    answer: "Bintang", // Contoh, sesuaikan
  },
  {
    question: "apa makanan favoritku?",
    options: ["Nasi Goreng", "Mie Ayam", "Pizza", "Sushi"],
    answer: "Mie Ayam", // Contoh, sesuaikan
  },
  {
    question: "apa jurusan favoritku?",
    options: ["Ekonomi", "Hukum", "Fisika", "Informatika"],
    answer: "Informatika", // Contoh, sesuaikan
  },
];

let currentQuestionIndex = 0;
let score = 0;

const qText = document.getElementById("qText");
const qButtons = document.getElementById("qButtons");
const qResult = document.getElementById("qResult");
const startQuizBtn = document.getElementById("startQuiz");

function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  qResult.textContent = "";
  displayQuestion();
  startQuizBtn.textContent = "Restart Quiz";
}

function displayQuestion() {
  if (currentQuestionIndex < quizData.length) {
    const q = quizData[currentQuestionIndex];
    qText.textContent = q.question;
    qButtons.innerHTML = "";
    q.options.forEach((option) => {
      const btn = document.createElement("button");
      btn.textContent = option;
      btn.className = "btn";
      btn.onclick = () => checkAnswer(option, q.answer);
      qButtons.appendChild(btn);
    });
  } else {
    qText.textContent = `Quiz Selesai! Kamu benar ${score} dari ${quizData.length} pertanyaan.`;
    qButtons.innerHTML = "";
    if (score === quizData.length) {
      qResult.textContent = "Luar biasa! Kamu sangat mengenal Bintang! ❤️";
    } else if (score > quizData.length / 2) {
      qResult.textContent = "Tidak buruk! Tapi masih ada yang bisa diingat. 😉";
    } else {
      qResult.textContent = "Ayo kita buat lebih banyak kenangan lagi! 😊";
    }
  }
}

function checkAnswer(selected, correct) {
  if (selected === correct) {
    score++;
    qResult.textContent = "Benar! 🎉";
  } else {
    qResult.textContent = `masa lupa sihh🤭. Jawaban yang benar adalah "${correct}".`;
  }
  // Disable buttons after selection
  Array.from(qButtons.children).forEach(btn => btn.disabled = true);

  setTimeout(() => {
    currentQuestionIndex++;
    displayQuestion();
  }, 1500); // Give time to read result
}

startQuizBtn.addEventListener("click", startQuiz);

// Initial display for quiz
document.addEventListener("DOMContentLoaded", () => {
  qText.textContent = "Klik 'Mulai' untuk mulai quiz kenangan";
  startQuizBtn.textContent = "Mulai Quiz";
});