class Timeline {
  constructor({ el, color }) {
    this.el = el;
    this.color = color;
    this.init();
  }

  init() {
    this.container = d3
      .select(this.el)
      .classed("timeline chart-container", true);

    this.empty = this.container
      .append("div")
      .attr("class", "empty-container")
      .text(
        "Clique em uma linha para mostrar a linha do tempo da troca de e-mails"
      );

    this.timeline = this.container.append("div");
    this.header = this.timeline.append("div").attr("class", "timeline-header");
    this.body = this.timeline.append("div").attr("class", "timeline-body");
  }

  render() {
    if (this.link) {
      this.empty.style("display", "none");
      this.timeline.style("display", null);

      const title = this.header
        .selectAll(".timeline-title")
        .data([this.link.source, this.link.target])
        .join((enter) =>
          enter
            .append("div")
            .attr("class", "timeline-title")
            .call((div) =>
              div.append("div").attr("class", "timeline-title__name")
            )
            .call((div) =>
              div
                .append("div")
                .attr("class", "timeline-title__type")
                .style("flex-direction", (d, i) => (i ? "row" : "row-reverse"))
                .call((div) =>
                  div.append("div").attr("class", "timeline-title__type__dot")
                )
                .call((div) =>
                  div.append("div").attr("class", "timeline-title__type__name")
                )
            )
        );
      title.select(".timeline-title__name").text((d) => d.name);
      title
        .select(".timeline-title__type")
        .call((div) =>
          div
            .select(".timeline-title__type__name")
            .text((d) => d.employmentType)
        )
        .call((div) =>
          div
            .select(".timeline-title__type__dot")
            .style("background-color", (d) => this.color(d.employmentType))
        );

      const item = this.body
        .selectAll(".timeline-item")
        .data(this.link.emails)
        .join((enter) =>
          enter
            .append("div")
            .attr("class", "timeline-item")
            .call((div) =>
              div
                .append("div")
                .attr("class", "timeline-item__body")
                .call((div) =>
                  div.append("div").attr("class", "timeline-item__time")
                )
                .call((div) =>
                  div.append("div").attr("class", "timeline-item__subject")
                )
            )
            .call((div) =>
              div
                .append("div")
                .attr("class", "timeline-item__divider")
                .append("div")
                .attr("class", "timeline-item__dot")
            )
        )
        .style("flex-direction", (d) =>
          this.link.source.email === d.from ? "row" : "row-reverse"
        )
        .style("text-align", (d) =>
          this.link.source.email === d.from ? "right" : "left"
        );
      item
        .select(".timeline-item__body")
        .call((div) => div.select(".timeline-item__time").text((d) => d.date))
        .call((div) =>
          div.select(".timeline-item__subject").text((d) => d.subject)
        );
      item
        .select(".timeline-item__dot")
        .style("background", (d) =>
          this.color(
            [this.link.source, this.link.target].find((e) => e.email === d.from)
              .employmentType
          )
        );
    } else {
      this.empty.style("display", null);
      this.timeline.style("display", "none");
    }
  }

  updateLink(link) {
    this.link = link;
    this.render();
  }
}
