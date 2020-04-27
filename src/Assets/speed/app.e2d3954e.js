(function(t) {
    function e(e) {
        for (var o, i, a = e[0], c = e[1], l = e[2], p = 0, u = []; p < a.length; p++) i = a[p],
        r[i] && u.push(r[i][0]),
        r[i] = 0;
        for (o in c) Object.prototype.hasOwnProperty.call(c, o) && (t[o] = c[o]);
        d && d(e);
        while (u.length) u.shift()();
        return n.push.apply(n, l || []),
        s()
    }
    function s() {
        for (var t, e = 0; e < n.length; e++) {
            for (var s = n[e], o = !0, a = 1; a < s.length; a++) {
                var c = s[a];
                0 !== r[c] && (o = !1)
            }
            o && (n.splice(e--, 1), t = i(i.s = s[0]))
        }
        return t
    }
    var o = {},
    r = {
        app: 0
    },
    n = [];
    function i(e) {
        if (o[e]) return o[e].exports;
        var s = o[e] = {
            i: e,
            l: !1,
            exports: {}
        };
        return t[e].call(s.exports, s, s.exports, i),
        s.l = !0,
        s.exports
    }
    i.m = t,
    i.c = o,
    i.d = function(t, e, s) {
        i.o(t, e) || Object.defineProperty(t, e, {
            enumerable: !0,
            get: s
        })
    },
    i.r = function(t) {
        "undefined" !== typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, {
            value: "Module"
        }),
        Object.defineProperty(t, "__esModule", {
            value: !0
        })
    },
    i.t = function(t, e) {
        if (1 & e && (t = i(t)), 8 & e) return t;
        if (4 & e && "object" === typeof t && t && t.__esModule) return t;
        var s = Object.create(null);
        if (i.r(s), Object.defineProperty(s, "default", {
            enumerable: !0,
            value: t
        }), 2 & e && "string" != typeof t) for (var o in t) i.d(s, o,
        function(e) {
            return t[e]
        }.bind(null, o));
        return s
    },
    i.n = function(t) {
        var e = t && t.__esModule ?
        function() {
            return t["default"]
        }: function() {
            return t
        };
        return i.d(e, "a", e),
        e
    },
    i.o = function(t, e) {
        return Object.prototype.hasOwnProperty.call(t, e)
    },
    i.p = "/";
    var a = window["webpackJsonp"] = window["webpackJsonp"] || [],
    c = a.push.bind(a);
    a.push = e,
    a = a.slice();
    for (var l = 0; l < a.length; l++) e(a[l]);
    var d = c;
    n.push([0, "chunk-vendors"]),
    s()
})({
    0 : function(t, e, s) {
        t.exports = s("56d7")
    },
    "0e1a": function(t, e, s) {
        t.exports = s.p + "img/share-warp.8539e4d6.png"
    },
    "146f": function(t, e, s) {
        t.exports = s.p + "img/off-line.ed1d46ae.png"
    },
    "18e7": function(t, e, s) {
        t.exports = s.p + "img/share-QQ.fe943b88.svg"
    },
    "1bf7": function(t, e, s) {
        "use strict";
        var o = s("5d79"),
        r = s.n(o);
        r.a
    },
    "1c17": function(t, e, s) {
        "use strict";
        var o = s("d68c"),
        r = s.n(o);
        r.a
    },
    2475 : function(t, e, s) {
        t.exports = s.p + "img/setting-node3.59c2746e.svg"
    },
    2930 : function(t, e, s) {
        t.exports = s.p 
    },
    "30eb": function(t, e, s) {
        "use strict";
        var o = s("3534"),
        r = s.n(o);
        r.a
    },
    "330e": function(t, e, s) {
        t.exports = s.p + "img/setting-user3.747c9d53.svg"
    },
    3534 : function(t, e, s) {},
    3589 : function(t, e, s) {
        t.exports = s.p + "img/location.c4e02305.svg"
    },
    "3e1c": function(t, e, s) {
        t.exports = s.p + "img/hybrid.8c6578ba.svg"
    },
    "480e": function(t, e, s) {
        t.exports = s.p + "img/share-weixin.c91803a9.svg"
    },
    4930 : function(t, e, s) {
        t.exports = s.p + "img/start-btn.9bd00181.svg"
    },
    "49cc": function(t, e, s) {},
    "51e8": function(t, e, s) {
        t.exports = s.p + "img/setting-user5.86dd70d1.svg"
    },
    "52f0": function(t, e, s) {
        "use strict";
        var o = s("de2f"),
        r = s.n(o);
        r.a
    },
    "56d7": function(t, e, s) {
        "use strict";
        s.r(e);
        s("0fae");
        var o = s("9e2f"),
        r = s.n(o),
        n = (s("cadf"), s("551c"), s("f751"), s("097d"), s("a026")),
        i = function() {
            var t = this,
            e = t.$createElement,
            s = t._self._c || e;
            return s("div", {
                attrs: {
                    id: "app"
                }
            },
            [s("a", {
                staticClass: "all-logo",
                attrs: {
                    href: t.officialWebsite,
                    target: "_blank"
                }
            },
            ), s("router-view")], 1)
        },
        a = [],
        c = s("e347"),
        l = s.n(c),
        d = {
            data: function() {
                return {
                    logoImg: l.a,
                    test: navigator.userAgent.toLowerCase(),
                    officialWebsite: "http://www.speedtest.cn"
                }
            },
            methods: {
                resizeUrl: function() {
                    var t = this;
                    this.officialWebsite = document.body.offsetWidth > 768 ? "http://www.speedtest.cn": "https://m.speedtest.cn/",
                    window.onresize = function() {
                        t.officialWebsite = document.body.offsetWidth > 768 ? "http://www.speedtest.cn": "https://m.speedtest.cn/"
                    }
                }
            },
            mounted: function() {
                this.resizeUrl(),
                console.log("version5.2.0")
            }
        },
        p = d,
        u = (s("5c0b"), s("2877")),
        h = Object(u["a"])(p, i, a, !1, null, null, null),
        f = h.exports,
        g = s("8c4f"),
        v = function() {
            var t = this,
            e = t.$createElement,
            s = t._self._c || e;
            return s("div", {
                style: {
                    backgroundColor: t.colorRgb(t.$store.state.secondLevelConfig.bgColor, .2)
                }
            },
            [t.networkSwitch ? s("div", {
                staticClass: "speedtest-container"
            },
            [s("StartVelocity", {
                attrs: {
                    reqResultContainerOpacity: t.resultContainerOpacity,
                    officialWebsite: t.officialWebsite,
                    reqsStopBtnText: t.stopBtnText,
                    reqProgressType: t.progressType
                },
                on: {
                    parGoVelocity: t.goVelocity,
                    parToggleServerModal: t.toggleServerModal,
                    parShowPicker: t.showPicker
                }
            }), t.startSwitch ? s("div", {
                staticClass: "result-container",
                style: {
                    opacity: !t.resultContainerOpacity
                }
            },
            [s("div", {
                staticClass: "result-container-left"
            },
            [t.velocityFruit ? t._e() : s("section", {
                staticClass: "gauge-assembly",
                class: [t.gaugeAssemblyOpacity ? "gauge-finish-animate": "gauge-assembly-animate"]
            },
            [s("div", {
                staticClass: "gauge-container",
                class: {
                    "gauge-container-other": "Safari" === t.$store.state.browserVersion,
                    "gauge-container-ios": t.$store.state.isiOS
                }
            },
            [s("div", {
                ref: "increment",
                staticClass: "increments-wrapper",
                class: {
                    "increments-wrapper-ie": "IE" === t.$store.state.browserVersion,
                    "increments-wrapper-ios": t.$store.state.isiOS && "Safari" !== t.$store.state.browserVersion
                }
            },
            [t._l(t.points,
            function(e, o) {
                return [e >= t.convertSpeed(t.speed) || "—" === t.convertSpeed(t.speed) ? s("span", {
                    key: o,
                    class: "increment increment-" + o + " monochrome-primary increment--off"
                },
                [s("span", [t._v(t._s(e))]), o && o !== t.points.length - 1 ? t._e() : s("i")]) : s("span", {
                    key: o,
                    class: "increment increment-" + o + " monochrome-primary increment--on",
                    style: {
                        color: t.$store.state.secondLevelConfig.uploadColor
                    }
                },
                [s("span", [t._v(t._s(e))]), o && o !== t.points.length - 1 ? t._e() : s("i", {
                    style: {
                        background: t.incrementIconBackground(o)
                    }
                })])]
            })], 2), s("div", {
                class: ["gauge-needle", {
                    "gauge-animation": t.isAnimation
                },
                {
                    "gauge-needle-ie": "IE" === t.$store.state.browserVersion
                }],
                style: {
                    transform: t.transform
                }
            },
            [s("svg", {
                attrs: {
                    width: "20px",
                    height: "115px",
                    viewBox: "0 0 20 115",
                    version: "1.1",
                    xmlns: "http://www.w3.org/2000/svg",
                    "xmlns:xlink": "http://www.w3.org/1999/xlink"
                }
            },
            [s("title", [t._v("矩形")]), s("desc", [t._v("Created with Sketch.")]), s("defs", [s("linearGradient", {
                attrs: {
                    x1: "51.9222415%",
                    y1: "36.0302734%",
                    x2: "51.9222415%",
                    y2: "0%",
                    id: "linearGradient-10"
                }
            },
            [s("stop", {
                attrs: {
                    "stop-color": t.colorRgb(t.$store.state.secondLevelConfig.uploadColor, .6),
                    "stop-opacity": "0",
                    offset: "0%"
                }
            }), s("stop", {
                attrs: {
                    "stop-color": t.$store.state.secondLevelConfig.uploadColor,
                    offset: "100%"
                }
            })], 1)], 1), s("g", {
                attrs: {
                    id: "页面1",
                    stroke: "none",
                    "stroke-width": "1",
                    fill: "none",
                    "fill-rule": "evenodd"
                }
            },
            [s("g", {
                attrs: {
                    id: "画板",
                    transform: "translate(-360.000000, -172.000000)",
                    fill: "url(#linearGradient-10)"
                }
            },
            [s("polygon", {
                attrs: {
                    id: "矩形",
                    points: "358 492 362.150509 172 377.849491 172 382 492"
                }
            })])])])]), s("div", {
                staticClass: "gauge",
                class: {
                    "gauge-ie": "IE" === t.$store.state.browserVersion
                }
            },
            [s("div", {
                staticClass: "gauge-path"
            },
            [s("svg", {
                attrs: {
                    width: "110%",
                    height: "110%",
                    viewBox: "0 0 100 100"
                }
            },
            [s("defs", [s("linearGradient", {
                attrs: {
                    x1: "1",
                    y1: "1",
                    x2: "0",
                    y2: "0",
                    id: "gradient1"
                }
            },
            [s("stop", {
                attrs: {
                    offset: "0%",
                    "stop-color": t.$store.state.secondLevelConfig.uploadColor
                }
            }), s("stop", {
                attrs: {
                    offset: "10%",
                    "stop-color": t.$store.state.secondLevelConfig.uploadColor
                }
            }), s("stop", {
                attrs: {
                    offset: "80%",
                    "stop-color": t.$store.state.secondLevelConfig.downloadColor
                }
            }), s("stop", {
                attrs: {
                    offset: "100%",
                    "stop-color": t.$store.state.secondLevelConfig.downloadColor
                }
            })], 1), s("linearGradient", {
                attrs: {
                    x1: "1",
                    y1: "1",
                    x2: "0",
                    y2: "0",
                    id: "gradient2"
                }
            },
            [s("stop", {
                attrs: {
                    offset: "0%",
                    "stop-color": t.$store.state.secondLevelConfig.uploadColor
                }
            }), s("stop", {
                attrs: {
                    offset: "10%",
                    "stop-color": t.$store.state.secondLevelConfig.uploadColor
                }
            }), s("stop", {
                attrs: {
                    offset: "80%",
                    "stop-color": t.$store.state.secondLevelConfig.downloadColor
                }
            }), s("stop", {
                attrs: {
                    offset: "100%",
                    "stop-color": t.$store.state.secondLevelConfig.downloadColor
                }
            })], 1)], 1), s("g", [s("circle", {
                staticClass: "gauge-path-background stroke-background",
                style: {
                    strokeWidth: 4.2
                },
                attrs: {
                    r: "43",
                    cx: "50%",
                    cy: "50%"
                }
            }), s("circle", {
                class: ["gauge-path-current-speed", {
                    "gauge-path-animation": t.isAnimation
                }],
                style: {
                    stroke: t.stroke,
                    strokeWidth: 4.2
                },
                attrs: {
                    r: "43",
                    cx: "50%",
                    cy: "50%",
                    "stroke-dashoffset": t.dashoffset
                }
            }), s("circle", {
                staticClass: "gauge-path-loading stroke-background",
                style: {
                    strokeWidth: 4.2
                },
                attrs: {
                    r: "43",
                    cx: "50%",
                    cy: "50%"
                }
            })])])])])]), s("div", {
                staticClass: "speed-assembly monochrome-primary font-Gothic center-result",
                class: {
                    "speed-assembly-ie": "IE" === t.$store.state.browserVersion,
                    "speed-assembly-ios": t.$store.state.isiOS
                }
            },
            [t._m(0), s("div", {
                staticClass: "number monochrome-primary"
            },
            [s("span", {
                staticClass: "font-Gothic-num",
                style: {
                    color: t.$store.state.secondLevelConfig.uploadColor
                }
            },
            [t._v(t._s(t.speed ? parseInt(t.convertSpeed(t.speed)) : 0)), !t.speed || parseInt(t.convertSpeed(t.speed)) <= 1e3 ? s("span", {
                staticClass: "font-Gothic-floating",
                style: {
                    color: t.$store.state.secondLevelConfig.uploadColor
                }
            },
            [t._v("." + t._s(t.speed ? t.convertSpeed(t.speed).split(".")[1] : 0))]) : t._e()])]), s("span", {
                staticClass: "unit monochrome-secondary",
                style: {
                    color: t.$store.state.secondLevelConfig.uploadColor
                }
            },
            [t._v("\n                    " + t._s(t.setting.unit) + "\n                    ")])])]), t.velocityFruit ? s("div", {
                staticClass: "gauge-finish"
            },
            [s("StartVelocityCircle", {
                class: t.gaugeAssemblyOpacity ? "gauge-assembly-animate-other": "gauge-finish-animate",
                on: {
                    parGoVelocity: t.startFinishStop
                }
            }), s("keep-alive", [s("ShareResult", {
                style: {
                    opacity: t.gaugeFinishOpacity
                },
                attrs: {
                    type: "icon",
                    url: this.$store.getters.speedResult.share_url
                }
            })], 1)], 1) : t._e(), t.velocityFruit ? t._e() : s("button", {
                class: ["stop-velocity", {
                    "stop-velocity-other": t.velocityFruit
                }],
                style: {
                    opacity: !t.gaugeFinishOpacity
                },
                on: {
                    click: t.stopVelocity
                }
            },
            [t._v(t._s(t.stopBtnText) + "\n                    ")])]), s("div", {
                staticClass: "result-container-right"
            },
            [s("div", {
                staticClass: "result-container-speed"
            },
            [s("a", {
                staticClass: "result-item-container",
                attrs: {
                    href: t.officialWebsite,
                    target: "_blank"
                }
            },
            [s("div", {
                staticClass: " result-item receiving"
            },
            [s("div", {
                staticClass: "result-label"
            },
            [t._v("下载 / " + t._s(t.setting.unit) + "\n                                ")]), s("div", {
                staticClass: "result-data receiving font-Gothic"
            },
            [s("span", {
                staticClass: "font-Gothic-num",
                domProps: {
                    textContent: t._s(t.convertSpeed(1 === t.progressType ? null: t.listenDlStatus))
                }
            }), s("canvas", {
                staticClass: "base-canvas",
                attrs: {
                    id: "downCanvas"
                }
            },
            [t._v("\n                                        下载canvas\n                                    ")])])])]), s("a", {
                staticClass: "result-item-container",
                attrs: {
                    href: t.officialWebsite,
                    target: "_blank"
                }
            },
            [s("div", {
                staticClass: "result-item sending"
            },
            [s("div", {
                staticClass: "result-label"
            },
            [t._v("上传 / " + t._s(t.setting.unit) + "\n                                ")]), s("div", {
                staticClass: "result-data sending font-Gothic"
            },
            [s("span", {
                staticClass: "font-Gothic-num",
                domProps: {
                    textContent: t._s(t.convertSpeed(2 === t.progressType ? null: t.listenUlStatus))
                }
            }), s("canvas", {
                staticClass: "base-canvas",
                attrs: {
                    id: "uploadCanvas"
                }
            },
            [t._v("\n                                        下载canvas\n                                    ")])])])])]), s("a", {
                staticClass: "parameters",
                attrs: {
                    href: t.officialWebsite,
                    target: "_blank"
                }
            },
            [s("div", [t._v("PING："), s("span", {
                domProps: {
                    textContent: t._s(this.$store.getters.testData.pingStatus)
                }
            }), t._v(" ms")]), s("div", [t._v("抖动："), s("span", {
                domProps: {
                    textContent: t._s(this.$store.getters.testData.jitterStatus)
                }
            }), t._v("ms")]), s("div", [t._v("丢包：" + t._s(this.$store.getters.testData.lossStatus) + "%")])]), s("a", {
                staticClass: "parameters-other",
                attrs: {
                    href: t.officialWebsite,
                    target: "_blank"
                }
            },
            [s("div", [t._m(1), s("p", {
                domProps: {
                    textContent: t._s("" !== this.$store.getters.testData.pingStatus ? this.$store.getters.testData.pingStatus: "—")
                }
            })]), s("div", [t._m(2), s("p", {
                domProps: {
                    textContent: t._s("" !== this.$store.getters.testData.jitterStatus ? this.$store.getters.testData.jitterStatus: "—")
                }
            })]), s("div", [s("p", [t._v("丢包/%")]), s("p", {
                domProps: {
                    textContent: t._s("" !== this.$store.getters.testData.lossStatus ? this.$store.getters.testData.lossStatus: "—")
                }
            })])])])]) : t._e(), s("ServerModal", {
                directives: [{
                    name: "show",
                    rawName: "v-show",
                    value: t.serverModalSwitch,
                    expression: "serverModalSwitch"
                }],
                on: {
                    parToggleServerModal: t.toggleServerModal
                }
            }), s("awesome-picker", {
                ref: "picker",
                staticClass: "picker-warp",
                attrs: {
                    data: t.picker.data,
                    anchor: t.picker.anchor
                },
                on: {
                    confirm: t.handlePickerConfirm
                }
            })], 1) : s("offNetwork")], 1)
        },
        m = [function() {
            var t = this,
            e = t.$createElement,
            o = t._self._c || e;
            return o("div", {
                staticClass: "logo-warp"
            },
            [o("img", {
                staticClass: "speedtest-logo",
                attrs: {
                    src: s("9d64"),
                    alt: "logo"
                }
            })])
        },
        function() {
            var t = this,
            e = t.$createElement,
            s = t._self._c || e;
            return s("p", [t._v("PING/"), s("span", {
                staticClass: "text-transform"
            },
            [t._v("ms")])])
        },
        function() {
            var t = this,
            e = t.$createElement,
            s = t._self._c || e;
            return s("p", [t._v("抖动/"), s("span", {
                staticClass: "text-transform"
            },
            [t._v("ms")])])
        }],
        C = (s("96cf"), s("3b8d")),
        w = (s("6c7b"), s("ac6a"), s("5df3"), s("f400"), s("75fc")),
        y = function() {
            var t = this,
            e = t.$createElement,
            s = t._self._c || e;
            return s("div", {
                staticClass: "start-velocity-warp",
                class: {
                    "start-velocity-warp-animate": t.startSwitch
                }
            },
            [s("div", {
                staticClass: "start-velocity"
            },
            [s("StartVelocityCircle", {
                class: {
                    "start-item-circle-animate": t.startSwitch
                },
                on: {
                    parGoVelocity: t.goVelocity
                }
            }), s("div", {
                staticClass: "start-item-group",
                class: {
                    "start-item-group-animate": t.startSwitch
                }
            },
            [s("div", {
                staticClass: "start-item",
                class: {
                    "start-item-left-animate": t.startSwitch
                }
            },
            [s("a", {
                // attrs: {
                //     href: t.officialWebsite,
                //     target: "_blank"
                // }
            },
            ), t.deviceIP && !t.ipInfo.operator ? s("div", [s("p", [t._v(t._s(t.carrieroperator))]), s("p")]) : s("div", [s("p", [t._v(t._s(t.ipInfo.ip))]), s("p", [s("a", {
                // attrs: {
                //     href: t.officialWebsite,
                //     target: "_blank"
                // }
            },
            [t._v(t._s(t.ipInfo.operator))])])])]), s("speedtestProgress", {
                attrs: {
                    progressType: t.reqProgressType
                }
            })], 1)], 1)])
        },
        S = [],
        b = (s("28a5"), s("afd7")),
        x = s.n(b),
        k = s("3589"),
        _ = s.n(k),
        T = s("f732"),
        L = s.n(T),
        O = s("330e"),
        A = s.n(O),
        I = s("ee8d"),
        E = s.n(I),
        j = s("51e8"),
        P = s.n(j),
        U = s("3e1c"),
        $ = s.n(U),
        D = s("ff4c"),
        M = s.n(D),
        R = s("2475"),
        N = s.n(R),
        G = s("b11a"),
        V = s.n(G),
        W = s("64bd"),
        B = s.n(W),
        F = function() {
            var t = this,
            e = t.$createElement,
            s = t._self._c || e;
            return s("div", {
                staticClass: "start-item-circle",
                on: {
                    click: t.goVelocity
                }
            },
            [s("p", [t._v("测速")]), s("svg", {
                staticClass: "start-btn",
                attrs: {
                    width: "354px",
                    height: "354px",
                    viewBox: "0 0 354 354",
                    version: "1.1",
                    xmlns: "http://www.w3.org/2000/svg",
                    "xmlns:xlink": "http://www.w3.org/1999/xlink"
                }
            },
            [s("title", [t._v("按钮")]), s("desc", [t._v("Created with Sketch.")]), s("defs", [s("linearGradient", {
                attrs: {
                    x1: "18.1623641%",
                    y1: "12.7921196%",
                    x2: "83.0978261%",
                    y2: "89.9558424%",
                    id: "linearGradient-1"
                }
            },
            [s("stop", {
                staticClass: "upload-canvas",
                attrs: {
                    "stop-color": t.$store.state.secondLevelConfig.downloadColor,
                    offset: "0%"
                }
            }), s("stop", {
                staticClass: "download-canvas",
                attrs: {
                    "stop-color": t.$store.state.secondLevelConfig.uploadColor,
                    offset: "100%"
                }
            })], 1)], 1), s("g", {
                attrs: {
                    id: "页面1",
                    stroke: "none",
                    "stroke-width": "1",
                    fill: "none",
                    "fill-rule": "evenodd"
                }
            },
            [s("g", {
                attrs: {
                    id: "测速1",
                    transform: "translate(-554.000000, -260.000000)",
                    fill: "url(#linearGradient-1)",
                    "fill-rule": "nonzero"
                }
            },
            [s("g", {
                attrs: {
                    id: "按钮",
                    transform: "translate(537.000000, 242.000000)"
                }
            },
            [s("circle", {
                attrs: {
                    cx: "194.126448",
                    cy: "195.150991",
                    r: "176.733752"
                }
            })])])])]), s("svg", {
                staticClass: "start-btn-circle",
                attrs: {
                    width: "387px",
                    height: "387px",
                    viewBox: "0 0 387 387",
                    version: "1.1",
                    xmlns: "http://www.w3.org/2000/svg",
                    "xmlns:xlink": "http://www.w3.org/1999/xlink"
                }
            },
            [s("title", [t._v("外圈")]), s("desc", [t._v("Created with Sketch.")]), s("defs", [s("linearGradient", {
                attrs: {
                    x1: "18.1623641%",
                    y1: "12.7921196%",
                    x2: "83.0978261%",
                    y2: "89.9558424%",
                    id: "linearGradient-1"
                }
            },
            [s("stop", {
                staticClass: "upload-canvas",
                attrs: {
                    "stop-color": t.$store.state.secondLevelConfig.downloadColor,
                    offset: "0%"
                }
            }), s("stop", {
                staticClass: "download-canvas",
                attrs: {
                    "stop-color": t.$store.state.secondLevelConfig.uploadColor,
                    offset: "100%"
                }
            })], 1)], 1), s("g", {
                attrs: {
                    id: "页面1",
                    stroke: "none",
                    "stroke-width": "1",
                    fill: "none",
                    "fill-rule": "evenodd"
                }
            },
            [s("g", {
                attrs: {
                    id: "测速1",
                    transform: "translate(-538.000000, -243.000000)",
                    fill: "url(#linearGradient-1)",
                    "fill-rule": "nonzero"
                }
            },
            [s("g", {
                attrs: {
                    id: "按钮",
                    transform: "translate(537.000000, 242.000000)"
                }
            },
            [s("path", {
                attrs: {
                    d: "M195,388 C87.6329009,388 1,301.367099 1,195 C1,87.6329009 87.6329009,1 195,1 C301.367099,1 388,87.6329009 388,195 C388,301.367099 301.367099,388 195,388 Z M195,385 C299.710245,385 385,299.710245 385,195 C385,89.2897552 299.710245,4 195,4 C89.2897552,4 4,89.2897552 4,195 C4,299.710245 89.2897552,385 195,385 Z",
                    id: "外圈"
                }
            })])])])])])
        },
        z = [],
        q = s("4930"),
        Z = s.n(q),
        Q = s("65ee"),
        X = s.n(Q),
        Y = {
            name: "StartVelocityCircle",
            data: function() {
                return {
                    startBtn: Z.a,
                    startBtnCircle: X.a
                }
            },
            methods: {
                goVelocity: function() {
                    this.$emit("parGoVelocity")
                }
            }
        },
        J = Y,
        K = (s("30eb"), Object(u["a"])(J, F, z, !1, null, "3e031a52", null)),
        H = K.exports,
        tt = function() {
            var t = this,
            e = t.$createElement,
            s = t._self._c || e;
            return s("div", {
                staticClass: "speedtest-progress"
            },
            [s("div", {
                staticClass: "progress-warp"
            },
            [s("div", {
                staticClass: "progress-advance-item",
                class: [1 === +t.progressType ? "progress-advance-left-ani": 2 === +t.progressType ? "progress-advance-right-ani": ""],
                
            })])])
        },
        et = [],
        st = {
            name: "speedtestProgress",
            props: ["progressType"],
            data: function() {
                return {
                    progressLeftWidth: 0,
                    progressRightWidth: 0,
                    linearColor: "linear-gradient(to right, transparent, #19C9EF)",
                    warpBackground: "linear-gradient(128deg, #40FFD2 0%,#50E3C2 48%, #19C9EF 100%)"
                }
            },
            watch: {
                progressType: function(t) {
                    2 === +t ? (this.$store.dispatch("setUploadInit", !0), this.linearColor = "linear-gradient(to right, transparent, ".concat(this.$store.state.secondLevelConfig.uploadColor, ")")) : 1 === +t ? (this.progressLeftWidth = 0, this.linearColor = "linear-gradient(to right, transparent, ".concat(this.$store.state.secondLevelConfig.downloadColor, ")")) : 4 === +t && this.$store.state.uploadInit && (this.progressLeftWidth = 0, this.progressRightWidth = 0, this.$store.dispatch("setGaugeAssemblyOpacity", 0), this.$store.dispatch("setVelocityFruit", !0))
                }
            }
        },
        ot = st,
        rt = (s("af1b"), Object(u["a"])(ot, tt, et, !1, null, "3da5582d", null)),
        nt = rt.exports,
        it = {
            name: "startVelocity",
            data: function() {
                return {
                    carrieroperator: "网络运营商",
                    point: "寻找测速点",
                    locationImg: x.a,
                    pointImg: x.a,
                    startSwitch: !1,
                    locationImgArr: [_.a, L.a, A.a, E.a, P.a],
                    pointImgArr: [$.a, M.a, N.a, V.a, B.a]
                }
            },
            props: ["reqProgressType", "reqResultContainerOpacity", "officialWebsite", "reqsStopBtnText"],
            computed: {
                ipInfo: function() {
                    return this.$store.getters.ipInfo
                },
                demoServer: function() {
                    return this.$store.getters.demoServer
                },
                deviceIP: function() {
                    return this.$store.getters.deviceIP
                },
                listenLocationIcon: function() {
                    return this.$store.state.secondLevelConfig.locationIcon
                },
                listenHybridIcon: function() {
                    return this.$store.state.secondLevelConfig.hybridIcon
                }
            },
            components: {
                StartVelocityCircle: H,
                speedtestProgress: nt
            },
            methods: {
                goVelocity: function() {
                    this.$store.state.ipInfo.operator ? this.$store.state.demoServer.sponsor ? (this.startSwitch = !0, this.$emit("parGoVelocity", !0)) : this.$message("未获得测度点信息") : this.$message("未获得IP信息")
                },
                toggleServerModal: function() { + this.reqProgressType && 4 !== +this.reqProgressType || (document.body.clientWidth >= 768 ? this.$emit("parToggleServerModal", !0) : this.$emit("parShowPicker"))
                },
                reviseIp: function(t) {
                    if (t) {
                        var e = t.split(".");
                        return e[1] = "*",
                        e[2] = "*",
                        e.join(".")
                    }
                }
            },
            watch: {
                ipInfo: function(t) {
                    this.locationImg = t.operator ? this.locationImgArr[ + this.$store.state.secondLevelConfig.locationIcon] : x.a
                },
                demoServer: function(t) {
                    this.pointImg = t.sponsor ? this.pointImgArr[ + this.$store.state.secondLevelConfig.hybridIcon] : x.a
                },
                listenLocationIcon: function(t) {
                    this.ipInfo.operator && (this.locationImg = this.locationImgArr[ + t])
                },
                listenHybridIcon: function(t) {
                    this.demoServer.sponsor && (this.pointImg = this.pointImgArr[ + t])
                }
            }
        },
        at = it,
        ct = (s("6745"), Object(u["a"])(at, y, S, !1, null, "48099259", null)),
        lt = ct.exports,
        dt = function() {
            var t = this,
            e = t.$createElement,
            o = t._self._c || e;
            return o("div", {
                staticClass: "share"
            },
            [o("div", {
                // attrs: {
                //     id: "copyInput"
                // }
            }), o("transition", {
                attrs: {
                    name: "fade"
                }
            },
            [o("div", {
                directives: [{
                    name: "show",
                    rawName: "v-show",
                    value: t.show,
                    expression: "show"
                }],
                staticClass: "wechat-dialog-container-warp",
                on: {
                    click: function(e) {
                        return e.target !== e.currentTarget ? null: t.onClose(e)
                    }
                }
            },
            [o("div", {
                staticClass: "wechat-dialog-container"
            },
            [o("p", {
                staticClass: "share-title"
            },
            [o("img", {
                staticClass: "close-icon",
                attrs: {
                    src: t.closeIcon,
                    alt: "close-icon"
                },
                on: {
                    click: t.onClose
                }
            })]), o("div", {
                staticClass: "share-code"
            },
            [o("img", {
                attrs: {
                    src: t.weixinQr,
                    alt: "code"
                }
            }), o("p", [t._v("微信扫一扫分享本次结果")])])])])]), o("transition", {
                attrs: {
                    name: "fade"
                }
            },
            [o("div", {
                directives: [{
                    name: "show",
                    rawName: "v-show",
                    value: t.copyShow,
                    expression: "copyShow"
                }],
                staticClass: "copy-connection"
            },
            )]), o("div", {
                
            }
            , 2), o("div", {
               
            },
            []), o("transition", {
                attrs: {
                    name: "fade"
                }
            },
            ), o("transition", {
                attrs: {
                    name: "fade"
                }
            })], 1)
        },
        pt = [],
        ut = s("a56c"),
        ht = s.n(ut),
        ft = s("18e7"),
        gt = s.n(ft),
        vt = s("480e"),
        mt = s.n(vt),
        Ct = s("ac66"),
        wt = s.n(Ct),
        yt = s("fa38"),
        St = s.n(yt),
        bt = s("8b23"),
        xt = s.n(bt),
        kt = s("2930"),
        _t = s.n(kt),
        Tt = s("c04a"),
        Lt = s.n(Tt),
        Ot = {
            props: {
                isShow: {
                default:
                    !1
                },
                url: {
                default:
                    location.href
                }
            },
            data: function() {
                return {
                    mobileShareOtherSwitch: !1,
                    nativeShare: new ht.a,
                    mobileShareSwitch: !1,
                    shareIcon: Lt.a,
                    show: this.isShow,
                    copyShow: !1,
                    closeIcon: _t.a,
                    shareConnectIcon: St.a,
                    shareArr: [{
                        title: "分享到QQ",
                        imgSrc: gt.a,
                        type: "qq"
                    },
                    {
                        title: "分享到微信",
                        imgSrc: mt.a
                    },
                    {
                        title: "分享到微博",
                        imgSrc: wt.a,
                        type: "weibo"
                    },
                    {
                        title: "分享到QQ空间",
                        imgSrc: xt.a,
                        type: "qzone"
                    }]
                }
            },
            computed: {
                weixinQr: function() {
                    return "http://qr.liantu.com/api.php?w=250&text=" + this.encodeUrl
                },
                encodeUrl: function() {
                    return encodeURIComponent(this.url)
                }
            },
            methods: {
                colorRgb: function(t, e) {
                    var s = t.toLowerCase(),
                    o = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
                    if (s && o.test(s)) {
                        if (4 === s.length) {
                            for (var r = "#",
                            n = 1; n < 4; n += 1) r += s.slice(n, n + 1).concat(s.slice(n, n + 1));
                            s = r
                        }
                        for (var i = [], a = 1; a < 7; a += 2) i.push(parseInt("0x" + s.slice(a, a + 2)));
                        return "rgba(" + i.join(",") + "," + e + ")"
                    }
                    return s
                },
                openClone: function() {
                    var t = this;
                    this.copyShow = !0,
                    setTimeout(function() {
                        t.copyShow = !1
                    },
                    1500)
                },
                toSharemobile: function() {
                    var t = navigator.userAgent.toLowerCase(),
                    e = /(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent) && /\sQQ/i.test(navigator.userAgent),
                    s = /(Android)/i.test(navigator.userAgent) && /MQQBrowser/i.test(navigator.userAgent) && /\sQQ/i.test(navigator.userAgent.split("MQQBrowser"));
                    if (e || s || t.indexOf("micromessenger") > -1 || t.indexOf("dingtalk") > -1) this.toggleMobileShare(!0);
                    else try {
                        var o = this.url;
                        this.nativeShare.setShareData({
                            icon: "",
                            link: o,
                            title: "测速分享",
                            desc: "快来看看你的网速有没有拖后退吧",
                            from: ""
                        }),
                        this.nativeShare.call()
                    } catch(r) {
                        this.toggleMobileShare(!0)
                    }
                },
                toggleMobileShareOther: function(t) {
                    this.mobileShareOtherSwitch = t
                },
                toggleMobileShare: function(t) {
                    this.mobileShareSwitch = t
                },
                onClose: function() {
                    this.show = !this.show
                },
                open: function(t, e) {
                    var s = new Map([["weibo", "http://service.weibo.com/share/share.php?url=".concat(this.encodeUrl)], ["qzone", "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=".concat(this.encodeUrl)], ["qq", "http://connect.qq.com/widget/shareqq/index.html?url=".concat(this.encodeUrl)]]);
                    if (1 === t) this.show = !0;
                    else if (void 0 !== e) {
                        var o = s.get(e);
                        window.open(o, "_blank", "toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=600,height=500")
                    }
                },
                copyArticle: function() {
                    var t = document.createRange();
                    t.selectNode(document.getElementById("copyInput"));
                    var e = window.getSelection();
                    e.rangeCount > 0 && e.removeAllRanges(),
                    e.addRange(t),
                    document.execCommand("copy"),
                    this.openClone()
                },
                goCopy: function() {
                    document.getElementById("copyDom1").addEventListener("click", this.copyArticle, !1),
                    document.getElementById("copyDom2").addEventListener("click", this.copyArticle, !1)
                }
            },
            mounted: function() {
                this.goCopy()
            }
        },
        At = Ot,
        It = (s("1bf7"), Object(u["a"])(At, dt, pt, !1, null, "567dfa32", null)),
        Et = It.exports,
        jt = function() {
            var t = this,
            e = t.$createElement,
            s = t._self._c || e;
            return s("transition", {
                attrs: {
                    name: "fade",
                    mode: "in-out"
                }
            },
            [s("div", {
                staticClass: "server-modal-warp",
                on: {
                    click: function(e) {
                        return e.target !== e.currentTarget ? null: t.toggleServerModal(e)
                    }
                }
            },
            [s("div", {
                staticClass: "server-modal"
            },
            [s("img", {
                staticClass: "close-icon",
                attrs: {
                    src: t.closeIcon,
                    alt: "close-icon"
                },
                on: {
                    click: t.toggleServerModal
                }
            }), s("h4", {
                staticClass: "clearfix"
            },
            [t._v("选择测速节点 "), s("span", {
                staticClass: "float-right text-primary "
            },
            [t._v(t._s(t.demoServer.city))])]), s("p", {
                staticClass: "text-primary"
            },
            [t._v(t._s(t.demoServer.sponsor))]), t.servers.length ? s("ul", {
                staticClass: "server-item-warp"
            },
            t._l(t.servers,
            function(e, o) {
                return s("li", {
                    key: o,
                    staticClass: "server-item",
                    on: {
                        click: function(s) {
                            return t.changeServer(e)
                        }
                    }
                },
                [t._v("\n                    " + t._s(e.city) + "-" + t._s(e.sponsor) + "\n                ")])
            }), 0) : t._e()])])])
        },
        Pt = [],
        Ut = {
            name: "ServerModal",
            computed: {
                demoServer: function() {
                    return this.$store.getters.demoServer
                },
                servers: function() {
                    return this.$store.getters.servers
                }
            },
            data: function() {
                return {
                    closeIcon: _t.a
                }
            },
            methods: {
                toggleServerModal: function() {
                    this.$emit("parToggleServerModal", !1)
                },
                changeServer: function(t) {
                    this.$store.dispatch("setDemoServer", t),
                    this.$emit("parToggleServerModal", !1)
                }
            }
        },
        $t = Ut,
        Dt = (s("7e11"), Object(u["a"])($t, jt, Pt, !1, null, "393f0892", null)),
        Mt = Dt.exports,
        Rt = function() {
            var t = this,
            e = t.$createElement,
            s = t._self._c || e;
            return s("transition", {
                attrs: {
                    name: "el-fade-in-linear"
                }
            },
            [s("div", {
                staticClass: "off-network"
            },
            [s("img", {
                attrs: {
                    src: t.offLineImg,
                    alt: "off-line"
                }
            }), s("h4", [t._v("当前网络已断开")]), s("p", [t._v("请检查网络设置后刷新")]), s("button", {
                on: {
                    click: t.reload
                }
            },
            [t._v("刷新")])])])
        },
        Nt = [],
        Gt = s("146f"),
        Vt = s.n(Gt),
        Wt = {
            name: "offNetwork",
            data: function() {
                return {
                    offLineImg: Vt.a
                }
            },
            methods: {
                reload: function() {
                    location.reload()
                }
            }
        },
        Bt = Wt,
        Ft = (s("52f0"), Object(u["a"])(Bt, Rt, Nt, !1, null, "396c9142", null)),
        zt = Ft.exports,
        qt = 0,
        Zt = 0,
        Qt = 0,
        Xt = {},
        Yt = {
            components: {
                StartVelocity: lt,
                ShareResult: Et,
                speedtestProgress: nt,
                StartVelocityCircle: H,
                ServerModal: Mt,
                offNetwork: zt
            },
            data: function() {
                return {
                    networkSwitch: navigator.onLine,
                    picker: {
                        data: [[]],
                        anchor: [0]
                    },
                    configuration: {},
                    sendWork: null,
                    anchorIndex: 0,
                    officialWebsite: "http://www.speedtest.cn",
                    stopBtnText: "取消测速",
                    serverModalSwitch: !1,
                    downCanvas: "",
                    downContext: "",
                    uploadCanvas: "",
                    uploadContext: "",
                    resultContainerOpacity: 0,
                    gaugeFinishOpacity: 0,
                    stopVelocitySwitch: !0,
                    startSwitch: !1,
                    worker: null,
                    interval: null,
                    progressType: 0,
                    speedTestUrl: "http://www.speedtest.cn",
                    isAnimation: !0,
                    points: [0, 5, 10, 20, 50, 100, 150, 300, 500],
                    speed: "0.0",
                    transform: "translate(-50%, -48%) rotateZ(45deg)",
                    dashoffset: 404,
                    stroke: "url('#gradient1')",
                    btnText: "开始测速",
                    downloadArr: [],
                    uploadArr: [],
                    setting: {
                        unit: "Mbps",
                        range: 500
                    },
                    testEventData: ""
                }
            },
            computed: {
                velocityFruit: function() {
                    return this.$store.getters.velocityFruit
                },
                gaugeAssemblyOpacity: function() {
                    return this.$store.getters.gaugeAssemblyOpacity
                },
                servers: function() {
                    return this.$store.getters.servers
                },
                listenTestState: function() {
                    return this.$store.getters.testState
                },
                listenDlStatus: function() {
                    return this.$store.getters.dlStatus
                },
                listenUlStatus: function() {
                    return this.$store.getters.ulStatus
                }
            },
            watch: {
                servers: function(t) {
                    this.configuration.serverLists = t,
                    this.pushPickerData()
                },
                startSwitch: function(t) {
                    var e = this;
                    setTimeout(function() {
                        e.resultContainerOpacity = t ? 1 : 0
                    },
                    600)
                },
                gaugeAssemblyOpacity: function(t) {
                    t || (this.progressType = 0)
                },
                velocityFruit: function(t) {
                    var e = this;
                    setTimeout(function() {
                        e.gaugeFinishOpacity = t ? 1 : 0
                    },
                    800),
                    t || (this.downCanvas.height = 150, this.uploadCanvas.height = 150)
                },
                listenTestState: function(t) {
                    var e = this;
                    this.speedToGauge(0),
                    -1 === t ? this.btnText = "开始测速": 1 === t ? this.stroke = "url('#gradient1')": 3 === t ? setTimeout(function() {
                        e.stroke = "url('#gradient2')"
                    },
                    600) : t >= 4 && (this.btnText = "开始测速", setTimeout(function() {
                        return e.speedToGauge(0)
                    },
                    50))
                },
                listenDlStatus: function(t) {
                    this.speedToGauge(t)
                },
                listenUlStatus: function(t) {
                    this.speedToGauge(t)
                }
            },
            methods: {
                colorRgb: function(t, e) {
                    var s = t.toLowerCase(),
                    o = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
                    if (s && o.test(s)) {
                        if (4 === s.length) {
                            for (var r = "#",
                            n = 1; n < 4; n += 1) r += s.slice(n, n + 1).concat(s.slice(n, n + 1));
                            s = r
                        }
                        for (var i = [], a = 1; a < 7; a += 2) i.push(parseInt("0x" + s.slice(a, a + 2)));
                        return "rgba(" + i.join(",") + "," + e + ")"
                    }
                    return s
                },
                listenNetwork: function() {
                    var t = this;
                    window.addEventListener("online",
                    function() {
                        location.reload(),
                        t.networkSwitch = !0
                    }),
                    window.addEventListener("offline",
                    function() {
                        t.networkSwitch = !1,
                        t.startSwitch = !1,
                        t.sendWork && (t.sendWork.terminate(), t.sendWork = null),
                        t.worker && (t.worker.terminate(), t.worker = null)
                    })
                },
                handlePickerConfirm: function(t) {
                    this.servers.length && (this.$store.dispatch("setDemoServer", this.servers[t[0].index]), this.anchorIndex = t[0].index, this.picker.anchor = [this.anchorIndex])
                },
                pushPickerData: function() {
                    this.servers.length && (this.picker.data = this.servers.reduce(function(t, e) {
                        return t[0] = [].concat(Object(w["a"])(t[0]), ["".concat(e.city, "-").concat(e.sponsor)]),
                        t
                    },
                    [[]]))
                },
                showPicker: function() {
                    this.$refs.picker.show()
                },
                resizeUrl: function() {
                    var t = this;
                    this.officialWebsite = document.body.offsetWidth > 768 ? "http://www.speedtest.cn": "https://m.speedtest.cn/",
                    window.onresize = function() {
                        t.officialWebsite = document.body.offsetWidth > 768 ? "http://www.speedtest.cn": "https://m.speedtest.cn/"
                    }
                },
                toggleServerModal: function(t) {
                    this.serverModalSwitch = t
                },
                incrementIconBackground: function(t) {
                    var e = new Map([[0, this.$store.getters.listenSecondLevelConfig.uploadColor], [this.points.length - 1, this.$store.getters.listenSecondLevelConfig.downloadColor]]);
                    return e.get(t)
                },
                goVelocity: function(t) {
                    var e = this;
                    this.$store.state.ipInfo.operator ? this.$store.state.demoServer.sponsor ? (this.stroke = "url('#gradient1')", setTimeout(function() {
                        e.startSwitch = t
                    },
                    600), this.resultContainerOpacity = t ? 1 : 0, this.$store.dispatch("setGaugeAssemblyOpacity", 1), this.$store.dispatch("setVelocityFruit", !1), setTimeout(function() {
                        e.startStop()
                    },
                    1500)) : this.$message("未获得测速节点信息") : this.$message("未获得IP信息")
                },
                startFinishStop: function() {
                    this.$store.dispatch("setGaugeAssemblyOpacity", 1),
                    this.gaugeFinishOpacity = 0,
                    setTimeout(function() {
                        this.$store.dispatch("setVelocityFruit", !1),
                        this.startStop()
                    }.bind(this), 1e3)
                },
                startStop: function() {
                    var t = this;
                    this.$nextTick(function() {
                        t.downCanvas = document.getElementById("downCanvas"),
                        t.downContext = t.downCanvas.getContext("2d"),
                        t.uploadCanvas = document.getElementById("uploadCanvas"),
                        t.uploadContext = t.uploadCanvas.getContext("2d"),
                        t.$store.dispatch("setUploadInit", !0),
                        t.stroke = "url('#gradient1')",
                        t.stopVelocitySwitch = !0,
                        t.isAnimation = !0,
                        Qt = document.querySelector(".base-canvas").width,
                        Zt = document.querySelector(".base-canvas").height,
                        t.worker = new Worker("/vendor/livetool/speed/new_worker.js"),
                        t.pollTime();
                        var e = t,
                        s = 0,
                        o = [{
                            x: 0,
                            y: 0
                        }],
                        r = [{
                            x: 0,
                            y: 0
                        }],
                        n = 0;
                        t.worker.onmessage = function(i) {
                            if (t.testEventData = JSON.parse(i.data), i.data) {
                                var a = JSON.parse(i.data);
                                if (t.progressType = 5, "" === a.ulStatus && "" !== a.dlStatus && 1 === a.testState) {
                                    t.progressType = 1,
                                    o = [].concat(Object(w["a"])(o), [{
                                        x: s,
                                        y: +a.dlStatus
                                    }]);
                                    var c = t.regroupLoadArr(o);
                                    s += 1.05 * Qt / 300,
                                    t.drawCanvas({
                                        req_canvas: e.downCanvas,
                                        req_context: e.downContext,
                                        req_arr: c,
                                        req_color: t.$store.getters.listenSecondLevelConfig.downloadColor
                                    })
                                } else if ("" !== a.ulStatus && 3 === a.testState) {
                                    t.progressType = 2,
                                    n += 1.05 * Qt / 300,
                                    r = [].concat(Object(w["a"])(r), [{
                                        x: n,
                                        y: +a.ulStatus
                                    }]);
                                    var l = t.regroupLoadArr(r);
                                    e.drawCanvas({
                                        req_canvas: e.uploadCanvas,
                                        req_context: e.uploadContext,
                                        req_arr: l,
                                        req_color: t.$store.getters.listenSecondLevelConfig.uploadColor
                                    })
                                }
                                t.$store.dispatch("setTestData", a),
                                +a.testState >= 4 && (t.sendWork.terminate(), t.progressType = +a.testState > 4 ? 0 : +a.testState, t.sendWork = null, t.worker = null)
                            }
                        },
                        t.configuration.xhrIgnoreErrors = 2,
                        console.log("resultConfig is", Xt),
                        t.worker.postMessage("start " + JSON.stringify(Xt))
                    })
                },
                pollTime: function() {
                    this.sendWork = new Worker("/vendor/livetool/speed/send_worker.js"),
                    this.sendWork.postMessage("start"),
                    this.sendWork.onmessage = function(t) {
                        this.sendWork && 1 === +t.data && this.worker.postMessage("status")
                    }.bind(this)
                },
                convertSpeed: function(t) {
                    return t ? "MB/s" === this.setting.unit ? t /= 8 : "KB/s" === this.setting.unit && (t = Math.round(t / 8 * 1024)) : t = "—",
                    t.toLocaleString()
                },
                speedToGauge: function(t) {
                    this.speed = +t,
                    t = this.convertSpeed( + t);
                    for (var e = 33.75,
                    s = 0,
                    o = 1; o < this.points.length; o++) {
                        var r = this.points[o] - this.points[o - 1]; + t >= this.points[o - 1] && +t < this.points[o] ? s += e * (( + t - this.points[o - 1]) / r) : +t > this.points[o - 1] && (s += e)
                    }
                    s = "Safari" === this.$store.state.browserVersion ? parseInt(s + 45) : s + 45,
                    this.dashoffset = "Safari" === this.$store.state.browserVersion ? parseInt(404 - (s - 45) / 270 * 202) : 404 - (s - 45) / 270 * 202,
                    this.transform = "translate(-50%, -48%) rotateZ(" + s + "deg)"
                },
                stopVelocity: function() {
                    this.stroke = "url('#gradient1')",
                    "取消测速" === this.stopBtnText ? (this.reset(), this.progressType = 0) : (this.startStop(), this.stopBtnText = "取消测速")
                },
                reset: function() {
                    var t = this;
                    this.$store.dispatch("resetTestData"),
                    this.downCanvas.height = 150,
                    this.uploadCanvas.height = 150,
                    this.ping = "-",
                    this.isAnimation = !1,
                    this.speed = "-",
                    this.speedToGauge(0),
                    this.stopBtnText = "开始测速",
                    setTimeout(function() {
                        t.downCanvas.height = 150,
                        t.uploadCanvas.height = 150
                    },
                    10),
                    this.worker && this.worker.postMessage("abort")
                },
                getRad: function(t) {
                    return t / 180 * Math.PI
                },
                drawCanvas: function(t) {
                    var e = t.req_arr,
                    s = t.req_color,
                    o = t.req_context,
                    r = t.req_canvas;
                    if (document.querySelector(".base-canvas")) {
                        var n = {},
                        i = {},
                        a = {
                            x: "",
                            y: ""
                        },
                        c = {
                            x: "",
                            y: ""
                        },
                        l = document.querySelector(".base-canvas").height;
                        r.width = document.querySelector(".base-canvas").width;
                        for (var d = 0; d < e.length - 1; d++) {
                            if (d >= e.length - 3) n = e[d],
                            i = e[d + 1];
                            else {
                                if (d % 5 !== 0) continue;
                                d >= e.length - 8 ? (n = e[d], i = e[e.length - 3]) : (n = e[d], i = e[d + 5])
                            }
                            a.x = (n.x + i.x) / 2,
                            a.y = n.y,
                            c.x = (n.x + i.x) / 2,
                            c.y = i.y,
                            o.save(),
                            o.translate(0, l),
                            o.rotate(this.getRad(180)),
                            o.scale( - 1, 1),
                            o.beginPath(),
                            o.moveTo(n.x, n.y),
                            o.bezierCurveTo(a.x, a.y, c.x, c.y, i.x, i.y),
                            o.lineTo(i.x, 0),
                            o.lineTo(n.x, 0),
                            o.lineTo(n.x - 400 / 375 * 5, 0),
                            o.lineTo(n.x - 400 / 375 * 10, 0),
                            o.fillStyle = s,
                            o.strokeStyle = "transparent",
                            o.fill(),
                            o.stroke(),
                            o.closePath(),
                            o.restore()
                        }
                    }
                },
                regroupLoadArr: function(t) {
                    var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 5,
                    s = [];
                    if (t.length > e) for (var o in t) + o === t.length - 1 && +o % e !== 0 && (s = [].concat(Object(w["a"])(s), [t[ + o]])),
                    +o % e || (s = [].concat(Object(w["a"])(s), [t[ + o]]));
                    return s.length ? (qt = 1 === s.length ? s[s.length - 1].y > s[s.length - 2].y ? s[s.length - 1].y: s[s.length - 2].y: s[s.length - 1].y > qt ? s[s.length - 1].y: qt, this.setPointXY(s)) : s
                },
                setPointXY: function(t) {
                    return t.reduce(function(t, e) {
                        return t = [].concat(Object(w["a"])(t), [{
                            x: e.x,
                            y: e.y * (Zt / qt)
                        }]),
                        t
                    },
                    [])
                },
                plusready: function() {
                    function t() {
                        document.addEventListener("pause", e, !1)
                    }
                    function e() {
                        this.reset()
                    }
                    document.addEventListener("plusready", t, !1)
                }
            },
            mounted: function() {
                var t = Object(C["a"])(regeneratorRuntime.mark(function t() {
                    return regeneratorRuntime.wrap(function(t) {
                        while (1) switch (t.prev = t.next) {
                        case 0:
                            return this.$store.dispatch("setSecondLevelConfig"),
                            this.listenNetwork(),
                            this.$store.dispatch("setLocation"),
                            this.$store.dispatch("setIpInfo"),
                            this.$store.dispatch("getDeviceIP"),
                            t.next = 7,
                            this.$store.dispatch("setServers");
                        case 7:
                            Xt = {
                                url_dl: this.$store.state.demoServer.downloadUrl,
                                url_ul: this.$store.state.demoServer.uploadUrl,
                                url_ping: this.$store.state.demoServer.pingUrl,
                                time_auto: !1,
                                time_ulGraceTime: 1.5,
                                overheadCompensationFactor: 1.1,
                                telemetry_extra: JSON.stringify({
                                    server_id: this.$store.state.demoServer.id,
                                    sponsor: this.$store.state.demoServer.sponsor
                                })
                            },
                            this.pushPickerData(),
                            this.resizeUrl(),
                            this.plusready();
                        case 11:
                        case "end":
                            return t.stop()
                        }
                    },
                    t, this)
                }));
                function e() {
                    return t.apply(this, arguments)
                }
                return e
            } ()
        },
        Jt = {
            name: "Speedtest",
            mixins: [Yt]
        },
        Kt = Jt,
        Ht = (s("1c17"), Object(u["a"])(Kt, v, m, !1, null, "50819268", null)),
        te = Ht.exports;
        n["default"].use(g["a"]);
        var ee = new g["a"]({
            routes: [{
                path: "/",
                name: "Speedtest",
                component: te
            }]
        }),
        se = (s("4917"), s("2f62")),
        oe = (s("8e6e"), s("456d"), s("bd86")),
        re = s("bc3a"),
        ne = s.n(re),
        ie = ne.a.create({
            timeout: 2e4
        });
        ie.interceptors.request.use(function(t) {
            return Ie.dispatch("setLoading", !0),
            t
        },
        function(t) {
            return Promise.reject(t)
        }),
        ie.interceptors.response.use(function(t) {
            return Ie.dispatch("setLoading", !1),
            t.data
        },
        function(t) {
            return Ie.dispatch("setLoading", !1),
            "Network Error" === t.message || console.log(t + " " + t.config.url),
            Promise.reject(t)
        });
        var ae = ie,
        ce = (s("a481"), s("d225")),
        le = s("b0b4"),
        de = function() {
            function t() {
                Object(ce["a"])(this, t)
            }
            return Object(le["a"])(t, [{
                key: "getType",
                value: function() {
                    var t = navigator.userAgent,
                    e = t.match(/NetType\/\w+/) ? t.match(/NetType\/\w+/)[0] : "NetType/other";
                    e = e.toLowerCase().replace("nettype/", "");
                    var s = 0;
                    switch (e) {
                    case "wifi":
                        s = 2;
                        break;
                    case "5g":
                        s = 6;
                        break;
                    case "4g":
                        s = 5;
                        break;
                    case "3g":
                    case "3gnet":
                        s = 4;
                        break;
                    case "2g":
                        s = 3;
                        break;
                    default:
                        s = 1
                    }
                    return s
                }
            }]),
            t
        } (),
        pe = de;
        function ue(t, e) {
            var s = Object.keys(t);
            if (Object.getOwnPropertySymbols) {
                var o = Object.getOwnPropertySymbols(t);
                e && (o = o.filter(function(e) {
                    return Object.getOwnPropertyDescriptor(t, e).enumerable
                })),
                s.push.apply(s, o)
            }
            return s
        }
        function he(t) {
            for (var e = 1; e < arguments.length; e++) {
                var s = null != arguments[e] ? arguments[e] : {};
                e % 2 ? ue(s, !0).forEach(function(e) {
                    Object(oe["a"])(t, e, s[e])
                }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(s)) : ue(s).forEach(function(e) {
                    Object.defineProperty(t, e, Object.getOwnPropertyDescriptor(s, e))
                })
            }
            return t
        }
        var fe = function() {
            return ae({
                method: "get",
                url: "https://forge.speedtest.cn/api/location/info"
            })
        },
        ge = function() {
            return ae({
                method: "get",
                url: "https://nodes.speedtest.cn/?https=1"
            })
        },
        ve = function(t, e, s) {
            var o = t.nodes ? [e.id].concat(Object(w["a"])(t.nodes)).splice(0, 5) : [e.id],
            r = {
                nodes: JSON.stringify(o),
                download: t.dlStatus,
                upload: t.ulStatus,
                ping: t.pingStatus,
                loss: t.lossStatus,
                jitter: t.jitterStatus,
                source: "plugin",
                timestamp: parseInt((new Date).getTime() / 1e3),
                app_id: "olkije939903",
                source_id: s,
                network: (new pe).getType()
            },
            n = "";
            for (var i in r) n += "".concat(r[i], "-");
            return n = hex_md5(n.slice(0, n.length - 1) + "52c346e9630f2d5dc5c27f1d3a1ad5d6"),
            r = he({},
            r, {
                sign: n
            }),
            ae({
                method: "post",
                url: "https://forge.speedtest.cn/api/v2/result/store",
                data: r
            })
        },
        me = function(t) {
            return ae({
                method: "get",
                url: "https://forge.speedtest.cn/api/v2/plugin/config?path=".concat(t)
            })
        },
        Ce = 1e3,
        we = !0;
        function ye(t, e) {
            var s = new XMLHttpRequest,
            o = (new Date).getTime();
            if (s.onload = function() {
                if (200 === s.status) {
                    var t = (new Date).getTime() - o;
                    try {
                        var r = performance.getEntries();
                        r = r[r.length - 1];
                        var n = r.responseStart - r.requestStart;
                        n <= 0 && (n = r.duration),
                        n > 0 && n < t && (t = n)
                    } catch(i) {}
                    e(t)
                } else e( - 1)
            }.bind(this), s.onerror = function() {
                e( - 1)
            }.bind(this), s.open("GET", t), we) try {
                s.timeout = Ce,
                s.ontimeout = s.onerror
            } catch(r) {}
            s.send()
        }
        function Se(t) {
            new XMLHttpRequest
        }
        /MSIE.(\d+\.\d+)/i.test(navigator.userAgent) && (we = !1);
        var be = 3,
        xe = 500;
        function ke(t, e) {
            var s = 0;
            t.pingT = -1;
            var o = function() {
                s++!==be ? ye(t.pingUrl,
                function(s) {
                    s >= 0 ? ((s < t.pingT || -1 === t.pingT) && (t.pingT = s), s < xe ? o() : e()) : (Se(t), e())
                }.bind(this)) : e()
            }.bind(this);
            o()
        }
        function _e(t, e) {
            var s = 0,
            o = function() {
                for (var s = null,
                o = 0; o < t.length; o++) - 1 !== t[o].pingT && (null == s || t[o].pingT < s.pingT) && (s = t[o]);
                e(s)
            }.bind(this),
            r = function() {
                s !== t.length ? ke(t[s++], r) : o()
            }.bind(this);
            r()
        }
        var Te = 5;
        function Le(t, e) {
            for (var s = [], o = 0; o < Te; o++) s[o] = [];
            for (o = 0; o < t.length; o++) s[o % Te].push(t[o]);
            var r = 0,
            n = null;
            for (o = 0; o < Te; o++) _e(s[o],
            function(t) {
                null != t && (null == n || t.pingT < n.pingT) && (n = t),
                r++,
                r === Te && e(n)
            }.bind(this))
        }
        function Oe(t) {
            var e = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
            if (e) {
                var s = function(e) {
                    if (! (e in n)) {
                        n[e] = !0;
                        for (var s = Object.keys(n).filter(function(t) {
                            return n[t]
                        }), o = 0; o < s.length; o++) s[o].length > 16 && (s.splice(o, 1), o--);
                        var r = s[0];
                        t && t(r)
                    }
                },
                o = function(t) {
                    t.split("\r\n").forEach(function(t, e, o) {
                        if (~t.indexOf("a=candidate")) {
                            var r = t.split(" "),
                            n = r[4],
                            i = r[7];
                            "host" === i && s(n)
                        } else if (~t.indexOf("c=")) {
                            r = t.split(" "),
                            n = r[2];
                            s(n)
                        }
                    })
                },
                r = new e({
                    iceServers: []
                });
                r.createDataChannel("", {
                    reliable: !1
                }),
                r.onicecandidate = function(t) {
                    t.candidate && o("a=" + t.candidate.candidate)
                },
                r.createOffer(function(t) {
                    o(t.sdp),
                    r.setLocalDescription(t)
                },
                function(t) {
                    console.warn("offer failed", t)
                });
                var n = Object.create(null);
                n["0.0.0.0"] = !1
            } else console.log("请使用主流浏览器：chrome,firefox,opera,safari方可获取ip")
        }
        var Ae = function() {
            function t() {
                Object(ce["a"])(this, t),
                this.userAgent = navigator.userAgent
            }
            return Object(le["a"])(t, [{
                key: "judge",
                value: function() {
                    return this.userAgent.indexOf("Opera") > -1 ? "Opera": this.userAgent.indexOf("Firefox") > -1 ? "FF": this.userAgent.indexOf("Chrome") > -1 ? "Chrome": this.userAgent.indexOf("Safari") > -1 ? "Safari": (this.userAgent.indexOf("compatible") > -1 && this.userAgent.indexOf("MSIE") > -1 && this.userAgent.indexOf("Opera"), "IE")
                }
            }]),
            t
        } ();
        n["default"].use(se["a"]);
        var Ie = new se["a"].Store({
            state: {
                secondLevelConfig: {
                    bgColor: "#ffffff",
                    uploadColor: "#24cae4",
                    downloadColor: "#50e3c2",
                    locationIcon: 0,
                    hybridIcon: 0
                },
                source: "",
                source_id: 0,
                isiOS: !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
                browserVersion: (new Ae).judge(),
                uploadInit: !1,
                gaugeAssemblyOpacity: 0,
                loadingSwitch: !1,
                velocityFruit: !1,
                init: !1,
                ipInfo: {
                    ip: "",
                    operator: ""
                },
                broadband: "",
                deviceIP: "",
                location: {
                    position: {
                        lng: "",
                        lat: ""
                    }
                },
                servers: [],
                server: {
                    sponsor: "Selecting server...",
                    operator: ""
                },
                demoServer: {
                    sponsor: "",
                    operator: "",
                    city: ""
                },
                testData: {
                    testState: -1,
                    dlStatus: "",
                    ulStatus: "",
                    pingStatus: "",
                    jitterStatus: "",
                    lossStatus: "",
                    dlProgress: 0,
                    ulProgress: 0,
                    pingProgress: 0
                },
                speedResult: {
                    share_url: "",
                    rank: 60
                },
                speedtestSettings: {}
            },
            getters: {
                init: function(t) {
                    return t.init
                },
                listenSecondLevelConfig: function(t) {
                    return t.secondLevelConfig
                },
                velocityFruit: function(t) {
                    return t.velocityFruit
                },
                gaugeAssemblyOpacity: function(t) {
                    return t.gaugeAssemblyOpacity
                },
                ipInfo: function(t) {
                    return t.ipInfo
                },
                location: function(t) {
                    return t.location
                },
                deviceIP: function(t) {
                    return t.deviceIP
                },
                servers: function(t) {
                    return t.servers
                },
                testData: function(t) {
                    return t.testData
                },
                server: function(t) {
                    return t.server
                },
                demoServer: function(t) {
                    return t.demoServer
                },
                speedtestSettings: function(t) {
                    return t.speedtestSettings
                },
                speedResult: function(t) {
                    return t.speedResult
                },
                broadband: function(t) {
                    return t.broadband
                },
                testState: function(t) {
                    return t.testData.testState
                },
                dlStatus: function(t) {
                    return t.testData.dlStatus
                },
                ulStatus: function(t) {
                    return t.testData.ulStatus
                },
                dlProgress: function(t) {
                    return (100 * t.testData.dlProgress).toFixed(2)
                },
                ulProgress: function(t) {
                    return (100 * t.testData.ulProgress).toFixed(2)
                },
                isTestDownload: function(t) {
                    return 1 === t.testData.testState
                },
                isTestNotStarted: function(t) {
                    return - 1 === t.testData.testState
                },
                isTestRun: function(t) {
                    return t.testData.testState > -1 && t.testData.testState < 4
                },
                isTestStop: function(t) {
                    return t.testData.testState >= 4
                }
            },
            mutations: {
                SET_SOURCE: function(t, e) {
                    t.source = e
                },
                SET_SOURCEID: function(t, e) {
                    t.source_id = e
                },
                SET_SECONDLEVELCONFIG: function(t, e) {
                    t.secondLevelConfig = e
                },
                SET_GAUGEASSEMBLYOPACITY: function(t, e) {
                    t.gaugeAssemblyOpacity = e
                },
                SET_VELOCITYFRUIT: function(t, e) {
                    t.velocityFruit = e
                },
                SET_UPLOADINIT: function(t, e) {
                    t.uploadInit = e
                },
                SET_LOADING: function(t, e) {
                    t.loadingSwitch = e
                },
                SET_IPINFO: function(t, e) {
                    t.ipInfo = e
                },
                SET_LOCATION: function(t, e) {
                    t.location = e
                },
                SET_SERVERS: function(t, e) {
                    t.servers = e,
                    t.demoServer = e[0]
                },
                SET_DEMOSERVER: function(t, e) {
                    t.demoServer = e
                },
                SET_TEST_DATA: function(t, e) {
                    t.testData = e
                },
                SET_SERVER: function(t, e) {
                    t.server = e,
                    "No servers available" !== e.sponsor && (t.speedtestSettings = {
                        url_dl: e.downloadUrl,
                        url_ul: e.uploadUrl,
                        url_ping: e.pingUrl,
                        time_auto: !1,
                        time_ulGraceTime: 1.5,
                        overheadCompensationFactor: 1.1,
                        telemetry_extra: JSON.stringify({
                            server_id: e.id,
                            sponsor: e.sponsor
                        })
                    },
                    t.init = !0)
                },
                SET_RESULT: function(t, e) {
                    t.speedResult = e
                },
                SET_BROADBAND: function(t, e) {
                    e.dlStatus <= 5 ? t.broadband = "5": e.dlStatus <= 10 ? t.broadband = "10": e.dlStatus <= 20 ? t.broadband = "20": e.dlStatus <= 50 ? t.broadband = "50": e.dlStatus <= 100 ? t.broadband = "100": e.dlStatus <= 200 ? t.broadband = "200": e.dlStatus <= 300 ? t.broadband = "300": e.dlStatus <= 400 ? t.broadband = "400": e.dlStatus <= 500 ? t.broadband = "500": t.broadband = "500+"
                },
                SET_DEVICE_IP: function(t, e) {
                    t.deviceIP = e
                }
            },
            actions: {
                setSecondLevelConfig: function() {
                    var t = Object(C["a"])(regeneratorRuntime.mark(function t(e) {
                        var s, o, r, n, i, a;
                        return regeneratorRuntime.wrap(function(t) {
                            while (1) switch (t.prev = t.next) {
                            case 0:
                                return s = e.commit,
                                o = window.location.href,
                                r = o.split(".")[0],
                                n = r.split("//")[1],
                                "myplugin" === n && (i = o.split("cn/")[1], n = i.split("/")[0]),
                                s("SET_SOURCE", n),
                                t.prev = 6,
                                t.next = 9,
                                me(n);
                            case 9:
                                a = t.sent,
                                console.log("result is", a),
                                !a.code && a.data && a.data.config && (s("SET_SOURCEID", a.data.id), s("SET_SECONDLEVELCONFIG", a.data.config)),
                                t.next = 17;
                                break;
                            case 14:
                                t.prev = 14,
                                t.t0 = t["catch"](6),
                                console.log("e is", t.t0);
                            case 17:
                            case "end":
                                return t.stop()
                            }
                        },
                        t, null, [[6, 14]])
                    }));
                    function e(e) {
                        return t.apply(this, arguments)
                    }
                    return e
                } (),
                setUploadInit: function(t, e) {
                    var s = t.commit;
                    s("SET_UPLOADINIT", e)
                },
                setDemoServer: function(t, e) {
                    var s = t.commit;
                    s("SET_DEMOSERVER", e)
                },
                setGaugeAssemblyOpacity: function(t, e) {
                    var s = t.commit;
                    s("SET_GAUGEASSEMBLYOPACITY", e)
                },
                setVelocityFruit: function(t, e) {
                    var s = t.commit;
                    s("SET_VELOCITYFRUIT", e)
                },
                setLoading: function(t, e) {
                    var s = t.commit;
                    s("SET_LOADING", e)
                },
                telemetry: function(t, e) {
                    var s = t.commit,
                    o = t.state;
                    ve(e, o.demoServer, o.source_id).then(function(t) {
                        s("SET_RESULT", t.data)
                    })
                },
                setLocation: function(t) {
                    var e = t.commit,
                    s = new AMap.Geolocation({
                        enableHighAccuracy: !0,
                        timeout: 1e4
                    });
                    s.getCurrentPosition(function(t, s) {
                        "complete" === t && e("SET_LOCATION", s)
                    })
                },
                setIpInfo: function(t) {
                    var e = t.commit;
                    fe().then(function(t) {
                        e("SET_IPINFO", t)
                    }).
                    catch(function(t) {
                        console.log("err is", t)
                    })
                },
                setServers: function(t) {
                    var e = t.dispatch,
                    o = t.commit;
                    return new Promise(function(t, r) {
                        ge().then(function(s) {
                            o("SET_SERVERS", s.data),
                            e("initServers"),
                            t()
                        }).
                        catch(function(t) {
                            console.log("error is", t),
                            o("SET_SERVERS", s("993a").data),
                            e("initServers"),
                            r(t)
                        })
                    })
                },
                setTestData: function(t, e) {
                    var s = t.dispatch,
                    o = t.commit;
                    o("SET_TEST_DATA", e),
                    e.testState >= 4 && s("telemetry", e)
                },
                resetTestData: function(t) {
                    var e = t.commit;
                    e("SET_TEST_DATA", {
                        testState: -1,
                        dlStatus: "",
                        ulStatus: "",
                        pingStatus: "",
                        jitterStatus: "",
                        dlProgress: 0,
                        ulProgress: 0,
                        pingProgress: 0
                    })
                },
                initServers: function(t) {
                    var e = t.commit,
                    s = t.getters;
                    Le(s.servers,
                    function(t) {
                        e("SET_SERVER", null != t ? t: {
                            sponsor: "No servers available",
                            operator: ""
                        })
                    })
                },
                getDeviceIP: function(t) {
                    var e = t.commit;
                    try {
                        Oe(function(t) {
                            e("SET_DEVICE_IP", t)
                        })
                    } catch(s) {
                        return
                    }
                }
            }
        }),
        Ee = (s("db4d"), s("6245")),
        je = s.n(Ee);
        n["default"].use(je.a),
        n["default"].use(r.a),
        n["default"].config.productionTip = !1,
        new n["default"]({
            router: ee,
            store: Ie,
            render: function(t) {
                return t(f)
            }
        }).$mount("#app")
    },
    "5c0b": function(t, e, s) {
        "use strict";
        var o = s("5e27"),
        r = s.n(o);
        r.a
    },
    "5d79": function(t, e, s) {},
    "5e27": function(t, e, s) {},
    "64bd": function(t, e, s) {
        t.exports = s.p + "img/setting-node5.12e583a9.svg"
    },
    "65ee": function(t, e, s) {
        t.exports = s.p + "img/start-btn-circle.bc92af1b.svg"
    },
    6745 : function(t, e, s) {
        "use strict";
        var o = s("49cc"),
        r = s.n(o);
        r.a
    },
    "7e11": function(t, e, s) {
        "use strict";
        var o = s("90f5"),
        r = s.n(o);
        r.a
    },
    "8b23": function(t, e, s) {
        t.exports = s.p + "img/share-kongjian.83b7853f.svg"
    },
    "90f5": function(t, e, s) {},
    "993a": function(t) {
        t.exports = {
            data: [{
                id: 200002,
                country: "China",
                country_code: "CN",
                city: "宿迁",
                operator: "BGP",
                pingUrl: "https://sp.17b.net:59090/hello",
                downloadUrl: "https://sp.17b.net:59090/download",
                uploadUrl: "https://sp.17b.net:59090/upload",
                https: !0,
                preferred: !1,
                lon: "118.29333",
                lat: "33.94515",
                distance: 323,
                sponsor: "宿迁昊锐云",
                sponsor_url: "http://www.17b.net"
            },
            {
                id: 1861,
                country: "China",
                country_code: "CN",
                city: "新乡",
                operator: "电信",
                pingUrl: "https://hnxxdx.node.speedtest.cn:59090/hello",
                downloadUrl: "https://hnxxdx.node.speedtest.cn:59090/download",
                uploadUrl: "https://hnxxdx.node.speedtest.cn:59090/upload",
                https: !0,
                preferred: !1,
                lon: "113.87806",
                lat: "35.30321",
                distance: 331,
                sponsor: "新乡易阳科技电信",
                sponsor_url: "http://www.idcjf.com/"
            },
            {
                id: 1862,
                country: "China",
                country_code: "CN",
                city: "新乡",
                operator: "移动",
                pingUrl: "https://hnxxyd.node.speedtest.cn:59090/hello",
                downloadUrl: "https://hnxxyd.node.speedtest.cn:59090/download",
                uploadUrl: "https://hnxxyd.node.speedtest.cn:59090/upload",
                https: !0,
                preferred: !1,
                lon: "113.87806",
                lat: "35.30321",
                distance: 331,
                sponsor: "新乡易阳科技移动",
                sponsor_url: "http://www.idcjf.com/"
            },
            {
                id: 153,
                country: "China",
                country_code: "CN",
                city: "合肥",
                operator: "联通",
                pingUrl: "https://112.122.10.26.prod.hosts.ooklaserver.net:8080/hello",
                downloadUrl: "https://112.122.10.26.prod.hosts.ooklaserver.net:8080/download",
                uploadUrl: "https://112.122.10.26.prod.hosts.ooklaserver.net:8080/upload",
                https: !0,
                preferred: !1,
                lon: "117.28330",
                lat: "31.86670",
                distance: 537,
                sponsor: "云测节点-CN",
                sponsor_url: "http://www.speedtest.cn"
            },
            {
                id: 93,
                country: "China",
                country_code: "CN",
                city: "南京",
                operator: "联通",
                pingUrl: "https://speedtest02.js165.com.prod.hosts.ooklaserver.net:8080/hello",
                downloadUrl: "https://speedtest02.js165.com.prod.hosts.ooklaserver.net:8080/download",
                uploadUrl: "https://speedtest02.js165.com.prod.hosts.ooklaserver.net:8080/upload",
                https: !0,
                preferred: !1,
                lon: "118.79680",
                lat: "32.06020",
                distance: 537,
                sponsor: "云测节点-CN",
                sponsor_url: "http://www.speedtest.cn"
            },
            {
                id: 154,
                country: "China",
                country_code: "CN",
                city: "武汉",
                operator: "电信",
                pingUrl: "https://vipspeedtest1.wuhan.net.cn:8080/hello",
                downloadUrl: "https://vipspeedtest1.wuhan.net.cn:8080/download",
                uploadUrl: "https://vipspeedtest1.wuhan.net.cn:8080/upload",
                https: !0,
                preferred: !1,
                lon: "114.28330",
                lat: "30.58330",
                distance: 729,
                sponsor: "云测节点-CN",
                sponsor_url: "http://www.speedtest.cn"
            },
            {
                id: 178,
                country: "China",
                country_code: "CN",
                city: "长春",
                operator: "联通",
                pingUrl: "https://speedtest1.jlinfo.jl.cn.prod.hosts.ooklaserver.net:8080/hello",
                downloadUrl: "https://speedtest1.jlinfo.jl.cn.prod.hosts.ooklaserver.net:8080/download",
                uploadUrl: "https://speedtest1.jlinfo.jl.cn.prod.hosts.ooklaserver.net:8080/upload",
                https: !0,
                preferred: !1,
                lon: "125.32280",
                lat: "43.88000",
                distance: 1059,
                sponsor: "云测节点-CN",
                sponsor_url: "http://www.speedtest.cn"
            },
            {
                id: 165,
                country: "China",
                country_code: "CN",
                city: "兰州",
                operator: "电信",
                pingUrl: "https://speedtest.bajianjun.com.prod.hosts.ooklaserver.net:8080/hello",
                downloadUrl: "https://speedtest.bajianjun.com.prod.hosts.ooklaserver.net:8080/download",
                uploadUrl: "https://speedtest.bajianjun.com.prod.hosts.ooklaserver.net:8080/upload",
                https: !0,
                preferred: !1,
                lon: "103.80000",
                lat: "36.03330",
                distance: 1196,
                sponsor: "云测节点-CN",
                sponsor_url: "http://www.speedtest.cn"
            },
            {
                id: 166,
                country: "China",
                country_code: "CN",
                city: "兰州",
                operator: "联通",
                pingUrl: "https://lanzhouunicom.com.prod.hosts.ooklaserver.net:8080/hello",
                downloadUrl: "https://lanzhouunicom.com.prod.hosts.ooklaserver.net:8080/download",
                uploadUrl: "https://lanzhouunicom.com.prod.hosts.ooklaserver.net:8080/upload",
                https: !0,
                preferred: !1,
                lon: "103.80000",
                lat: "36.03330",
                distance: 1196,
                sponsor: "云测节点-CN",
                sponsor_url: "http://www.speedtest.cn"
            },
            {
                id: 171,
                country: "China",
                country_code: "CN",
                city: "贵阳",
                operator: "移动",
                pingUrl: "https://speedtest1.gz.chinamobile.com.prod.hosts.ooklaserver.net:8080/hello",
                downloadUrl: "https://speedtest1.gz.chinamobile.com.prod.hosts.ooklaserver.net:8080/download",
                uploadUrl: "https://speedtest1.gz.chinamobile.com.prod.hosts.ooklaserver.net:8080/upload",
                https: !0,
                preferred: !1,
                lon: "106.63330",
                lat: "26.65000",
                distance: 1493,
                sponsor: "云测节点-CN",
                sponsor_url: "http://www.speedtest.cn"
            },
            {
                id: 4,
                country: "China",
                country_code: "CN",
                city: "广州",
                operator: "电信",
                pingUrl: "https://gzspeedtest.com.prod.hosts.ooklaserver.net:8080/hello",
                downloadUrl: "https://gzspeedtest.com.prod.hosts.ooklaserver.net:8080/download",
                uploadUrl: "https://gzspeedtest.com.prod.hosts.ooklaserver.net:8080/upload",
                https: !0,
                preferred: !1,
                lon: "113.26670",
                lat: "23.13330",
                distance: 1553,
                sponsor: "云测节点-CN",
                sponsor_url: "http://www.speedtest.cn"
            },
            {
                id: 108,
                country: "China",
                country_code: "CN",
                city: "乌鲁木齐",
                operator: "移动",
                pingUrl: "https://speedtest1.xj.chinamobile.com.prod.hosts.ooklaserver.net:8080/hello",
                downloadUrl: "https://speedtest1.xj.chinamobile.com.prod.hosts.ooklaserver.net:8080/download",
                uploadUrl: "https://speedtest1.xj.chinamobile.com.prod.hosts.ooklaserver.net:8080/upload",
                https: !0,
                preferred: !1,
                lon: "87.60890",
                lat: "43.79580",
                distance: 2612,
                sponsor: "云测节点-CN",
                sponsor_url: "http://www.speedtest.cn"
            },
            {
                id: 110,
                country: "China",
                country_code: "CN",
                city: "和田",
                operator: "移动",
                pingUrl: "https://speedtest2.xj.chinamobile.com.prod.hosts.ooklaserver.net:8080/hello",
                downloadUrl: "https://speedtest2.xj.chinamobile.com.prod.hosts.ooklaserver.net:8080/download",
                uploadUrl: "https://speedtest2.xj.chinamobile.com.prod.hosts.ooklaserver.net:8080/upload",
                https: !0,
                preferred: !1,
                lon: "79.92220",
                lat: "37.11420",
                distance: 3288,
                sponsor: "云测节点-CN",
                sponsor_url: "http://www.speedtest.cn"
            },
            {
                id: 112,
                country: "China",
                country_code: "CN",
                city: "喀什",
                operator: "移动",
                pingUrl: "https://speedtest3.xj.chinamobile.com.prod.hosts.ooklaserver.net:8080/hello",
                downloadUrl: "https://speedtest3.xj.chinamobile.com.prod.hosts.ooklaserver.net:8080/download",
                uploadUrl: "https://speedtest3.xj.chinamobile.com.prod.hosts.ooklaserver.net:8080/upload",
                https: !0,
                preferred: !1,
                lon: "75.99380",
                lat: "39.46770",
                distance: 3583,
                sponsor: "云测节点-CN",
                sponsor_url: "http://www.speedtest.cn"
            },
            {
                id: 130,
                country: "China",
                country_code: "CN",
                city: "伊犁",
                operator: "移动",
                pingUrl: "https://speedtest4.xj.chinamobile.com.prod.hosts.ooklaserver.net:8080/hello",
                downloadUrl: "https://speedtest4.xj.chinamobile.com.prod.hosts.ooklaserver.net:8080/download",
                uploadUrl: "https://speedtest4.xj.chinamobile.com.prod.hosts.ooklaserver.net:8080/upload",
                https: !0,
                preferred: !1,
                lon: "43.91680",
                lat: "81.32410",
                distance: 5702,
                sponsor: "云测节点-CN",
                sponsor_url: "http://www.speedtest.cn"
            }],
            links: {
                first: "https://forge.lezhisoft.cn/api/v1/speedtest/scheduling?page=1",
                last: "https://forge.lezhisoft.cn/api/v1/speedtest/scheduling?page=61",
                prev: null,
                next: "https://forge.lezhisoft.cn/api/v1/speedtest/scheduling?page=2"
            },
            meta: {
                current_page: 1,
                from: 1,
                last_page: 61,
                path: "https://forge.lezhisoft.cn/api/v1/speedtest/scheduling",
                per_page: 15,
                to: 15,
                total: 908
            }
        }
    },
    "9d64": function(t, e) {
        t.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABGdBTUEAALGPC/xhBQAACEBJREFUWAm1WG2MVNUZPufcO7ALy0pSIRQWgQrRsvI5s3yscbsQabERJcQ2Rk2Ktsb+sI1JjU01sSYmtPyyH2paWquJJthWTZM2Fq0GpHb52G9hwqLUDQ1LhILbuOvuOHPvOX2e98wdhqkLXWb3JjP33HPPec9znvd9n/fMKDVJV2s2O6c1+/7Kas2H1Roon9/S27cojka/55xtyo8WamMXq0bnmrNa58vHjac9IQBbOnu2KRfd5wqfztFY3blAxUorp4Nz1YDjRqoC+JXOw/dq677l3Gd1VgXKwSDvVhuA1DZW8UNcpJrrigBu6j749ci6R5Szdc4AkANbYIzgYmkDaDjlic5V1/VVA45zxwXwloMHl+ZDuyOObYMiSwAVgzbeXRGc0mjb8Hcdq657vVpw/zfA7f39NQODZ3ZG1t5INzpFFyrEGd3q2WPMEVzsgtc61ix9diLA0QZj+pLX5s5DX4ts/COt4zoEPQAUmSNI+QAUgcK1Vgf72jOND1/S4Dhfjgmw1bkw1XHgKevcuiCwyIViZgqoYqzRnXQt9mlVeLQ9s3T7ONe/7PDPBXhbX9fckeHRl6zS9SGWx50AIBtaRcKgd7HTeAvmwOAAwG3VWjMCJvQyldY2dx9uyg1/+hq8Xx9oWwRXlBCAU8Ig4pDuFuAmN3Xh7HsmAxyxXQTw1p62NXGUfwaLhzGBgA/EVQmkB8QkITi8t9qlQv3gP2bNGqrc6EQ9lwBu6Wi7Ph/FvwQphtLBS8S3pHEcmsRc4uLg7bZVjT0yeJK+BOA3UJtyOv4VcAV0nRONS/TNCzAxU5DJokiMNtFI5suPTxKuklkR6uGud3fAb3VebAnMu1GEWIZ6kBZJIixiE9oF75TX2e1799YM1kc7rFKrsYXpYsMZjRBB04xGVn+sTGpAhfbvcz/O/+mFDRtyJRSXaIQiwucGNihjJCO9Gz1TbPMic76+ercLi8pc5NrzV8UvQIsWa7Cf2BARxxdUYBpEfJp1cYONgrUn62ofbuk4dA6A3zUNDT/bN3v2sCz0OV/m9ODprVgfcXeBHcaeXyRQBRdKoggjTBiySBBaLyi3p+O4XvoRuRaDKdyUJctkwr3ULvbDW1db67YWTp7au76959et3f0Ly+0lbYMNLkfowa0wgo/UVhoptlm+ZBFmLvvxsZCbyKqWxAjvqZR5DO8ikSHGMPaRVB3O8W30Y6wogKyHjWiGgUmPRMOvrGk/9gucH6eU2wVz5mzMHZYmFndM0JIs3ngEg2QvOU4B+OzlXSfvSIy9unJTd93U6bdjsRPCPjeDOdxgUhI5lnHOZxlT2rQAVZFyzamO42/c2PfvuYldE4bBW5hRnFh0MxiKaUxcRXcCNBdEuRM20c/qUojcDxsPndqYGNu9bN2Zv6zeeCeqzi6URoQuGfOC7j2RxDbnF2OeG0DoSIhhPDwwY+iTT17+aq+bTrvmzRVNR2Esy8DnrpCFPs5k916kyS7Z8K724EQjUT4ibXcuaT/9AIaUrr+mb9qlTHiXtTrvSyPmYoMXYpvthF3/TpgGMfSS027aQL7/pzRIyEpnMt/WSn/kQcAFNIaPz1Yyh2fqI8b6usy2XyTWKIhW3f+l9jN/XHj47Bza4/VGuvlEMCW8GwMR1qzoqOVYjvPFzbApXhGX+7bXWG8X7zK0IwD3gYj96dVbrAsPyiSJNboHE9H2ZY+GOdmDk7bFGIt+nKpjqxdhA68u6BzcRsO83lyxtj/S4W/8oTZxK8F6uwwB71ra9uuRSSYtEjHlAEYA0hiL/YGm5Q+aGv19vDxFtujyMbOPQKGd0GK/Edwxb2pccI9ekx1aKtPxtT+dfg6MQXkYixgvmw+REMW4wxiJR6zFiwrB+AcgeFvjqeI6sGxZW0dTI45O4T2IzfeQKAxLTCBzHE5AZEx6pU/aCZNkZcSm/Vuuo8GDHvRe8NLjXekZKyWIsOpjXtbQ6jRtjPmbpDMjP3juI82rev51Mw4St2HiDQBcB7dA2hOg2DmYtHA3koLdJ5Zk6ncPJAh5d6aGBEmdJ4twTwIM8DHAe0F0Fm3aCUxqF6d6Xtkax7W493yDKXyWKcThfIBzEQ4OgTaDwVXB3n8unnG23FRrd3blaBT/NtFPqTKJu7E8oTHuLpzY2WM+fL+p4Zu0MyaD5YtUtk+s+MIp9PFz2SsX2ycTcOSK4ZHUdbrdkCOwKGHCOIY01dTWlWTrf2LwsiuOY0BzV/YOZPAXRduAzksXQgFtAmVMMx5FEwlO6ai2xtx7ZPnMwWSZSQPYfOSDawuRfaQkS6wWAOXjjcngE44OpWShP0pZ/cB7K+YdT8DxPikAb/nATS2M5p6zJjAiKyiREYSZ4AjMfxQPHAIOAIfcjNpt2bUNveXgJgUgs/78f478XpkAB2AAYhXyDPnMBUD208UhzlJIkKPxzPmbj18/S2SlEuAVJUmlkfLn9Z1HnocrG4BTgEiJFJCJMHsWcWDL6SD19LHV814un1/ZnlCA69t7n4pUeAPdSpbwN4iv42SyyCIzJNRRn6m1Pzi6bN6ZSkCVzxMGcF17748jnbrJi+3F/9skiQJ/DgWh3plNz99TCWSs5wkBuO5Qz3dxWtnCQwFFV+o3WYRrJXMh5JDk3ccy838+FpCx+qsG2NKb3ZjL2+9QdH1FYBKwnEmCWAjK/kV6weN/zuiRsUBcqv+KSl1isLW7e+ZIlNoT4XTKU3fyvw1+k0bG6r+FZtpPOjNzrwhYskZVDOZs+BAOrKEUf7gXxeAj/H30h6704hd5ikkWqeZeFUDIWBsK2IJABb1O178Ets4RTFVuqdjNfwEiNSBW7382KwAAAABJRU5ErkJggg=="
    },
    ac66: function(t, e, s) {
        t.exports = s.p
    },
    af1b: function(t, e, s) {
        "use strict";
        var o = s("bf72"),
        r = s.n(o);
        r.a
    },
    afd7: function(t, e, s) {
        t.exports = s.p + "img/loading.2fcf45de.svg"
    },
    b11a: function(t, e, s) {
        t.exports = s.p + "img/setting-node4.a7c74b95.svg"
    },
    bf72: function(t, e, s) {},
    c04a: function(t, e, s) {
        t.exports = s.p 
    },
    d68c: function(t, e, s) {},
    de2f: function(t, e, s) {},
    e347: function(t, e, s) {
        t.exports = s.p + "img/logo.72529403.svg"
    },
    ee8d: function(t, e, s) {
        t.exports = s.p + "img/setting-user4.33e63703.svg"
    },
    f732: function(t, e, s) {
        t.exports = s.p + "img/setting-user2.62ca6448.svg"
    },
    fa38: function(t, e, s) {
        t.exports = s.p
    },
    ff4c: function(t, e, s) {
        t.exports = s.p + "img/setting-node2.a5f62eac.svg"
    }
});