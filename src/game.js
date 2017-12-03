;(function () {
    window.ld40.game = window.ld40.game || {};
    const game = window.ld40.game;
    const snake = window.ld40.snake;
    const constants = window.ld40.constants;
    const graphics = window.ld40.graphics;
    const input = window.ld40.input;
    const level = window.ld40.level;
    const audio = window.ld40.audio;

    game.Game = Game;

    const levels = [
        "world-1-1",
        "world-1-2",
        "world-1-3",
        "world-2-1",
        "world-2-2",
        "world-2-3"
    ];

    const gameStates = {
        title: 0,
        inGame: 1,
        paused: 2,
        gameOver: 3,
        win: 4
    };

    function Game() {
        this.initialTime = Date.now();
        this.dying = false;
        this.currentLevel = 0;
        this.lives = 3;
        this.score = 0;
        this.canStartPlaying = false;
        this.gameState = gameStates.title;
        window.ld40.game.gameInstance = this;
        this.gotoTitle();
    }

    Game.prototype.gotoTitle = function () {
        graphics.reset();
        this.gameState = gameStates.title;
        const _this = this;
        
        this.canStartPlaying = false;
        
        input.onKeyDown(function () {
            if (_this.gameState == gameStates.title) {
                _this.startPlaying();
            }
        });
    };
    
    Game.prototype.win = function() {
        if (this.gameState == gameStates.win) return;
        
        this.gameState = gameStates.win;
        graphics.reset();

        const _this = this;
        input.onKeyDown(function () {
            if (_this.gameState == gameStates.win) {
                _this.gotoTitle();
            }
        });
    };

    Game.prototype.getHighScore = function () {
        return localStorage.getItem("ld40-hs") || 0;
    };

    Game.prototype.setHighScore = function (val) {
        this.highScore = val;
        localStorage.setItem("ld40-hs", val);
    };

    Game.prototype.startPlaying = function () {
        if (this.gameState == gameStates.inGame) return;
        graphics.reset();
        this.gameState = gameStates.inGame;
        this.currentLevel = 0;
        this.lives = 3;
        this.score = 0;
        this.reset();
    };

    Game.prototype.tick = function () {
        if (this.gameState == gameStates.inGame) {
            this.ticks++;

            const t = Date.now();
            const dt = t - this.lastTickAt;

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

            if (dt > constants.TICK_INTERVAL) {
                this.lastTickAt = t;
                this.update();
            }
        } else if (this.gameState == gameStates.title) {
            graphics.renderTitleScreen();
        } else if (this.gameState == gameStates.gameOver) {
            graphics.renderGameOver();
            graphics.renderUI(this);
        } else if (this.gameState == gameStates.win) {
            graphics.renderVictoryScreen();
            graphics.renderUI(this);
        }
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
        this.levelScore += 100;
        if (this.foodRemaining <= 0) {
            this.isExitOpen = true;
        }
    };
    Game.prototype.die = function () {
        if (this.dying) return;
        this.dying = true;
        audio.playSfx("die");
        this.dyingOrWarping = true;
        graphics.snakeDieEffect();

        const _this = this;
        setTimeout(function () {
            _this.lives--;
            if (_this.lives <= 0) {
                _this.gameOver();
            } else {
                _this.reset();
            }
        }, 3000);

    };
    Game.prototype.gameOver = function () {
        graphics.reset();
        audio.pauseMusic();
        
        this.gameState = gameStates.gameOver;
        this.score += this.levelScore;
        this.levelScore = 0;

        if (this.score > this.getHighScore()) {
            this.setHighScore(this.score);
        }
        
        const _this = this;
        input.onKeyDown(function () {
            if (_this.gameState == gameStates.gameOver) {
                _this.gotoTitle();
            }
        });
    };
    Game.prototype.reset = function () {
        this.dying = false;
        this.highScore = this.getHighScore();
        this.levelScore = 0;
        audio.pauseMusic();
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
        this.isExitOpen = false;
        this.atTransitionScreen = true;
        this.dyingOrWarping = false;

        const _this = this;
        setTimeout(function () {
            audio.playMusic("world1");
            graphics.reset();
            _this.atTransitionScreen = false;
        }, 2500);
    };
    Game.prototype.nextLevel = function () {
        this.score += this.levelScore;
        this.levelScore = 0;
        this.score += 1000;
        audio.playSfx("warp");
        this.dyingOrWarping = true;
        graphics.snakeWarpEffect();

        const _this = this;
        setTimeout(function () {
            _this.currentLevel++;
            if (_this.currentLevel >= levels.length) {
                _this.win();
            } else {
                _this.reset();
            }
        }, 2000);
    };
})();