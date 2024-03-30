const data = document.getElementById('home.js').getAttribute('data');
const email = data.split('').reverse().join('');

document.getElementById("emailfill").innerHTML = `<a href="mailto:${email}">${email}</a>`;
