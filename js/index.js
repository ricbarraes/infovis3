Promise.all([
  d3.csv("data/EmployeeRecords.csv"),
  d3.csv("data/EmailHeaders.csv"),
]).then(([employeeRecords, emailHeaders]) => {
  const graph = processData(employeeRecords, emailHeaders);

  const dispatch = d3.dispatch(
    "mincountchange",
    "showemailstimeline",
    "hideemailstimeline"
  );

  // Min emails count control
  const minCountControl = d3
    .select("#min-count-control")
    .attr(
      "max",
      d3.max(graph.links, (d) => d.emails.length)
    )
    .on("change", (event) => {
      const count = event.currentTarget.valueAsNumber;
      d3.select("#min-count").text(count);
      dispatch.call("mincountchange", null, count);
    });

  const color = d3
    .scaleOrdinal()
    .domain([...new Set(graph.nodes.map((d) => d.employmentType))])
    .range(["#7F3C8D", "#11A579", "#3969AC", "#F2B701", "#E73F74", "#80BA5A"]);

  const network = new Network({
    el: document.querySelector("#network"),
    data: graph,
    color,
    dispatch,
  });

  const timeline = new Timeline({
    el: document.querySelector("#timeline"),
    color,
  });

  dispatch
    .on("mincountchange", (count) => {
      network.updateMinCount(count);
    })
    .on("showemailstimeline", (link) => {
      timeline.updateLink(link);
    })
    .on("hideemailstimeline", () => {
      timeline.updateLink();
    });

  minCountControl.dispatch("change");
});
