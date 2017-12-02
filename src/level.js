;(function() {
    window.ld40.level = window.ld40.level || {};
    const level = window.ld40.level;
    const utils = window.ld40.utils;
    
    level.Level = Level;
    
    function Level(definition) {
        const def = utils.clone(definition);
        this.id = utils.uniqueId();
        this.def = def;
        for(let tile of def.tiles) {
            for(let loc of tile.locations) {
                loc.id = utils.uniqueId();
            }
        }
    }
})();