define(function(require, exports, module) {
    var kity = require('../core/kity');
    var utils = require('../core/utils');

    var Minder = require('../core/minder');
    var MinderNode = require('../core/node');
    var Command = require('../core/command');
    var Module = require('../core/module');
    var Renderer = require('../core/render');

    Module.register('ProgressModule', function() {
        var minder = this;

        var PROGRESS_DATA = 'progress';

        // Designed by Akikonata
        var BG_COLOR = '#fff';
        var PIE_COLOR = '#43BC00';
        var SHADOW_PATH = 'M10,3c4.418,0,8,3.582,8,8h1c0-5.523-3.477-10-9-10S1,5.477,1,11h1C2,6.582,5.582,3,10,3z';
        var SHADOW_COLOR = '#8E8E8E';

        // jscs:disable maximumLineLength
        var FRAME_PATH = 'M10,0C4.477,0,0,4.477,0,10c0,5.523,4.477,10,10,10s10-4.477,10-10C20,4.477,15.523,0,10,0zM10,18c-4.418,0-8-3.582-8-8s3.582-8,8-8s8,3.582,8,8S14.418,18,10,18z';

        var FRAME_GRAD = new kity.LinearGradient().pipe(function(g) {
            g.setStartPosition(0, 0);
            g.setEndPosition(0, 1);
            g.addStop(0, PIE_COLOR);
            g.addStop(1, PIE_COLOR);
        });
        var CHECK_PATH = 'M15.812,7.896l-6.75,6.75l-4.5-4.5L6.25,8.459l2.812,2.803l5.062-5.053L15.812,7.896z';
        var CHECK_COLOR = '#EEE';

        var IMAGE_DATA = {
            0: '',
            1: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpGODdGMTE3NDA3MjA2ODExOEY2MkExRjhGQUM5MkEzRiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGN0I3QkIyRTVEOTQxMUU5QTJGODg0QjVBMzg5MzkyMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGN0I3QkIyRDVEOTQxMUU5QTJGODg0QjVBMzg5MzkyMCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Q0JDREFDREY0M0JGMTFFOTkwODJFQ0ZCQjY1OUU1ODYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Q0JDREFDRTA0M0JGMTFFOTkwODJFQ0ZCQjY1OUU1ODYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5+N4+UAAAA7UlEQVR42mJkwAImzpzNA6SigDgAiE2AWBQq9RqIzwDxBiBelp+e+gVdLyMWw5KBVCcQCzPgB2+BuBxo6FysBgINYgNSIMkYBtLAEiBOBhr8C8RhQZIgxzAGJD2xIIIJyZvkGAY3FGoGAyM0Ah4QEWYMRISpAhM0Nik1jAFqRhQTNGlQCwQwQdMZtYAJC1KihYO8tBSidE+aNQddSJSJgcqABZqdRAnYTCx4zQTNm9QCZ5igGZ1aYAPIwGXQRMlAhYS9jAlaBJVTwUBQyfMFubRZTEF+XgI0DFE4QEEytChiIKf4on0BS60qACDAAO22R+pezxWdAAAAAElFTkSuQmCC',
            2: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpGODdGMTE3NDA3MjA2ODExOEY2MkExRjhGQUM5MkEzRiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGN0I3QkIzMjVEOTQxMUU5QTJGODg0QjVBMzg5MzkyMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGN0I3QkIzMTVEOTQxMUU5QTJGODg0QjVBMzg5MzkyMCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Q0JDREFDREY0M0JGMTFFOTkwODJFQ0ZCQjY1OUU1ODYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Q0JDREFDRTA0M0JGMTFFOTkwODJFQ0ZCQjY1OUU1ODYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6PijVHAAACD0lEQVR42qSVS0gbURSGz725mRhNrFERjCAiOJGCmGJBzMaFCILuxIUUwU0VhFIfCF2Xdql21eey+GhFQdCVKzeCooibLFxa6qOoqJE2M4kz3j8wgzUxTsy/SXJz/i/n3v/kDqMMCm4N+jixF8WisC9u6I1xI+HDumAuXTD+WzOSP0wy3x88/3J118vuLlRvD710MT6lFlSK7tJmT8Sv0uLZJn0+Xv2vTtYk5cubX02fJjICZVeK3+Wd9XJ314eafqW1+KldNHGwTJOHy5TeDSOFi23NSERkt3pqF9aXgFV7yjvn6l4rpcJHThRUAlTo8jQc6eez8mM31ri1TXQmYR6nsHpvkJZC47SojinwgpECIgCcGbbpFBYuqqF5dZQqZYfwwAtGKkykiQBun1k2Rfwh+qmO0O0fhxcMsDhGA2k6gXWUhGmm7hUV8fRyMMDimDOMxkPqKWuhr7UD5Gbins5VAktgaCvcT7LCOgPPKCRDYOljawsMsISzRKvIqXgBd1/9SVxQvgIDLAlUdtdje3kDwQCLXyb/fl8429DyBYIBFjfInN6LHybXLqOPhsELBlj2DRPeHddOEzEzV8EDr/XXsxXaGV5oj76L5wJFLTzw2ilbb2LX/3r3tZOVtuhb3cn2UYNaeODN6YK1Bh+jgTQRAM7s2jRG9ps+fst6Y2d7BGDOMBpIEwFkegTcCDAAydRFrNlwhNQAAAAASUVORK5CYII=',
            3: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpGODdGMTE3NDA3MjA2ODExOEY2MkExRjhGQUM5MkEzRiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGN0I5MTlDNzVEOTQxMUU5QTJGODg0QjVBMzg5MzkyMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGN0I5MTlDNjVEOTQxMUU5QTJGODg0QjVBMzg5MzkyMCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Q0JDREFDREY0M0JGMTFFOTkwODJFQ0ZCQjY1OUU1ODYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Q0JDREFDRTA0M0JGMTFFOTkwODJFQ0ZCQjY1OUU1ODYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz78uHhEAAAB+0lEQVR42qSVvy8kYRzGv/Puu+8gayUim1AIBRJXuEMi0QiiIhQqkUsUJxINivsHROtOJUShEKGhECqVRCQuJ6LZiEai8OsQt4udnZ2Z995nY/aQvbVz8yRTzDvP9zPv+z7feUejLKr4ORJipA2GedFnwzEbDCcVwrjQAgmdieNH21h0SC6eN88/vK3V3g5UHowOBzT2vbagnPeXtuitxbW0fveD5q62Mx71XDKNGVLKsbOm2YWsQDUrURwoXClkwZ6ZqiHRFq7PmKbPN+nbxearFwuNk/JaDtFG3E4MqNmaGOeuAbBKvax7tWZMlPIQvSdTWmTZNo+Ikl51u6Kufowzd5mYmYLp+cBcqX2kS/OeS3L6wEgDEQD2DMv0AnspRiwARjpMpIkAXu6ZV8XsBEWCJQIshtZAmuRTnFgQLI4+Q2v41WnymnTGP3E0rZpuTnNjqJq+RDpyehKOScs3u0U8n7e3hz+kr1z6lYoBSKyABR+uU799LxkMsBRQHO3FT3wDwQCLxaynpbW7/aRfIBhgMdXtyyfGhbUTi/43DLVggJU5YT4efU3epuLSq1CDWvfTy6jucHytKzpleIHCixrU/v0Mn4Uj6Cx5s9UZnTTzWT488KIGtZ4OWLfx0RpIEwFgz2zpTPzzgM3nF4A+Q2sgTQSQ7RfwR4ABANqtU61ftGsWAAAAAElFTkSuQmCC',
            4: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpGODdGMTE3NDA3MjA2ODExOEY2MkExRjhGQUM5MkEzRiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGN0I5MTlDQjVEOTQxMUU5QTJGODg0QjVBMzg5MzkyMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGN0I5MTlDQTVEOTQxMUU5QTJGODg0QjVBMzg5MzkyMCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Q0JDREFDREY0M0JGMTFFOTkwODJFQ0ZCQjY1OUU1ODYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Q0JDREFDRTA0M0JGMTFFOTkwODJFQ0ZCQjY1OUU1ODYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4lPylRAAACRElEQVR42mJkwAKkzqTzMDEwxvCxcMX8+PdL/8e/3zwgcVZG5p/sTKw3vv39OfMfw//Fz0xmfkHXy4guIHc2K42ZkalPjUOSJVjYnN2KR41BjJWfweBSGVwNGyPLf6CBv4DMgkfG02ZgNRDoKjZeZs4VnEys3hMUEtjs+bRQLJI+m4HhE6CL/7Mxse78+veHP9C1IAsYWGCSIMPk2EW8Vqjmswmx8DAQA37//8vI+I/RnZuZYyOQ6wkSY4J5E+QyoGHsxBoGA7/+/2H89e+3O9AMsBcYQREADOgX85UzudG9ScjLyIAFGGF//v8VYQLFJigC8BlGDACawwbEsUygpAGKTQYKAcjrXMzs6UygdAZKGtQAP//91mACJVpQOiMEJFgFiIl1diZibV+vXsIgzy6KVw0jA+N/Jg4m1i+vfn8kaCAwjTJs0ihj0OKUwakGmNC/Aw1ku3jsyy2iXCnCwsuwTr2YwZxHBZvrGICOO8/06c+3JWvfnvxJrNeBOYphqWoegwu/Loo4NzP7v09/v89jAmbyJbd+PP9z8NM1omOTk4mNYa5yJkOIsDki2fz78wNILYeXMAYXS3++/f35PyngHxCWPljyX+ZMxj+QGSi2qp8vWOd6reUHKYaC1IL0KJ/L3Y3IMVDw+e/3iEc/32xzvtb0ixjvH/p0ncH5WvPPhz9fb/n+75cnyQUsOxMLw9Nf7xnOfrnHsOzNkR83fjz78/f/vyJgATsbb4mNrwoARsYnYMl0GZgyFgEjcxm2KgAgwACjlkBR3jRkmQAAAABJRU5ErkJggg==',
            5: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpGODdGMTE3NDA3MjA2ODExOEY2MkExRjhGQUM5MkEzRiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGN0I5MTlDRjVEOTQxMUU5QTJGODg0QjVBMzg5MzkyMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGN0I5MTlDRTVEOTQxMUU5QTJGODg0QjVBMzg5MzkyMCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Q0JDREFDREY0M0JGMTFFOTkwODJFQ0ZCQjY1OUU1ODYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Q0JDREFDRTA0M0JGMTFFOTkwODJFQ0ZCQjY1OUU1ODYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7PAm74AAAB3UlEQVR42qyVzytEURTH7z3v12BQSKGkRLKhKGVjYSEsLGwsKCu/NiMLf4A/QGwwLCjExkKhLG2UYoGSHxtZIKEwzPt5r3PUiDGZYd63Xu+9+9773PN959xzOUug4v3+IDDenaNmdpvCrjGFE6RxjSuWAdrpm2eFBZOL1/XhSPy3PH6g9GCoT+EwXhkoUjvzG4zGYCUr1HJZ7dHo5zs6VyUCbbwcvqqbmkkIxKj0bCVjNQO09omyXr0pp/rbRCUHAz+cYMRSB2371TM7MFqagKmxhwQrNQraVitCep4aZKnIkR7ngrdkKYF1vG2lMYjZpMgQZqQKi8mWLreF04KMDwucEoA/+na+fDAr3mYyy1+lYsJc6RUAZZMS8BssFSFHx6MHqDQomyxNkfVMxegHqjMqDT9kCacKqGipzvwQZt0A5qM44xICoEXunCdfgFjoUQTqh7uRc1+AWH7H8Oy+La097Fnpwmh9v3jRWcBFvnRu3rg7zydpASVjJp5WgFqQJ8XI8OWC/ehG/gXDVSIkkyFkRT+yjC1oNiqcza6LSeuvULKK/24DGXOfzYGE/ruurPut5pMxO1X7mFWhgrKF7avTrwYbwsjCv3bsJFuAifbOcAuYRuByoi3gXYABABVzzkbJT3SqAAAAAElFTkSuQmCC',
            6: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpGODdGMTE3NDA3MjA2ODExOEY2MkExRjhGQUM5MkEzRiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGN0JCODkyMTVEOTQxMUU5QTJGODg0QjVBMzg5MzkyMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGN0JCODkyMDVEOTQxMUU5QTJGODg0QjVBMzg5MzkyMCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Q0JDREFDREY0M0JGMTFFOTkwODJFQ0ZCQjY1OUU1ODYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Q0JDREFDRTA0M0JGMTFFOTkwODJFQ0ZCQjY1OUU1ODYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4QzL3rAAACQElEQVR42qxVTWsTURS9785X0sYKtQgqFEGM4kalBcGNy6IuKirookJXpioSsaA/QpB2YbFFcVGLVVdSFNyIIOhCg1BFWusHcVGsFKxpkvl+z3uDCTFN4gR7YJiZ996cd887994RUAdb36QSCGKgQ28bcKS315F+gscNobkWGnPF0B2XoCYXe8fztd+K2oHuzPmzmsDrydgW/cSmA9bBRBI2Gxth3+yVyhpT6IoIPXq89K1n7GZdQorK3KDFp+NoHB3ZPmge6tjz10bbMkNrlFDEykTjaSF0+ila3gD08iSTdVtdR6Z3ps1OPQFR4KtQCCn62rXYI3o9zGNYlsmREZkVlawMTwXCk34fcZQkCDaADvr7nR3n2mtl/ktyNXQyLFBhF7KbbEAzsiggHpOuM8ipwW7Cf4Klt2lWCjnPODXWA670dyMnLefZeoBct0ouCyEaLgopha9mpyIRChAKyeHVJW+lwY4BXPh6G+4uv4hESIluYxzN16/yC2smbenB4KcxmPmZiSyZgnuHK0Fh6v7yS6d6YjW04dTHEXie+xCZjOubvpvgM3zw2V0Knv16X5r44efg2Pw1yBS+tGSIAuCg7iG3IDr4y8PZSXe2mC2RzdmLLZFRlUgFKk1cdsXe5Nv0Q6nU8aJ0sRUylmqgPrOwf7S/0hwY+dA5Tb4/JqdkVDJeq6P2hNrXyWYNNkW3Ua5NLqdGUZFEl87tIjXYW007dvUvgGpziMppF1VA7A+RE0NjPhfaN9iAer+A3wIMAJUl5rgsMhT3AAAAAElFTkSuQmCC',
            7: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpGODdGMTE3NDA3MjA2ODExOEY2MkExRjhGQUM5MkEzRiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGN0JCODkyNTVEOTQxMUU5QTJGODg0QjVBMzg5MzkyMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGN0JCODkyNDVEOTQxMUU5QTJGODg0QjVBMzg5MzkyMCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Q0JDREFDREY0M0JGMTFFOTkwODJFQ0ZCQjY1OUU1ODYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Q0JDREFDRTA0M0JGMTFFOTkwODJFQ0ZCQjY1OUU1ODYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz768fpCAAAB7UlEQVR42qxVTUsbURR9785XEqNCK0IrSEH8wI0VC4KbLqUKdaFLBVeNCn50058hZqFUEVyUonRlaSn0N1QR7KbirgtxKcaYmUzee54rJmiaxmjmwDAzb+add+8799wnRQU830slScjJJjsx6et8n6/DJI870go8cv5cqmBdC/Pp5NX6RflcWT7Qvj/3zpK03BV7Zo8/HfSGkl2i1WkWLw8/lP5xpW1AmMfj0t+BtY8VCRGV22jFd+LkjK68mHZfN/XeWahtf+afTBCxccn5mVX+GKLlBYRd/Mhk7V7LyE7novvETopaEBolpZbDDVbsK17f8BgV0+TIQObVSlZE3hRkXofD4LhOQbIA2OjTrY7ZhvI070v5NmwIVjCqhVhNFqAaWS0Aj4trirg0WE1RJzj1hOWliOuMSyMKBDrsIS5arrMoANU9FsWIiCCFNASFM1ERotBzFCf3F6wUCSGC+01nhexnuKRQLxn7O6NyG+yULxntBwly6yKEED5u28QtSBv9HhuqHksGl2gjzCK4cqVu03mwsBtq9ZYL9KGpOmR/O+5Pj5WaAyOrgnGbrO9QSj9AVY05P9C+Jqo12BRuafbm/6LlqJBigH2bR4PdrNqxbx8B8OYM7NQNB8RuiPwYOUfnKrfKAlQ6Aq4EGAB6ILRp6si9kwAAAABJRU5ErkJggg==',
            8: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpGODdGMTE3NDA3MjA2ODExOEY2MkExRjhGQUM5MkEzRiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGN0JCODkyOTVEOTQxMUU5QTJGODg0QjVBMzg5MzkyMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGN0JCODkyODVEOTQxMUU5QTJGODg0QjVBMzg5MzkyMCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Q0JDREFDREY0M0JGMTFFOTkwODJFQ0ZCQjY1OUU1ODYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Q0JDREFDRTA0M0JGMTFFOTkwODJFQ0ZCQjY1OUU1ODYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4fxzT4AAACI0lEQVR42qxVS2sTURS+98zjTiYxIu3KYClV1CwsSrsSXIcqEhcuXLQgVEkRtOovcOPKbrJQmtqdCx9dSUV04T+wGBHEIoJYcCEovtrJTDJz/Y5MQ2ynYWJ7hnmdufe73znnfmekSLC9LytZEnI8b7oTftQ84kVBnv2WNHxF1ru10K9FQt/7PFr7vXGu3OgYWLpUMSTNFDMF81zfcWc0t18U7D2iWL/eHmNLUwMwwOPVTyN3ZhMBwcreZWQeuGSfrA6eVyfyxX8WKixNbYoEjLVN1vPVsFEGW15AmDGYzBnOwwHVP7Zw8JrabbgijTV1KGUkS1nDeYzXMfYRXxDipNb69PxQJTXYugW6JYOoWUKq/oYgwc41pfGtpUO1z+4Ts0MXxdHs4KaJSSF3GjB8YPQT2I2jojY7V4Kvorx8S9z98kJoHL0YY+CcIJfUJNNe/4BVxI2VBXHhQ038CNd6Ct01VIWwz4aTBjz7XheltzdFffVjalBgHSZUSm01oDMFKauuuCi9JauLSSE1oTqNnQLERvcoQ/brnQKEzt/Qr9CbY21uF4wxGIuV8igW+rYMjDh19yluQdOIP/pfMNQhghCmgeW1N/SBV1cWW1F4qnOTpw3VInPx/bFqud0c2NA0z5hkPOmFKY/FnKdoX2e7NljcqqzNrdgyK4ToI2+X0WDnu3bsuD/m+BcAbU5BToegACcGajhkLf8MvdtcgKRfwB8BBgBO4NcxGjHCuwAAAABJRU5ErkJggg==',
            9: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpGODdGMTE3NDA3MjA2ODExOEY2MkExRjhGQUM5MkEzRiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGN0JERDE3RTVEOTQxMUU5QTJGODg0QjVBMzg5MzkyMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGN0JERDE3RDVEOTQxMUU5QTJGODg0QjVBMzg5MzkyMCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Q0JDREFDREY0M0JGMTFFOTkwODJFQ0ZCQjY1OUU1ODYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Q0JDREFDRTA0M0JGMTFFOTkwODJFQ0ZCQjY1OUU1ODYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz56DCe+AAAByElEQVR42mJkwAKkzqTzAKkoIA4AYhMgFoVKvQbiM0C8AYiXPTOZ+QVdLyMWw5KBVCcQCzPgB2+BuBxo6FysBgINYgNSIMkYBtLAEiBOBhr8C8RhQZIgxzAGJD2xIIIJyZvkGAY3FGoGAyM0Ah4QEWYogJeZg+Hz3x/oYarABI1NkgyLFLFmuG7Qz6DMIY4sDDIjigmaNIgGVrzqDB1yUQz7Pl5hePDzNbp0ABM0nREFQC6ao5zOcPvHC4as+3MZ/v7/h67EhAkp0YIBMyMTgyu/HgMrIwuKSgEWboaFKtkMv/79YYi/M5XhC2r4wYAoE7qIPLsowwKVLIZ5yhkMnExsYDGQ4XOU0hkkWQUZEu5OY3j66x1OXzBBsxMc3PvxkiH/wQIGB35thmWqecDY5GTolI9isORVYygAil/4+gBfqLxmgeZNT2TRNW9PMHz6+41hplIawyHtRgYxVj6GzmcbGTa/P0somM8wQTM6Btj14RJDzO3JDFxAb4MsmPx8BzHxtoFgwuZmYmf4/u8Xwz+G/wxEFBYKTNAiqByXqq//fhJjGAO05PmCXNospiA/LwEahigcoCAZWhQxkFN80b6ApVYVABBgABBillOFM4g3AAAAAElFTkSuQmCC',
        }

        minder.getPaper().addResource(FRAME_GRAD);

        // 进度图标的图形
        var ProgressIcon = kity.createClass('ProgressIcon', {
            base: kity.Group,

            constructor: function(value) {
                this.callBase();
                this.setSize(20);
                this.create(value);
                this.setValue(value);
                this.setId(utils.uuid('node_progress'));
                this.translate(0.5, 0.5);
            },

            setSize: function(size) {
                this.width = this.height = size;
            },

            create: function(value) {

                // var bg, pie, frame, check;

                // bg = new kity.Circle(9)
                //     .fill(BG_COLOR);

                // pie = new kity.Pie(9, 0)
                //     .fill(PIE_COLOR);

                // frame = new kity.Path()
                //     .setTranslate(-10, -10)
                //     .setPathData(FRAME_PATH)
                //     .fill(FRAME_GRAD);

                // check = new kity.Path()
                //     .setTranslate(-10, -10)
                //     .setPathData(CHECK_PATH)
                //     .fill(CHECK_COLOR);
                
                var image = new kity.Image('', 20, 20, -10, -10);
                this.addShape(image);
                this.image = image;
            },

            setValue: function(value) {
                // this.pie.setAngle(360 * (value - 1) / 8);
                // this.check.setVisible(value == 9);
                // this.fg.setVisible(value == 1);
                // this.rect.setVisible(value == 1);
                this.image.setUrl(IMAGE_DATA[value])
            }
        });

        /**
         * @command Progress
         * @description 设置节点的进度信息（添加一个进度小图标）
         * @param {number} value 要设置的进度
         *     取值为 0 移除进度信息；
         *     取值为 1 表示未开始；
         *     取值为 2 表示完成 1/8；
         *     取值为 3 表示完成 2/8；
         *     取值为 4 表示完成 3/8；
         *     其余类推，取值为 9 表示全部完成
         * @state
         *    0: 当前有选中的节点
         *   -1: 当前没有选中的节点
         */
        var ProgressCommand = kity.createClass('ProgressCommand', {
            base: Command,
            execute: function(km, value) {
                var nodes = km.getSelectedNodes();
                for (var i = 0; i < nodes.length; i++) {
                    nodes[i].setData(PROGRESS_DATA, value || null).render();
                }
                km.layout();
            },
            queryValue: function(km) {
                var nodes = km.getSelectedNodes();
                var val;
                for (var i = 0; i < nodes.length; i++) {
                    val = nodes[i].getData(PROGRESS_DATA);
                    if (val) break;
                }
                return val || null;
            },

            queryState: function(km) {
                return km.getSelectedNodes().length ? 0 : -1;
            }
        });

        return {
            'commands': {
                'progress': ProgressCommand
            },
            'renderers': {
                left: kity.createClass('ProgressRenderer', {
                    base: Renderer,

                    create: function(node) {
                        return new ProgressIcon(node.getData(PROGRESS_DATA));
                    },

                    shouldRender: function(node) {
                        return node.getData(PROGRESS_DATA);
                    },

                    update: function(icon, node, box) {
                        var data = node.getData(PROGRESS_DATA);
                        var spaceLeft = node.getStyle('space-left');
                        var x, y;

                        icon.setValue(data);

                        x = box.left - icon.width - spaceLeft;
                        y = -icon.height / 2;
                        icon.setTranslate(x + icon.width / 2, y + icon.height / 2);

                        return new kity.Box(x, y, icon.width, icon.height);
                    }
                })
            }
        };
    });
});