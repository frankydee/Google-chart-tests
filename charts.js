//const google = window.google;

google.charts.load("current", {
  callback: createChart,
  packages: ["corechart", "line", "table"]
});

//Constants for the series columns and values
var TARGET_X_LABEL_COUNT = 25;
var dataColEnum = {
  TYPE: 0,
  CRACK_LENGTH: 1,
  START_YT: 2,
  END_YT: 3
};

var S_AND_C = { valueColIndex: 1, tooltipColIndex: 2, value: 0 };

var RIGHT_RAIL = [
  { valueColIndex: null, tooltipColIndex: null, value: null }, //0. dummy entry
  { valueColIndex: 3, tooltipColIndex: 4, value: -1 },
  { valueColIndex: 5, tooltipColIndex: 6, value: -2 },
  { valueColIndex: 7, tooltipColIndex: 8, value: -3 },
  { valueColIndex: 9, tooltipColIndex: 10, value: -4 },
  { valueColIndex: 11, tooltipColIndex: 12, value: -5 }
];

var LEFT_RAIL = [
  { valueColIndex: null, tooltipColIndex: null, value: null }, //0. dummy entry
  { valueColIndex: 13, tooltipColIndex: 14, value: 1 },
  { valueColIndex: 15, tooltipColIndex: 16, value: 2 },
  { valueColIndex: 17, tooltipColIndex: 18, value: 3 },
  { valueColIndex: 19, tooltipColIndex: 20, value: 4 },
  { valueColIndex: 21, tooltipColIndex: 22, value: 5 }
];

// eslint-disable-next-line
var testDataV1 = [
  { type: "SC", crackLength: null, startYt: 3333, endYt: 3360 },
  { type: "SC", crackLength: null, startYt: 3600, endYt: 3723 },

  { type: "R", crackLength: 1, startYt: 3256, endYt: 3300 },
  { type: "R", crackLength: 2, startYt: 3345, endYt: 3365 },
  { type: "R", crackLength: 1, startYt: 3451, endYt: 3723 },
  { type: "R", crackLength: 5, startYt: 3724, endYt: 3724 },
  { type: "R", crackLength: 3, startYt: 3726, endYt: 3826 },
  { type: "R", crackLength: 4, startYt: 4001, endYt: 4090 },

  { type: "L", crackLength: 1, startYt: 3256, endYt: 3300 },
  { type: "L", crackLength: 2, startYt: 3345, endYt: 3365 },
  { type: "L", crackLength: 1, startYt: 3451, endYt: 3723 },
  { type: "L", crackLength: 5, startYt: 3724, endYt: 3724 },
  { type: "L", crackLength: 3, startYt: 3726, endYt: 3826 },
  { type: "L", crackLength: 4, startYt: 4001, endYt: 4090 }
];

/* Input Data Table
-------------------
Format of each row:
  [type ,crackLength, startYt, endYt]
  where
    type =  "SC" for S&C or
            "R"  for Right Rail or
            "L"  for Left Rail or
    
    crackLength = [1-5] The RCF crack length (set to null for S&C)
    
    startYt     = Start Mileage in "Yards Total" of the S&C unit (when type="SC")
                  or of a rail segment (when type = "R" or "L") with contiguous 
                  yards of the same crack length
    
    endYt       = Start Mileage in "Yards Total" of the S&C unit (when type="SC")
                  or of a rail segment (when type = "R" or "L") with contiguous 
                  yards of the same crack length
*/
var testDataV2 = [
  ["SC", null, 3333, 3360],
  ["SC", null, 3600, 3723],
  ["R", 1, 3256, 3300],
  ["R", 2, 3345, 3365],
  ["R", 1, 3451, 3723],
  ["R", 5, 3724, 3724],
  ["R", 3, 3726, 3826],
  ["R", 4, 4001, 4090],
  ["L", 1, 3256, 3300],
  ["L", 2, 3345, 3365],
  ["L", 1, 3451, 3723],
  ["L", 5, 3724, 3724],
  ["L", 3, 3726, 3826],
  ["L", 4, 4001, 4090]

  // [ "R", 5, 3724, 3727 ],
  // [ "R", 5, 3728, 3729 ],
];

var startYt = 3233; //1.1474;
var endYt = 4092; // 2.0572;

//var startYt = 3722; //1.1474;
//var endYt = 3730; // 2.0572;

// eslint-disable-next-line
var debugText = "Debug Test goes here";

function createChart() {
  var data = initDataTable();

  populateMileageAxis(data, startYt, endYt);

  //populateDataV1(data, testDataV1, startYt);
  populateDataV2(data, testDataV2, startYt);

  var options = initChartOptions(startYt, endYt);

  var container = document.getElementById("chart_div");

  var chart = new google.visualization.LineChart(container);

  var changeCreatedBySettingTick = false;

  var oldCoords;

  /*
  var observer = new MutationObserver(function() {
    var coords = getCoords();

    debugText = JSON.stringify(coords);
    document.getElementById("debug_text").innerHTML = debugText;

    //Check if the HAxis has changed, if so reset the Ticks
    if (!(oldCoords.x.min == coords.x.min && oldCoords.x.max == coords.x.max)) {
      setHAxisTicks(coords);
    }
  });

  // start observing on 'ready'
  google.visualization.events.addListener(chart, "ready", function() {
    observer.observe(container, {
      childList: true,
      subtree: true
    });
  });
*/
  //document.getElementById("debug_text").innerHTML = debugText;

  drawChart();
  oldCoords = getCoords();

  // Chart Resize on window resize with jQuery
  window.addEventListener(
    "resize",
    function() {
      drawChart();
    },
    false
  );

  function drawChart() {
    chart.draw(data, options);
  }

  // get axis coordinates from chart
  function getCoords() {
    var chartLayout = chart.getChartLayoutInterface();
    var chartBounds = chartLayout.getChartAreaBoundingBox();
    return {
      x: {
        min: chartLayout.getHAxisValue(chartBounds.left),
        max: chartLayout.getHAxisValue(chartBounds.width + chartBounds.left)
      }
    };
  }

  var ticksSettingCounter = 0;

  function setHAxisTicks(coords) {
    ticksSettingCounter++;
    options.hAxis.ticks = {};
    if (coords) {
      var startYt = coords.x.min;
      var endYt = coords.x.max;
      options.hAxis.ticks = buildHAxisTicks(startYt, endYt);
    }
    chart.draw(data, options);
    changeCreatedBySettingTick = true;
  }
}

// eslint-disable-next-line
function myToYt(my) {
  var miles = Math.floor(my);
  var yards = (my - miles) * 10000;
  return Math.round(miles * 1760 + yards);
}

function ytToMy(yt) {
  var wholeMiles = Math.floor(yt / 1760);
  var yardRemainder = yt % 1760;
  var mileYard = wholeMiles + yardRemainder / 10000;
  return mileYard.toFixed(4);
}

function initDataTable() {
  var data = new google.visualization.DataTable();
  //0. The X Axis
  //data.addColumn("string", "Mileage");
  data.addColumn("number", "Mileage");
  //1. The series used to illustrate S&C
  data.addColumn("number", "S&C Unit");
  //2. S&C Tooltip
  data.addColumn({ type: "string", role: "tooltip", p: { html: true } });
  //3. Right 5
  data.addColumn("number", "Right Rail 1mm");
  //4
  data.addColumn({ type: "string", role: "tooltip", p: { html: true } });
  //5
  data.addColumn("number", "Right Rail 2mm");
  //6
  data.addColumn({ type: "string", role: "tooltip", p: { html: true } });
  //7
  data.addColumn("number", "Right Rail 3mm");
  //8
  data.addColumn({ type: "string", role: "tooltip", p: { html: true } });
  //9
  data.addColumn("number", "Right Rail 4mm");
  //10
  data.addColumn({ type: "string", role: "tooltip", p: { html: true } });
  //11
  data.addColumn("number", "Right Rail 5mm");
  //12
  data.addColumn({ type: "string", role: "tooltip", p: { html: true } });
  //13
  data.addColumn("number", "Left Rail 1mm");
  //14
  data.addColumn({ type: "string", role: "tooltip", p: { html: true } });
  //15
  data.addColumn("number", "Left Rail 2mm");
  //16
  data.addColumn({ type: "string", role: "tooltip", p: { html: true } });
  //17
  data.addColumn("number", "Left Rail 3mm");
  //18
  data.addColumn({ type: "string", role: "tooltip", p: { html: true } });
  //19
  data.addColumn("number", "Left Rail 4mm");
  //20
  data.addColumn({ type: "string", role: "tooltip", p: { html: true } });
  //21
  data.addColumn("number", "Left Rail 5mm");
  //22
  data.addColumn({ type: "string", role: "tooltip", p: { html: true } });

  return data;
}

function populateMileageAxis(dataTable, startYt, endYt) {
  var totalRows = endYt - startYt + 1;

  dataTable.addRows(totalRows);
  for (var i = 0; i < totalRows; i++) {
    dataTable.setValue(
      i,
      0, //ytToMy(startYt + i)
      startYt + i
    );
  }
}

/*
  FD 2017-10-19 13h38m:
  This block of code is commented out which means there will be ticks defined
  for each yard. It will make the X Axis crowded but it means the zoom will work OK

function buildHAxisTicks(startYt, endYt) {
  
  var hAxisLabelCount = 0;
  var lengthYt = endYt - startYt + 1;

  lengthYt = endYt - startYt + 1;

  if (lengthYt <= TARGET_X_LABEL_COUNT) {
    hAxisLabelCount = lengthYt;
  } else {
    // TODO: Make this more clever so it's a multiple of the length
    hAxisLabelCount = TARGET_X_LABEL_COUNT;
  }

  //var yardRemainder = startYt % 1760;
  //var firstTickYt = Math.floor(yardRemainder/22)*22 + Math.floor(startYt/1760)
  var firstTickYt = Math.floor(startYt / 22) * 22;

  
  var yardPerTick = Math.floor(lengthYt / hAxisLabelCount);
  //Make it a multiple of 22 so the labels are at the exact chain
  yardPerTick = Math.round(yardPerTick / 22) * 22;
  if (yardPerTick == 0) {
    yardPerTick = 1;
  }
  var hTicks = [];
  for (var yt = firstTickYt; yt < endYt; yt = yt + yardPerTick) {
    hTicks.push({ v: yt, f: ytToMy(yt) });
  }
  return hTicks;
}
*/

function buildHAxisTicks(startYt, endYt) {
  
  var hTicks = [];
  var yardPerTick = 1;
  for (var yt = startYt; yt < endYt; yt = yt + yardPerTick) {
    hTicks.push({ v: yt, f: ytToMy(yt) });
  }
  return hTicks;
}


// eslint-disable-next-line
function populateDataV1(dataTable, baseData, startYt) {
  var value,
    valueColIndex,
    tooltipColIndex,
    tooltip = "";

  baseData.forEach(function(d) {
    switch (d.type) {
      //{"type":'R', "crackLength":1, "startYt": 3256, "endYt": 3300  },
      case "R":
        var o = RIGHT_RAIL[d.crackLength];
        tooltip = "Right Rail " + o.value + "mm";
        break;

      case "L":
        var o = LEFT_RAIL[d.crackLength];
        tooltip = "Left Rail " + o.value + "mm";
        break;

      case "SC":
        var o = S_AND_C;
        tooltip = "S&C Unit";
        break;
    }

    value = o.value;
    valueColIndex = o.valueColIndex;
    tooltipColIndex = o.tooltipColIndex;
    tooltip = tt(tooltip, ytToMy(d.startYt) + "-" + ytToMy(d.endYt + 1));

    for (var i = d.startYt - startYt; i <= d.endYt - startYt + 1; i++) {
      dataTable.setValue(i, valueColIndex, value);
      dataTable.setValue(i, tooltipColIndex, tooltip);
    }
  });
}

function populateDataV2(dataTable, baseData, chartStartYt) {
  var value,
    valueColIndex,
    tooltipColIndex,
    tooltip,
    startYt,
    endYt = "";

  baseData.forEach(function(dataRow) {
    switch (dataRow[dataColEnum.TYPE]) {
      //{"type":'R', "crackLength":1, "startYt": 3256, "endYt": 3300  },
      case "R":
        var o = RIGHT_RAIL[dataRow[dataColEnum.CRACK_LENGTH]];
        tooltip = "Right Rail " + o.value + "mm";
        break;

      case "L":
        var o = LEFT_RAIL[dataRow[dataColEnum.CRACK_LENGTH]];
        tooltip = "Left Rail " + o.value + "mm";
        break;

      case "SC":
        var o = S_AND_C;
        tooltip = "S&C Unit";
        break;
    }

    value = o.value;
    valueColIndex = o.valueColIndex;
    tooltipColIndex = o.tooltipColIndex;
    startYt = dataRow[dataColEnum.START_YT];
    endYt = dataRow[dataColEnum.END_YT];
    tooltip = tt(tooltip, ytToMy(startYt) + "-" + ytToMy(endYt + 1));

    for (var i = startYt - chartStartYt; i <= endYt - chartStartYt + 1; i++) {
      dataTable.setValue(i, valueColIndex, value);
      dataTable.setValue(i, tooltipColIndex, tooltip);
    }
  });
}

function initChartOptions(startYt, endYt) {
  var xTicks = buildHAxisTicks(startYt, endYt);

  return {
    legend: "none",
    colors: ["red"],
    tooltip: { isHtml: true },

    // Allow multiple
    // simultaneous selections.
    //selectionMode: 'multiple',
    // Trigger tooltips
    // on selections.
    // tooltip: {trigger: 'selection'},
    // Group selections
    // by x-value.
    //aggregationTarget: 'category',

    hAxis: {
      title: "Mileage (M.YYYY)",
      titleTextStyle: { bold: true, italic: false },
      slantedText: true,
      slantedTextAngle: 90,
      ticks: xTicks,
      gridlines: { color: "#eaecef", count:20 }
      
      //ignored when we use ticks
      //,format: "####"
      //ignored when we use ticks
      //gridlines: { count: -1 }
    },

    vAxis: {
      title: "Rail - Crack Length mm",
      titleTextStyle: { bold: true, italic: false },

      gridlines: {
        count: 11
      },

      ticks: [
        { v: -5, f: "R-5" },
        { v: -4, f: "R-4" },
        { v: -3, f: "R-3" },
        { v: -2, f: "R-2" },
        { v: -1, f: "R-1" },
        { v: 0, f: "S&C info" },
        { v: 1, f: "L-1" },
        { v: 2, f: "L-2" },
        { v: 3, f: "L-3" },
        { v: 4, f: "L-4" },
        { v: 5, f: "L-5" }
      ]
    },

    lineWidth: 10,
    pointSize: 10,
    pointShape: "square",
    pointsVisible: false,

    //This makes the tooltip appear for all series in a single window
    //    Nice but it makes the X value appear as well and if it's in Yt it doesn't make sense.
    //focusTarget: 'category',

    explorer: {
      actions: ["dragToZoom", "rightClickToReset"],
      axis: "horizontal",
      maxZoomIn: 1 / (endYt - startYt) * 5,
      keepInBounds: true
    },

    series: {
      0: {
        lineWidth: 500,
        //color: "#DCDCDC" // pale grey
        color: "#98999b" 
      }
    }
  };
}

function tt(firstLine, mileageRange) {
  return (
    '<div style="padding:5px 5px 5px 5px;">' +
    "<p>" +
    firstLine +
    "<p>" +
    "<p><b>" +
    mileageRange +
    "</b></p>" +
    "</div>"
  );
}
