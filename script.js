
const svgEl = document.getElementById('chart')
const width = svgEl.getAttribute('width')
const height = svgEl.getAttribute('height')
const padding = 60
const svg = d3.select('#chart')
const info = d3.select('#info')


const svg_2 = d3.select('#chart_due')
const svgEl_2 = document.getElementById('chart_due')
const width_2 = svgEl.getAttribute('width')
const height_2 = svgEl.getAttribute('height')

let pointsColor1 = '#87CEFA' // the colour of one of the Countries
let pointsColor2 = '#90EE90' // the colour of one of the Countries
let textColor = '#194d30'

var current = ""


// in dataset.js you see that the data is in comma separated values format. 
// this is a way to decode it by also expliciting the types, so that the d3 dataset is correctly made
const data = d3.csvParse(dataset, d => {
	return {
		date : new Date(+d.year, +d.month-1, +d.day),
		cases : +d.cases, // + indicates a number (by default all vals are strings)
		continent : d.continent,
		deaths : +d.deaths,
		country : d.country,
		pop2019 : +d.pop2019,
		cum14 : +d.cum14daysCasesPer100000
	}
});



// sorting the dataset by date
data.sort((a, b) => d3.ascending(a.date, b.date))

//take day by day array and return grouped by week
var getArrByWeek = function(data){
	var first_day = 1577833200000
	console.log(first_day)

	return d3.rollups(
		data,
		xs => d3.sum(xs, x => x.cases),
		d => {
			time = d.date.getTime()
			if (time < first_day){
				return new Date(d.date.getFullYear(),d.date.getMonth(),d.date.getDate() + 1)
			}
			else {
				var diff = time - first_day
				diff = ( diff / 1000 / 60 / 60 / 24 ) % 7
				return new Date(d.date.getFullYear(),d.date.getMonth(),d.date.getDate() - diff)
			}
		},
		//d => d.date
	)
	.map(([d,c]) => ({Day: d,Cases: c}))
}

var groupdata = getArrByWeek(data)


console.log(groupdata)

svg.append("svg:defs")
	.append("svg:marker")
		.attr("id", "triangle")
		.attr("refX", 6)
		.attr("refY", 6)
		.attr("markerWidth", 30)
		.attr("markerHeight", 30)
		.attr("orient", "auto")
		.append("path")
		.attr("d", "M 0 0 12 6 0 12 3 6")
		.style("fill", "black");

// X asix
var Theight = height - padding
var xAxis = d3.scaleTime()
	.domain(d3.extent(groupdata,function(d) {return d.Day}))
	.range([0 + padding,width - padding]);
svg.append("g")
	.attr("transform", "translate(0," + Theight + ")")
	.call(d3.axisBottom(xAxis));

// Y axis
console.log(groupdata)
var yAxis = d3.scaleLinear()
	.domain([0,d3.max(groupdata,function(d){return +d.Cases})])
	.range([height - padding ,0 + padding ])
svg.append("g")
	.attr("transform", "translate("+ padding +",0)")
	.call(d3.axisLeft(yAxis));

svg.append("path")
	.datum(groupdata)
	.attr("fill","none")
	.attr("stroke","steelblue")
	.attr("stroke-width", 1.5)
	.attr("id", "data_line")
	.attr("d", d3.line()
	  .x(function(d) { return xAxis(d.Day) })
	  .y(function(d) { return yAxis(d.Cases) })
	);

var testfunc = function(d,give_data){
	var day = d.target.__data__.Day
	//var todo_item = data.filter(c => {return c.date ===day})
	var test2 = d3.filter(data,function(d){return d.date.getTime() === day.getTime()})
	if (current != ""){
		test2 = d3.filter(test2,function(d){return d.continent === current})
	}
	test2.sort((a, b) => d3.descending(a.cases, b.cases))
	console.log("func")
	console.log(give_data)
	console.log(day)
	const htmlcode = `<li></li><li style="font-weight: 600;" margin-left="10px"><div class="left" id="totale">TOTALE</div><div class="right">${give_data.find(d => d.Day === day).Cases}</div></li>` +
		`<li></li><li style="font-weight: 700;" margin-left="10px"><div class="left" id="paese">Paese</div><div class="right" id="casi">Casi</div></li><li></li>` +
		test2.map(data => `<li><button class="left_button" id="list_button" onclick="selectplace(this)">${data.country}</button><div class="right">${data.cases}</div></li>`.trimEnd()).join("");;
	var datefin = [day.getDate(), day.getMonth() + 1, day.getFullYear()].join(' - ')
	//console.log(test2)
	//console.log(day)
	
	document.getElementById("info").innerHTML = '<ul id:"list">' + `<li style="font-weight: 700;">${datefin}</li>` + htmlcode + '</ul>'
}

svg.selectAll(".dot")
	.data(groupdata)
	.join("circle") // enter append
		.attr("class", function(d){return "dot" + d.Cases})
		.attr("r", "3") // radius
		.attr("cx", d=> xAxis(new Date(d.Day)))   // center x passing through your xScale
		.attr("cy", d=> yAxis(parseInt(d.Cases)))   // center y through your yScale
	.on("click",(evento)=>(testfunc(evento,groupdata)))


function filter_data(continent){
	if (current != continent && continent != ""){
		var data_continent = d3.filter(data,function(d){return d.continent === continent})
		current = continent

		groupdata = getArrByWeek(data_continent)


		// //clear the graph
		svg.selectAll("circle").remove()
		svg.selectAll("#data_line").remove()
		svg.selectAll("g").remove()

		var Theight = height - padding
		var xAxis = d3.scaleTime()
			.domain(d3.extent(groupdata,function(d) {return d.Day}))
			.range([0 + padding,width - padding]);
		svg.append("g")
			.attr("transform", "translate(0," + Theight + ")")
			.call(d3.axisBottom(xAxis));

		// Y axis
		console.log(groupdata)
		var yAxis = d3.scaleLinear()
			.domain([0,d3.max(groupdata,function(d){return +d.Cases})])
			.range([height - padding ,0 + padding ])
		svg.append("g")
			.attr("transform", "translate("+ padding +",0)")
			.call(d3.axisLeft(yAxis));

		//rebuild the graph
		svg.append("path")
			.datum(groupdata)
			.attr("fill","none")
			.attr("stroke","steelblue")
			.attr("stroke-width", 1.5)
			.attr("id", "data_line")
			.attr("d", d3.line()
				.x(function(d) { return xAxis(d.Day) })
				.y(function(d) { return yAxis(d.Cases) })
			);

		svg.selectAll(".dot")
			.data(groupdata)
			.join("circle") // enter append
				.attr("class", function(d){return "dot" + d.Cases})
				.attr("r", "3") // radius
				.attr("cx", d=> xAxis(new Date(d.Day)))   // center x passing through your xScale
				.attr("cy", d=> yAxis(parseInt(d.Cases)))   // center y through your yScale
			.on("click",(evento)=>(testfunc(evento,groupdata)))

	}
	else if(current != continent && continent == ""){
		current = continent
		var groupdata = d3.rollups(
			data,
			xs => d3.sum(xs, x => x.cases),
			d => d.date
		)
		.map(([k,v]) => ({Day: k, Cases: v}))

		svg.selectAll("circle").remove()
		svg.selectAll("#data_line").remove()
		svg.selectAll("g").remove()

		var Theight = height - padding
		var xAxis = d3.scaleTime()
			.domain(d3.extent(groupdata,function(d) {return d.Day}))
			.range([0 + padding,width - padding]);
		svg.append("g")
			.attr("transform", "translate(0," + Theight + ")")
			.call(d3.axisBottom(xAxis));

		// Y axis
		console.log(groupdata)
		var yAxis = d3.scaleLinear()
			.domain([0,d3.max(groupdata,function(d){return +d.Cases})])
			.range([height - padding ,0 + padding ])
		svg.append("g")
			.attr("transform", "translate("+ padding +",0)")
			.call(d3.axisLeft(yAxis));

		svg.append("path")
			.datum(groupdata)
			.attr("fill","none")
			.attr("stroke","steelblue")
			.attr("stroke-width", 1.5)
			.attr("id", "data_line")
			.attr("d", d3.line()
				.x(function(d) { return xAxis(d.Day) })
				.y(function(d) { return yAxis(d.Cases) })
			);

		svg.selectAll(".dot")
			.data(groupdata)
			.join("circle") // enter append
				.attr("class", function(d){return "dot" + d.Cases})
				.attr("r", "3") // radius
				.attr("cx", d=> xAxis(new Date(d.Day)))   // center x passing through your xScale
				.attr("cy", d=> yAxis(parseInt(d.Cases)))   // center y through your yScale
			.on("click",(evento)=>(testfunc(evento,groupdata)))

	}
	else {
		return 0
	}
}

var buttons = document.getElementsByClassName("select_button");
for (var i = 0; i < buttons.length; i++) {
	buttons[i].onclick = function() {
		filter_data(this.id)
	};
}

function selectplace(i){
	//ATTENZIONE, IL VECCHIO GRAFICO NON VIENE RIMOSSO
	var selected_place = i.outerText
	console.log(selected_place)

	var place = d3.filter(data,function(d){return d.country === selected_place})
	console.log(place)

	var groupdata = d3.rollups(
		place,
		xs => d3.sum(xs, x => x.cases),
		d => d.date
	)
	.map(([k,v]) => ({Day: k, Cases: v}))

	// X asix
	var Theight_2 = height_2 - padding
	var xAxis_2 = d3.scaleTime()
		.domain(d3.extent(groupdata,function(d) {return d.Day}))
		.range([0 + padding,width_2 - padding]);
	svg_2.append("g")
		.attr("transform", "translate(0," + Theight_2 + ")")
		.call(d3.axisBottom(xAxis_2));

	// Y axis
	var yAxis_2 = d3.scaleLinear()
		.domain([0,d3.max(groupdata,function(d){return +d.Cases})])
		.range([height_2 - padding ,0 + padding ])
	svg_2.append("g")
		.attr("transform", "translate("+ padding +",0)")
		.call(d3.axisLeft(yAxis_2));

	svg_2.append("path")
		.datum(groupdata)
		.attr("fill","none")
		.attr("stroke","steelblue")
		.attr("stroke-width", 1.5)
		.attr("id", "data_line")
		.attr("d", d3.line()
			.x(function(d) { return xAxis_2(d.Day) })
			.y(function(d) { return yAxis_2(d.Cases) })
		);

	svg_2.selectAll(".dot")
	.data(groupdata)
	.join("circle") // enter append
		.attr("class", function(d){return "dot" + d.Cases})
		.attr("r", "3") // radius
		.attr("cx", d=> xAxis_2(new Date(d.Day)))   // center x passing through your xScale
		.attr("cy", d=> yAxis_2(parseInt(d.Cases)))   // center y through your yScale
	.on("click",testfunc)

}
