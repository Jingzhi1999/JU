// shared helper: embed arbitrary text safely inside an inline <script> as a JS string literal
module.exports = function js(s) { return JSON.stringify(s).split('<').join('\\u003c'); };
