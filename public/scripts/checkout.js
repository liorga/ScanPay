function getId() {
  return window.location.pathname.split('/').at(-1);
}

$(document).ready(() => {
  // eslint-disable-next-line no-undef
  const socket = io('http://localhost:3000');
  socket.emit('get-data', getId());
  socket.on('data', (data) => {
    data.forEach((e) => {
      for (let i = 0; i < e.quantity; i += 1) {
        $('#items').append(`<tr>
                              <td>${e.name}</td>
                              <td>${e.price}</td>
                              <td>
                                <input type="checkbox">
                              </td>
                            </tr>`);
      }
    });
  });

  socket.on('user-update', (data) => {
    const cb = $('input[type=checkbox]')[data];
    cb.checked = !cb.checked;
    cb.disabled = !cb.disabled;
  });

  $(document).on('click', 'input[type=checkbox]', (e) => {
    socket.emit('update', getId(), $(e.target).parent().parent().index());
  });
});
