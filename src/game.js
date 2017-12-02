;(function() {
    window.ld40.game = window.ld40.game || {};
    const game = window.ld40.game;
    const snake = window.ld40.snake;
    const constants = window.ld40.constants;
    const input = window.ld40.input;
    
    game.Game = Game;
    
    function Game() {
        this.snake = new snake.Snake(0, 0, null);
        this.initialTime = Date.now();
        this.lastTickAt = 0;
        this.ticks = 0;
        this.lastDirectionChangeAt = -100;
    }
    Game.prototype.tick = function() {
        this.ticks++;
        
        const t = Date.now();
        const dt = t - this.lastTickAt;
        
        if (dt > constants.TICK_INTERVAL) {
            this.lastTickAt = t;
            this.update();
        }
        
        const dDirTicks = this.ticks - this.lastDirectionChangeAt;
        if (dDirTicks > constants.MIN_TICKS_BETWEEN_DIR_CHANGES) {
            let direction = {
                x: input.isKeyDown("a") ? -1 : input.isKeyDown("d") ? 1 : 0,
                y: input.isKeyDown("w") ? -1 : input.isKeyDown("s") ? 1 : 0,
            }
            if (direction.x != 0 || direction.y != 0) this.snake.setDirection(direction.x, direction.y);
        }
        
        if (input.isKeyDown("space")) {
            this.snake.addNode();
        }
    };
    Game.prototype.update = function() {
        this.snake.update();
    };
})();