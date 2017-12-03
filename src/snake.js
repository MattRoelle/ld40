;(function () {
    window.ld40.snake = window.ld40.snake || {};
    const snake = window.ld40.snake;
    const constants = window.ld40.constants;
    const graphics = window.ld40.graphics;
    const utils = window.ld40.utils;

    snake.Snake = Snake;
    snake.SnakeNode = SnakeNode;

    function Snake(x, y, level, game) {
        this.id = utils.uniqueId();
        this.pos = {x: x, y: y};
        this.level = level;
        this.game = game;
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

        const tiles = this.level.def.tiles.map((t) => {
            const ret = [];
            for (let i = 0; i < t.locations.length; i++) {
                const loc = t.locations[i];
                const adjx = loc.x * constants.TILE_SIZE;
                const adjy = loc.y * constants.TILE_SIZE;
                ret.push(new utils.Rect(adjx, adjy, constants.TILE_SIZE * loc.w, constants.TILE_SIZE * loc.h));
            }
            return ret;
        }).reduce((prev, curr) => prev.concat(curr));

        const r = new utils.Rect(
            targetx + constants.SNAKE_RECT_INSET,
            targety + constants.SNAKE_RECT_INSET,
            constants.SNAKE_RECT_SIZE,
            constants.SNAKE_RECT_SIZE
        );

        let canMove = true;
        if (tiles.length > 0) {
            for (let r2 of tiles) {
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

        for (let f of this.level.def.food) {
            if (f.isDead) continue;

            const adjx = f.x * constants.TILE_SIZE;
            const adjy = f.y * constants.TILE_SIZE;

            if (utils.dist(this.head.pos.x + 13, this.head.pos.y + 13, adjx, adjy) < 10) {
                f.isDead = true;
                graphics.killEntity(f.id);
                this.addNode();
                this.game.eat();
            }
        }

        for (let e of this.level.enemies) {
            const r1 = new utils.Rect(e.pos.x - 13, e.pos.y - 13, constants.TILE_SIZE, constants.TILE_SIZE);
            for (let n of this.nodes) {
                const r2 = new utils.Rect(
                    n.pos.x + constants.SNAKE_RECT_INSET,
                    n.pos.y + constants.SNAKE_RECT_INSET,
                    constants.SNAKE_RECT_SIZE,
                    constants.SNAKE_RECT_SIZE
                );
                if (r1.collidesWith(r2)) {
                    this.game.die();
                }
            }
        }
        
        if (this.game.isExitOpen) {
            const adjx = this.game.level.def.exitPosition.x*constants.TILE_SIZE;
            const adjy = this.game.level.def.exitPosition.y*constants.TILE_SIZE;
            if (utils.dist(this.head.pos.x, this.head.pos.y, adjx, adjy) < 10) {
                this.game.nextLevel();
            }
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
        for (let i = constants.POSITION_HISTORY_LENGTH - 1; i >= 0; i--) {
            newNode.positionHistory.push(utils.clone(lastNode.positionHistory[i]));
        }
    };

    function SnakeNode(type, nextNode, x, y) {
        this.id = utils.uniqueId();
        this.type = type;
        this.next = nextNode;
        this.pos = {x: x, y: y};
        this.dpos = {x: 0, y: 0};

        this.positionHistory = [];
        /*
        for (let i = 0; i < constants.POSITION_HISTORY_LENGTH; i++) {
            this.positionHistory.push(utils.clone(this.pos));
        }
        */
    }
    SnakeNode.prototype.update = function () {
        if (!!this.next) {
            const newPos = this.next.positionHistory[0];
            this.dpos = {x: newPos.x - this.pos.x, y: newPos.y - this.pos.y};
            this.pos = newPos;
        }

        this.positionHistory.push(utils.clone(this.pos));
        while (this.positionHistory.length > constants.POSITION_HISTORY_LENGTH) this.positionHistory.shift();
    };
})();