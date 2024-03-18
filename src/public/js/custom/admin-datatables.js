// Call the dataTables jQuery plugin
$(document).ready(function() {

  const data = document.getElementById('admin-datatables.js').getAttribute('data');

  let usersColumns = [];
  for (const key in JSON.parse(data).users[0]) usersColumns.push({ data: key, title: key });
  $('#usersTable').DataTable({
    data: JSON.parse(data).users,
    columns: usersColumns
  });

  let settingsColumns = [];
  for (const key in JSON.parse(data).settings[0]) settingsColumns.push({ data: key, title: key });
  $('#settingsTable').DataTable({
    data: JSON.parse(data).settings,
    columns: settingsColumns
  });

  let updaterdatasColumns = [];
  for (const key in JSON.parse(data).updaterdatas[0]) updaterdatasColumns.push({ data: key, title: key });
  $('#updaterdatasTable').DataTable({
    data: JSON.parse(data).updaterdatas,
    columns: updaterdatasColumns
  });

  let sessionsColumns = [];
  for (const key in JSON.parse(data).sessions[0]) sessionsColumns.push({ data: key, title: key });
  $('#sessionsTable').DataTable({
    data: JSON.parse(data).sessions,
    columns: sessionsColumns
  });

  let rateLimitsColumns = [];
  for (const key in JSON.parse(data).rateLimits[0]) rateLimitsColumns.push({ data: key, title: key });
  $('#rateLimitsTable').DataTable({
    data: JSON.parse(data).rateLimits,
    columns: rateLimitsColumns
  });

});
