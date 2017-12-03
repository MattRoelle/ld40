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
        
        this.lastDashAt = -1000;

        const _this = this;
    }

    Snake.prototype.move = function (x, y) {
        if (this.dashing) return;
        
        this.direction = {x: x, y: y};
        this.propel();
    };
    Snake.prototype.propel = function() {
        let speed = constants.SNAKE_SPEED;
        if (this.dashing) speed *= 2.25;

        const nangle = Math.atan2(this.direction.y, this.direction.x);
        const ntargetx = this.head.pos.x + (Math.cos(nangle) * speed);
        const ntargety = this.head.pos.y + (Math.sin(nangle) * speed);

        const xangle = Math.atan2(0, this.direction.x);
        const xtargetx = this.head.pos.x + (Math.cos(xangle) * speed);
        const xtargety = this.head.pos.y + (Math.sin(xangle) * speed);
        
        const yangle = Math.atan2(this.direction.y, 0);
        const ytargetx = this.head.pos.x + (Math.cos(yangle) * speed);
        const ytargety = this.head.pos.y + (Math.sin(yangle) * speed);
        
        const r = new utils.Rect(
            ntargetx + constants.SNAKE_RECT_INSET,
            ntargety + constants.SNAKE_RECT_INSET,
            constants.SNAKE_RECT_SIZE,
            constants.SNAKE_RECT_SIZE
        );
        
        const rx = new utils.Rect(
            xtargetx + constants.SNAKE_RECT_INSET,
            xtargety + constants.SNAKE_RECT_INSET,
            constants.SNAKE_RECT_SIZE,
            constants.SNAKE_RECT_SIZE
        );

        const ry = new utils.Rect(
            ytargetx + constants.SNAKE_RECT_INSET,
            ytargety + constants.SNAKE_RECT_INSET,
            constants.SNAKE_RECT_SIZE,
            constants.SNAKE_RECT_SIZE
        );

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

        let canMove = true, canMoveX = true, canMoveY = true;
        if (tiles.length > 0) {
            for (let r2 of tiles) {
                if (r.collidesWith(r2)) canMove = false;
                if (rx.collidesWith(r2)) canMoveX = false;
                if (ry.collidesWith(r2)) canMoveY = false;
            }
        }

        if (canMove) {
            this.head.pos.x = ntargetx;
            this.head.pos.y = ntargety;
        } else if (canMoveY) {
            this.head.pos.x = ytargetx;
            this.head.pos.y = ytargety;
        } else if (canMoveX) {
            this.head.pos.x = xtargetx;
            this.head.pos.y = xtargety;
        } else {
            this.dashing = false;
        }
    };
    Snake.prototype.update = function () {
        if (this.dashing) this.propel();
        
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
            if (!e.isHitboxActive) continue;
            
            const r1 = new utils.Rect(e.pos.x - 11, e.pos.y - 10, constants.TILE_SIZE - 2, constants.TILE_SIZE - 2);
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
    Snake.prototype.dash = function() {
        if (this.dashing) return;
        
        const t = Date.now();
        const dt = t - this.lastDashAt;
        if (dt < 600) return;
        this.lastDashAt = t;
        
        this.dashing = true;
        const _this = this;
        setTimeout(function() {
            _this.dashing = false;
        }, 200);
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