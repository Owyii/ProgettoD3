const svgEl = document.getElementById('chart')
const width = svgEl.getAttribute('width')
const height = svgEl.getAttribute('height')
const padding = 60
const svg = d3.select('#chart')
const info = d3.select('#info')
let pointsColor1 = '#87CEFA' // the colour of one of the Countries
let pointsColor2 = '#90EE90' // the colour of one of the Countries
let textColor = '#194d30'

// in dataset.js you see that the data is in comma separated values format. 
// this is a way to decode it by also expliciting the types, so that the d3 dataset is correctly made
const data = d3.csvParse(dataset, d => {
	return {
		date : new Date(+d.year, +d.month-1, +d.day),
		cases : +d.cases, // + indicates a number (by default all vals are strings)
		deaths : +d.deaths,
		country : d.country,
		pop2019 : +d.pop2019,
		continent : d.continent,
		cum14 : +d.cum14daysCasesPer100000
	}
})

// sorting the dataset by date
data.sort((a, b) => d3.ascending(a.date, b.date))

const groupdata = d3.rollups(
	data,
	xs => d3.sum(xs, x => x.cases),
	d => d.date
)
.map(([k,v]) => ({Day: k, Cases: v}))
//serve per mappare in un jarray, potrebbe non essere necessario


// X asix
var Theight = height - padding
var xAxis = d3.scaleTime()
	.domain(d3.extent(groupdata,function(d) {return d.Day}))
	.range([0 + padding,width - padding]);
svg.append("g")
	.attr("transform", "translate(0," + Theight + ")")
	.call(d3.axisBottom(xAxis));

// Y axis
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
	.attr("d", d3.line()
	  .x(function(d) { return xAxis(d.Day) })
	  .y(function(d) { return yAxis(d.Cases) })
	);

var testfunc = function(d){
	//console.log(d.target.__data__.Day)
	var todo_item = []
	const htmlcode = data.map(data => `<li>${data.cases}</li>`).join('');
	
	document.getElementById("info").innerHTML = '<ul id:"list">' + htmlcode + '</ul>'
}

svg.selectAll(".dot")
	.data(groupdata)
	.join("circle") // enter append
		.attr("class", function(d){return "dot" + d.Cases})
		.attr("r", "3") // radius
		.attr("cx", d=> xAxis(new Date(d.Day)))   // center x passing through your xScale
		.attr("cy", d=> yAxis(parseInt(d.Cases)))   // center y through your yScale
	.on("click",testfunc)
