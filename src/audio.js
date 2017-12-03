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
    };
    
    let musicAudio;
    
    audio.playMusic = _playMusic;
    audio.pauseMusic = _pauseMusic;
    audio.playSfx = _playSfx;
    
    function _playMusic(song) {
        _pauseMusic();
        musicAudio = new Audio(musicLookup[song]);
        musicAudio.play();
    }
    
    function _pauseMusic() {
        if (!!musicAudio) {
            musicAudio.pause();
        }
    }
    
    function _playSfx(sfx) {
        var audio = new Audio(sfxLookup[sfx]);
        audio.play();
    }
})();