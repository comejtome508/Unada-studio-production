/* ─────────────────────────────────────────────────────────
   house.js — HouseProgress SVG component
   viewBox: 0 0 120 96  |  rendered: 86×69
   ───────────────────────────────────────────────────────── */

var HOUSE = {
  C: {
    forest:  '#0D7A52',
    meadow:  '#A8D4BE',
    paleSun: '#FAECC8',
    deep:    '#0D2B1E',
    off:     '#F7F4EE',
    fg3:     '#6B7A73',
    sun:     '#F2C94C',
    border:  'rgba(13,43,30,0.12)',
  },

  getStage: function(answered) {
    return Math.round((Math.min(answered, 29) / 29) * 12);
  },

  op: function(stage, minStage) {
    return stage >= minStage ? '1' : '0';
  },

  render: function(answered) {
    var s = this.getStage(answered);
    var C = this.C;
    var op = this.op.bind(this, s);
    var isComplete = s >= 12;

    var sunHtml = isComplete
      ? '<circle class="sun-pop-el" cx="100" cy="16" r="10" fill="' + C.sun + '" style="animation:v2SunPop 0.5s ease-out forwards;transform-origin:100px 16px;opacity:0"/>'
      : '';

    return '<svg viewBox="0 0 120 96" width="86" height="69" xmlns="http://www.w3.org/2000/svg" style="overflow:visible;flex-shrink:0">' +
      '<defs>' +
        '<pattern id="fnd-stripe" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">' +
          '<rect width="3" height="6" fill="' + C.meadow + '" opacity="0.7"/>' +
          '<rect x="3" width="3" height="6" fill="' + C.off + '" opacity="0.5"/>' +
        '</pattern>' +
      '</defs>' +

      '<!-- Ghost outline -->' +
      '<g opacity="0.12" fill="none" stroke="' + C.deep + '" stroke-width="1" stroke-dasharray="3,2">' +
        '<polygon points="12,44 60,12 108,44"/>' +
        '<rect x="22" y="44" width="76" height="38"/>' +
        '<rect x="22" y="82" width="76" height="8"/>' +
        '<rect x="47" y="60" width="26" height="22" rx="2"/>' +
        '<rect x="26" y="50" width="18" height="16"/>' +
        '<rect x="76" y="50" width="18" height="16"/>' +
        '<rect x="82" y="16" width="8" height="18"/>' +
        '<circle cx="60" cy="12" r="5"/>' +
      '</g>' +

      '<!-- s1: Ground line -->' +
      '<line x1="8" y1="90" x2="112" y2="90" stroke="' + C.deep + '" stroke-width="1.5" opacity="' + op(1) + '" style="transition:opacity 0.4s"/>' +

      '<!-- s2: Foundation -->' +
      '<rect x="22" y="82" width="76" height="8" fill="url(#fnd-stripe)" stroke="' + C.forest + '" stroke-width="1" rx="1" opacity="' + op(2) + '" style="transition:opacity 0.4s"/>' +

      '<!-- s3: Walls -->' +
      '<rect x="22" y="44" width="76" height="38" fill="' + C.off + '" stroke="' + C.deep + '" stroke-width="1" opacity="' + op(3) + '" style="transition:opacity 0.4s"/>' +
      '<line x1="22" y1="44" x2="60" y2="12" stroke="' + C.deep + '" stroke-width="1.5" opacity="' + op(3) + '" style="transition:opacity 0.4s"/>' +

      '<!-- s4: Right roof slope -->' +
      '<line x1="98" y1="44" x2="60" y2="12" stroke="' + C.deep + '" stroke-width="1.5" opacity="' + op(4) + '" style="transition:opacity 0.4s"/>' +

      '<!-- s5: Roof fill -->' +
      '<polygon points="12,44 60,12 108,44" fill="' + C.meadow + '" stroke="' + C.deep + '" stroke-width="1" opacity="' + op(5) + '" style="transition:opacity 0.4s"/>' +

      '<!-- s6: Door -->' +
      '<rect x="47" y="60" width="26" height="22" fill="' + C.paleSun + '" stroke="' + C.forest + '" stroke-width="1.5" rx="2" opacity="' + op(6) + '" style="transition:opacity 0.4s"/>' +

      '<!-- s7: Door handle -->' +
      '<circle cx="71" cy="71" r="2.5" fill="' + C.forest + '" opacity="' + op(7) + '" style="transition:opacity 0.4s"/>' +

      '<!-- s8: Left window -->' +
      '<rect x="26" y="50" width="18" height="16" fill="' + C.paleSun + '" stroke="' + C.forest + '" stroke-width="1" opacity="' + op(8) + '" style="transition:opacity 0.4s"/>' +
      '<line x1="35" y1="50" x2="35" y2="66" stroke="' + C.forest + '" stroke-width="0.75" opacity="' + op(8) + '" style="transition:opacity 0.4s"/>' +
      '<line x1="26" y1="58" x2="44" y2="58" stroke="' + C.forest + '" stroke-width="0.75" opacity="' + op(8) + '" style="transition:opacity 0.4s"/>' +

      '<!-- s9: Right window -->' +
      '<rect x="76" y="50" width="18" height="16" fill="' + C.paleSun + '" stroke="' + C.forest + '" stroke-width="1" opacity="' + op(9) + '" style="transition:opacity 0.4s"/>' +
      '<line x1="85" y1="50" x2="85" y2="66" stroke="' + C.forest + '" stroke-width="0.75" opacity="' + op(9) + '" style="transition:opacity 0.4s"/>' +
      '<line x1="76" y1="58" x2="94" y2="58" stroke="' + C.forest + '" stroke-width="0.75" opacity="' + op(9) + '" style="transition:opacity 0.4s"/>' +

      '<!-- s10: Apex cap -->' +
      '<circle cx="60" cy="12" r="5" fill="' + C.forest + '" opacity="' + op(10) + '" style="transition:opacity 0.4s"/>' +

      '<!-- s11: Chimney -->' +
      '<rect x="82" y="16" width="8" height="18" fill="' + C.forest + '" rx="1" opacity="' + op(11) + '" style="transition:opacity 0.4s"/>' +

      '<!-- s12: Smoke -->' +
      '<circle cx="83" cy="11" r="5" fill="' + C.fg3 + '" opacity="' + (s >= 12 ? '0.22' : '0') + '" style="transition:opacity 0.4s"/>' +
      '<circle cx="89" cy="8"  r="4" fill="' + C.fg3 + '" opacity="' + (s >= 12 ? '0.16' : '0') + '" style="transition:opacity 0.4s"/>' +

      sunHtml +
    '</svg>';
  }
};
