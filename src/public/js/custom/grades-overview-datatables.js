// Call the dataTables jQuery plugin
$(document).ready(function() {

  const data = JSON.parse(document.getElementById('grades-overview-datatables.js').getAttribute('data'));
  const term = location.search !== "" ? location.search.match(new RegExp("[?&]term=([^&]+)(&|$)"))[1] : null;

  function sanitizeData(data) {
    var d = [];
    Object.keys(data).forEach(function(key) {
      d.push(data[key]);
    });
    return d;
  }

  $('#overviewTable').DataTable({
    paging: false,
    info: false,
    searching: false,
    data: sanitizeData(data),
    columns: [
      {
        data: 'class.title',
        title: "Subject"
      }, {
        data: 'termGrade',
        title: "Grade",
        render: (termGrade, type, row) => {
          let termQuery = term !== null ? `?term=${term}` : '';
          if (type === 'display') return `<a href="/grades/class/${row['classId']+termQuery}" class="btn btn-${termGrade.style} btn-circle">${termGrade.letter}</a> ${termGrade.average !== "" ? termGrade.average + "%" : ""}`;
          return termGrade.average;
        }
      }, {
        data: 'teacher',
        title: "Instructor",
        render: (teacher, type, row) => {
          return `${teacher.lastName}, ${teacher.firstName}`;
        }
      }
    ]
  });


});
