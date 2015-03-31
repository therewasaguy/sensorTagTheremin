var osc;
var env, noiseEnv;
var ampReader;
var filter;

var bgColor;
var playColor;

var notes = [55, 50, 53, 55, 53, 50, 48, 50];
var index = 0;

var myDrum;
var noise;

var mic;

function setup() {
  var cnv = createCanvas(windowWidth, windowHeight);

  var myContainer = document.getElementById('p5Container');
  cnv.parent(myContainer);

  bgColor = color(255, 255, 0);
  playColor = color(100,0,100);
  background(bgColor);

  initSound();
}

function draw() {
  var level = ampReader.getLevel();

  var cColor = lerpColor(playColor, bgColor, level*5);
  background(cColor);
}

function initSound() {
  ampReader = new p5.Amplitude();

  osc = new p5.Oscillator();
  osc.setType('square');
  env = new p5.Env(0.1, .95, 0.7, 0.5, 0.6, 0.0);
  noiseEnv = new p5.Env(0.1, .95, 0.7, 0.5, 0.6, 0.0);
  osc.start();
  osc.amp(env);

  filter = new p5.BandPass();

  noise = new p5.Noise();
  noise.amp(noiseEnv);
  noise.start();
  noise.disconnect();
  osc.disconnect();
  osc.connect(filter);
  noise.connect(filter);

  // loading sound async
  loadSound('audio/beatbox.mp3', soundLoaded);

  mic = new p5.AudioIn();

}

function triggerOscAttack() {
  var note = notes[index % notes.length];
  note = midiToFreq(note);
  osc.freq(note);
  env.triggerAttack();

  myDrum.play();
  index++;
}

function triggerOscRelease() {
  env.triggerRelease();
}

function triggerNoiseAttack() {
  noiseEnv.triggerAttack();
  myDrum.play();
}

function triggerNoiseRelease() {
  noiseEnv.triggerRelease();
}


function soundLoaded(snd) {
  myDrum = snd;

  myDrum.disconnect();
  myDrum.connect(filter);
}

function tweakFilter(x_, y_, z_) {

  var x = abs(x_);
  filter.freq(map(x, 0, 3, 200, 4500), 0.2);

  var y = abs(y_);
  filter.res(map(y, 0, 3, 0.2, 20), 0.2);

}