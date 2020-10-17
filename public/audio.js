var canvas,
  ctx,
  center_x,
  center_y,
  radius,
  bars,
  x_end,
  y_end,
  bar_height,
  bar_width,
  frequency_array,
  longerBar;

var audio, analyser, source, rads, x, y;

bars = 200;
bar_width = 2;

/**
 **render method
 */
function animationLooper() {
  // set to the size of device
  canvas = document.getElementById("myCanvas");
  canvas.width = 300;
  canvas.height = 300;
  canvas.background_color="black";
  
  ctx = canvas.getContext("2d");

  // find the center of the window
  center_x = canvas.width / 2;
  center_y = canvas.height / 2;
  radius = 60;

  var background_color = "black";

  // style the background
  var gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
 
   
    gradient.addColorStop(0, "rgba(223,145,170, 1)");
    gradient.addColorStop(1, "rgba(167, 67 , 62 , 1)");
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //draw a circle
  ctx.beginPath();
  ctx.arc(center_x, center_y, radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.color="white";


  analyser.getByteFrequencyData(frequency_array);
  for (var i = 0; i < bars; i++) {
    //divide a circle into equal parts
    rads = (Math.PI * 2) / bars;

    bar_height = frequency_array[i] * 0.7*0.5;

    // set coordinates
    x = center_x + Math.cos(rads * i) * radius;
    y = center_y + Math.sin(rads * i) * radius;
    x_end = center_x + Math.cos(rads * i) * (radius + bar_height);
    y_end = center_y + Math.sin(rads * i) * (radius + bar_height);

    //draw a bar which
    //     the width will depend on
    drawBar(x, y, x_end, y_end, bar_width, frequency_array[i]);
  }
  window.requestAnimationFrame(animationLooper);
}

// for drawing a bar
function drawBar(x1, y1, x2, y2, width, frequency) {
  
  
    
var lineColor = "white";
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

window.onload = function() {
 
  // alert(
  //   "A 2d Music Visualizer that auto plays a song."
  // )
  audio = new Audio();
  context = new (window.AudioContext || window.webkitAudioContext)();
  analyser = context.createAnalyser();

  audio.src =
    "https://cdn.glitch.com/dcda3f59-5482-4edd-a65f-f571dc77196f%2Fencounter.mp3?v=1602812584794";
  audio.crossOrigin = "anonymous"; // the source path
  source = context.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(context.destination);

  frequency_array = new Uint8Array(analyser.frequencyBinCount);

  audio.play;
  document.getElementById("pause").addEventListener("click", function() {
    audio.pause();
  });
  document.getElementById("play").addEventListener("click", function() {
    audio.play();
  });
  
  document.getElementById("help").addEventListener("click", function() {
    alert(
      "The song is 'Encounter' from Persona5."
    );});
  
  animationLooper();
};
