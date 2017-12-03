;(function () {
    window.ld40.graphics = window.ld40.graphics || {};
    const graphics = window.ld40.graphics;
    const constants = window.ld40.constants;

    let _root;
    let _gData;
    let _snakePickupFoodTimeout;

    const _sLookup = {
        snake: {
            diag: {},
            straight: {}
        }
    };
    const _fontStyle = {
        fontFamily: "arcadeclassicregular",
        fontSize: 80,
        fill: 0xFFFFFF,
        align: "left"
    };
    let _curLivesShown = -1;
    _sLookup.snake.diag[constants.SNAKE_NODE_TYPES.HEAD] = "snake-head-diag";
    _sLookup.snake.diag[constants.SNAKE_NODE_TYPES.BODY] = "snake-body";
    _sLookup.snake.diag[constants.SNAKE_NODE_TYPES.TAIL] = "snake-tail-diag";
    _sLookup.snake.straight[constants.SNAKE_NODE_TYPES.HEAD] = "snake-head";
    _sLookup.snake.straight[constants.SNAKE_NODE_TYPES.BODY] = "snake-body";
    _sLookup.snake.straight[constants.SNAKE_NODE_TYPES.TAIL] = "snake-tail";

    let _snakeShader, _introShader, _introShaderStart, _snakeDying, _snakeDieStart, _snakeWarping, _snakeWarpStart;

    graphics.init = _init;
    graphics.animationFrame = _animationFrame;
    graphics.renderSnake = _renderSnake;
    graphics.setCameraPos = _setCameraPos;
    graphics.renderLevel = _renderLevel;
    graphics.renderUI = _renderUI;
    graphics.killEntity = _killEntity;
    graphics.reset = _reset;
    graphics.snakePickupFoodEffect = _snakePickupFoodEffect;
    graphics.renderTransitionScreen = _renderTransitionScreen;
    graphics.snakeDieEffect = _snakeDieEffect;
    graphics.snakeWarpEffect = _snakeWarpEffect;

    function _init(cb) {
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

        graphics.pixiApp = new PIXI.Application({
            width: constants.SCREEN_W * 4,
            height: constants.SCREEN_H * 4,
            backgroundColor: 0x000000,
            roundPixels: true,
            antialias: false
        });

        graphics.pixiApp.view.id = "main-renderer";
        document.body.appendChild(graphics.pixiApp.view);

        _reset();

        _addAssetsToLoader();
        PIXI.loader.load(function () {
            cb();
        });
    }

    function _reset(isIntro) {
        _emptyContainer(graphics.pixiApp.stage);

        _curLivesShown = -1;
        _root = new PIXI.Container();
        _root.scale.set(4, 4);

        _gData = {
            snake: {
                container: new PIXI.Container()
            },
            levels: {}
        };

        _snakeShader = new PIXI.Filter(null, document.getElementById("snake-shader").innerHTML, {
            uOverlay: {
                type: "bool",
                value: false
            },
            uOverlayColor: {
                type: "vec4",
                value: [1, 1, 1, 1]
            }
        });

        _introShaderStart = Date.now();
        _introShader = new PIXI.Filter(null, document.getElementById("intro-shader").innerHTML, {
            uTime: {
                type: "f",
                value: 0
            },
            uResolution: {
                type: "vec2",
                value: [constants.SCREEN_W * 4, constants.SCREEN_H * 4]
            }
        });

        _snakeDying = false;
        _snakeWarping = false;
        _gData.snake.container.filters = [_snakeShader];

        _addSortedChild(graphics.pixiApp.stage, _root, 15);
        _addSortedChild(_root, _gData.snake.container, 10);

        if (!isIntro) {
            _root.filters = [_introShader];
        }

        if (!!_snakePickupFoodTimeout) {
            clearTimeout(_snakePickupFoodTimeout);
            _snakePickupFoodTimeout = null;
        }
    }

    function _animationFrame() {
        _introShader.uniforms.uTime = (Date.now() - _introShaderStart) / 1000;

        if (_snakeDying) {
            const dt = Date.now() - _snakeDieStart;

            if (dt < 2000) {
                const scale = 1 - (dt / 2000);
                const b = Math.sin(dt / (10 + (20 * scale)));

                if (Math.abs(b) < 0.3333) {
                    _snakeShader.uniforms.uOverlay = false;
                } else {
                    _snakeShader.uniforms.uOverlay = true;
                    _snakeShader.uniforms.uOverlayColor = b > 0 ?
                        [1, 1, 1, 1] :
                        [0, 0, 0, 0];
                }
            } else {
                _snakeShader.uniforms.uOverlay = true;
                _snakeShader.uniforms.uOverlayColor = [0, 0, 0, 0];
            }
        }

        if (_snakeWarping) {
            const dt = Date.now() - _snakeWarpStart;

            if (dt < 1500) {
                const scale = 1 - (dt / 1500);
                const b = Math.sin(dt / (10 + (20 * scale)));
                _snakeShader.uniforms.uOverlay = true;
                _snakeShader.uniforms.uOverlayColor = b < -0.3333 ?
                    [1, 0, 0, 1] : b < 0.3333 ?
                        [0, 1, 0, 1] :
                        [0, 0, 1, 0];
            } else {
                _snakeShader.uniforms.uOverlay = true;
                _snakeShader.uniforms.uOverlayColor = [0, 0, 0, 0];
            }
        }
    }

    function _setCameraPos(snakeHeadPos, bounds) {
        const x = -snakeHeadPos.x * 4 + ((constants.SCREEN_W * 4) / 2);
        const y = -snakeHeadPos.y * 4 + ((constants.SCREEN_H * 4) / 2) - 60;
        
        _root.position.set(x, y);
    }

    function _renderSnake(snake) {
        for (let i = 0; i < snake.nodes.length; i++) {
            const node = snake.nodes[i];
            let nodeSprite;

            if (!_gData[node.id]) {
                const sName = _sLookup.snake.straight[node.type];
                nodeSprite = PIXI.Sprite.from(sName);
                nodeSprite.anchor.set(0.5, 0.5);
                _addSortedChild(_gData.snake.container, nodeSprite, 10 + (snake.nodes.length / 100));
                _gData[node.id] = nodeSprite;
            } else {
                nodeSprite = _gData[node.id];
            }

            if (node.type == constants.SNAKE_NODE_TYPES.HEAD) {
                if (snake.direction.x != 0 && snake.direction.y != 0) {
                    nodeSprite.texture = PIXI.utils.TextureCache["snake-head-diag"];
                } else {
                    nodeSprite.texture = PIXI.utils.TextureCache["snake-head"];
                }

                if (snake.direction.x < 0) {
                    nodeSprite.scale.set(-1, 1);
                } else {
                    nodeSprite.scale.set(1, 1);
                }

                if (snake.direction.y < 0 && snake.direction.x == 0) nodeSprite.rotation = -Math.PI / 2;
                else if (snake.direction.y > 0 && snake.direction.x == 0) nodeSprite.rotation = Math.PI / 2;
                else if (snake.direction.y < 0 && snake.direction.x < 0) nodeSprite.rotation = Math.PI / 2;
                else if (snake.direction.y < 0 && snake.direction.x > 0) nodeSprite.rotation = -Math.PI / 2;
                else nodeSprite.rotation = 0;

            }

            nodeSprite.position.set(node.pos.x + 5, node.pos.y + 5);
        }
    }

    function _renderLevel(game) {
        const level = game.level;
        let gLevel;
        if (!_gData[level.id]) {
            gLevel = {};
            _gData[level.id] = gLevel;

            gLevel.backgroundSprite = PIXI.extras.TilingSprite.from(level.def.backgroundSprite, 2000, 1500);
            gLevel.backgroundSprite.position.set(-996, -744);
            _addSortedChild(_root, gLevel.backgroundSprite, 20);

            gLevel.tiles = {};
            for (let tile of level.def.tiles) {
                const sName = tile.sprite;
                for (let loc of tile.locations) {
                    const adjx = loc.x * constants.TILE_SIZE;
                    const adjy = loc.y * constants.TILE_SIZE;
                    const adjw = loc.w * constants.TILE_SIZE;
                    const adjh = loc.h * constants.TILE_SIZE;
                    const locSprite = PIXI.extras.TilingSprite.from(sName, adjw, adjh);
                    locSprite.position.set(adjx, adjy);

                    const shadSprite = PIXI.extras.TilingSprite.from("shadow", adjw + 4, adjh + 4)
                    shadSprite.position.set(adjx - 2, adjy - 2);
                    _addSortedChild(_root, shadSprite, 17);

                    const shadSprite2 = PIXI.extras.TilingSprite.from("shadow", adjw + 2, adjh + 2)
                    shadSprite2.position.set(adjx, adjy);
                    _addSortedChild(_root, shadSprite2, 17.5);

                    _addSortedChild(_root, locSprite, 15);
                }
            }
        } else {
            gLevel = _gData[level.id];
        }

        for (let f of level.def.food) {
            let foodSprite;
            if (!_gData[f.id]) {
                foodSprite = PIXI.Sprite.from("food");
                foodSprite.anchor.set(0.5, 0.5);
                foodSprite.position.set(f.x * constants.TILE_SIZE - 6, f.y * constants.TILE_SIZE - 6);
                foodSprite.ogpos = {x: foodSprite.position.x, y: foodSprite.position.y};
                _addSortedChild(_root, foodSprite, 13);
                _gData[f.id] = foodSprite;
            } else {
                foodSprite = _gData[f.id];
            }

            const st = 0.75 + Math.sin(Date.now() / 50) * 0.1;
            foodSprite.scale.set(st, st);
            foodSprite.rotation += 0.03;
        }

        for (let e of level.enemies) {
            let eSprite;
            if (!_gData[e.id]) {
                eSprite = PIXI.Sprite.from(e.type);
                _addSortedChild(_root, eSprite);
                _gData[e.id] = eSprite;
            } else {
                eSprite = _gData[e.id];
                eSprite.anchor.set(0.5, 0.5);
            }

            eSprite.position.set(e.pos.x - eSprite.texture.width / 2, e.pos.y - eSprite.texture.height / 2);

            if (e.type == "spikeball") {
                eSprite.rotation += 0.1;
            }
        }

        if (game.isExitOpen && !gLevel.exitSpr) {
            gLevel.exitSpr = new PIXI.extras.AnimatedSprite([
                "exit01",
                "exit02"
            ].map(PIXI.Texture.from));
            gLevel.exitSpr.animationSpeed = 0.25;
            gLevel.exitSpr.play();
            gLevel.exitSpr.position.set(
                level.def.exitPosition.x * constants.TILE_SIZE,
                level.def.exitPosition.y * constants.TILE_SIZE
            );
            _addSortedChild(_root, gLevel.exitSpr, 14);
        }
    }

    function _renderUI(game) {
        let levelData;
        if (!_gData[game.id]) {
            levelData = {};

            levelData.container = new PIXI.Container();
            levelData.container.position.set(0, 130 * 4);
            levelData.container.scale.set(4, 4);

            levelData.backgroundGfx = new PIXI.Graphics();
            levelData.backgroundGfx.beginFill(0x000000);
            levelData.backgroundGfx.drawRect(0, 0, 200, 20);

            _addUITextAt(levelData, "livesLabel", "LIVES", 5, 0);
            _addUITextAt(levelData, "scoreLabel", "SCORE", 45, 0);
            _addUITextAt(levelData, "scoreText", "0", 45, 8);
            _addUITextAt(levelData, "highScoreLabel", "HIGH", 85, 0);
            _addUITextAt(levelData, "highScoreText", "0", 85, 8);
            _addUITextAt(levelData, "foodLabel", "FOOD", 125, 0);
            _addUITextAt(levelData, "foodText", "0", 125, 8);

            _addSortedChild(graphics.pixiApp.stage, levelData.container, 5);
            _addSortedChild(levelData.container, levelData.backgroundGfx, 20);

            _gData[game.id] = levelData;
        } else {
            levelData = _gData[game.id];
        }

        levelData.foodText.text = game.foodRemaining;
        levelData.scoreText.text = game.score;

        if (game.lives != _curLivesShown) {
            _curLivesShown = game.lives;

            if (!!levelData.livesShown) {
                for (let spr of levelData.livesShown) {
                    levelData.container.removeChild(spr);
                }
            }

            levelData.livesShown = [];
            for (let i = 0; i < game.lives; i++) {
                const spr = PIXI.Sprite.from("snake-head");
                _addSortedChild(levelData.container, spr, 5);
                spr.position.set(2 + (12 * i), 9);
            }
        }
    }

    function _addUITextAt(levelData, k, text, x, y) {
        levelData[k] = new PIXI.Text(text, _fontStyle);
        levelData[k].position.set(x, y);
        levelData[k].scale.set(0.125, 0.125);
        _addSortedChild(levelData.container, levelData[k], 15);
    }

    function _killEntity(id) {
        if (!!_gData[id]) {
            const ent = _gData[id];
            _root.removeChild(ent);
            ent.isDead = true;
        }
    }

    function _emptyContainer(container) {
        if (container.children.length == 0) return;
        for (let i = 0; i < container.children.length; i++) {
            const child = container.children[i];
            _emptyContainer(child);
            container.removeChild(child);
        }
    }

    function _addAssetsToLoader() {
        PIXI.loader
            .add("world-1-1", "./src/data/level1-1.json")
            .add("world-1-2", "./src/data/level1-2.json")
            .add("world-1-tile-1", "./assets/world-1-tile-1.png")
            .add("shadow", "./assets/shadow.png")
            .add("snake-body", "./assets/body.png")
            .add("snake-head", "./assets/head.png")
            .add("snake-tail", "./assets/tail.png")
            .add("snake-head-diag", "./assets/head_diag.png")
            .add("snake-tail-diag", "./assets/tail_diag.png")
            .add("world-1-bg", "./assets/world-1-bg.png")
            .add("spikeball", "./assets/spikeball.png")
            .add("exit01", "./assets/exit01.png")
            .add("exit02", "./assets/exit02.png")
            .add("food", "./assets/food.png");
    }

    function _addSortedChild(container, child, z) {
        child.z = z;
        container.addChild(child);
        container.children.sort(function (a, b) {
            a.z = a.z || 0;
            b.z = b.z || 0;
            return b.z - a.z;
        });
    }

    function _snakePickupFoodEffect(t) {
        t = t || 750;
        _snakeShader.uniforms.uOverlay = true;
        _snakeShader.uniforms.uOverlayColor = [1, 1, 1, 1];
        _snakePickupFoodTimeout = setTimeout(function () {
            _snakeShader.uniforms.uOverlay = false;
        }, t);
    }

    function _snakeDieEffect() {
        _snakeShader.uniforms.uOverlay = true;
        _snakeDying = true;
        _snakeDieStart = Date.now();
    }

    function _snakeWarpEffect() {
        _snakeShader.uniforms.uOverlay = true;
        _snakeWarping = true;
        _snakeWarpStart = Date.now();
    }

    function _renderTransitionScreen(game) {
        let tdata;
        if (!_gData.tscreen) {
            tdata = {};
            tdata.title = new PIXI.Text(game.level.def.name, {
                fontFamily: "arcadeclassicregular",
                fontSize: 180,
                fill: 0xFFFFFF,
                align: "center"
            });
            tdata.title.anchor.set(0.5, 0.5);
            tdata.title.scale.set(0.125, 0.125);
            tdata.title.position.set(100, 25);
            _addSortedChild(_root, tdata.title, 30);

            _gData.tscreen = tdata;
        } else {
            tdata = _gData.tscreen;
        }
    }
})();