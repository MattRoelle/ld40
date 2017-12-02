;(function () {
    window.ld40.snake = window.ld40.snake || {};
    const snake = window.ld40.snake;
    const constants = window.ld40.constants;
    const utils = window.ld40.utils;

    snake.Snake = Snake;
    snake.SnakeNode = SnakeNode;

    function Snake(x, y, map) {
        this.id = utils.uniqueId();
        this.pos = {x: x, y: y};
        this.map = map;
        this.head = new SnakeNode(constants.SNAKE_NODE_TYPES.HEAD, null, x, y);
        this.nodes = [this.head];
        this.direction = {x: 1, y: 0};

        const _this = this;
        setTimeout(function() { _this.addNode(); }, 2000);
        setTimeout(function() { _this.addNode(); }, 4000);
        setTimeout(function() { _this.addNode(); }, 6000);
        setTimeout(function() { _this.addNode(); }, 8000);
        setTimeout(function() { _this.addNode(); }, 10000);
        setTimeout(function() { _this.addNode(); }, 12000);
    }

    Snake.prototype.setDirection = function (x, y) {
        this.direction = {x: x, y: y};
    };
    Snake.prototype.update = function () {
        const angle = Math.atan2(this.direction.y, this.direction.x);
        this.head.pos.x += Math.cos(angle) * constants.SNAKE_SPEED;
        this.head.pos.y += Math.sin(angle) * constants.SNAKE_SPEED;

        for (let i = this.nodes.length - 1; i >= 0; i--) {
            const node = this.nodes[i];
            node.update();
        }
    };
    Snake.prototype.addNode = function () {
        const lastNode = this.nodes[this.nodes.length - 1];
        const newNode = new SnakeNode(constants.SNAKE_NODE_TYPES.HEAD, lastNode, lastNode.pos.x, lastNode.pos.y);
        this.nodes.push(newNode);
    };

    function SnakeNode(type, nextNode, x, y) {
        this.id = utils.uniqueId();
        this.type = type;
        this.next = nextNode;
        this.pos = {x: x, y: y};

        this.positionHistory = [];
        for (let i = 0; i < constants.POSITION_HISTORY_LENGTH; i++) {
            this.positionHistory.push(utils.clone(this.pos));
        }
    }

    SnakeNode.prototype.update = function () {
        if (!!this.next) {
            this.pos = this.next.positionHistory[0];
        }

        this.positionHistory.push(utils.clone(this.pos));
        while (this.positionHistory.length > constants.POSITION_HISTORY_LENGTH) this.positionHistory.shift();
    };
})();