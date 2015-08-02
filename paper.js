var drawingData;
var firstPointTime;
var lastPointTime;
var totalTime;
var isPlaying = true;

function initFromData(data) {
  drawingData = data;
  firstPointTime = data[0][2];
  lastPointTime = data[data.length - 1][2];
  totalTime = lastPointTime - firstPointTime;
}

var path = new Path({
  strokeColor: 'rgb(213, 129, 174)',
  strokeWidth: '3',
  strokeCap: 'round',
});

var dataPaths = [path];
var pointIndex = 0;

function resetDrawing() {
  pointIndex = 0;
  path = null;
  _.each(dataPaths, function(p) {
    p.remove();
  });
  dataPaths = [];

  removeBrushes();
}

///////////////////////////////////////////////////////////////////////////////
// Initializations

initFromData(window.drawingData2);
Timer.start();

///////////////////////////////////////////////////////////////////////////////
// Main animation loop

// TODO(david): Get variable-width inking working for playback.
function onFrame(event) {
  var currentTime = Timer.getMs() / 1000;
  var timeOffset = currentTime + firstPointTime;

  for (; drawingData[pointIndex] &&
       drawingData[pointIndex][2] < timeOffset; pointIndex++) {
    var datum = drawingData[pointIndex];
    var x = datum[0];
    var y = datum[1];

    // Detect for pen lift (start new path if so)
    if ((x === 0 && y === 0) || !path) {
      path && path.simplify(1.0);
      path = new Path({
        strokeColor: {
          hue: Math.random() * 360,
          saturation: 0.7,
          brightness: 0.8
        },
        strokeWidth: '3',
        strokeCap: 'round',
      });
      dataPaths.push(path);
    } else {
      path.add(new Point(x, y - 200));
    }
  }

  path.smooth();
}

///////////////////////////////////////////////////////////////////////////////
// Brush tool

tool.minDistance = 8;
tool.maxDistance = 40;
var brushPath;
var brushPaths = [];

function onMouseDown(event) {
  brushPath = new Path({
    fillColor: {
      hue: Math.random() * 360,
      saturation: 0.7,
      brightness: 0.7
    }
  });
  brushPath.add(event.point);
  brushPaths.push(brushPath);
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

function removeBrushes() {
  brushPath = null;
  _.each(brushPaths, function(p) {
    p.remove();
  });
  brushPaths = [];
};

///////////////////////////////////////////////////////////////////////////////
// Progress control

var updateProgress = function() {
  var nowSecs = Timer.getMs() / 1000;
  var progress = Math.max(0, Math.min(1.0, nowSecs / totalTime));
  var progressStyle = (progress * 100) + "%";

  $(".elapsed-progress").css("width", progressStyle);
};

setInterval(updateProgress, 20);

$(".progress-control").click(function(e) {
  var $target = $(e.currentTarget);

  var horizontalPadding = ($target.innerWidth() - $target.width()) / 2;
  var relativePosition = (e.pageX - $target.offset().left -
      horizontalPadding) / $target.width();

  var clampedPosition = Math.min(Math.max(relativePosition, 0.0), 1.0);
  var msToSeek = clampedPosition * totalTime * 1000;

  Timer.seekTo(msToSeek);
  resetDrawing();
});

///////////////////////////////////////////////////////////////////////////////
// Event handlers

$('#zoom-in-btn').on('click', function() {
  view.zoom += 0.1;
});

$('#zoom-out-btn').on('click', function() {
  view.zoom = Math.max(0.1, view.zoom - 0.1);
});

$('#play-btn').on('click', function() {
  Timer.resume();
  removeBrushes();
});

$('#pause-btn').on('click', function() {
  Timer.pause();
});

$('#play-pause-btn').on('click', function() {
  if (isPlaying) {  // pause
    Timer.pause();
    isPlaying = false;
    $('#play-pause-btn').html("&#9654; PLAY");
  } else {  // play
    Timer.resume();
    removeBrushes();
    isPlaying = true;
    $('#play-pause-btn').html("&#9616;&#9616; PAUSE");
  }
});

$("#video-canvas").on("mousewheel", function(event) {
  // Detect if user is pinch-to-zoom-ing on trackpad
  if (event.ctrlKey) {
    var zoom = view.zoom * (1 + (event.deltaY * 0.003));
    view.zoom = Math.max(0.1, zoom);
  } else {
    view.scrollBy(new Point(event.deltaX, -event.deltaY) * 0.5);
  }

  event.preventDefault();
  event.stopPropagation();
});

$("#get-data").click(function() {
  $.get("http://toyserver.rileyjshaw.com/scratchpad", function(data) {
    initFromData(data);
    Timer.reset();
    resetDrawing();
  });
});
