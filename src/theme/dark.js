define(function(require, exports, module) {
    var theme = require('../core/theme');
    
    ['dark', 'dark-compact'].forEach(function(name) {
        var compact = name == 'dark-compact';

        /* jscs:disable maximumLineLength */
        theme.register(name, {
            'background': '#393c41',

            'root-color': '#fff',
            'root-background': '#4695fc',
            'root-stroke': '#4695fc',
            'root-font-size': 24,
            'root-padding': compact ? [10, 25] : [15, 25],
            'root-margin': compact ? [15, 25] : [20, 60],
            'root-radius': 5,
            'root-space': 10,
            'root-shadow': 'rgba(0, 0, 0, .25)',

            'main-color': '#333',
            'main-background': '#fff',
            'main-stroke': '#fff',
            'main-font-size': 16,
            'main-padding': compact ? [5, 15] : [6, 20],
            'main-margin': compact ? [5, 10] : 10,
            'main-radius': 5,
            'main-space': 5,
            'main-shadow': 'rgba(0, 0, 0, .25)',

            'sub-color': 'white',
            'sub-background': 'transparent',
            'sub-stroke': 'none',
            'sub-font-size': 12,
            'sub-padding': [5, 10],
            'sub-margin': compact ? [5, 10] : [10, 10],
            'sub-tree-margin': 30,
            'sub-radius': 5,
            'sub-space': 5,

            'connect-color': 'white',
            'connect-width': 2,
            'main-connect-width': 3,
            'connect-radius': 5,

            // 'selected-background': 'none',
            'selected-stroke': 'rgb(254, 219, 0)',
            'selected-stroke-width': 3,
            // 'selected-color': 'black',

            'marquee-background': 'rgba(255,255,255,.3)',
            'marquee-stroke': 'white',

            'drop-hint-color': 'yellow',
            'sub-drop-hint-width': 2,
            'main-drop-hint-width': 4,
            'root-drop-hint-width': 4,

            'order-hint-area-color': 'rgba(0, 255, 0, .5)',
            'order-hint-path-color': '#0f0',
            'order-hint-path-width': 1,

            'text-selection-color': 'rgb(27,171,255)',
            'line-height':1.5
        });
    });
});