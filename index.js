let globalMousePos = { x: undefined, y: undefined}
window.addEventListener('mousemove', (event) => {
    globalMousePos = { x: event.clientX, y: event.clientY };
  });
  
const { select, timeParse, json, scaleTime, scaleBand, extent, axisLeft, axisBottom } = d3;

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
   
  const svg = select('.scatterplot')
    .append('svg')
    .attr('width',width - margin.right - margin.left)
    .attr('height',height - margin.bottom - margin.top)
    .attr('viewBox',[0, 0, width, height])


 const convertTimeToDate = time => {
  const date = new Date(1970, 0,1,0,time.split(":")[0], time.split(":")[1])
  return date; 
}

const xExtent = [
  d3.min(data, d => new Date(d.Year-1, 1,1)),
  d3.max(data, d => new Date(d.Year+1, 1,1)),
]

let yExtent = [
  d3.min(data, d => convertTimeToDate(d.Time)),
  d3.max(data, d => convertTimeToDate(d.Time))
]

const xScale = scaleTime()
    .domain(xExtent)
    .range([margin.left, width - margin.right])

const yScale = scaleTime()
    .domain(yExtent)
    .range([margin.top,height - margin.bottom,])

const usedDopingColor = 'rgba(0,0,255,0.5)' 
const noDopingColor = 'orange'
    
const dots = data.map(datapoint => ({
    cx: xScale(new Date(datapoint.Year,1,1)),
    datapoint,
    cy: yScale(convertTimeToDate(datapoint.Time)),
    fill: datapoint.Doping !== '' ? usedDopingColor : noDopingColor,
    r: 10
}))

const tooltip = select('#tooltip')
tooltip.style('opacity',0)


svg 
  .selectAll('circle')
  .data(dots)
  .join('circle')
  .attr('class', 'dot')
  .attr('cx', d => d.cx)
  .attr('cy', d => d.cy)
  .attr('data-xvalue', d => d.datapoint.Year)
  .attr('data-yvalue', d => convertTimeToDate(d.datapoint.Time))
  .attr('r', d => d.r)
  .attr('fill',d => d.fill)
  .attr('stroke-width', 1)
  .attr('stroke', 'black')
  .attr('class','dot')
  .on('mouseover', (e,d) => {
    const { Year, Time, Doping, Name, Nationality } = d.datapoint
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
    tooltip.attr('data-year', Year)
  })
  .on('mouseout', () => {
    tooltip.style('opacity',0)
  })

// axis creation
svg.append('g')
   .attr('transform',`translate(${margin.left},0)`)
   .attr('id', 'y-axis')
   .call(axisLeft(yScale)
   .tickFormat(d => {
    let appendZero = val => val < 10 ? `0${val}` : val
    return appendZero(d.getMinutes()) + ':' + appendZero(d.getSeconds());
   })
   .tickSizeOuter(0))

svg.append('g')
   .attr('transform',`translate(0,${height - margin.bottom})`)
   .attr('id', 'x-axis')
   .call(axisBottom(xScale).tickSizeOuter(0))

// y-axis -label
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
        width: 25
    },
    {
        text: "Riders with doping allegations", 
        color: usedDopingColor,
        x: width,
        y: (height - margin.bottom)/2 + 60,
        width: 25
    }
]

svg
  .selectAll('g.legend-label')
  .data(legendData)
  .join('g')
  .append('rect')
  .attr('width', d => d.width)
  .attr('height', d => d.width)
  .attr('fill', d => d.color)
  .attr('id', 'legend')
  .attr('x',d => d.x)
  .attr('y',d => d.y)

svg 
  .selectAll('text.label')
  .data(legendData)
  .join('text')
  .text(d => d.text)
  .attr('x', d => d.x - 10)
  .attr('y', d => d.y + 12.5)
  .attr('text-anchor', 'end')
  .attr('id','label')


}

main()