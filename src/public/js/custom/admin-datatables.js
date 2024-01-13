// Call the dataTables jQuery plugin
$(document).ready(function() {

  const data = document.getElementById('admin-datatables.js').getAttribute('data');

  let usersColumns = [];
  for (const key in JSON.parse(data).users[0]) usersColumns.push({ data: key, title: key });
  $('#usersTable').DataTable({
    data: JSON.parse(data).users,
    columns: usersColumns
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
