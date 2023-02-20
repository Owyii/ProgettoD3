const svgEl = document.getElementById('chart')
const width = svgEl.getAttribute('width')
const height = svgEl.getAttribute('height')
const padding = 100
const svg = d3.select('#chart')
const color1 = '#87CEFA'
const color2 = '#FF8400'
const textColor = '#194d30'
const pieRadius = 30
const hpadding = 100
const wpadding = 80
const svgEl2 = document.getElementById('quadrato-1')
const width2 = svgEl2.getAttribute('width')
const height2 = svgEl2.getAttribute('height')
const svg2 = d3.select('#quadrato-1')


const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
	var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

	return {
		x: centerX + (radius * Math.cos(angleInRadians)),
		y: centerY + (radius * Math.sin(angleInRadians))
	};
}

const describeArc = (x, y, radius, startAngle, endAngle) => {

	var start = polarToCartesian(x, y, radius, endAngle)
	var end = polarToCartesian(x, y, radius, startAngle)

	var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"

	var d = [
	    "M", start.x, start.y, 
	    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
	].join(" ")

	return d + `L ${x} ${y} Z`       
}

// when you need to make the slice of the pie chart : 
// describeArc(pieRadius/2, pieRadius/2, pieRadius, 0, (360*percentage))

const data = d3.csvParse(dataset, d => {
	return {
		companyType : d.companyType,
		nCompanies : +d.nCompanies,
		percControlled : +d.percControlled,
		evasion : +d.evasion/1000000000
	}
})

console.log(data)

/*END*/

//start

const xScale=d3.scaleLinear()
	.domain([0,data.length])
	.range([wpadding,width-wpadding])

const yScale=d3.scaleLinear()
	.domain([0,d3.max(data, d => d.evasion)])
	.range([height-hpadding,hpadding])

const yAxis=d3.axisLeft(yScale)
	.ticks(10)
	.tickSize(-(width-(wpadding*2)))

const yTicks = svg
	.append('g')
	.attr('transform', `translate(${wpadding -4}, 0)`)
	.call(yAxis)
	.style("font-size", "14px")

svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("y", wpadding-40)
    .attr("x", -height/2)
    .attr("dy", "1")
    .attr("transform", "rotate(-90)")
    .text("Evasion (€ billion)")
	.style("font-size", "20px");

svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", width/2)
    .attr("y", height - hpadding/2)
	.style("font-size", "20px")
    .text("Company type");
	
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

const AsseY = svg
	.append("g")
	.append('line')
		.attr('x1', wpadding)
		.attr('y1', height-hpadding)
		.attr('x2', wpadding)
		.attr('y2', hpadding-20)
		.style('marker-end', "url(#triangle)")
		.style("stroke",'black')
		.style('width', 2)

const AsseX = svg
	.append("g")
	.append('line')
		.attr('x1', wpadding)
		.attr('y1', height-hpadding)
		.attr('x2', width-wpadding)
		.attr('y2', height-hpadding)
		.style("stroke",'black')
		.style('width', 2)

	console.log(xScale(0))

// colouring the ticks
svg
	.selectAll('.tick line')
	.style('stroke', '#D3D3D3')

// colouring the ticks' text
svg
	.selectAll('.tick text')
	.style('color', textColor)

// hiding the vertical ticks' line
svg
	.selectAll('path.domain')
	.style('stroke-width', 0)


const arc = describeArc(300, 300, 100, 20, 100)
	
const pies = svg
	.selectAll('g.stringa')
	.data(data)
	.enter()
	.append('g')
		.attr('class', 'stringa')
		.attr('transform',(d,i) => `translate(${xScale(i)}, ${yScale(d.evasion)})`)

const lines = pies
	.append('line')
		.attr('x1',(d,i) => -xScale(i)+wpadding)
		.attr('y1', 0)
		.attr('x2', wpadding)
		.attr('y2', 0)
		.style("stroke",'black')
		.style('width', 2)

const textsEva = pies
	.append('text')
		.text(function(d){ return d.evasion})
		.style("stroke",'black')
		.style('font-size', "11px")
		.attr("transform",(d,i) => `translate(${-xScale(i) + wpadding + 10}, -4)`)

const circles = pies
 	.append('circle')
 		.attr('cx', wpadding)
 		.attr('cy', 0)
 		.attr('r',pieRadius)
 		.attr('fill',color1) 
		.style('stroke', 'black')

const arcs = pies
 	.append('path')
		.attr('d', d => describeArc((wpadding), 0, pieRadius, 0, (d.percControlled * 360)))
		.attr('fill', color2)
		.style('stroke', 'black')

const textsType = pies
	.append('text')
		.text(function(d){ return d.companyType})
		.attr("transform", `translate(${wpadding}, ${1.6 * pieRadius})`)
		.style("text-anchor", "middle")
		.style("font-size", "18px")
		.style('font-weight','600')

const textsPerc = pies
	.append('text')
		.text(function(d){ return Math.round(d.percControlled*100) + '%'})
		.attr("transform", `translate(${wpadding-8}, ${-pieRadius-5})`)
		

console.log(describeArc((wpadding + xScale(0)), yScale(data[0].evasion), pieRadius, 0, (data[0].percControlled * 360)))

const pie = svg2
	.selectAll('g.string')
	.data(data)
	.enter()
	.append('g')
		.attr('class', 'string')

const circle = pie
	.append('circle')
		.attr('cx', width2/2)
		.attr('cy', height2/2)
		.attr('r',pieRadius)
		.attr('fill',color1) 
		.style('stroke', 'black')

const arco = pie
	.append('path')
		.attr('d', d => describeArc(width2/2, height2/2, pieRadius, 0, 90))
		.attr('fill', color2)
		.style('stroke', 'black')

const textsTyp = pie
	.append('text')
		.text("Non controllato")
		.attr("transform", `translate(0, ${0.8 * pieRadius})`)
		.style("text-anchor", "start")
		.style("font-size", "14px")
const textsTyp2 = pie
	.append('text')
		.text("Controllato")
		.attr("transform", `translate(${width2-25}, ${0.6 * pieRadius})`)
		.style("text-anchor", "end")
		.style("font-size", "14px")

const line1 = pie
	.append('line')
		.attr('x1', 50)
		.attr('y1', 0.8*pieRadius+5)
		.attr('x2', width2/2-10)
		.attr('y2', height2/2)
		.style("stroke",'black')
		.style('width', 2)
const line2 = pie
	.append('line')
		.attr('x1', width2-60)
		.attr('y1', 0.6*pieRadius+5)
		.attr('x2', width2/2+10)
		.attr('y2', pieRadius+10)
		.style("stroke",'black')
		.style('width', 2)