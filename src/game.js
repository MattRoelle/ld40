;(function () {
    window.ld40.game = window.ld40.game || {};
    const game = window.ld40.game;
    const snake = window.ld40.snake;
    const constants = window.ld40.constants;
    const graphics = window.ld40.graphics;
    const input = window.ld40.input;
    const level = window.ld40.level;

    game.Game = Game;

    const levels = [
        "world-1-1",
        "world-1-2"
    ];

    function Game() {
        this.initialTime = Date.now();
        this.currentLevel = 0;
        this.lives = 3;
        this.reset();
    }

    Game.prototype.tick = function () {
        this.ticks++;

        const t = Date.now();
        const dt = t - this.lastTickAt;

        if (dt > constants.TICK_INTERVAL) {
            this.lastTickAt = t;
            this.update();
        }

        if (!this.atTransitionScreen) {
            if (!this.dyingOrWarping) {
                graphics.renderLevel(this);
            }
            graphics.renderSnake(this.snake);
            graphics.setCameraPos(this.snake.head.pos, this.level.def.cameraBounds);
        } else {
            graphics.renderTransitionScreen(this);
        }

        graphics.renderUI(this);
    };
    Game.prototype.update = function () {
        if (!this.dyingOrWarping) {
            this.snake.update();
            this.level.update();
        }
        
        const dDirTicks = this.ticks - this.lastDirectionChangeAt;
        if (!this.dyingOrWarping && !this.atTransitionScreen && dDirTicks > constants.MIN_TICKS_BETWEEN_DIR_CHANGES) {
            let direction = {
                x: (input.isKeyDown("a") || input.isKeyDown("left")) ? -1 : (input.isKeyDown("d") || input.isKeyDown("right")) ? 1 : 0,
                y: (input.isKeyDown("w") || input.isKeyDown("up")) ? -1 : (input.isKeyDown("s") || input.isKeyDown("down")) ? 1 : 0,
            }
            if (direction.x != 0 || direction.y != 0) this.snake.move(direction.x, direction.y);
        }

        if (input.isKeyDown("space") || input.isKeyDown("shift")) {
            this.snake.dash();
        }
    };
    Game.prototype.eat = function () {
        this.foodRemaining--;
        this.score += 100;
        if (this.foodRemaining <= 0) {
            this.isExitOpen = true;
        }
    };
    Game.prototype.die = function () {
        this.dyingOrWarping = true;
        graphics.snakeDieEffect();

        const _this = this;
        setTimeout(function () {
            _this.lives--;
            _this.reset();
        }, 3000);

    };
    Game.prototype.reset = function () {
        graphics.reset(true);
        this.level = new level.Level(PIXI.loader.resources[levels[this.currentLevel]].data);
        this.snake = new snake.Snake(
            this.level.def.startPosition.x * constants.TILE_SIZE,
            this.level.def.startPosition.y * constants.TILE_SIZE,
            this.level,
            this
        );
        this.lastTickAt = 0;
        this.ticks = 0;
        this.foodRemaining = this.level.def.food.length;
        this.lastDirectionChangeAt = -100;
        this.score = 0;
        this.isExitOpen = false;
        this.atTransitionScreen = true;
        this.dyingOrWarping = false;

        const _this = this;
        setTimeout(function () {
            graphics.reset();
            _this.atTransitionScreen = false;
        }, 2500);
    };
    Game.prototype.nextLevel = function () {
        this.dyingOrWarping = true;
        graphics.snakeWarpEffect();

        const _this = this;
        setTimeout(function () {
            _this.currentLevel++;
            _this.reset();
        }, 2000);
    };
})();