// Pizzicato audio library variables / effects
let reverb = new Pizzicato.Effects.Reverb({
    time: 1.5,
    decay: 0.01,
    reverse: false,
    mix: 0.6
});
let delay = new Pizzicato.Effects.DubDelay({
    feedback: 0.6,
    time: 0.5,
    mix: 0.5,
	cutoff: 700
});
let audioIn = new Pizzicato.Sound({
	source: 'input',
	options: { volume: 1 }
});

let audioArray = [];
let audio      = new preloadAudio();

// Audio Analyser class created to enable interaction between audio and the stage
let audioAnalyser;

class AudioAnalyser {
	constructor(source, minDb, maxDb, smoothing, ftt, monitor) {
		let self = this;

		this.monitor  = monitor;
		this.context  = Pizzicato.context;
		this.analyser = Pizzicato.context.createAnalyser();

		this.analyser.minDecibels = minDb;
		this.analyser.maxDecibels = maxDb;
		this.analyser.smoothingTimeConstant = smoothing;

		this.source = Pizzicato.context.createMediaStreamSource(source.getRawSourceNode().mediaStream);
		this.source.connect(this.analyser);
		if (this.monitor) this.source.connect(this.context.destination);

		this.smoothing = smoothing;
		this.ftt       = ftt;
		this.data      = new Uint8Array(this.analyser.frequencyBinCount);

		this.low  = 0;
		this.mid  = 0;
		this.high = 0;

		this.signal_volume = 0;
	}
	run() {
		this.analyser.getByteFrequencyData(this.data);

		this.signal_volume = this.getVolume() * 5;

		this.low  = this.getBand(1);
		this.mid  = this.getBand(2);
		this.high = this.getBand(3);
	}
	getVolume() {
		let values = 0;
	    let average;

	    let length = this.data.length;

	    // Get all the frequency amplitudes
	    for (let i = 0; i < length; i++) {
	        values += this.data[i];
	    }

	    average = values / length;
	    return average;
	}
	getBand(band) {
		let values = 0;
	    let average;

		let min, max;
	    let length = this.data.length;
		let size = Math.round(length / 3);

		if (band == 1) min = 0,        max = min + size;
		if (band == 2) min = size,     max = min + size;
		if (band == 3) min = size * 2, max = min + size;


	    // Get all the frequency amplitudes
	    for (let i = min; i < max; i++) {
	        values += this.data[i];
	    }

	    average = values / size;
	    return average;
	}
	setSmoothingTime(time) {
		return this.analyser.smoothingTimeConstant = time;
	}
	setMinDecibels(db) {
		return this.analyser.minDecibels = db;
	}
	setMaxDecibels(db) {
		return this.analyser.maxDecibels = db;
	}
}

function createAudioGroup() {
	audio.audioGroup = new Pizzicato.Group(audioArray);
}

function audioTrack(url, volume) {
	var audio = new Pizzicato.Sound(url, function() {
		audio.volume = 0;
		audioArray.push(audio);
		console.log(url + ' loaded.');
		if (audioArray.length == 15) {
			createAudioGroup();
			console.log('all audio loaded.')
		}
	});

    if (volume) audio.volume = volume;

	this.src   = audio;
	this.muted = true;

    var looping = false;
    this.play = function(noResetTime) {
        playSound(noResetTime);
    };
    this.startLoop = function(noResetTime) {
        if (looping) return;
        // audio.addEventListener('ended', audioLoop);
		audio.on('end', audioLoop);
        audioLoop(noResetTime);
        looping = true;
    };
    this.stopLoop = function(noResetTime) {
        try{ audio.removeEventListener('ended', audioLoop) } catch (e) {};
        audio.pause();
        if (!noResetTime) audio.currentTime = 0;
        looping = false;
    };
    this.isPlaying = function() {
        return !audio.paused;
    };
    this.isPaused = function() {
        return audio.paused;
    };
    this.stop = this.stopLoop;

    function audioLoop(noResetTime) {
        playSound(noResetTime);
    }
    function playSound(noResetTime) {
        // for really rapid sound repeat set noResetTime
        if(!audio.paused) {
            audio.pause();
            if (!noResetTime ) audio.currentTime = 0;
        }
        try{
            var playPromise = audio.play();
            if(playPromise) {
                playPromise.then(function(){}).catch(function(err){});
            }
        }
        catch(err){ console.error(err) }
	}
}


function preloadAudio() {

	this.audioGroup;

    this.credit            = new audioTrack('sounds/credit.mp3');
    this.coffeeBreakMusic  = new audioTrack('sounds/coffee-break-music.mp3');
    this.die               = new audioTrack('sounds/miss.mp3');
    this.ghostReturnToHome = new audioTrack('sounds/ghost-return-to-home.mp3');
    this.eatingGhost       = new audioTrack('sounds/eating-ghost.mp3');
    this.ghostTurnToBlue   = new audioTrack('sounds/ghost-turn-to-blue.mp3', 0.5);
    this.eatingFruit       = new audioTrack('sounds/eating-fruit.mp3');
    this.ghostSpurtMove1   = new audioTrack('sounds/ghost-spurt-move-1.mp3');
    this.ghostSpurtMove2   = new audioTrack('sounds/ghost-spurt-move-2.mp3');
    this.ghostSpurtMove3   = new audioTrack('sounds/ghost-spurt-move-3.mp3');
    this.ghostSpurtMove4   = new audioTrack('sounds/ghost-spurt-move-4.mp3');
    this.ghostNormalMove   = new audioTrack('sounds/ghost-normal-move.mp3');
    this.extend            = new audioTrack('sounds/extend.mp3');
    this.eating            = new audioTrack('sounds/eating.mp3', 0.5);
    this.startMusic        = new audioTrack('sounds/start-music.mp3');

    this.ghostReset = function(noResetTime) {
        for (var s in this) {
            if (s == 'silence' || s == 'ghostReset' ) return;
            if (s.match(/^ghost/)) this[s].stopLoop(noResetTime);
        }
    };

    this.silence = function(noResetTime) {
        for (var s in this) {
            if (s == 'silence' || s == 'ghostReset' ) return;
            this[s].stopLoop(noResetTime);
        }
    }
}
