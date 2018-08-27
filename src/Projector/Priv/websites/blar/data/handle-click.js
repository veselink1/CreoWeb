(self.__CW_RESOURCES__ || (self.__CW_RESOURCES__ = {
    '-key-': function(key) {
        return (this[key] || (this[key] = {}));
    }
}))['-key-']("-GLOBAL-")["handleClick"] = (function(exports) {
    var require = self.__cwuser_require__;
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = handleClick;

    function handleClick() {
        alert("You clicked me!");
    };
    return exports;
}({}))