;(function() {
    window.ld40.constants = window.ld40.constants || {};
    const constants = window.ld40.constants;
    
    constants.SCREEN_W = 200;
    constants.SCREEN_H = 150;
    
    constants.SNAKE_SPEED = 1;
    constants.POSITION_HISTORY_LENGTH = 10;
    constants.TICKS_PER_SECOND = 32;
    constants.TICK_INTERVAL = 1000/constants.TICKS_PER_SECOND;
    constants.MIN_TICKS_BETWEEN_DIR_CHANGES = 4;
    
    constants.SNAKE_NODE_TYPES = {
        HEAD: 0,
        BODY: 1,
        TAIL: 2
    };
})();