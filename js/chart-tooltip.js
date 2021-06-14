class ChartTooltip {
  constructor(container) {
    this.container = container;
    this.tooltip = container.append("div").attr("class", "chart-tooltip");
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.move = this.move.bind(this);
  }

  show(content) {
    this.tooltip.classed("show", true).html(content);
    this.containerBox = this.container.node().getBoundingClientRect();
    this.tooltipBox = this.tooltip.node().getBoundingClientRect();
  }

  hide() {
    this.tooltip.classed("show", false);
  }

  move(event) {
    const [x0, y0] = d3.pointer(event);
    let x = x0 - this.tooltipBox.width / 2;
    if (x < 0) {
      x = 0;
    } else if (x + this.tooltipBox.width > this.containerBox.width) {
      x = this.containerBox.width - this.tooltipBox.width;
    }
    let y = y0 - this.tooltipBox.height - 8;
    if (y < 0) {
      y = y0 + 8;
    }
    this.tooltip.style("transform", `translate(${x}px,${y}px)`);
  }
}
