function processData(employeeRecords, emailHeaders) {
  const formatEmail = (email) => email.slice(0, -7);
  // Nodes
  const nodes = employeeRecords.map((d) => ({
    name: `${d.FirstName} ${d.LastName}`,
    employmentType: d.CurrentEmploymentType,
    email: formatEmail(d.EmailAddress),
  }));

  // Links
  const parseTime = d3.timeParse("%-m/%-d/%Y %H:%M");
  const emails = emailHeaders.reduce((emails, d) => {
    return [
      ...emails,
      ...d.To.split(", ")
        .filter((to) => to !== d.From)
        .map((to) => ({
          from: formatEmail(d.From),
          to: formatEmail(to),
          date: d.Date,
          parsedDate: parseTime(d.Date),
          subject: d.Subject,
        })),
    ];
  }, []);
  const linksMap = new Map();
  const grouped = Array.from(
    d3.group(emails, (d) => `${d.from}-${d.to}`),
    ([, emails]) => {
      const d = emails[0];
      return {
        source: d.from,
        target: d.to,
        emails,
      };
    }
  );
  grouped.forEach((d) => {
    const key1 = `${d.source}-${d.target}`;
    const key2 = `${d.target}-${d.source}`;
    let foundKey;
    if (linksMap.has(key1)) foundKey = key1;
    if (linksMap.has(key2)) foundKey = key2;
    if (foundKey) {
      const e = linksMap.get(foundKey);
      e.emails = [...e.emails, ...d.emails];
    } else {
      linksMap.set(key1, d);
    }
  });
  const links = [...linksMap.values()].sort((a, b) =>
    d3.ascending(a.emails.length, b.emails.length)
  );
  links.forEach((d) =>
    d.emails.sort((a, b) => d3.ascending(a.parsedDate, b.parsedDate))
  );

  return {
    nodes,
    links,
  };
}
