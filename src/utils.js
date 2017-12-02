;(function () {
    window.ld40.utils = window.ld40.utils || {};
    const utils = window.ld40.utils;
    
    let _id = 0;

    utils.Rect = Rect;
    utils.clone = clone;
    utils.uniqueId = uniqueId;

    function Rect(x, y, w, h) {
        this.set(x, y, w, h);
    }

    Rect.prototype.set = function (x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.left = x;
        this.top = y;
        this.right = x + w;
        this.bottom = y + h;
    };

    Rect.prototype.collidesWith = function (r2) {
        const r1 = this;
        return !(
            r1.right < r2.left ||
            r1.left > r2.right ||
            r1.top > r2.bottom ||
            r1.bottom < r2.top
        );
    };
    
    function clone(obj) {
        let newObj = {};
        Object.assign(newObj, obj);
        return newObj;
    }
    
    function uniqueId() {
        return ++_id;
    }
})();