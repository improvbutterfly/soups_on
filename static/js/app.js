// Load json file
const dataPromise = d3.json("./static/data/soup_data.json");
//console.log(dataPromise)

// Select the form
let form = d3.select("#filter-charts");
form.on("click", rebuildPlot);


// Set up the base content

function init() {

	dataPromise.then(function(data) {
		//console.log(data);

	    let recipeID = data.index;
		let recipeData = data.data;
	    //console.log(recipeData);
/*
	    d3.select("select").selectAll("option")
	    .data(recipeID)
	    .enter()
	    .append("option")
	    .attr("value", function(d){
	    	return d;
	    })
	    .html(function(d){
	    	return d;
	    });
*/

	    // set default ID to first ID in data
	   	//let defaultID = names[0];
		//console.log(defaultID);

		// update the metadata
		//loadMetadata(defaultID);

		// Plot the data for the first ID
		buildPlot();

		// Bonus load gauge chart
		//gaugeChart(defaultID);

	});

};
/*
// function to build the graph
function loadMetadata(ID){
	console.log(ID);
	dataPromise.then(function(data) {
		  console.log(data);

	    var filteredMetadata = data.metadata.filter(md => md.id === parseInt(ID));
	    var metadata = filteredMetadata[0];

	    console.log(metadata);

	    // create string with metadata
	    var mdString = "";
    	for (key in metadata) {
    		mdString = mdString.concat(`<strong>${key}:</strong> ${metadata[key]}<br />\n`);
	    	console.log(`${key}: ${metadata[key]}`)
		};
		console.log(mdString);

	    // Update contents of metadata area
	    d3.select("#sample-metadata")
	    .html(mdString);

  	});
};
*/
function rebuildPlot(){
	d3.event.preventDefault();

	buildPlot();
};

// function to build the graph
function buildPlot(){
	//console.log(ID);
	let scatterX = d3.select("#scatter-x").property("value");
	let scatterY = d3.select("#scatter-y").property("value");
	let sort1 = d3.select("#sort1").property("value");
	let sort2 = d3.select("#sort2").property("value");
	let minVoters = parseInt(d3.select("#input-min-voters").property("value"));
	let maxVoters = parseInt(d3.select("#input-max-voters").property("value"));
	console.log(scatterX);
	console.log(scatterY);
	console.log(sort1);
	console.log(sort2);

	if (sort1 == ""){
		sort1 = "voters";
	};

	console.log(typeof minVoters);
	console.log(minVoters);
	console.log(maxVoters);

	if (isNaN(minVoters)){
		minVoters=0;
	};
	if (isNaN(maxVoters)){
		maxVoters=714;
	};

	dataPromise.then(function(data) {
		let recipeData = data.data;
	    //console.log(recipeData);
		console.log(recipeData[9].minutes);

	    let filteredData = recipeData.filter(d => d.voters >= minVoters && d.voters <= maxVoters);
		let sortedData;
		if (sort2 != ""){
			sortedData = filteredData.sort((a,b) => {
				if (b[sort1] === a[sort1]){
					return b[sort2] - a[sort2];
				}
				return b[sort1] > a[sort1] ? 1 : -1;
			});
		}
		else {
			sortedData = filteredData.sort((a,b) => b[sort1] - a[sort1]);
		}
		console.log(sortedData);

	    console.log(filteredData);

		// Put all data into variables
		let dataToChart = {
			xValues: [],
			yValues: [],
			recipeNames: [],
			rating: [],
			voters: [],
			minutes: [],
			n_steps: [],
			n_ingredients: []
		};

		for (let i = 0; i < sortedData.length -1; i++){
			dataToChart.xValues.push(sortedData[i][scatterX]);
			dataToChart.yValues.push(sortedData[i][scatterY]);
			dataToChart.recipeNames.push(sortedData[i].name);
			dataToChart.rating.push(sortedData[i].rating);
			dataToChart.voters.push(sortedData[i].voters);
			dataToChart.minutes.push(sortedData[i].minutes);
			dataToChart.n_steps.push(sortedData[i].n_steps);
			dataToChart.n_ingredients.push(sortedData[i].n_ingredients);
		};
		console.log(dataToChart);
		//console.log(dataToChart.yValues);


		//Plot the scatter chart

		let trace2 = {
			x: dataToChart.xValues,
			y: dataToChart.yValues,
			text: dataToChart.recipeNames,
			mode: "markers",
			type: "scatter",
		};
		let scatterData = [trace2];

		let scatterLayout = {
			title: scatterX.concat(" vs. ", scatterY),
			height: 400,
			width: 600,
			xaxis: {
				title: scatterX
			},
			yaxis: {
				title: scatterY
			}
		};

		console.log("Displaying scatter chart");
		Plotly.newPlot("scatter", scatterData, scatterLayout);

		// create top ten
		let topTen = {recipeValues: [],
						labels: [],
						"names": [],
						sortedOn: sort1
					}
		console.log(topTen);
		for (let i = 0; i < 10; i++){
			topTen.recipeValues.push(dataToChart[sort1][i]);
			topTen.labels.push(dataToChart.recipeNames[i]);
			topTen.names.push(dataToChart.recipeNames[i]);			
		};
		console.log(topTen);

		// Plot bar chart
		let trace1 = {
//			x: topTen.labels,
//			y: topTen.recipeValues,
			x: topTen.recipeValues,
			y: topTen.labels,
			text: topTen.names,
			type: "bar",
			orientation: "h"
		}

		let barData = [trace1];

		let barLayout = {
			title: `Top Ten Recipes by ${sort1}`,
			yaxis:{
				automargin: true,
				autorange: "reversed"
			},
			xaxis: {
				title: sort1
			}
		};

		console.log("Displaying bar chart");
		Plotly.newPlot("bar", barData, barLayout, {responsive: true});
/*
		// Plot the bubble chart

		var trace2 = {
			x: otu_ids,
			y: sampleValues,
			text: otu_labels,
			mode: "markers",
			type: "scatter",
			marker: {
				size: sampleValues,
				color: otu_ids,
				colorscale: "Picnic"
			}
		};

		var bubbleData = [trace2];

		var bubbleLayout = {
			title: "Bubble Chart"
		};

		console.log("Displaying bubble chart");
		Plotly.newPlot("bubble", bubbleData, bubbleLayout);
*/
  	});
};
/*
// function to call when select option changed
function optionChanged(ID) {
	// update the metadata
	loadMetadata(ID);

	// Plot the data for the selected ID
	buildPlot(ID);

	// Plot the bonus guage chart
	gaugeChart(ID);
};


*/
init();
