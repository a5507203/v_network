! function(t, e) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = e(require("three"), require("three.texttexture")) : "function" == typeof define && define.amd ? define(["three", "three.texttexture"], e) : (t.THREE = t.THREE || {}, t.THREE.TextSprite = e(t.THREE, t.THREE.TextTexture))
}(this, function(t, e) {
    "use strict";
    e = e && e.hasOwnProperty("default") ? e.default : e;
    var r = new t.Vector3,
        i = new t.Vector3,
        a = new t.Vector3;
    return function(o) {
        function n(r) {
            void 0 === r && (r = {});
            var i = r.textSize;
            void 0 === i && (i = 1);
            var a = r.redrawInterval;
            void 0 === a && (a = 1);
            var n = r.maxFontSize;
            void 0 === n && (n = 1 / 0);
            var p = r.material;
            void 0 === p && (p = {});
            var s = r.texture;
            void 0 === s && (s = {}), o.call(this, new t.SpriteMaterial(Object.assign({}, p, {
                map: new e(s),
                transparent: true,
                alphaTest:0.5
            }))), this.textSize = i, this.redrawInterval = a, this.maxFontSize = n, this.lastRedraw = 0
        }
        o && (n.__proto__ = o), n.prototype = Object.create(o && o.prototype), n.prototype.constructor = n;
        var p = {
            isTextSprite: {
                configurable: !0
            }
        };
        return p.isTextSprite.get = function() {
            return !0
        }, n.prototype.onBeforeRender = function(t, e, r) {
            this.redraw(t, r)
        }, n.prototype.updateScale = function() {
            this.scale.set(this.material.map.aspect, 1, 1).multiplyScalar(this.textSize * this.material.map.paddingBoxHeight)
        }, n.prototype.updateMatrix = function() {
            for (var t = [], e = arguments.length; e--;) t[e] = arguments[e];
            return this.updateScale(), o.prototype.updateMatrix.apply(this, t)
        }, n.prototype.redraw = function(t, e) {
            var r = this;
            this.lastRedraw + this.redrawInterval < Date.now() && (this.redrawInterval ? setTimeout(function() {
                r.redrawNow(t, e)
            }, 1) : this.redrawNow(t, e))
        }, n.prototype.redrawNow = function(e, o) {
            this.updateScale(), this.material.map.fontSize = Math.min(t.Math.ceilPowerOfTwo(function(t, e, o) {
                if (e.domElement.width && e.domElement.height && t.material.map.lines.length) {
                    var n = t.getWorldPosition(r).distanceTo(o.getWorldPosition(i));
                    if (n) {
                        var p = t.getWorldScale(a).y * e.domElement.height / n;
                        if (p) return Math.round(p / t.material.map.paddingBoxHeight)
                    }
                }
                return 0
            }(this, e, o)), this.maxFontSize), this.material.map.autoRedraw || this.material.map.redraw(), this.lastRedraw = Date.now()
        }, n.prototype.dispose = function() {
            this.material.map.dispose(), this.material.dispose()
        }, Object.defineProperties(n.prototype, p), n
    }(t.Sprite)
});