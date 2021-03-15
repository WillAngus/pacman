/* Sound handlers added by Dr James Freeman who was sad such a great reverse was a silent movie  */

// Pizzicato audio library variables / effects
var reverb = new Pizzicato.Effects.Reverb({
    time: 1.5,
    decay: 0.01,
    reverse: false,
    mix: 0.6
});
var delay = new Pizzicato.Effects.DubDelay({
    feedback: 0.6,
    time: 0.5,
    mix: 0.5,
	cutoff: 700
});
var audioIn = new Pizzicato.Sound({
	source: 'input',
	options: { volume: 1 }
});

var audioArray = [];
var audio      = new preloadAudio();

function createAudioGroup() {
	audio.audioGroup = new Pizzicato.Group(audioArray);
}

function audioTrack(url, volume) {
    // var audio = new Audio(url);
	var audio = new Pizzicato.Sound(url, function() {
		audioArray.push(audio);
		console.log(url + ' loaded.');
		if (audioArray.length == 15) {
			createAudioGroup();
			console.log('all audio loaded.')
		}
	});

    if (volume) audio.volume = volume;

	this.src = audio;

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
