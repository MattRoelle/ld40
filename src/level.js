;(function() {
    window.ld40.level = window.ld40.level || {};
    const level = window.ld40.level;
    const utils = window.ld40.utils;
    const enemies = window.ld40.enemies;
    const constants = window.ld40.constants;
    
    level.Level = Level;
    
    function Level(definition) {
        const def = utils.clone(definition);
        this.id = utils.uniqueId();
        this.def = def;

        this.def.cameraBounds.x1 *= constants.TILE_SIZE;
        this.def.cameraBounds.x2 *= constants.TILE_SIZE;
        this.def.cameraBounds.y1 *= constants.TILE_SIZE;
        this.def.cameraBounds.y2 *= constants.TILE_SIZE;
        this.def.cameraBounds.x1 += constants.TILE_SIZE*2
        this.def.cameraBounds.x2 += constants.TILE_SIZE*2;
        this.def.cameraBounds.y1 += constants.TILE_SIZE*2;
        this.def.cameraBounds.y2 += constants.TILE_SIZE*2;
        
        this.enemies = [];
        
        for(let tile of def.tiles) {
            for(let loc of tile.locations) {
                loc.id = utils.uniqueId();
            }
        }
        
        for(let f of def.food) {
            f.id = utils.uniqueId();
            f.isDead = false;
        }
        
        for(let e of def.enemies) {
            this.enemies.push(new (enemies.ctorLookup[e.type])(e, this));
        }
    }
    Level.prototype.update = function() {
        for(let e of this.enemies) {
            e.update();
        }
    }
})();