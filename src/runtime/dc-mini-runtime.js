/* dc-mini-runtime — renders `.dc.html` Design Component artboards (the <x-dc> template subset:
   {{holes}}, <sc-if>, <sc-for>, on* handlers, refs) on top of Preact so the same artboard files
   run inside the standalone review canvas. Not the official runtime; it implements the documented subset. */
(function (global) {
  'use strict';
  var P = global.preact;
  var h = P.h, Fragment = P.Fragment, Component = P.Component, render = P.render;
  var SVG_ATTR = { viewbox: 'viewBox', preserveaspectratio: 'preserveAspectRatio', gradientunits: 'gradientUnits', gradienttransform: 'gradientTransform', patternunits: 'patternUnits', patterntransform: 'patternTransform', clippathunits: 'clipPathUnits', maskunits: 'maskUnits', maskcontentunits: 'maskContentUnits', stddeviation: 'stdDeviation', filterunits: 'filterUnits', primitiveunits: 'primitiveUnits', markerwidth: 'markerWidth', markerheight: 'markerHeight', markerunits: 'markerUnits', refx: 'refX', refy: 'refY', textlength: 'textLength', lengthadjust: 'lengthAdjust', spreadmethod: 'spreadMethod', startoffset: 'startOffset', basefrequency: 'baseFrequency', numoctaves: 'numOctaves', surfacescale: 'surfaceScale', specularexponent: 'specularExponent', specularconstant: 'specularConstant', diffuseconstant: 'diffuseConstant', tablevalues: 'tableValues', attributename: 'attributeName', attributetype: 'attributeType', repeatcount: 'repeatCount', keytimes: 'keyTimes', keysplines: 'keySplines', calcmode: 'calcMode', pointsatx: 'pointsAtX', pointsaty: 'pointsAtY', pointsatz: 'pointsAtZ', limitingconeangle: 'limitingConeAngle', edgemode: 'edgeMode', kernelmatrix: 'kernelMatrix', kernelunitlength: 'kernelUnitLength', targetx: 'targetX', targety: 'targetY', xchannelselector: 'xChannelSelector', ychannelselector: 'yChannelSelector', stitchtiles: 'stitchTiles', zoomandpan: 'zoomAndPan', glyphref: 'glyphRef', viewtarget: 'viewTarget' };
  var SVG_TAG = { lineargradient: 'linearGradient', radialgradient: 'radialGradient', clippath: 'clipPath', foreignobject: 'foreignObject', feblend: 'feBlend', fecolormatrix: 'feColorMatrix', fecomponenttransfer: 'feComponentTransfer', fecomposite: 'feComposite', feconvolvematrix: 'feConvolveMatrix', fediffuselighting: 'feDiffuseLighting', fedisplacementmap: 'feDisplacementMap', fedistantlight: 'feDistantLight', fedropshadow: 'feDropShadow', feflood: 'feFlood', fefunca: 'feFuncA', fefuncb: 'feFuncB', fefuncg: 'feFuncG', fefuncr: 'feFuncR', fegaussianblur: 'feGaussianBlur', feimage: 'feImage', femerge: 'feMerge', femergenode: 'feMergeNode', femorphology: 'feMorphology', feoffset: 'feOffset', fepointlight: 'fePointLight', fespecularlighting: 'feSpecularLighting', fespotlight: 'feSpotLight', fetile: 'feTile', feturbulence: 'feTurbulence', textpath: 'textPath' };
  var HOLE = /\{\{\s*([^{}]+?)\s*\}\}/g;
  var ONLY_HOLE = /^\s*\{\{\s*([^{}]+?)\s*\}\}\s*$/;

  function lookup(scope, path) {
    path = String(path).trim();
    if (path === 'true') return true; if (path === 'false') return false; if (path === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return +path;
    if (/^'[^']*'$/.test(path) || /^"[^"]*"$/.test(path)) return path.slice(1, -1);
    var parts = path.split('.'); var cur = scope;
    for (var i = 0; i < parts.length; i++) { if (cur == null) return undefined; cur = cur[parts[i]]; }
    return cur;
  }
  function textParts(s) {
    var parts = [], last = 0, m; HOLE.lastIndex = 0;
    while ((m = HOLE.exec(s))) { if (m.index > last) parts.push({ s: s.slice(last, m.index) }); parts.push({ p: m[1] }); last = m.index + m[0].length; }
    if (last < s.length) parts.push({ s: s.slice(last) });
    return parts;
  }
  var nid = 0;
  function compileNodes(nodes, svg) {
    var out = [];
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.nodeType === 3) { var t = n.nodeValue; if (!t) continue; if (t.indexOf('{{') < 0) { out.push({ k: 't', s: t }); } else { out.push({ k: 'tx', parts: textParts(t) }); } continue; }
      if (n.nodeType !== 1) continue;
      var tag = n.tagName.toLowerCase(); var id = ++nid;
      if (tag === 'sc-if') { out.push({ k: 'if', id: id, cond: (n.getAttribute('value') || '').replace(/^\s*\{\{|\}\}\s*$/g, '').trim(), ch: compileNodes(n.childNodes, svg) }); continue; }
      if (tag === 'sc-for') { out.push({ k: 'for', id: id, list: (n.getAttribute('list') || '').replace(/^\s*\{\{|\}\}\s*$/g, '').trim(), as: n.getAttribute('as') || 'item', ch: compileNodes(n.childNodes, svg) }); continue; }
      if (tag === 'helmet' || tag === 'dc-import') continue;
      var isSvg = svg || tag === 'svg';
      var attrs = [];
      for (var a = 0; a < n.attributes.length; a++) {
        var at = n.attributes[a]; var name = at.name, val = at.value;
        if (name.indexOf('hint-') === 0) continue;
        if (isSvg && SVG_ATTR[name]) name = SVG_ATTR[name];
        var mm = ONLY_HOLE.exec(val);
        if (mm) attrs.push({ n: name, h: mm[1] }); else if (val.indexOf('{{') >= 0) attrs.push({ n: name, parts: textParts(val) }); else attrs.push({ n: name, s: val });
      }
      out.push({ k: 'el', id: id, tag: isSvg && SVG_TAG[tag] ? SVG_TAG[tag] : tag, attrs: attrs, ch: compileNodes(n.childNodes, isSvg) });
    }
    return out;
  }
  function str(v) { return v == null ? '' : (typeof v === 'object' ? JSON.stringify(v) : String(v)); }
  function renderNodes(nodes, scope, keyp, out) {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.k === 't') { out.push(n.s); continue; }
      if (n.k === 'tx') { var s = ''; for (var j = 0; j < n.parts.length; j++) { var p = n.parts[j]; s += p.s != null ? p.s : str(lookup(scope, p.p)); } out.push(s); continue; }
      if (n.k === 'if') { if (lookup(scope, n.cond)) { var kids = []; renderNodes(n.ch, scope, keyp + '.' + n.id, kids); out.push(h(Fragment, { key: keyp + '.' + n.id }, kids)); } continue; }
      if (n.k === 'for') {
        var list = lookup(scope, n.list) || []; var items = [];
        for (var x = 0; x < list.length; x++) { var sc = Object.create(scope); sc[n.as] = list[x]; sc.$index = x; var kk = []; renderNodes(n.ch, sc, keyp + '.' + n.id + '[' + x + ']', kk); items.push(h(Fragment, { key: keyp + '.' + n.id + '[' + x + ']' }, kk)); }
        out.push(h(Fragment, { key: keyp + '.' + n.id }, items)); continue;
      }
      var props = { key: keyp + '.' + n.id };
      for (var a = 0; a < n.attrs.length; a++) {
        var at = n.attrs[a]; var v;
        if (at.s != null) v = at.s; else if (at.h != null) v = lookup(scope, at.h); else { v = ''; for (var q = 0; q < at.parts.length; q++) { var pp = at.parts[q]; v += pp.s != null ? pp.s : str(lookup(scope, pp.p)); } }
        if (v === undefined || v === null || v === false) { if (at.h != null) continue; }
        props[at.n] = v;
      }
      var ch = []; renderNodes(n.ch, scope, keyp + '.' + n.id, ch);
      out.push(h(n.tag, props, ch));
    }
    return out;
  }

  function DCLogic(props) { Component.call(this, props); this.state = this.state || {}; }
  DCLogic.prototype = Object.create(Component.prototype); DCLogic.prototype.constructor = DCLogic;
  DCLogic.prototype.renderVals = function () { return {}; };
  DCLogic.prototype.render = function () { var vals = this.renderVals() || {}; var out = []; renderNodes(this.__tpl__, vals, 'r', out); return h(Fragment, null, out); };

  function parseDc(src) {
    var doc = new DOMParser().parseFromString(src, 'text/html');
    var xdc = doc.querySelector('x-dc'); if (!xdc) throw new Error('no <x-dc>');
    var helmet = xdc.querySelector('helmet'); var css = '', links = [];
    if (helmet) { helmet.querySelectorAll('style').forEach(function (s) { css += s.textContent + '\n'; }); helmet.querySelectorAll('link[rel="stylesheet"]').forEach(function (l) { links.push(l.getAttribute('href')); }); helmet.remove(); }
    var script = doc.querySelector('script[type="text/x-dc"]'); var propsDecl = {};
    try { propsDecl = JSON.parse(script.getAttribute('data-props') || '{}'); } catch (e) { propsDecl = {}; }
    var defaults = {}; Object.keys(propsDecl).forEach(function (k) { if (k[0] !== '$' && propsDecl[k] && 'default' in propsDecl[k]) defaults[k] = propsDecl[k].default; });
    var preview = propsDecl.$preview || { width: 390, height: 844 };
    var title = (doc.querySelector('title') || {}).textContent || '';
    return { title: title, css: css, links: links, tpl: compileNodes(xdc.childNodes, false), code: script.textContent, defaults: defaults, preview: preview };
  }
  var fontLinks = {};
  function hoistLinks(links) { links.forEach(function (href) { if (fontLinks[href]) return; fontLinks[href] = 1; var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l); }); }
  function hoistFontFaces(css) { var faces = css.match(/@font-face\s*\{[^}]*\}/g); if (!faces) return css; var st = document.createElement('style'); st.textContent = faces.join('\n'); document.head.appendChild(st); return css; }

  function mount(host, src, extraProps, opts) {
    opts = opts || {};
    var parsed = parseDc(src);
    hoistLinks(parsed.links); hoistFontFaces(parsed.css);
    var factory = new Function('DCLogic', 'preact', parsed.code + '\n;return Component;');
    var Comp = factory(DCLogic, P);
    Comp.prototype.__tpl__ = parsed.tpl;
    var root = host; var style;
    if (opts.shadow !== false && host.attachShadow) { var sh = host.shadowRoot || host.attachShadow({ mode: 'open' }); sh.innerHTML = ''; style = document.createElement('style'); style.textContent = parsed.css; sh.appendChild(style); root = document.createElement('div'); root.className = 'dc-root'; sh.appendChild(root); }
    else { style = document.createElement('style'); style.textContent = parsed.css; host.appendChild(style); root = document.createElement('div'); root.className = 'dc-root'; host.appendChild(root); }
    var inst = null; var props = Object.assign({}, parsed.defaults, extraProps || {}, { ref: function (r) { inst = r; } });
    render(h(Comp, props), root);
    return { get instance() { return inst; }, parsed: parsed, root: root, unmount: function () { render(null, root); } };
  }
  global.DCMini = { parseDc: parseDc, mount: mount, DCLogic: DCLogic, compileNodes: compileNodes };
})(typeof window !== 'undefined' ? window : this);
