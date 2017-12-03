;(function() {
    window.ld40.audio = window.ld40.audio || {};
    const audio = window.ld40.audio;
    
    const musicLookup = {
        "world1": "audio-world1",
    };
    
    const sfxLookup = {
        "eat": "audio-eat"
    };
    
    audio.playMusic = _playMusic;
    audio.playSfx = _playSfx;
    
    function _playMusic(song) {
        for(let k of musicLookup) {
            const audio = document.getElementById(k);
            audio.pause();
        }
        document.getElementById(musicLookup[song]).play();
    }
    
    function _playSfx(sfx) {
        document.getElementById(sfxLookup[sfx]).play();
    }
})();