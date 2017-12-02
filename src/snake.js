;(function () {
    window.ld40.snake = window.ld40.snake || {};
    const snake = window.ld40.snake;
    const constants = window.ld40.constants;
    const utils = window.ld40.utils;

    snake.Snake = Snake;
    snake.SnakeNode = SnakeNode;

    function Snake(x, y, level) {
        this.id = utils.uniqueId();
        this.pos = {x: x, y: y};
        this.level = level;
        this.head = new SnakeNode(constants.SNAKE_NODE_TYPES.HEAD, null, x, y);
        this.nodes = [this.head];
        this.direction = {x: 1, y: 0};

        const _this = this;
    }

    Snake.prototype.move = function (x, y) {
        this.direction = {x: x, y: y};
        
        const angle = Math.atan2(this.direction.y, this.direction.x);
        
        const targetx = this.head.pos.x + (Math.cos(angle) * constants.SNAKE_SPEED);
        const targety = this.head.pos.y + (Math.sin(angle) * constants.SNAKE_SPEED);

        const tilesInRange = this.level.def.tiles.map((t) => {
            const ret = [];
            for (let i = 0; i < t.locations.length; i++) {
                const loc = t.locations[i];
                const adjx = loc.x * constants.TILE_SIZE;
                const adjy = loc.y * constants.TILE_SIZE;
                const dist = utils.dist(targetx, targety, adjx, adjy);
                if (dist < constants.TILE_CULLING_DIST) {
                    ret.push(new utils.Rect(adjx, adjy, constants.TILE_SIZE * loc.w, constants.TILE_SIZE * loc.h));
                }
            }
            return ret;
        }).reduce((prev, curr) => prev.concat(curr));


        let canMove = true;
        if (tilesInRange.length > 0) {
            const r = new utils.Rect(
                targetx + constants.SNAKE_RECT_INSET,
                targety + constants.SNAKE_RECT_INSET,
                constants.SNAKE_RECT_SIZE,
                constants.SNAKE_RECT_SIZE
            );
            for (let r2 of tilesInRange) {
                if (r.collidesWith(r2)) {
                    canMove = false;
                    break;
                }
            }
        }

        if (canMove) {
            this.head.pos.x = targetx;
            this.head.pos.y = targety;
        }

    };
    Snake.prototype.update = function () {
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            const node = this.nodes[i];
            node.update();
        }
    };
    Snake.prototype.addNode = function () {
        const lastNode = this.nodes[this.nodes.length - 1];
        const newNode = new SnakeNode(
            constants.SNAKE_NODE_TYPES.BODY,
            lastNode,
            lastNode.pos.x,
            lastNode.pos.y
        );
        this.nodes.push(newNode);
    };

    function SnakeNode(type, nextNode, x, y) {
        this.id = utils.uniqueId();
        this.type = type;
        this.next = nextNode;
        this.pos = {x: x, y: y};
        this.dpos = {x: 0, y: 0};

        this.positionHistory = [];
        for (let i = 0; i < constants.POSITION_HISTORY_LENGTH; i++) {
            this.positionHistory.push(utils.clone(this.pos));
        }
    }

    SnakeNode.prototype.update = function () {
        if (!!this.next) {
            const newPos = this.next.positionHistory[0];
            this.dpos = {x: newPos.x - this.pos.x, y: newPos.y - this.pos.y};
            this.pos = newPos;
        }
        
        if (this.type == constants.SNAKE_NODE_TYPES.TAIL) {
            console.log("tail");
        }

        this.positionHistory.push(utils.clone(this.pos));
        while (this.positionHistory.length > constants.POSITION_HISTORY_LENGTH) this.positionHistory.shift();
    };
})();