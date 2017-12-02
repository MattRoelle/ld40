;(function () {
    window.ld40.game = window.ld40.game || {};
    const game = window.ld40.game;
    const snake = window.ld40.snake;
    const constants = window.ld40.constants;
    const input = window.ld40.input;
    const level = window.ld40.level;

    game.Game = Game;

    function Game() {
        this.level = new level.Level(PIXI.loader.resources["world-1-1"].data);
        this.snake = new snake.Snake(
            this.level.def.startPosition.x * constants.TILE_SIZE,
            this.level.def.startPosition.y * constants.TILE_SIZE,
            this.level
        );
        this.initialTime = Date.now();
        this.lastTickAt = 0;
        this.ticks = 0;
        this.lastDirectionChangeAt = -100;
    }

    Game.prototype.tick = function () {
        this.ticks++;

        const t = Date.now();
        const dt = t - this.lastTickAt;

        if (dt > constants.TICK_INTERVAL) {
            this.lastTickAt = t;
            this.update();
        }

    };
    Game.prototype.update = function () {
        this.snake.update();

        const dDirTicks = this.ticks - this.lastDirectionChangeAt;
        if (dDirTicks > constants.MIN_TICKS_BETWEEN_DIR_CHANGES) {
            let direction = {
                x: input.isKeyDown("a") ? -1 : input.isKeyDown("d") ? 1 : 0,
                y: input.isKeyDown("w") ? -1 : input.isKeyDown("s") ? 1 : 0,
            }
            if (direction.x != 0 || direction.y != 0) this.snake.move(direction.x, direction.y);
        }

        if (input.isKeyDown("space")) {
            this.snake.addNode();
        }
    };
})();