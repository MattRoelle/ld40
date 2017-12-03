;(function() {
    window.ld40.audio = window.ld40.audio || {};
    const audio = window.ld40.audio;
    
    const musicLookup = {
        "world1": "./assets/music/world1.wav",
    };
    
    const sfxLookup = {
        "eat": "./assets/music/eat.wav",
        "warp": "./assets/music/warping.wav",
        "die": "./assets/music/die.wav",
        "dash": "./assets/music/dash.wav"
    };
    
    let musicAudio;
    let muted = false;
    const $muteBtn = document.getElementById("mute-btn");
    
    audio.playMusic = _playMusic;
    audio.pauseMusic = _pauseMusic;
    audio.playSfx = _playSfx;
    
    function _playMusic(song) {
        if (muted) return;
        _pauseMusic();
        musicAudio = new Audio(musicLookup[song]);
        musicAudio.loop = true;
        musicAudio.play();
    }
    
    function _pauseMusic() {
        if (!!musicAudio) {
            musicAudio.pause();
            musicAudio = null;
        }
    }
    
    function _playSfx(sfx) {
        if (muted) return;
        var audio = new Audio(sfxLookup[sfx]);
        if (sfx == "die") {
            audio.volume = 0.5;
        }
        audio.play();
    }

    $muteBtn.addEventListener("click", function() {
        debugger;
        if (muted) {
            _playMusic("world1");
            $muteBtn.innerHTML = "mute";
        } else {
            $muteBtn.innerHTML = "unmute";
            _pauseMusic();
        }
        muted = !muted;
    });
})();