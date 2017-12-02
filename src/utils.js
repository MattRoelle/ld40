;(function () {
    window.ld40.utils = window.ld40.utils || {};
    const utils = window.ld40.utils;

    let _id = 0;

    utils.Rect = Rect;
    utils.clone = _clone;
    utils.uniqueId = _uniqueId;
    utils.dist = _dist;

    function Rect(x, y, w, h) {
        this.set(x, y, w, h);
    }

    Rect.prototype.set = function (x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    };

    Rect.prototype.collidesWith = function (rect2) {
        const rect1 = this;
        return rect1.x < rect2.x + rect2.w &&
            rect1.x + rect1.w > rect2.x &&
            rect1.y < rect2.y + rect2.h &&
            rect1.h + rect1.y > rect2.y;
    };

    function _clone(obj) {
        let newObj = {};
        Object.assign(newObj, obj);
        return newObj;
    }

    function _uniqueId() {
        return ++_id;
    }

    function _dist(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
})();