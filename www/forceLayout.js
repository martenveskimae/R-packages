//Based on Mike Bostock's Force-Directed Tree: https://bl.ocks.org/mbostock/95aa92e2f4e8345aaa55a4a94d41ce37

init = function(){
  m = window.devicePixelRatio,
  width = window.innerWidth,
  height = window.innerHeight-190,
  mWidth = width*m,
  mHeight = height*m,
  canvas = d3.select("#packages").append("canvas")
  .attr("class", "canvas")
  .attr("width", mWidth)
  .attr("height", mHeight)
  .style("width", function(){ return width + "px"; })
  .style("height", function(){ return height + "px"; }),
  canvas = document.querySelector("canvas"),
  context = canvas.getContext("2d");
  context.scale(m,m);
};

Shiny.addCustomMessageHandler("df", function(message){

  links = [];
  message.source.forEach(function(d,i){
    links.push({ source: message.source[i], target: message.target[i] });
  });

  var nodesByName = {};

  links.forEach(function(link) {
    link.source = nodeByName(link.source);
    link.target = nodeByName(link.target);
  });

  var nodes = d3.values(nodesByName);

  d3.select(canvas)
  .call(d3.drag()
    .container(canvas)
    .subject(dragsubject)
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended));

  var simulation = d3.forceSimulation(nodes)
  .alphaTarget(0.5)
  .velocityDecay(0.5)
  .force("charge", d3.forceManyBody())
  .force("link", d3.forceLink(links).distance(75).strength(0.5))
  .force("center", d3.forceCenter())
  .force("x", d3.forceX())
  .force("y", d3.forceY())
  .on("tick", ticked);

  function ticked() {
    context.clearRect(0, 0, width, height);
    context.save();
    context.translate(width / 2, height / 2);

    context.beginPath();
    links.forEach(drawLink);
    context.strokeStyle = "#aaa";
    context.stroke();

    context.beginPath();
    nodes.forEach(drawNode);
    context.fill();
    context.strokeStyle = "#fff";
    context.stroke();

    context.restore();
  }

  function dragsubject() {
    return simulation.find(d3.event.x - width / 2, d3.event.y - height / 2);
  }

  function dragstarted() {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;
  }

  function dragged() {
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
  }

  function dragended() {
    if (!d3.event.active) simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
  }

  function mX(d) { return d.x = Math.max(-width /2 + 10, Math.min(width/2 - 10, d.x)); };
  function mY(d) { return d.y = Math.max(-height/2 + 15, Math.min(height/2 - 5, d.y)); };

  function drawLink(d) {
    context.moveTo(mX(d.source), mY(d.source));
    context.lineTo(mX(d.target), mY(d.target));
  }

  function drawNode(d) {
    context.moveTo(mX(d) + 3.5, mY(d));
    context.arc(mX(d), mY(d), 3.5, 0, 2 * Math.PI);
    context.fillText(d.name, mX(d)+5, mY(d)-5);
  }

  function nodeByName(name) {
    return nodesByName[name] || (nodesByName[name] = {name: name});
  }
});