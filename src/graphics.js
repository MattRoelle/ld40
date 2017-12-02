;(function () {
    window.ld40.graphics = window.ld40.graphics || {};
    const graphics = window.ld40.graphics;
    const constants = window.ld40.constants;

    const _root = new PIXI.Container();
    const _gData = {
        snake: {}
    };
    
    graphics.init = _init;
    graphics.animationFrame = _animationFrame;
    graphics.renderSnake = _renderSnake;
    graphics.setCameraPos = _setCameraPos;

    function _init(cb) {
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

        graphics.pixiApp = new PIXI.Application({
            width: constants.SCREEN_W,
            height: constants.SCREEN_H,
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
        const x = -snakeHeadPos.x + (constants.SCREEN_W/2);
        const y = -snakeHeadPos.y + (constants.SCREEN_H/2);
        _root.position.set(x, y);
    }
    
    function _renderSnake(snake) {
        for(let i = 0; i < snake.nodes.length; i++) {
            const node = snake.nodes[i];
            let nodeSprite;
            
            if (!_gData[node.id]) {
                nodeSprite = PIXI.Sprite.from("snake-piece");
                _root.addChild(nodeSprite);
                _gData[node.id] = nodeSprite;
            } else {
                nodeSprite = _gData[node.id];
            }
            
            nodeSprite.position.set(node.pos.x, node.pos.y);
        }
    }
    
    function _addAssetsToLoader() {
        PIXI.loader
            .add("snake-piece", "./assets/snake-piece.png");
    }
})();