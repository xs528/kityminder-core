define(function(require, exports, module) {
    var kity = require('../core/kity');
    var data = require('../core/data');
    var Promise = require('../core/promise');

    var DomURL = window.URL || window.webkitURL || window;

    function loadImage(info, callback) {
        return new Promise(function(resolve, reject) {
            var image = document.createElement("img");
            image.onload = function() {
                resolve({
                    element: this,
                    x: info.x,
                    y: info.y,
                    width: info.width,
                    height: info.height
                });
            };
            image.onerror = function(err) {
                reject(err);
            };

            image.crossOrigin = 'anonymous';
            image.src = info.url;
        });
    }

    /**
     * xhrLoadImage: 通过 xhr 加载保存在 BOS 上的图片
     * @note: BOS 上的 CORS 策略是取 headers 里面的 Origin 字段进行判断
     *        而通过 image 的 src 的方式是无法传递 origin 的，因此需要通过 xhr 进行
     */
    function xhrLoadImage(info, callback) {
        return Promise(function (resolve, reject) {
            var xmlHttp = new XMLHttpRequest();

            xmlHttp.open('GET', info.url + '&_=' + Date.now(), true);
            xmlHttp.responseType = 'blob';
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                    var blob = xmlHttp.response;

                    var image = document.createElement('img');
                    
                    image.src = DomURL.createObjectURL(blob);                    
                    image.onload = function () {
                        DomURL.revokeObjectURL(image.src);
                        resolve({
                            element: image,
                            x: info.x,
                            y: info.y,
                            width: info.width,
                            height: info.height
                        });
                    };
                }
            };

            xmlHttp.send();
        });
    }

    function getSVGInfo(minder) {
        var paper = minder.getPaper(),
            paperTransform,
            domContainer = paper.container,
            svgXml,
            svgContainer,
            svgDom,

            renderContainer = minder.getRenderContainer(),
            renderBox = renderContainer.getRenderBox(),
            width = renderBox.width + 1,
            height = renderBox.height + 1,

            blob, svgUrl, img;

        // 保存原始变换，并且移动到合适的位置
        paperTransform = paper.shapeNode.getAttribute('transform');
        paper.shapeNode.setAttribute('transform', 'translate(0.5, 0.5)');
        renderContainer.translate(-renderBox.x, -renderBox.y);

        // 获取当前的 XML 代码
        svgXml = paper.container.innerHTML;

        // 回复原始变换及位置
        renderContainer.translate(renderBox.x, renderBox.y);
        paper.shapeNode.setAttribute('transform', paperTransform);

        // 过滤内容
        svgContainer = document.createElement('div');
        svgContainer.innerHTML = svgXml;
        svgDom = svgContainer.querySelector('svg');
        svgDom.setAttribute('width', renderBox.width + 1);
        svgDom.setAttribute('height', renderBox.height + 1);
        svgDom.setAttribute('style', 'font-family: Arial, "Microsoft Yahei","Heiti SC";');

        svgContainer = document.createElement('div');
        svgContainer.appendChild(svgDom);

        svgXml = svgContainer.innerHTML;

        // Dummy IE
        svgXml = svgXml.replace(' xmlns="http://www.w3.org/2000/svg" ' +
            'xmlns:NS1="" NS1:ns1:xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:NS2="" NS2:xmlns:ns1=""', '');

        // svg 含有 &nbsp; 符号导出报错 Entity 'nbsp' not defined ,含有控制字符触发Load Image 会触发报错
        svgXml = svgXml.replace(/&nbsp;|[\x00-\x1F\x7F-\x9F]/g, "");

        // fix title issue in safari
        // @ http://stackoverflow.com/questions/30273775/namespace-prefix-ns1-for-href-on-tagelement-is-not-defined-setattributens
        svgXml = svgXml.replace(/NS\d+:title/gi, 'xlink:title');

        blob = new Blob([svgXml], {
            type: 'image/svg+xml'
        });

        svgUrl = DomURL.createObjectURL(blob);

        //svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgXml);

        var imagesInfo = [];

        // 遍历取出图片信息
        traverse(minder.getRoot());

        function traverse(node) {
            var nodeData = node.data;
            
            if (nodeData.image) {
                minder.renderNode(node);
                var nodeData = node.data;
                var imageUrl = nodeData.image;
                var imageSize = nodeData.imageSize;
                var imageRenderBox = node.getRenderBox("ImageRenderer", minder.getRenderContainer());
                var imageInfo = {
                    url: imageUrl,
                    width: imageSize.width,
                    height: imageSize.height,
                    x: -renderContainer.getBoundaryBox().x + imageRenderBox.x,
                    y: -renderContainer.getBoundaryBox().y + imageRenderBox.y
                };

                imagesInfo.push(imageInfo);
            }

            // 若节点折叠，则直接返回
            if (nodeData.expandState === 'collapse') {
                return;
            }

            var children = node.getChildren();
            for (var i = 0; i < children.length; i++) {
                traverse(children[i]);
            }
        }

        return {
            width: width,
            height: height,
            dataUrl: svgUrl,
            xml: svgXml,
            imagesInfo: imagesInfo
        };
    }


    function encode(json, minder, option) {

        var resultCallback;

        /* 绘制 PNG 的画布及上下文 */
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');

        /* 尝试获取背景图片 URL 或背景颜色 */
        var bgDeclare = minder.getStyle('background').toString();
        var bgUrl = /url\(\"(.+)\"\)/.exec(bgDeclare);
        var bgColor = kity.Color.parse(bgDeclare);

        /* 获取 SVG 文件内容 */
        var svgInfo = getSVGInfo(minder);
        var width = option && option.width && option.width > svgInfo.width ? option.width : svgInfo.width;
        var height = option && option.height && option.height > svgInfo.height ? option.height : svgInfo.height;
        var offsetX = option && option.width && option.width > svgInfo.width ? (option.width - svgInfo.width)/2 : 0;
        var offsetY = option && option.height && option.height > svgInfo.height ? (option.height - svgInfo.height)/2 : 0;
        var svgDataUrl = svgInfo.dataUrl;
        var imagesInfo = svgInfo.imagesInfo;

        /* 画布的填充大小 */
        var padding = 20;

        canvas.width = width + padding * 2;
        canvas.height = height + padding * 2;

        function fillBackground(ctx, style) {
            ctx.save();
            ctx.fillStyle = style;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }

        function drawImage(ctx, image, x, y, width, height) {
            if (width && height) {
                ctx.drawImage(image, x + padding, y + padding, width, height);
            } else {
                ctx.drawImage(image, x + padding, y + padding);
            }
        }

        function generateDataUrl(canvas) {
            return canvas.toDataURL('image/png');
        }

        // 加载节点上的图片
        function loadImages(imagesInfo) {
            var imagePromises = imagesInfo.map(function(imageInfo) {
                return xhrLoadImage(imageInfo);
            });

            return Promise.all(imagePromises);
        }
        function drawWatermark() {
            var imgUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIMAAAAwCAYAAAAyw8m9AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ1IDc5LjE2MzQ5OSwgMjAxOC8wOC8xMy0xNjo0MDoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QjhBNkExNzM2MzEyMTFFOUExQjJCQkZDRTAwRTEyNTkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QjhBNkExNzQ2MzEyMTFFOUExQjJCQkZDRTAwRTEyNTkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCOEE2QTE3MTYzMTIxMUU5QTFCMkJCRkNFMDBFMTI1OSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCOEE2QTE3MjYzMTIxMUU5QTFCMkJCRkNFMDBFMTI1OSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PpT31FUAABbDSURBVHja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';

            var info = {
                url: imgUrl,
            }
            return loadImage(info)
        }

        function drawSVG() {
            var svgData = {url: svgDataUrl};

            return loadImage(svgData).then(function($image) {
                drawImage(ctx, $image.element, offsetX, offsetY, $image.width, $image.height);
                return loadImages(imagesInfo);
            }).then(function($images) {
                for(var i = 0; i < $images.length; i++) {
                    drawImage(ctx, $images[i].element, $images[i].x + offsetX, $images[i].y + offsetY, $images[i].width, $images[i].height);
                }
                // 非 vip 加水印
                return drawWatermark()
            }, function(err) {
                // 这里处理 reject，出错基本上是因为跨域，
                // 出错后依然导出，只不过没有图片。
                alert('脑图的节点中包含跨域图片，导出的 png 中节点图片不显示，你可以替换掉这些跨域的图片并重试。');
                DomURL.revokeObjectURL(svgDataUrl);
                // 非 vip 加水印
                if (window.bridge && !window.bridge.isVip()) {
                    drawWatermark();
                }
                document.body.appendChild(canvas);
                var pngBase64 = generateDataUrl(canvas);
                document.body.removeChild(canvas);
                return pngBase64;
            }).then(function($image) {
                // 非 vip 加水印
                if (window.bridge && !window.bridge.isVip()) {
                    drawImage(ctx, $image.element, canvas.width - 140 - padding, -10);
                }

                DomURL.revokeObjectURL(svgDataUrl);
                document.body.appendChild(canvas);
                var pngBase64 = generateDataUrl(canvas);
                
                document.body.removeChild(canvas);
                return pngBase64;
            });
        }

        if (bgUrl) {
            var bgInfo = {url: bgUrl[1]};
            return loadImage(bgInfo).then(function($image) {
                fillBackground(ctx, ctx.createPattern($image.element, "repeat"));
                return drawSVG();
            });
        } else {
            fillBackground(ctx, bgColor.toString());
            return drawSVG();
        }
    }
    data.registerProtocol("png", module.exports = {
        fileDescription: "PNG 图片",
        fileExtension: ".png",
        mineType: "image/png",
        dataType: "base64",
        encode: encode
    });
});
