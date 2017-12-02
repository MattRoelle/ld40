;(function () {
    window.ld40.graphics = window.ld40.graphics || {};
    const graphics = window.ld40.graphics;
    const constants = window.ld40.constants;

    const _root = new PIXI.Container();
    _root.scale.set(4, 4);
    const _gData = {
        snake: {},
        levels: {}
    };
    
    const _sLookup = {
        snake: {
            diag: { },
            straight: { }
        }
    };
    _sLookup.snake.diag[constants.SNAKE_NODE_TYPES.HEAD] = "snake-head-diag";
    _sLookup.snake.diag[constants.SNAKE_NODE_TYPES.BODY] = "snake-body";
    _sLookup.snake.diag[constants.SNAKE_NODE_TYPES.TAIL] = "snake-tail-diag";
    _sLookup.snake.straight[constants.SNAKE_NODE_TYPES.HEAD] = "snake-head";
    _sLookup.snake.straight[constants.SNAKE_NODE_TYPES.BODY] = "snake-body";
    _sLookup.snake.straight[constants.SNAKE_NODE_TYPES.TAIL] = "snake-tail";
    
    graphics.init = _init;
    graphics.animationFrame = _animationFrame;
    graphics.renderSnake = _renderSnake;
    graphics.setCameraPos = _setCameraPos;
    graphics.renderLevel = _renderLevel;

    function _init(cb) {
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

        graphics.pixiApp = new PIXI.Application({
            width: constants.SCREEN_W*4,
            height: constants.SCREEN_H*4,
            backgroundColor: 0x000000,
            roundPixels: true
        });

        graphics.pixiApp.view.id = "main-renderer";
        document.body.appendChild(graphics.pixiApp.view);
        
        graphics.pixiApp.stage.addChild(_root);
        
        _addAssetsToLoader();
        PIXI.loader.load(function() {
            cb();
        });
    }
    
    function _animationFrame() {
    }
    
    function _setCameraPos(snakeHeadPos) {
        const x = -snakeHeadPos.x*4 + ((constants.SCREEN_W*4)/2);
        const y = -snakeHeadPos.y*4 + ((constants.SCREEN_H*4)/2);
        _root.position.set(x, y);
    }
    
    function _renderSnake(snake) {
        for(let i = 0; i < snake.nodes.length; i++) {
            const node = snake.nodes[i];
            let nodeSprite;
            
            if (!_gData[node.id]) {
                const sName = _sLookup.snake.straight[node.type];
                nodeSprite = PIXI.Sprite.from(sName);
                nodeSprite.anchor.set(0.5, 0.5);
                _addChildToRootWithZ(nodeSprite, 10 + (snake.nodes.length/100));
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

                if (snake.direction.y < 0 && snake.direction.x == 0) nodeSprite.rotation = -Math.PI/2;
                else if (snake.direction.y > 0 && snake.direction.x == 0) nodeSprite.rotation = Math.PI/2;
                else if (snake.direction.y < 0 && snake.direction.x < 0) nodeSprite.rotation = Math.PI/2;
                else if (snake.direction.y < 0 && snake.direction.x > 0) nodeSprite.rotation = -Math.PI/2;
                else nodeSprite.rotation = 0;
                
            }
            
            nodeSprite.position.set(node.pos.x + 5, node.pos.y + 5);
        }
    }
    
    function _renderLevel(level) {
        let gLevel;
        if (!_gData[level.id]) {
            gLevel = {};
            _gData[level.id] = gLevel;
            
            gLevel.backgroundSprite = PIXI.extras.TilingSprite.from(level.def.backgroundSprite, 2000, 1500);
            gLevel.backgroundSprite.position.set(-996, -744);
            _addChildToRootWithZ(gLevel.backgroundSprite, 20);

            gLevel.tiles = {};
            for(let tile of level.def.tiles) {
                const sName = tile.sprite;
                for(let loc of tile.locations) {
                    const adjx = loc.x*constants.TILE_SIZE;
                    const adjy = loc.y*constants.TILE_SIZE;
                    const adjw = loc.w*constants.TILE_SIZE;
                    const adjh = loc.h*constants.TILE_SIZE;
                    const locSprite = PIXI.extras.TilingSprite.from(sName, adjw, adjh);
                    locSprite.position.set(adjx, adjy);
                    const shadSprite = PIXI.extras.TilingSprite.from("shadow", adjw + 2, adjh + 2)
                    shadSprite.position.set(adjx - 1, adjy - 1);
                    _addChildToRootWithZ(locSprite, 15);
                    _addChildToRootWithZ(shadSprite, 17);
                    console.log(locSprite);
                }
            }
        }
    }
    
    function _addAssetsToLoader() {
        PIXI.loader
            .add("world-1-1", "./src/data/level1-1.json")
            .add("world-1-tile-1", "./assets/world-1-tile-1.png")
            .add("shadow", "./assets/shadow.png")
            .add("snake-body", "./assets/body.png")
            .add("snake-head", "./assets/head.png")
            .add("snake-tail", "./assets/tail.png")
            .add("snake-head-diag", "./assets/head_diag.png")
            .add("snake-tail-diag", "./assets/tail_diag.png")
            .add("world-1-bg", "./assets/world-1-bg.png");
    }
    
    function _addChildToRootWithZ(child, z) {
        child.z = z;
        _root.addChild(child);
        _root.children.sort(function(a, b) {
            a.z = a.z || 0;
            b.z = b.z || 0;
            return b.z - a.z;
        });
    }
})();