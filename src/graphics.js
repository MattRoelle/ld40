;(function () {
    window.ld40.graphics = window.ld40.graphics || {};
    const graphics = window.ld40.graphics;

    const _cameraPosition = {x: 0, y: 0};

    graphics.init = function () {
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

        graphics.pixiApp = new PIXI.Application({
            width: 200,
            height: 150,
            backgroundColor: 0x000000
        });

        graphics.pixiApp.view.id = "main-renderer";
        document.body.appendChild(graphics.pixiApp.view);

        _animationFrame();
    };

    function _animationFrame() {

        requestAnimationFrame(_animationFrame);
    }
})();