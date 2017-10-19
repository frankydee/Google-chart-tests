const google = window.google;
google.charts.load('current', {
    callback: function () {
      var chart1;
      var chart2;
  
      var data1 = new google.visualization.DataTable();
      var data2 = new google.visualization.DataTable();
  
      var container1 = document.getElementById('mcs-chart');
      var container2 = document.getElementById('snr-chart');
  
      var options1 = {title:'Wot',
        height:300,
        displayAnnotations: false,
        displayZoomButtons: false,
        chartArea: { width:'95%',height:'90%'},
        lineWidth: 1.5,
        legend: { position: 'none' },
        crosshair: {
          trigger: 'both',
          orientation: 'vertical'
        },
        explorer: {
            actions: ['dragToZoom', 'rightClickToReset'],
            axis: 'horizontal',
            keepInBounds: true,
            maxZoomIn: 10.0
        },
      };
  
      var options2 = {
        displayZoomButtons: false,
        displayRangeSelector: false,
        title:'rsi typ',
        chartArea: { width:'95%',height:'90%'},
        height:100,
        lineWidth: 1.5,
        colors: ['red'],
        legend: { position: 'none' },
        crosshair: {
          trigger: 'both',
          orientation: 'vertical'
        },
        explorer: {
            actions: ['dragToZoom', 'rightClickToReset'],
            axis: 'horizontal',
            keepInBounds: true,
            maxZoomIn: 10.0
        },
      };
  
      prepareChartOne(data1);
      prepareChartTwo(data2);
      // FD: I think this is to synchronise the "selection" (highlighted point) and it doesn't work.
      /*
      google.visualization.events.addListener(chart1, 'onmouseover', function(selection) {
        chart1.setSelection(selection);
        chart2.setSelection([{ row: selection.row, column: null }]);
      });
      */
  
      // sync chart2
      //FD:OK
      var observer = new MutationObserver(function () {
        setRange(getCoords());
      });
  
      // start observing on 'ready'
      google.visualization.events.addListener(chart1, 'ready', function() {
        observer.observe(container1, {
          childList: true,
          subtree: true
        });
      });
  
      /*
      google.visualization.events.addListener(chart2, 'onmouseover', function(selection) {
        chart2.setSelection(selection);
        chart1.setSelection([{ row: selection.row, column: null }]);
      });
      */
  
      drawCharts();
      
      window.addEventListener('resize', drawCharts, false);
      
      function drawCharts() {
        chart1.draw(data1, options1);
        chart2.draw(data2, options2);
      }
  
      function prepareChartOne(data) {
        data.addColumn('date', 'Date');
        data.addColumn('number', 'Sessions');
        data.addColumn({type: 'string', role: 'style'});
        data.addColumn({type:'string', role:'annotation'});
  
        var sessions = [786, 450, 866, 814, 192, 466, 984, 780, 922, 458, 786, 758, 701, 831, 901, 557, 114, 393, 689, 658, 103, 837, 164, 727, 593, 193, 945, 583, 948, 338];
        var start = new Date(1458345600 * 1000);
        for(var i = 0; i < sessions.length; i++) {
          var newDate = start.setDate(start.getDate() + 1);
          if(i == 10){
              data.addRow([new Date(newDate), sessions[i],'point { size: 6; shape-type: circle; fill-color: green;','Buy']);
  
          }else{
            data.addRow([new Date(newDate), sessions[i],null,null]);
          }
  
        }
  
        chart1 = new google.visualization.LineChart(container1);
      }
  
      function prepareChartTwo(data) {
        data.addColumn('date', 'Date');
        data.addColumn('number', 'Other Sessions');
  
        var rsi = [100, 450, 200, 333, 192, 466, 984, 77, 922, 458, 200, 758, 701, 831, 901, 557, 114, 393, 500, 658, 103, 837, 300, 727, 593, 193, 945, 583, 948, 338];
  
        var start = new Date(1458345600 * 1000);
  
        for(var i = 0; i < rsi.length; i++) {
          var newDate = start.setDate(start.getDate() + 1);
          data.addRow([new Date(newDate), rsi[i]]);
        }
  
        chart2 = new google.visualization.LineChart(container2);
      }
  
      // get axis coordinates from chart1
      //FD:OK
      function getCoords() {
        var chartLayout = chart1.getChartLayoutInterface();
        var chartBounds = chartLayout.getChartAreaBoundingBox();
        return {
          x: {
            min: chartLayout.getHAxisValue(chartBounds.left),
            max: chartLayout.getHAxisValue(chartBounds.width + chartBounds.left)
          },
          y: {
            min: chartLayout.getVAxisValue(chartBounds.top),
            max: chartLayout.getVAxisValue(chartBounds.height + chartBounds.top)
          }
        };
      }
  
      // set axis coordinates on chart2
      //FD:OK
      function setRange(coords) {
        options2.hAxis = {};
        options2.vAxis = {};
        options2.hAxis.viewWindow = {};
        options2.vAxis.viewWindow = {};
        if (coords) {
          options2.hAxis.viewWindow.min = coords.x.min;
          options2.hAxis.viewWindow.max = coords.x.max;
          options2.vAxis.viewWindow.min = coords.y.min;
          options2.vAxis.viewWindow.max = coords.y.max;
        }
        chart2.draw(data2, options2);
      }
    },
    packages: ['corechart','annotatedtimeline']
  })