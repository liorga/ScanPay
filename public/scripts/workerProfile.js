$(document).ready(() => {
  $('#logout').on('click', () => {
    document.cookie = 'auth-token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  });
});
