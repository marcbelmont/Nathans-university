
function compile(e) {
  var res = compileT(0, e);
  return res;
}

function compileT(time, e) {
  if (e.tag == 'note')
    return [noteObject(e, time)];
  if (e.tag == 'rest')
    return [{tag: 'note', pitch: "", start: time, dur: e.dur}];
  if (e.tag == 'repeat') {
    var notes = [];
    for (var i = 0; i < e.count; i++)
      notes = notes.concat(compileT(time + endTime(0, e.section) * i,
				    e.section));
    return notes;
  }
  var a = [];
  if (e.tag == 'seq')
    return a.concat(compileT(time, e.left),
                    compileT(endTime(time, e.left), e.right));
  return a.concat(compileT(time, e.left),
                    compileT(time, e.right));
}

/////////////
// Helpers //
/////////////

function noteObject(e, time) {
  return {tag: 'note', pitch: noteToMidi(e.pitch), start: time, dur: e.dur};
}

function noteToMidi(note) {
  if (typeof 'note' === 'number') return note;
  var letterPitch = {c:0, d:2, e:4, f:5, g:7, a:10, b:11};
  var octave = Number(note.charAt(1));
  return 12 + 12 * octave + letterPitch[note.charAt(0)];
}

function endTime(start, e) {
  if (e.tag == 'note' || e.tag == 'rest') return start + e.dur;
  if (e.tag == 'repeat') return start + endTime(0, e.section) * e.count
  if (e.tag == 'par') {
    var l = endTime(start, e.left);
    var r = endTime(start, e.right);
    return l > r ? l : r;
  }
  return (endTime(start, e.left) +
          endTime(start, e.right));
}

///////////
// Songs //
///////////

var melody_mus =
    { tag: 'seq',
      left:
       { tag: 'seq',
         left: { tag: 'note', pitch: 'a4', dur: 250 },
         right: { tag: 'note', pitch: 'b4', dur: 250 } },
      right:
       { tag: 'seq',
         left: { tag: 'note', pitch: 'c4', dur: 500 },
         right: { tag: 'note', pitch: 'd4', dur: 500 } } };
var melody_rest =
  { tag: 'seq',
    left: { tag: 'rest', dur: 100 },
    right: { tag: 'note', pitch: 'd4', dur: 500 } };
var melody_repeat =
  { tag: 'repeat',
    section: { tag: 'note', pitch: 'c4', dur: 250 },
    count: 3 };
var melody_repeat2 =
  { tag: 'repeat',
    section: { tag: 'seq',
               left: { tag: 'note', pitch: 'c4', dur: 500 },
               right: { tag: 'note', pitch: 'd4', dur: 500 } },
    count: 3 };

(function(m) {
  console.log(m);
  console.log(compile(m));
})(melody_repeat2);

