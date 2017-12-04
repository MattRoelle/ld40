;(function() {
    window.ld40.input = window.ld40.input || {};
    const input = window.ld40.input;
    
    input.init = _init;
    input.isKeyDown = _isKeyDown;
    input.onKeyDown = _onKeyDown;

    const _inputMap = {
        "w": 87,
        "a": 65,
        "s": 83,
        "d": 68,
        "space": 32,
        "shift": 16,
        "left": 37,
        "up": 38,
        "right": 39,
        "down": 40
    };
    let _keystates = {};
    
    function _init() {
        window.addEventListener("keydown", function(e) {
            e.preventDefault();
            _keystates[e.which] = true;
        });
        window.addEventListener("keyup", function(e) {
            e.preventDefault();
            _keystates[e.which] = false;
        });
    }
    
    function _isKeyDown(k) {
        return !!_keystates[_inputMap[k]];
    }
    
    let _currentKeydownEv;
    function _onKeyDown(cb) {
        if (!!_currentKeydownEv) {
            window.removeEventListener(_currentKeydownEv);
        }
        _currentKeydownEv = window.addEventListener("keydown", function(e) {
            e.preventDefault();
            cb();
        });
    }
})();