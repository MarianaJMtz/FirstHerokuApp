function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  /* data route */
   var url = "/metadata/" + sample;
   d3.json(url).then(function(response) {
     
     var datameta = response;

    // Use d3 to select the panel with id of `#sample-metadata`
     var sampleInfo  = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
     sampleInfo.html("");
    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
     var i;
     for (i = 0; i < Object.keys(datameta).length -2; i++) {
       sampleInfo.append("li").text(Object.keys(datameta)[i] + ": " + Object.values(datameta)[i])
     };
    // BONUS: Build the Gauge Chart
     var washingFreq = datameta.WFREQ
     console.log(washingFreq)

    // buildGauge(data.WFREQ);
     var degrees = 180 - (washingFreq * 20),
          radius = 0.5;
     var radians = degrees * Math.PI/180;
     var x = radius * Math.cos(radians);
     var y = radius * Math.sin(radians);

     //Path to create triangles
     var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
         pathX = String(x),
         space= ' ',
         pathY = String(y),
         pathEnd = ' Z';
     var path = mainPath.concat(pathX,space,pathY,pathEnd);

     var datagauge = [{ type: 'scatter',
         x: [0], y: [0],
         marker: {size: 28, color:'850000'},
         showlegend: false,
         name: 'Washing Frequency',
         text: washingFreq,
         hoverinfo: 'text+name'},
       { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
      rotation: 90,
      text:['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      textinfo: 'text',
      textposition: 'inside',
      marker: {colors:['rgba(79, 110, 53, .5)', 'rgba(67, 126, 82, .5)',
                         'rgba(82, 143, 141, .5)', 'rgba(99, 119, 159, .5)',
                         'rgba(141, 118, 176, .5)', 'rgba(193, 139, 187, .5)',
                         'rgba(209, 161, 170, .5)','rgba(226, 206, 184, .5)',
                         'rgba(234, 242, 209, .5)','rgba(255, 255, 255, 0)']},
      labels: ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', ''],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
     }];

     var layout= {
       shapes:[{
         type: 'path',
         path: path,
         fillcolor: '850000',
         line:{
           color: '850000'
         }
       }],
       title:'<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
       //height: 1000,
       //width: 1000,
       xaxis: {zeroline: false, showticklabels: false,
       showgrid: false, range: [-1,1]},
       yaxis: {zeroline: false, showticklabels:false, 
       range: [-1,1]}
     };

     Plotly.newPlot('gauge', datagauge, layout);

   });
};
function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
   var url = "/samples/" + sample;
   d3.json(url).then(function(response2) {

     var dataSample = response2;

     var otuIds = dataSample.otu_ids;
     var sampleValues = dataSample.sample_values;
     var otuLabels = dataSample.otu_labels;


    // @TODO: Build a Bubble Chart using the sample data
     var trace = {
       x: otuIds,
       y: sampleValues,
       text: otuLabels,
       mode: 'markers',
       marker: {
         color: otuIds,
         size: sampleValues
         
       }
     };

     var data = [trace];

     var layout = {
       showlegend: false,
       xaxis: {
         title:"OTU ID"
       }
     };

     Plotly.newPlot('bubble', data, layout);

    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
     var dataArray = [];
    
     var j;
     for (j = 0; j < dataSample.otu_ids.length; j++) {
       dataArray.push({
         otu_ids:dataSample.otu_ids[j],
         otu_labels:dataSample.otu_labels[j], 
         sample_values:dataSample.sample_values[j]
         })
     };
     
     var orderedData = dataArray.sort(function(a, b) {
       return b.sample_values - a.sample_values;
       });

     var topTen = orderedData.slice(0, 10);

     var topTenOtuIds = topTen.map(item => item.otu_ids);
     var topTenSampleValues = topTen.map(item => item.sample_values);
     var topTenLabels = topTen.map(item => item.otu_labels);

     //Let's make the PIE graph ... pie, pie, pie, PIEEEEEEEE
    
     var datag = [{
       values: topTenSampleValues,
       labels: topTenOtuIds,
       text: topTenLabels,
       textinfo: 'percent',
       type: "pie"
     }];

     var layout = {

     };

     Plotly.newPlot("pie",datag,layout);

   });
};

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();

