;(function () {
    window.ld40.enemies = window.ld40.enemies || {};
    const enemies = window.ld40.enemies;
    const utils = window.ld40.utils;
    const constants = window.ld40.constants;

    enemies.ctorLookup = {
        "spikeball": SpikeBall,
        "speartrap": SpearTrap
    };
    enemies.SpikeBall = SpikeBall;

    function SpikeBall(def, level) {
        this.level = level;
        this.def = def;
        this.id = utils.uniqueId();
        this.isHitboxActive = true;
        this.type = "spikeball";
        this.pos = {
            x: def.positions[0].x * constants.TILE_SIZE,
            y: def.positions[0].y * constants.TILE_SIZE
        };
        this.currentPosition = 0;
        this.nPositions = this.def.positions.length;
    }

    SpikeBall.prototype.update = function () {
        const targetPos = utils.clone(this.def.positions[(this.currentPosition + 1) % this.nPositions]);
        targetPos.x *= constants.TILE_SIZE;
        targetPos.y *= constants.TILE_SIZE;

        const angleToTarget = Math.atan2(targetPos.y - this.pos.y, targetPos.x - this.pos.x);
        this.pos.x += Math.cos(angleToTarget) * this.def.speed;
        this.pos.y += Math.sin(angleToTarget) * this.def.speed;

        if (utils.dist(this.pos.x, this.pos.y, targetPos.x, targetPos.y) < 3) this.currentPosition++;
    };

    function SpearTrap(def, level) {
        this.level = level;
        this.def = def;
        this.id = utils.uniqueId();
        this.type = "speartrap";
        this.timeSpawned = Date.now();
        this.lastPeriodChange = this.def.offset;
        this.isHitboxActive = false;
        this.pos = {
            x: def.position.x * constants.TILE_SIZE,
            y: def.position.y * constants.TILE_SIZE
        };
    }
    SpearTrap.prototype.update = function () {
        const dt = Date.now() - this.timeSpawned;
        const ddt = dt - this.lastPeriodChange;
        if ((this.isHitboxActive && ddt > this.def.activePer) || (!this.isHitboxActive && ddt > this.def.inactivePer)) {
            this.isHitboxActive = !this.isHitboxActive;
            this.lastPeriodChange = dt;
        }
    };
})();