;(function() {
    window.ld40.level = window.ld40.level || {};
    const level = window.ld40.level;
    const utils = window.ld40.utils;
    const enemies = window.ld40.enemies;
    
    level.Level = Level;
    
    function Level(definition) {
        const def = utils.clone(definition);
        this.id = utils.uniqueId();
        this.def = def;
        
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