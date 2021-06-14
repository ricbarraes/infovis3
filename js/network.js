class Network {
  constructor({ el, data, color, dispatch }) {
    this.el = el;
    this.data = data;
    this.color = color;
    this.dispatch = dispatch;
    this.init();
  }

  init() {
    this.width = this.el.clientWidth;
    this.height = this.el.clientHeight;

    this.x = d3
      .scaleSqrt()
      .domain([1, d3.max(this.data.links, (d) => d.emails.length)])
      .range([1, 8]);

    this.groupingForce = forceInABox()
      .size([this.width, this.height])
      .template("treemap")
      .groupBy("employmentType")
      .strength(0.1)
      .links(this.data.links)
      .linkStrengthInterCluster(0.0001)
      .linkStrengthIntraCluster(0.1);
    this.simulation = d3
      .forceSimulation()
      .nodes(this.data.nodes)
      .force("group", this.groupingForce)
      .force("charge", d3.forceManyBody().strength(-4))
      .force(
        "link",
        d3
          .forceLink(this.data.links)
          .id((d) => d.email)
          .distance(80)
          .strength(this.groupingForce.getLinkStrength)
      )
      .stop()
      .tick(300);

    this.container = d3
      .select(this.el)
      .classed("network chart-container", true);
    this.svg = this.container
      .append("svg")
      .attr("viewBox", [0, 0, this.width, this.height])
      .on("click", () => {
        this.dispatch.call("hideemailstimeline");
        this.link.classed("is-active", false);
      });
    this.gLinks = this.svg.append("g").attr("class", "links");
    this.gNodes = this.svg.append("g").attr("class", "nodes");

    this.tooltip = new ChartTooltip(this.container);
  }

  render() {
    this.link = this.gLinks
      .selectAll("line")
      .data(
        this.data.links.filter((d) => d.emails.length >= this.minCount),
        (d) => d.index
      )
      .join((enter) =>
        enter
          .append("line")
          .attr("class", "link")
          .attr("stroke-width", (d) => this.x(d.emails.length))
          .on("mouseenter", (event, d) => {
            this.tooltip.show(`
              <div>${d.source.name} (${d.source.employmentType})</div>
              <div>${d.target.name} (${d.target.employmentType})</div>
              <div>${d.emails.length} ${
              d.emails.length === 1 ? "email" : "emails"
            }</div>
            `);
          })
          .on("mouseleave", this.tooltip.hide)
          .on("mousemove", this.tooltip.move)
          .on("click", (event, d) => {
            const currentLink = d3.select(event.currentTarget);
            if (currentLink.classed("is-active")) {
              currentLink.classed("is-active", false);
              this.dispatch.call("hideemailstimeline");
            } else {
              event.stopPropagation();
              this.link.classed("is-active", (e) => e === d);
              this.dispatch.call("showemailstimeline", null, d);
            }
          })
      )
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    this.gNodes
      .selectAll("circle")
      .data(this.data.nodes, (d) => d.email)
      .join((enter) =>
        enter
          .append("circle")
          .attr("class", "node")
          .attr("r", 8)
          .attr("fill", (d) => this.color(d.employmentType))
          .on("mouseenter", (event, d) => {
            this.tooltip.show(`
              <div>${d.name} (${d.employmentType})</div>
            `);
          })
          .on("mouseleave", this.tooltip.hide)
          .on("mousemove", this.tooltip.move)
      )
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y);
  }

  updateMinCount(minCount) {
    this.minCount = minCount;
    this.render();
  }
}
