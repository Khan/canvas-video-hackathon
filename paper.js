var drawingData = window.drawingData2;

var path = new Path({
  strokeColor: 'rgb(213, 129, 174)',
  strokeWidth: '3',
  strokeCap: 'round',
});

var pointIndex = 0;
var firstPointTime = drawingData[0][2];

///////////////////////////////////////////////////////////////////////////////
// Main animation loop

// TODO(david): Get variable-width inking working for playback.
function onFrame(event) {
  var currentTime = event.time;
  var timeOffset = currentTime + firstPointTime;

  for (; drawingData[pointIndex] &&
       drawingData[pointIndex][2] < timeOffset; pointIndex++) {
    var datum = drawingData[pointIndex];
    var x = datum[0];
    var y = datum[1];

    // Detect for pen lift (start new path if so)
    if (x === 0 && y === 0) {
      path = new Path({
        strokeColor: {
          hue: Math.random() * 360,
          saturation: 0.6,
          brightness: 0.6
        },
        strokeWidth: '3',
        strokeCap: 'round',
      });
    } else {
      path.add(new Point(x, y - 200));
    }
  }

  path.smooth();
  path.strokeColor.hue += 0.5;
}

///////////////////////////////////////////////////////////////////////////////
// Brush tool

tool.minDistance = 8;
tool.maxDistance = 40;
var brushPath;

function onMouseDown(event) {
  brushPath = new Path({
    fillColor: {
      hue: Math.random() * 360,
      saturation: 0.7,
      brightness: 0.7
    }
  });
  brushPath.add(event.point);
}

function onMouseDrag(event) {
  var step = event.delta;
  step.angle += 90;
  step.length = (1 / step.length) * 15;

  var top = event.middlePoint + step;
  var bottom = event.middlePoint - step;

  brushPath.add(top);
  brushPath.insert(0, bottom);
  brushPath.smooth();
}

function onMouseUp(event) {
  brushPath.add(event.point);
  brushPath.closed = true;
  brushPath.smooth();
}

///////////////////////////////////////////////////////////////////////////////
// Event handlers

$('#zoom-in-btn').on('click', function() {
  view.zoom += 0.1;
});

$('#zoom-out-btn').on('click', function() {
  view.zoom = Math.max(0.1, view.zoom - 0.1);
});

$('#play-btn').on('click', function() {
  view.play();
});

$('#pause-btn').on('click', function() {
  view.pause();
});
