// Global variables 
let pointy1, pointy2, pointy3;
let cubic1, cubic2, cubic3;
let rounded1, rounded2, rounded3;
// Add global variable to track which sun video is currently active
let sunVideos = [];
let currentSunVideo = 0; // Tracks the index of the current sun video
let pointyOn = 0;
let playing = false;
let currentSpeed = 1.0;
let isMuted = false; // New variable to track mute state

// Music variables
let music = [];
let currentTrack = 0;
let isPlaying = false;

// FFT and visualizer intensity variables
let fft;
let visualizerIntensity = 1.0; // Default intensity
let visualizerColor = { r: 255, g: 0, b: 0 }; // Initial visualizer color (white)


// Sky variables
let gridY = 0;
let gridSpeed = 1; // Speed of grid movement
let gridSize = 40;
let colorR = 0, colorG = 0, colorB = 0 // Initial grid color
let numRows, numCols;
let colorIndex = 0;
const gridColors = [
  { r: 77, g: 0, b: 77 },
  { r: 45, g: 0, b: 77 },
  { r: 26, g: 0, b: 77 },
  { r: 0, g: 77, b: 77 },
  { r: 77, g: 77, b: 0 },
  { r: 77, g: 32, b: 0 },
  { r: 0, g: 0, b: 0}
];
const visualizerColors = [
  { r: 255, g: 0, b: 0 },
  { r: 0, g: 255, b: 255 },
  { r: 255, g: 255, b: 0 }
];

// Setup function
function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0); // Black background for the grid

  // Load videos and music
  loadVideos();
  loadMusic();

  // Initialize FFT object for audio analysis
  fft = new p5.FFT();

  // Add slider for controlling visualizer intensity
  intensitySlider = createSlider(0.1, 1, 0.5, 0.1);

  // Add event listeners to buttons
  document.getElementById('play').addEventListener('click', togglePlayPause);
  document.getElementById('skip').addEventListener('click', nextTrack);
  document.getElementById('playback').addEventListener('click', previousTrack);
  document.getElementById('color').addEventListener('click', () => {
    landscapePointy();
  });

  // Calculate number of rows and columns for the grid
  numRows = Math.ceil(windowHeight / gridSize);
  numCols = Math.ceil(windowWidth / gridSize);

  // Add event listener to change grid color on clicking #sky button
  document.getElementById('sky').addEventListener('click', changeGridColor);

  // Add event listener to change the sun video on clicking #sun button
document.getElementById('sun').addEventListener('click', switchSunVideo);
}

// Draw function
function draw() {
  background(0); // Black background for grid
  moveGridDown();
  drawGrid(0);
  // Update visualizer intensity from the slider
  visualizerIntensity = intensitySlider.value();
  // Draw the audio visualizer line
  drawAudioVisualizer();
  image(sunVideos[currentSunVideo], 560, 120);
  landscapePointy();
  // Show the current speed
  displaySpeed();
}

// Load videos into global variables
function loadVideos() {
  pointy1 = createVideo(['pointy1.webm']);
  pointy2 = createVideo(['pointy2.webm']);
  pointy3 = createVideo(['pointy3.webm']);
  cubic1 = createVideo(['cubic1.webm']);
  cubic2 = createVideo(['cubic2.webm']);
  cubic3 = createVideo(['cubic3.webm']);
  rounded1 = createVideo(['rounded1.webm']);
  rounded2 = createVideo(['rounded2.webm']);
  rounded3 = createVideo(['rounded3.webm']);
  sundusk = createVideo(['sundusk.webm']);
  sunnight = createVideo(['sunnight.webm']);
  sundawn = createVideo(['sundawn.webm']);
  sunVideos = [sundusk, sunnight, sundawn];
  // Hide and set videos to loop
  const allVideos = [pointy1, pointy2, pointy3, cubic1, cubic2, cubic3, rounded1, rounded2, rounded3];
  allVideos.forEach(video => {
    video.size(1440, 810);
    video.hide();
    video.loop();
  });
  sunVideos.forEach((video) => {
    video.size(800, 800);
    video.hide();  // Hide initially
    video.loop();  // Set to loop
  });

  // Show the first sun video
  sunVideos[currentSunVideo].show();
}

// Load music into global variables
function loadMusic() {
  const tracks = [
    '80s-retro-synth-wave-223103.mp3',
    '80s-retrowave-synthwave-retro-synthpop-futuristic-electro-pop-music-20596.mp3',
    '80x-chill-synthwave-201658.mp3',
    '80x-deep-synthwave-203118.mp3',
    'midnight-synths-237179.mp3',
    'traveling-memories-technology-future-synthwave-199941.mp3'
  ];

  tracks.forEach((track, index) => {
    music[index] = loadSound(track);
  });
}

// Draw audio visualizer
function drawAudioVisualizer() {
  // Set the visualizer color
  stroke(visualizerColor.r, visualizerColor.g, visualizerColor.b);
  strokeWeight(2);

  let spectrum = fft.analyze();
  let visualizerHeight = height / 2 + 96;  // This is the middle of the screen vertically
  let centerX = width / 2;  // This is the middle of the screen horizontally

  for (let i = 0; i < spectrum.length; i++) {  // Iterate through half the spectrum to draw symmetrically
    let amplitude = map(spectrum[i], 0, 255, 0, visualizerHeight);  // Map amplitude to height

    // Calculate position on the left and right side from the center
    let xLeft = map(i, 0, spectrum.length / 4, centerX, 0);  // Left side
    let xRight = map(i, 0, spectrum.length / 4, centerX, width);  // Right side

    // Draw lines from the middle extending upwards and downwards based on amplitude
    line(xLeft, visualizerHeight - amplitude * visualizerIntensity, xLeft, visualizerHeight + amplitude * visualizerIntensity);  // Left side line
    line(xRight, visualizerHeight - amplitude * visualizerIntensity, xRight, visualizerHeight + amplitude * visualizerIntensity);  // Right side line
  }
}

function changeGridColor() {
  // Get the next color in the array
  const color = gridColors[colorIndex];
  
  // Update grid color variables
  colorR = color.r;
  colorG = color.g;
  colorB = color.b;

  // Update the visualizer color to match the grid color
  visualizerColor = { r: color.r, g: color.g, b: color.b };
  
  // Move to the next color in the list
  colorIndex = (colorIndex + 1) % gridColors.length;
}

// Function to change heading colors based on track
function updateHeadingColors(trackIndex) {
  const trackColors = [
    { h1: '#FF0000', h2: '#FF00FF', h3: '#9500FF', border: '#FF00FF' },
    { h1: '#00FFFF', h2: '#5500FF', h3: '#9500FF', border: '#5500FF' },
    { h1: '#FFFF00', h2: '#FF8000', h3: '#FF00FF', border: '#FF8000' },
    { h1: '#9500FF', h2: '#FF0000', h3: '#FF00FF', border: '#FF0000' },
    { h1: '#9500FF', h2: '#00FFFF', h3: '#5500FF', border: '#00FFFF' },
    { h1: '#FF00FF', h2: '#FFFF00', h3: '#FF8000', border: '#FFFF00' }
  ];

  const trackNames = ['UPBEAT.mp3', 'PONDER.mp3', 'CHILL.mp3', 'FOCUSED.mp3', 'IDEA.mp3', 'MOTIVATED.mp3'];

  // Change the color of the elements in taskbar1
  document.querySelector('h1').style.color = trackColors[trackIndex].h1;
  document.querySelector('h2').style.color = trackColors[trackIndex].h2;
  document.querySelector('h3').style.color = trackColors[trackIndex].h3;

  // Update the track name in taskbar1
  document.querySelector('h2').textContent = trackNames[trackIndex];

  // Change the color of h2 and h3 in taskbar4
  const taskbar4Headings = document.querySelectorAll('#taskbar4 h2, #taskbar4 h3');
  taskbar4Headings.forEach((heading) => {
    if (heading.tagName === 'H2') {
      heading.style.color = trackColors[trackIndex].h2;  // Set h2 color
    } else if (heading.tagName === 'H3') {
      heading.style.color = trackColors[trackIndex].h3;  // Set h3 color
    }
  });

  // Update the cassette border color
  document.getElementById('cassette').style.border = `1px solid ${trackColors[trackIndex].border}`;
}

function switchSunVideo() {
  // Hide the current sun video
  sunVideos[currentSunVideo].hide();

  // Increment the index to the next video
  currentSunVideo = (currentSunVideo + 1) % sunVideos.length;

  // Show the new current sun video
  sunVideos[currentSunVideo].show();

  // Update the visualizer color to one of the three colors
  visualizerColor = visualizerColors[currentSunVideo];
  
  // Display the new video in the canvas
  image(sunVideos[currentSunVideo], 560, 120);
}

// Play/Pause music and video
function togglePlayPause() {
  pauseAll();

  const playSuffix = ['1', '2', '3'][pointyOn % 3];  // Determine current suffix based on pointyOn
  const playImage = `play${playSuffix}.svg`;
  const pauseImage = `pause${playSuffix}.svg`;

  if (isPlaying) {
    music[currentTrack].pause();
    document.getElementById('play').src = playImage;  // Change to corresponding play image when paused
    pauseCurrentVideo();
    sunVideos[currentSunVideo].pause(); // Pause the sun video too
  } else {
    music[currentTrack].play();
    document.getElementById('play').src = pauseImage; // Change to corresponding pause image when playing
    playCurrentVideo();
    sunVideos[currentSunVideo].play(); // Play the current sun video
  }

  isPlaying = !isPlaying;
}

// Play the appropriate video
function playCurrentVideo() {
  // Logic for playing videos
}

// Pause the current video
function pauseCurrentVideo() {
  // Logic for pausing videos
}

// Stop all media
function pauseAll() {
  music.forEach(track => track.stop());
}

// Switch to the next track
function nextTrack() {
  if (isPlaying) music[currentTrack].stop();
  currentTrack = (currentTrack + 1) % music.length;
  if (isPlaying) music[currentTrack].play();
  updateHeadingColors(currentTrack);
}

// Go back to the previous track
function previousTrack() {
  if (isPlaying) music[currentTrack].stop();
  currentTrack = (currentTrack - 1 + music.length) % music.length;
  if (isPlaying) music[currentTrack].play();
  updateHeadingColors(currentTrack);
}


// Speed up the videos
function speedUp() {
  currentSpeed = min(currentSpeed + 0.5, 3.0);
  setSpeed(currentSpeed);
}

// Slow down the videos
function slowDown() {
  currentSpeed = max(currentSpeed - 0.5, 0);
  setSpeed(currentSpeed);
}

// Function to display the current speed on the screen
function displaySpeed() {
  fill(255);
  textSize(24);
  textAlign(CENTER);
  text('Speed:' + nf(currentSpeed, 1, 2) + 'x', width - 150, 50);
}
// Handle window resizing
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  numRows = Math.ceil(windowHeight / gridSize);
  numCols = Math.ceil(windowWidth / gridSize);
}

// Draw grid and animate its movement
function moveGridDown() {
  noFill()
  gridY += gridSpeed;
  if (gridY >= gridSize) gridY = 0;
}

function drawGrid() {
  stroke(colorR, colorG, colorB);
  strokeWeight(1);

  for (let row = -1; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      let x = col * gridSize;
      let y = row * gridSize + gridY;
      rect(x, y, gridSize, gridSize);
    }
  }
}

// Change the grid color randomly
function changeGridColor() {
  // Get the next color in the array
  const color = gridColors[colorIndex];
  
  // Update grid color variables
  colorR = color.r;
  colorG = color.g;
  colorB = color.b;
  
  // Move to the next color in the list
  colorIndex = (colorIndex + 1) % gridColors.length;
}

// Display videos based on `pointyOn` value
function landscapePointy() {
  const videos = [pointy1, pointy2, pointy3, cubic1, cubic2, cubic3, rounded1, rounded2, rounded3];
  const imgMap = ['playback', 'skip', 'sky', 'sun', 'color', 'cassette'];
  
  const imgSuffix = ['1', '2', '3'][pointyOn % 3];
  imgMap.forEach(id => {
    document.getElementById(id).src = `${id}${imgSuffix}.svg`;
  });

  const videoIndex = pointyOn % videos.length;
  image(videos[videoIndex], 240, 120);
}

function keyPressed() {
  if (key === 'W' || key === 'w') {
    speedUp();
  } else if (key === 'S' || key === 's') {
    slowDown();
  } else if (key === 'A' || key === 'a') {
    decreaseIntensity();
  } else if (key === 'D' || key === 'd') {
    increaseIntensity();
  } else if (key === 'M' || key === 'm') {
    toggleMute(); // Call the mute function when M key is pressed
  }
}

// Function to toggle mute
function toggleMute() {
  isMuted = !isMuted; // Toggle mute state

  // Set volume of all music tracks
  music.forEach(track => {
    if (isMuted) {
      track.setVolume(0); // Mute
    } else {
      track.setVolume(1); // Unmute
    }
  });

  // Set volume of all videos
  const allVideos = [pointy1, pointy2, pointy3, cubic1, cubic2, cubic3, rounded1, rounded2, rounded3, sundusk, sunnight, sundawn];
  allVideos.forEach(video => {
    if (isMuted) {
      video.volume(0); // Mute
    } else {
      video.volume(1); // Unmute
    }
  });
}

// Function to decrease visualizer intensity (lower bound: 0.1)
function decreaseIntensity() {
  visualizerIntensity = max(visualizerIntensity - 0.5, 0);
  document.getElementById('intensitydisplay').innerHTML = visualizerIntensity.toFixed(1);
}

// Function to increase visualizer intensity (upper bound: 5)
function increaseIntensity() {
  visualizerIntensity = min(visualizerIntensity + 0.5, 5.0);
  document.getElementById('intensitydisplay').innerHTML = visualizerIntensity.toFixed(1);
}

// Update the displaySpeed function to update the speed in the HTML
function displaySpeed() {
  document.getElementById('speeddisplay').innerHTML = currentSpeed.toFixed(2);
}

// Function to set video speed
function setSpeed(speed) {
  const allVideos = [pointy1, pointy2, pointy3, cubic1, cubic2, cubic3, rounded1, rounded2, rounded3, sundusk, sunnight, sundawn];
  allVideos.forEach(video => video.speed(speed));
}