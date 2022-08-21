// Load json file
const dataPromise = d3.json("./static/data/soup_data.json");
//console.log(dataPromise)

// Select the form
let form = d3.select("#filter-charts");
form.on("click", rebuildPlot);


// Set up the base content
function init() {
	// Plot the data
	buildPlot();

};

// Function to rebuild after filter options selected
function rebuildPlot(){
	d3.event.preventDefault();

	buildPlot();
};

// function to build the graph
function buildPlot(){
	//get values from form;
	let scatterX = d3.select("#scatter-x").property("value");
	let scatterY = d3.select("#scatter-y").property("value");
	let sort1 = d3.select("#sort1").property("value");
	let sort2 = d3.select("#sort2").property("value");
	let minVoters = parseInt(d3.select("#input-min-voters").property("value"));
	let maxVoters = parseInt(d3.select("#input-max-voters").property("value"));
	let minRating = parseInt(d3.select("#input-min-rating").property("value"));
	let maxRating = parseInt(d3.select("#input-max-rating").property("value"));
	let minMinutes = parseInt(d3.select("#input-min-minutes").property("value"));
	let maxMinutes = parseInt(d3.select("#input-max-minutes").property("value"));
	let filterIngredient = d3.select("#input-ingredient").property("value");
	//console.log("filterIngredient: ", filterIngredient);

	/*
	console.log(scatterX);
	console.log(scatterY);
	console.log(sort1);
	console.log(sort2);*/

	if (sort1 == ""){
		sort1 = "voters";
	};
/*
	console.log(typeof minVoters);
	console.log(minVoters);
	console.log(maxVoters);
*/
	// Check voters values are valid, otherwise set default
	if (isNaN(minVoters)){
		minVoters=0;
	};
	if (isNaN(maxVoters)){
		maxVoters=714;
	};

	// Check rating values are valid, otherwise set default
	if (isNaN(minRating)){
		minRating=0;
	};
	if (isNaN(maxRating)){
		maxRating=5;
	};
/*
	console.log(typeof minRating);
	console.log(minRating);
	console.log(maxRating);
*/

	// Check minutes values are valid, otherwise set default
	if (isNaN(minMinutes)){
		minMinutes=0;
	};
	if (isNaN(maxMinutes)){
		maxMinutes=15000;
	};


	dataPromise.then(function(data) {
		let recipeData = data.data;
	    //console.log(recipeData);

	    let filteredData = recipeData.filter(d => {
			return d.voters >= minVoters && d.voters <= maxVoters && 
			d.rating >= minRating && d.rating <= maxRating &&
			d.minutes >= minMinutes && d.minutes <= maxMinutes
		});
		if (filterIngredient != ""){
			filteredData = filteredData.filter(d => {
				//console.log(filterIngredient);
				return d.ingredients.includes(filterIngredient);
			});
		}
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
		//console.log(sortedData);

	    //console.log(filteredData);

		// Put all data into variables
		let dataToChart = {
			xValues: [],
			yValues: [],
			recipeID: [],
			recipeNames: [],
			rating: [],
			voters: [],
			minutes: [],
			n_steps: [],
			n_ingredients: []
		};

		for (let i = 0; i < sortedData.length; i++){
			dataToChart.xValues.push(sortedData[i][scatterX]);
			dataToChart.yValues.push(sortedData[i][scatterY]);
			dataToChart.recipeID.push(sortedData[i].recipe_id);
			dataToChart.recipeNames.push(sortedData[i].name);
			dataToChart.rating.push(sortedData[i].rating);
			dataToChart.voters.push(sortedData[i].voters);
			dataToChart.minutes.push(sortedData[i].minutes);
			dataToChart.n_steps.push(sortedData[i].n_steps);
			dataToChart.n_ingredients.push(sortedData[i].n_ingredients);
		};
		//console.log(dataToChart);
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
						ID: []
					}
		//console.log(topTen);
		for (let i = 0; i < 10; i++){
			topTen.recipeValues.push(dataToChart[sort1][i]);
			topTen.labels.push(dataToChart.recipeNames[i]);
			topTen.names.push(dataToChart.recipeNames[i]);			
			topTen.ID.push(dataToChart.recipeID[i]);			
		};
		//console.log(topTen);

		// Plot bar chart
		let trace1 = {
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

		let recipeMenu = d3.select("#selRecipeData");
		//console.log(recipeMenu);
		//console.log(topTen.ID);

		// Reset options
		recipeMenu.html("");

		for (let i = 0; i < topTen.ID.length; i++){
			recipeMenu
				.append("option")
				.text(topTen.names[i])
				.property("value", topTen.ID[i])
		};

		let searchID = topTen.ID[0];
		displayRecipe(searchID);

		//console.log("data length: ", dataToChart.recipeID.length);
		d3.select("#warning").html("");

		if (dataToChart.recipeID.length == 0){
			d3.select("#warning").append("span")
			.text("Sorry, your filter options did not produce any data. Try again!");
		};

  	});
};

// function to display the recipe
function displayRecipe(ID){
	dataPromise.then(function(data) {
		let recipeData = data.data;
		// select the data
		let showRecipe = recipeData.filter(d => {
			return d.recipe_id == ID;
		});
		//console.log(showRecipe);

		let recipeText = d3.select("#showRecipe");

		recipeText.html("")
		
		recipeText.append("p")
			.html(`Recipe: <a href="https://www.food.com/recipe/${showRecipe[0].recipe_id}">${showRecipe[0].name}</a>`);

		recipeText.append("p")
			.html(`Ingredients: ${showRecipe[0].ingredients}<br />\n
			Number of Steps: ${showRecipe[0].n_steps}<br />\n
			Minutes to Cook: ${showRecipe[0].minutes}<br />\n
			Rating: ${showRecipe[0].rating}<br />\n
			Number of Voters: ${showRecipe[0].voters}<br />\n
			`);
	});
}

// function to call when select option changed
function optionChanged(ID) {
	// display the recipe
	displayRecipe(ID);

};


init();
