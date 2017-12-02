;(function() {
    const graphics = window.ld40.graphics;
    const game = window.ld40.game;
    const input = window.ld40.input;
    
    let _curGame;
    
    _main();
    
    function _main() {
        graphics.init(function() {
            input.init();
            _startGame();
            requestAnimationFrame(_animationFrame);
        });
    }
    
    function _startGame() {
        _curGame = new game.Game();
    }
    
    function _animationFrame() {
        if (!!_curGame) {
            _curGame.tick();
        }
        
        graphics.animationFrame();
        graphics.renderSnake(_curGame.snake);
        graphics.setCameraPos(_curGame.snake.head.pos);
        
        requestAnimationFrame(_animationFrame);
    }
})();
