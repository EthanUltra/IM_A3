// Global variables
let pointyVideos = [];
let cubicVideos = [];
let roundedVideos = [];
let sunVideos = [];
let currentSunVideo = 0;
let pointyOn = 0;
let playing = false;
let currentSpeed = 1.0;
let isPlaying = false;
let fft, intensitySlider, visualizerIntensity = 1.0;
let gridY = 0, gridSpeed = 1, gridSize = 40, numRows, numCols, colorIndex = 0;
let visualizerColorIndex = 0;
let currentTrack = 0;
let music = [];
const gridColors = [
  { r: 77, g: 0, b: 77 }, { r: 45, g: 0, b: 77 }, { r: 26, g: 0, b: 77 },
  { r: 0, g: 77, b: 77 }, { r: 77, g: 77, b: 0 }, { r: 77, g: 32, b: 0 }
];
const visualizerColors = [
  { r: 255, g: 0, b: 0 }, { r: 0, g: 255, b: 0 }, { r: 0, g: 0, b: 255 },
  { r: 255, g: 255, b: 0 }, { r: 0, g: 255, b: 255 }, { r: 255, g: 0, b: 255 }
];

// Setup function
function setup() {
  createCanvas(windowWidth, windowHeight);
  loadVideos();
  loadMusic();
  fft = new p5.FFT();
  intensitySlider = createSlider(0.1, 5.0, 1.0, 0.1);

  numRows = ceil(windowHeight / gridSize);
  numCols = ceil(windowWidth / gridSize);

  document.getElementById('play').addEventListener('click', togglePlayPause);
  document.getElementById('skip').addEventListener('click', nextTrack);
  document.getElementById('playback').addEventListener('click', previousTrack);
  document.getElementById('sun').addEventListener('click', switchSunVideo);
  document.getElementById('color').addEventListener('click', changeGridColor);
}

// Draw function
function draw() {
  background(0);
  moveGridDown();
  drawGrid();
  drawAudioVisualizer();
  displaySpeed();
}

// Load videos
function loadVideos() {
  pointyVideos = [createVideo('pointy1.webm'), createVideo('pointy2.webm'), createVideo('pointy3.webm')];
  cubicVideos = [createVideo('cubic1.webm'), createVideo('cubic2.webm'), createVideo('cubic3.webm')];
  roundedVideos = [createVideo('rounded1.webm'), createVideo('rounded2.webm'), createVideo('rounded3.webm')];
  sunVideos = [createVideo('sundusk.webm'), createVideo('sunnight.webm'), createVideo('sundawn.webm')];

  [...pointyVideos, ...cubicVideos, ...roundedVideos, ...sunVideos].forEach(video => {
    video.size(800, 800);
    video.hide();
    video.loop();
    video.speed(currentSpeed);
  });
  sunVideos[0].show(); // Show the first sun video
}

// Load music
function loadMusic() {
  const tracks = ['track1.mp3', 'track2.mp3', 'track3.mp3', 'track4.mp3', 'track5.mp3', 'track6.mp3'];
  tracks.forEach((track, index) => music[index] = loadSound(track));
}

// Draw audio visualizer
function drawAudioVisualizer() {
  stroke(visualizerColors[visualizerColorIndex].r, visualizerColors[visualizerColorIndex].g, visualizerColors[visualizerColorIndex].b);
  strokeWeight(2);
  let spectrum = fft.analyze();
  let centerX = width / 2, visualizerHeight = height / 2;
  for (let i = 0; i < spectrum.length / 4; i++) {
    let amplitude = map(spectrum[i], 0, 255, 0, height / 2);
    let xLeft = map(i, 0, spectrum.length / 4, centerX, 0);
    let xRight = map(i, 0, spectrum.length / 4, centerX, width);
    line(xLeft, visualizerHeight - amplitude * visualizerIntensity, xLeft, visualizerHeight + amplitude * visualizerIntensity);
    line(xRight, visualizerHeight - amplitude * visualizerIntensity, xRight, visualizerHeight + amplitude * visualizerIntensity);
  }
}

// Switch sun video
function switchSunVideo() {
  sunVideos[currentSunVideo].hide();
  currentSunVideo = (currentSunVideo + 1) % sunVideos.length;
  sunVideos[currentSunVideo].show();
  image(sunVideos[currentSunVideo], 560, 120);
}

// Toggle play/pause music
function togglePlayPause() {
  if (isPlaying) {
    music[currentTrack].pause();
    sunVideos[currentSunVideo].pause();
  } else {
    music[currentTrack].play();
    sunVideos[currentSunVideo].play();
  }
  isPlaying = !isPlaying;
}

// Play next track
function nextTrack() {
  if (isPlaying) music[currentTrack].stop();
  currentTrack = (currentTrack + 1) % music.length;
  music[currentTrack].play();
  updateVisualizerColor();
}

// Play previous track
function previousTrack() {
  if (isPlaying) music[currentTrack].stop();
  currentTrack = (currentTrack - 1 + music.length) % music.length;
  music[currentTrack].play();
  updateVisualizerColor();
}

// Update visualizer color based on track
function updateVisualizerColor() {
  visualizerColorIndex = currentTrack % visualizerColors.length;
}

// Move grid down
function moveGridDown() {
  gridY += gridSpeed;
  if (gridY >= gridSize) gridY = 0;
}

// Draw grid
function drawGrid() {
  stroke(gridColors[colorIndex].r, gridColors[colorIndex].g, gridColors[colorIndex].b);
  strokeWeight(1);
  for (let row = -1; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      let x = col * gridSize, y = row * gridSize + gridY;
      rect(x, y, gridSize, gridSize);
    }
  }
}

// Change grid color
function changeGridColor() {
  colorIndex = (colorIndex + 1) % gridColors.length;
}

// Display video speed
function displaySpeed() {
  fill(255);
  textSize(24);
  textAlign(CENTER);
  text('Speed: ' + nf(currentSpeed, 1, 2) + 'x', width - 150, 50);
}

// Handle window resizing
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  numRows = ceil(windowHeight / gridSize);
  numCols = ceil(windowWidth / gridSize);
}

// Speed control functions
function keyPressed() {
  if (key === 'W' || key === 'w') speedUp();
  else if (key === 'S' || key === 's') slowDown();
}

function speedUp() {
  currentSpeed = min(currentSpeed + 0.5, 3.0);
  sunVideos.forEach(video => video.speed(currentSpeed));
}

function slowDown() {
  currentSpeed = max(currentSpeed - 0.5, 0.5);
  sunVideos.forEach(video => video.speed(currentSpeed));
}