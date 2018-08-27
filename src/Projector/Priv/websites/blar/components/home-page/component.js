"use strict";
(self.__CW_COMPONENTS__ || (self.__CW_COMPONENTS__ = {})).HomePage = React.createClass({
    getDefaultProps: function() {
        return {};
    },
    getInitialState: function() {
        return {
            "lang": "EN"
        };
    },
    render: function() {;
        var __CW_SELF_NAME__ = "HomePage";
        var __CW_INTERNAL_SELF__ = this;
        var __CW_INTERNAL_STATE_PROXY__ = (function() {
            var proxy = {};
            var newState = Object.assign({}, __CW_INTERNAL_SELF__.state);
            var timeoutHandle = null;
            var registerKey = (function(key) {
                Object.defineProperty(proxy, key, {
                    get: function() {
                        return newState[key];
                    },
                    set: function(value) {
                        newState[key] = value;
                        if (timeoutHandle === null) {
                            clearTimeout(timeoutHandle);
                        }
                        timeoutHandle = setTimeout(function() {
                            __CW_INTERNAL_SELF__.setState(newState);
                        }, 0);
                    },
                });
            });
            for (var key in newState) {
                registerKey(key);
            }
            return proxy;
        })();
        try {
            return (React.createElement("div", {
                "className": "home-page",
                "style": {
                    "background": "white",
                    "box-shadow": "1px 2px 4px rgba(0,0,0,0.2)",
                    "color": "#444",
                    "font-family": "Arial, Helvetica, sans-serif",
                    "padding": "16px",
                    "margin": "8px"
                }
            }, (React.createElement("h1", {
                "className": "welcome-text"
            }, (React.createElement("span", {
                "dangerouslySetInnerHTML": {
                    "__html": "Гоогле "
                }
            })))), (React.createElement("p", {
                "className": "language-text"
            }, (React.createElement("span", {
                "dangerouslySetInnerHTML": {
                    "__html": (__CW_RESOURCES__["-GLOBAL-"]).INTL[(__CW_INTERNAL_STATE_PROXY__).lang].LANGUAGE
                }
            })))), (React.createElement("button", {
                "className": (__CW_INTERNAL_STATE_PROXY__).lang == "EN" ?
                    "my-button selected" :
                    "my-button",
                "onClick": (function() {
                    var __CW_INTERNAL_EVENT__ = arguments[0];
                    var __CW_INTERNAL_TARGET__ = null;
                    var __CW_INTERNAL_VALUE__ = null;
                    if (__CW_INTERNAL_EVENT__ != null && __CW_INTERNAL_EVENT__.target != null && __CW_INTERNAL_EVENT__.target instanceof HTMLElement) {
                        __CW_INTERNAL_TARGET__ = __CW_INTERNAL_EVENT__.target;
                        if (__CW_INTERNAL_TARGET__) {
                            __CW_INTERNAL_VALUE__ = __CW_INTERNAL_TARGET__.value;
                        }
                    } else {
                        __CW_INTERNAL_EVENT__ = null;
                    }

                    (__CW_INTERNAL_STATE_PROXY__).lang = "EN";
                })
            }, (React.createElement("span", {
                "dangerouslySetInnerHTML": {
                    "__html": "EN"
                }
            })))), (React.createElement("button", {
                "className": (__CW_INTERNAL_STATE_PROXY__).lang == "BG" ?
                    "my-button selected" :
                    "my-button",
                "onClick": (function() {
                    var __CW_INTERNAL_EVENT__ = arguments[0];
                    var __CW_INTERNAL_TARGET__ = null;
                    var __CW_INTERNAL_VALUE__ = null;
                    if (__CW_INTERNAL_EVENT__ != null && __CW_INTERNAL_EVENT__.target != null && __CW_INTERNAL_EVENT__.target instanceof HTMLElement) {
                        __CW_INTERNAL_TARGET__ = __CW_INTERNAL_EVENT__.target;
                        if (__CW_INTERNAL_TARGET__) {
                            __CW_INTERNAL_VALUE__ = __CW_INTERNAL_TARGET__.value;
                        }
                    } else {
                        __CW_INTERNAL_EVENT__ = null;
                    }

                    (__CW_INTERNAL_STATE_PROXY__).lang = "BG";
                })
            }, (React.createElement("span", {
                "dangerouslySetInnerHTML": {
                    "__html": "BG"
                }
            })))), (React.createElement("button", {
                "className": (__CW_INTERNAL_STATE_PROXY__).lang == "DE" ?
                    "my-button selected" :
                    "my-button",
                "onClick": (function() {
                    var __CW_INTERNAL_EVENT__ = arguments[0];
                    var __CW_INTERNAL_TARGET__ = null;
                    var __CW_INTERNAL_VALUE__ = null;
                    if (__CW_INTERNAL_EVENT__ != null && __CW_INTERNAL_EVENT__.target != null && __CW_INTERNAL_EVENT__.target instanceof HTMLElement) {
                        __CW_INTERNAL_TARGET__ = __CW_INTERNAL_EVENT__.target;
                        if (__CW_INTERNAL_TARGET__) {
                            __CW_INTERNAL_VALUE__ = __CW_INTERNAL_TARGET__.value;
                        }
                    } else {
                        __CW_INTERNAL_EVENT__ = null;
                    }

                    (__CW_INTERNAL_STATE_PROXY__).lang = "DE";
                })
            }, (React.createElement("span", {
                "dangerouslySetInnerHTML": {
                    "__html": "DE"
                }
            })))), (React.createElement("button", {
                "className": (__CW_INTERNAL_STATE_PROXY__).lang == "RU" ?
                    "my-button selected" :
                    "my-button",
                "onClick": (function() {
                    var __CW_INTERNAL_EVENT__ = arguments[0];
                    var __CW_INTERNAL_TARGET__ = null;
                    var __CW_INTERNAL_VALUE__ = null;
                    if (__CW_INTERNAL_EVENT__ != null && __CW_INTERNAL_EVENT__.target != null && __CW_INTERNAL_EVENT__.target instanceof HTMLElement) {
                        __CW_INTERNAL_TARGET__ = __CW_INTERNAL_EVENT__.target;
                        if (__CW_INTERNAL_TARGET__) {
                            __CW_INTERNAL_VALUE__ = __CW_INTERNAL_TARGET__.value;
                        }
                    } else {
                        __CW_INTERNAL_EVENT__ = null;
                    }

                    (__CW_INTERNAL_STATE_PROXY__).lang = "RU";
                })
            }, (React.createElement("span", {
                "dangerouslySetInnerHTML": {
                    "__html": "RU"
                }
            })))), (React.createElement("button", {
                "className": (__CW_INTERNAL_STATE_PROXY__).lang == "CH" ?
                    "my-button selected" :
                    "my-button",
                "onClick": (function() {
                    var __CW_INTERNAL_EVENT__ = arguments[0];
                    var __CW_INTERNAL_TARGET__ = null;
                    var __CW_INTERNAL_VALUE__ = null;
                    if (__CW_INTERNAL_EVENT__ != null && __CW_INTERNAL_EVENT__.target != null && __CW_INTERNAL_EVENT__.target instanceof HTMLElement) {
                        __CW_INTERNAL_TARGET__ = __CW_INTERNAL_EVENT__.target;
                        if (__CW_INTERNAL_TARGET__) {
                            __CW_INTERNAL_VALUE__ = __CW_INTERNAL_TARGET__.value;
                        }
                    } else {
                        __CW_INTERNAL_EVENT__ = null;
                    }

                    (__CW_INTERNAL_STATE_PROXY__).lang = "CH";
                })
            }, (React.createElement("span", {
                "dangerouslySetInnerHTML": {
                    "__html": "CH"
                }
            }))))));
        } catch (e) {
            return React.createElement(
                'div', {
                    style: {
                        "background": "rgb(255,240,240)",
                        "color": "rgb(255,59,59)",
                        "fontFamily": "Consolas, Menlo, Monaco, \"Courier New\", monospace",
                        "fontSize": "16px",
                        "lineHeight": "20px",
                        "padding": "4px 8px",
                        "borderTop": "1px solid rgb(255,215,215)",
                        "borderBottom": "1px solid rgb(255,215,215)"
                    }
                },
                '"' + __CW_SELF_NAME__ + '" failed: ',
                React.createElement('div', {
                    style: {
                        paddingLeft: '24px'
                    }
                }, e.name + ': ' + e.message)
            );
        }
    },
});