export default async function() {
  console.time("initializeAsync");
  await tableau.extensions.initializeAsync({configure: configure});
  console.timeEnd("initializeAsync");

  const dashboard = tableau.extensions.dashboardContent.dashboard;
  console.log(`Dashboard name: ${dashboard.name}`);
  for (const worksheet of dashboard.worksheets) {
    console.log(`Worksheet: ${worksheet.name}`);
    
    for (const ds of await worksheet.getDataSourcesAsync()) {
      console.log(`Data source: ${ds.name}`);
    }
    for (const table of await worksheet.getUnderlyingTablesAsync()) {
      console.log(`Underlying table: ${table.caption} (${table.id})`);
    }
  }
}

function configure() {
  return {};
}

function timeout(ms: number, message = "The operation timed out"): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error(message));
    }, ms);
  });
}