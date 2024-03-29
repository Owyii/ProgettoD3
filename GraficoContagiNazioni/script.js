//Global variables
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
let isShowing = false

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

// in dataset.js you see that the data is in comma separated values format. 
// this is a way to decode it by also expliciting the types, so that the d3 dataset is correctly made
const data = d3.csvParse(dataset, d => {
	return {
		date : new Date(+d.year, +d.month-1, +d.day),
		cases : +d.cases, // + indicates a number (by default all vals are strings)
		country : d.country,
		continent : d.continent,
		deaths : +d.deaths,
		pop2019 : +d.pop2019,
		cum14 : +d.cum14daysCasesPer100000
	}
});

// sorting the dataset by date
data.sort((a, b) => d3.ascending(a.date, b.date))

//take day by day array and return grouped by week
var getArrByWeek = function(data){
	const first_day = 1577833200000
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
	)
	.map(([d,c]) => ({Day: d,Cases: c}))
}

var groupdata = getArrByWeek(data)

// svg.append("svg:defs").append("svg:marker")
//     .attr("id", "arrowhead")
// 	.attr("viewBox", "0 0 10 10")
//     .attr("refX", 10)
//     .attr("refY", 1)
//     .attr("markerWidth", 12)
//     .attr("markerHeight", 12)
//     .attr("orient", "auto")
//     .append("path")
// 	.attr("d", "M 0 0 L 5 10 L 10 0");

// // X asix
// var Theight = height - padding
// var xAxis = d3.scaleTime()
// 	.domain(d3.extent(groupdata,function(d) {return d.Day}))
// 	.range([0 + padding,width - padding]);
// svg.append("g")
// 	.attr("transform", "translate(0," + Theight + ")")
// 	.call(d3.axisBottom(xAxis))

// // Y axis
// console.log(groupdata)
// var yAxis = d3.scaleLinear()
// 	.domain([0,d3.max(groupdata,function(d){return +d.Cases})])
// 	.range([height - padding ,0 + padding ])
// svg.append("g")
// 	.attr("transform", "translate("+ padding +",0)")
// 	.call(d3.axisLeft(yAxis))
// 	.select("path").attr("marker-end", "url(#arrowhead)");

// svg.append("path")
// 	.datum(groupdata)
// 	.attr("fill","none")
// 	.attr("stroke","steelblue")
// 	.attr("stroke-width", 1.5)
// 	.attr("id", "data_line")
// 	.attr("d", d3.line()
// 	  .x(function(d) { return xAxis(d.Day) })
// 	  .y(function(d) { return yAxis(d.Cases) })
// 	);

// var xa = svg.append("g")
// 	.attr("class", "y axis")
// 	.attr("transform", "translate(0," + height + ")")      
// 	.style("dominant-baseline", "central")
// 	.call(yAxis);
  
//   xa.select("path").attr("marker-end", "url(#triangle)");

//function to create the list on the right with all the information about the state
var testfunc = function(d,give_data){
	var day = d.target.__data__.Day
	var test2 = d3.filter(data,function(d){return d.date.getTime() === day.getTime()})
	if (current != ""){
		test2 = d3.filter(test2,function(d){return d.continent === current})
	}
	test2.sort((a, b) => d3.descending(a.cases, b.cases))

	const htmlcode = `<li></li><li style="font-weight: 600;" margin-left="10px"><div class="left" id="totale">TOTALE</div><div class="right">${give_data.find(d => d.Day === day).Cases}</div></li>` +
		`<li></li><li style="font-weight: 700;" margin-left="10px"><div class="left" id="paese">Paese</div><div class="right" id="casi">Casi</div></li><li></li>` +
		test2.map(data => `<li><button class="left_button" id="list_button" onclick="selectplace(this)">${data.country}</button><div class="right">${data.cases}</div></li>`.trimEnd()).join("");;

	const datefin = [day.getDate(), day.getMonth() + 1, day.getFullYear()].join(' - ')
	let end_date = day.addDays(7)
	const dateend = [end_date.getDate(), end_date.getMonth() + 1, end_date.getFullYear()].join(' - ')
	
	document.getElementById("info").innerHTML = '<ul id:"list">' + `<li style="font-weight: 700; text-align: center;"> Dal ${datefin} al ${dateend}</li>` + htmlcode + '</ul>'
	document.getElementById("info").style.visibility = "visible";
}

//give total data when pressing a button
function write_info(give_data){
	give_data.sort((a,b) => d3.descending(a.Cases,b.Cases))
	const htmlcode_info = `<li></li><li style="font-weight: 600;" margin-left="10px"><div class="left" id="totale">TOTALE</div><div class="right">${d3.sum(give_data,function(d){return +d.Cases})}</div></li>` +
		`<li></li><li style="font-weight: 700;" margin-left="10px"><div class="left" id="paese">Paese</div><div class="right" id="casi">Casi</div></li><li></li>` +
		give_data.map(data => `<li><button class="left_button" id="list_button" onclick="selectplace(this)">${data.Country}</button><div class="right">${data.Cases}</div></li>`.trimEnd()).join("");;

	document.getElementById("info").innerHTML = '<ul id:"list">' + `<li style="font-weight: 700; text-align: center;"> Casi durante tutto il periodo </li>` + htmlcode_info + '</ul>'
	document.getElementById("info").style.visibility = "visible";
}

// When i press the button in the header even the info change
function continent_info(continent,give_data){
	let list_states = give_data
	if(continent != ""){
		list_states = d3.filter(list_states,function(d){return d.continent === continent})
	}
	list_states = d3.rollups(
		list_states,
		xs => d3.sum(xs,x => x.cases),
		d => d.country
	)
	.map(([p,c]) => ({Country:p,Cases: c}))
	write_info(list_states)
}

// Function to create the graph based on the array that is passed
// there is no other parameter passed becouse the graph is always the same for the moment 
function make_graph(element,new_data){

	svg.append("svg:defs").append("svg:marker")
		.attr("id", "arrowhead")
		.attr("viewBox", "0 0 10 10")
		.attr("refX", 10)
		.attr("refY", 1)
		.attr("markerWidth", 12)
		.attr("markerHeight", 12)
		.attr("orient", "auto")
		.append("path")
		.attr("d", "M 0 0 L 5 10 L 10 0");

	// X axis
	var Theight = height - padding
	var xAxis = d3.scaleTime()
		.domain(d3.extent(new_data,function(d) {return d.Day}))
		.range([0 + padding,width - padding]);
	element.append("g")
		.attr("transform", "translate(0," + Theight + ")")
		.call(d3.axisBottom(xAxis))
		

	// Y axis
	var yAxis = d3.scaleLinear()
		.domain([0,d3.max(new_data,function(d){return +d.Cases})])
		.range([height - padding ,0 + padding ])
	element.append("g")
		.attr("transform", "translate("+ padding +",0)")
		.call(d3.axisLeft(yAxis))
		.select("path").attr("marker-end", "url(#arrowhead)");



	//rebuild the graph
	element.append("path")
		.datum(new_data)
		.attr("fill","none")
		.attr("stroke","steelblue")
		.attr("stroke-width", 1.5)
		.attr("id", "data_line")
		.attr("d", d3.line()
			.x(function(d) { return xAxis(d.Day) })
			.y(function(d) { return yAxis(d.Cases) })
		);


	//rebuild the point
	element.selectAll(".dot")
		.data(new_data)
		.join("circle") // enter append
			.attr("class", function(d){return "dot" + d.Cases})
			.attr("r", "3") // radius
			.attr("cx", d=> xAxis(new Date(d.Day)))   // center x passing through your xScale
			.attr("cy", d=> yAxis(parseInt(d.Cases)))   // center y through your yScale
		.on("click",(evento)=>(testfunc(evento,new_data)))	
}

make_graph(svg,groupdata)

// Remake the graph resetting the axis
function remake_graph(element,new_data){

	// //clear the graph
	element.selectAll("circle").remove()
	element.selectAll("#data_line").remove()
	element.selectAll("g").remove()

	make_graph(element,new_data)
}

make_graph(svg,groupdata)

//Function that based on the button pressed choose what information to display
function filter_data(continent){
	continent_info(continent,data)
	if (current != continent && continent != ""){
		var data_continent = d3.filter(data,function(d){return d.continent === continent})
		current = continent

		groupdata = getArrByWeek(data_continent)

		remake_graph(svg,groupdata)
	}
	else if(current != continent && continent == ""){
		groupdata = getArrByWeek(data)
		
		remake_graph(svg,groupdata)
		current=""
	}
	else {
		return 0
	}
}

//Get the button pressed
var buttons = document.getElementsByClassName("select_button");
for (var i = 0; i < buttons.length; i++) {
	buttons[i].onclick = function() {
		filter_data(this.id)
	};
}

//Show a graph in the bottom part of the page with the information by state day by day
function selectplace(i){
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

	if(isShowing){
		remake_graph(svg_2,groupdata)
	}
	else{
		make_graph(svg_2,groupdata)
		isShowing = true
	}
}
