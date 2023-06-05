let globalMousePos = { x: undefined, y: undefined}
window.addEventListener('mousemove', (event) => {
    globalMousePos = { x: event.clientX, y: event.clientY };
  });
  
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
  const svg = select('.scatterplot')
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


const usedDopingColor = 'rgba(0,0,255,0.5)' 
const noDopingColor = 'orange'
    
const marks = data.map(dataPoint => ({
    cx: xScale(new Date(dataPoint.Year,1,1)),
    dataPoint,
    cy: yScale(dataPoint.Time),
    fill: dataPoint.Doping !== '' ? usedDopingColor : noDopingColor,
    r: 10
}))

const tooltip = select('#tooltip')
tooltip.style('opacity',0)


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
  .on('mouseover', (e,d) => {
    console.log(e)
    const { Year, Time, Doping, Name, Nationality } = d.dataPoint
    const text = `
        ${Name}
       Nationality: ${Nationality} </br>
       Time: ${Time}
       Year: ${Year} </br>
        ${Doping? 'Doping:'+Doping :''}
    `
    tooltip.style('left', margin.left + globalMousePos.x+100+'px')
    tooltip.style('top',  globalMousePos.y-45+'px')
    tooltip.style('opacity',1)
    tooltip.html(text)
  })
  .on('mouseout', () => {
    tooltip.style('opacity',0)
  })

svg.append('g')
   .attr('transform',`translate(${margin.left},0)`)
   .attr('class', 'y-axis')
   .call(axisLeft(yScale).tickSizeOuter(0))

svg.append('g')
   .attr('transform',`translate(0,${height - margin.bottom})`)
   .attr('class', 'x-axis')
   .call(axisBottom(xScale).tickSizeOuter(0))

svg 
  .append('text')
  .attr('x', -height/2)
  .attr('y',0)
  .attr('transform', 'rotate(-90)')
  .attr('text-anchor','middle')
  .attr('class','y-axis-label')
  .text("Time in Minutes")

const legendData = [
    {
        text: "No doping allegations", 
        color: noDopingColor,
        x: width,
        y: (height - margin.bottom)/2,
        width: 50
    },
    {
        text: "Riders with doping allegations", 
        color: usedDopingColor,
        x: width,
        y: (height - margin.bottom)/2 + 60,
        width: 50
    }
]

svg
  .selectAll('g.legend')
  .data(legendData)
  .join('g')
  .append('rect')
  .attr('width', d => d.width)
  .attr('height', d => d.width)
  .attr('fill', d => d.color)
  .attr('x',d => d.x)
  .attr('y',d => d.y)

svg 
  .selectAll('text.label')
  .data(legendData)
  .join('text')
  .text(d => d.text)
  .attr('x', d => d.x - 10)
  .attr('y', d => d.y + 25)
  .attr('text-anchor', 'end')


}

main()