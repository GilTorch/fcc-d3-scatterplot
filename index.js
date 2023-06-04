
const { select, json, scaleTime, scaleBand, extent, axisLeft, axisBottom } = d3;

const width = window.innerWidth*0.7; 
const height = window.innerHeight*0.7; 

const margin = {
    top: 50, 
    right: 50, 
    bottom: 50, 
    left: 50
}

const URL = [
    "https://raw.githubusercontent.com/",
    "freeCodeCamp/",
    "ProjectReferenceData/",
    "master/",
    "cyclist-data.json"
].join('')


const main = async () => {
   const data =  await json(URL)
   
   console.table(data)
  const svg = select('body')
    .append('svg')
    .attr('width',width - margin.right - margin.left)
    .attr('height',height - margin.bottom - margin.top)
    .attr('viewBox',[0, 0, width, height])

 const yValue = d => d.Time

 const xScaleExtent = extent(data, d => new Date(d.Year, 1,1));

 const xScale = scaleTime()
    .domain(xScaleExtent)
    .range([margin.left, width - margin.right])

const yScale = scaleBand()
    .domain(data.map(yValue))
    .range([height - margin.bottom, margin.top])
    
const marks = data.map(dataPoint => ({
    cx: xScale(new Date(dataPoint.Year,1,1)),
    cy: yScale(dataPoint.Time),
    fill: dataPoint.Doping !=="" ? 'rgba(0,0,255,0.5)' : 'orange',
    r: 10
}))

svg 
  .selectAll('circle')
  .data(marks)
  .join('circle')
  .attr('cx', d => d.cx)
  .attr('cy', d => d.cy)
  .attr('r', d => d.r)
  .attr('fill',d => d.fill)
  .attr('stroke-width', 1)
  .attr('stroke', 'black')

svg.append('g')
   .attr('transform',`translate(${margin.left},0)`)
   .call(axisLeft(yScale).tickSizeOuter(0))

svg.append('g')
   .attr('transform',`translate(0,${height - margin.bottom})`)
   .call(axisBottom(xScale).tickSizeOuter(0))
 

}

main()