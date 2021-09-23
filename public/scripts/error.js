$(document).ready(() => {
  $.get('https://v2.jokeapi.dev/joke/Programming', (data, status) => {
    if (status === 'success') {
      if (data.type === 'single') {
        $('#joke')[0].innerText = data.joke;
      } else {
        $('#joke')[0].innerText = `${data.setup} ${data.delivery}`;
      }
    }
  });
});
