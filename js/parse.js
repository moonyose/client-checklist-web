/* Turn typed or dictated free text into checklist tasks.
 * "Birth certificate, tax transcripts and police clearance by November 15; employment letter in 2 weeks"
 * -> library matches with due dates; anything unrecognized becomes a custom task. */
(function (global) {
  'use strict';
  var MONTHS = { jan: 0, january: 0, enero: 0, feb: 1, february: 1, febrero: 1, mar: 2, march: 2, marzo: 2, apr: 3, april: 3, abril: 3,
    may: 4, mayo: 4, jun: 5, june: 5, junio: 5, jul: 6, july: 6, julio: 6, aug: 7, august: 7, agosto: 7, sep: 8, sept: 8, september: 8,
    septiembre: 8, setiembre: 8, oct: 9, october: 9, octubre: 9, nov: 10, november: 10, noviembre: 10, dec: 11, december: 11, diciembre: 11 };
  var WEEKDAYS = { sunday: 0, domingo: 0, monday: 1, lunes: 1, tuesday: 2, martes: 2, wednesday: 3, miercoles: 3, thursday: 4, jueves: 4, friday: 5, viernes: 5, saturday: 6, sabado: 6 };

  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }

  // Returns {due: 'YYYY-MM-DD'|null, rest: string}
  function extractDate(seg, ref) {
    var CC = global.CC, n = norm(seg), m, d = null;
    var lead = '(?:\\b(?:by|before|due|on|until|para el|para|antes del|antes de|el)\\s+)?';
    var monthRe = Object.keys(MONTHS).sort(function (a, b) { return b.length - a.length; }).join('|');
    var patterns = [
      [new RegExp(lead + '(\\d{4})-(\\d{1,2})-(\\d{1,2})'), function (m) { return new Date(+m[1], +m[2] - 1, +m[3]); }],
      [new RegExp(lead + '\\b(' + monthRe + ')\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s*(\\d{4}))?'), function (m) { return mk(m[3], MONTHS[m[1]], +m[2]); }],
      [new RegExp(lead + '\\b(\\d{1,2})\\s+(?:de\\s+)?(' + monthRe + ')(?:\\s+(?:de\\s+)?(\\d{4}))?'), function (m) { return mk(m[3], MONTHS[m[2]], +m[1]); }],
      [new RegExp(lead + '\\b(\\d{1,2})/(\\d{1,2})(?:/(\\d{2,4}))?\\b'), function (m) { return mk(m[3], +m[1] - 1, +m[2]); }],
      [/\b(?:in|en)\s+(\d+|one|two|three|four|un|una|dos|tres|cuatro)\s+(days?|weeks?|dias?|semanas?)\b/, function (m) {
        var num = { one: 1, two: 2, three: 3, four: 4, un: 1, una: 1, dos: 2, tres: 3, cuatro: 4 }[m[1]] || +m[1];
        return CC.addDays(ref, /^(week|semana)/.test(m[2]) ? num * 7 : num); }],
      [/\b(?:by\s+|for\s+)?(?:next week|la proxima semana|la semana que viene)\b/, function () { return CC.addDays(ref, 7); }],
      [/\b(?:by\s+)?(?:tomorrow|manana)\b/, function () { return CC.addDays(ref, 1); }],
      [new RegExp(lead + '(?:next\\s+|este\\s+|el proximo\\s+)?\\b(' + Object.keys(WEEKDAYS).join('|') + ')\\b'), function (m) {
        var diff = (WEEKDAYS[m[1]] - ref.getDay() + 7) % 7 || 7; return CC.addDays(ref, diff); }]
    ];
    function mk(y, mo, day) {
      var yr = y ? (+y < 100 ? 2000 + +y : +y) : ref.getFullYear();
      var dt = new Date(yr, mo, day);
      if (!y && dt < ref) dt = new Date(yr + 1, mo, day); // "Nov 15" means the next one
      return dt;
    }
    for (var i = 0; i < patterns.length; i++) {
      m = patterns[i][0].exec(n);
      if (m) { d = patterns[i][1](m); return { due: d && !isNaN(d) ? CC.ymd(d) : null, rest: (seg.slice(0, m.index) + ' ' + seg.slice(m.index + m[0].length)).trim() }; }
    }
    return { due: null, rest: seg };
  }

  function matchLibrary(text) {
    var lib = global.CC_LIBRARY, n = ' ' + norm(text) + ' ', best = null, bestLen = 0;
    lib.ITEMS.forEach(function (it) {
      it.keywords.concat([it.title.en, it.title.es]).forEach(function (k) {
        var kk = norm(k);
        if (kk.length > bestLen && n.indexOf(kk) >= 0) { best = it.id; bestLen = kk.length; }
      });
    });
    return best;
  }

  function cleanTitle(s) {
    s = s.replace(/^\s*(?:[-*•\d.)]+\s*)?/, '').replace(/^(?:and|y|also|tambien|she|he|they|client|el cliente|la cliente)\b\s*/i, '')
         .replace(/^(?:needs? to|needs?|has to|must|should|necesita|tiene que|debe)\s+/i, '').replace(/[\s,.;:]+$/, '').trim();
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  }

  function parse(text, ref) {
    ref = ref || global.CC.today();
    var out = [];
    // Groups = lines / sentences / semicolons. A single date inside a group applies to the whole group
    // ("birth certificate, tax transcripts and police clearance by Nov 15").
    String(text || '').split(/\n|;|\.\s/).forEach(function (group) {
      var segs = group.split(/,|\s+(?:and|y|also|plus)\s+/i).map(function (s) { return s.trim(); }).filter(Boolean);
      var items = [];
      segs.forEach(function (seg) {
        var dx = extractDate(seg, ref), rest = dx.rest, libId = matchLibrary(rest), title = cleanTitle(rest);
        if (!title && !libId) { if (dx.due && items.length) { var last = items[items.length - 1]; last.due = last.due || dx.due; last._explicit = true; } return; }
        items.push({ libId: libId, title: title, due: dx.due, src: seg.trim(), _explicit: !!dx.due });
      });
      var dated = items.filter(function (o) { return o._explicit; });
      if (dated.length === 1) items.forEach(function (o) { o.due = o.due || dated[0].due; });
      items.forEach(function (o) { delete o._explicit; out.push(o); });
    });
    return out;
  }

  global.CC_PARSE = { parse: parse, extractDate: extractDate, matchLibrary: matchLibrary };
})(window);
