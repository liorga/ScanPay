function showToast(text) {
  const toast = document.getElementById('toast');
  toast.className = 'show';
  toast.innerText = text;
  setTimeout(() => {
    toast.className = toast.className.replace('show', '');
  }, 3000);
}

function getId() {
  return window.location.pathname.split('/').at(-1);
}

function makeId(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

let totalPrice = 0;

$(document).ready(() => {
  // eslint-disable-next-line no-undef
  const socket = io('localhost');
  socket.emit('get-data', getId());

  if (sessionStorage.getItem('id') === null) {
    sessionStorage.setItem('id', makeId(15));
  }

  socket.on('data', (data) => {
    data.forEach((e) => {
      const checked = e.user == null ? '' : 'checked';
      const disabled = e.paid || (checked !== '' && sessionStorage.getItem('id') !== e.user) ? 'disabled' : '';
      $('#items').append(`<tr>
                              <td>${e.name}</td>
                              <td>${e.price}</td>
                              <td>
                                <input type="checkbox" ${checked} ${disabled}>
                              </td>
                            </tr>`);
    });
    $('input[type=checkbox]:checked').each((i, el) => {
      if (!el.disabled) totalPrice += parseInt($(el).parent().prev()[0].innerText, 10);
    });
    $('#totalPrice').text(totalPrice);
  });

  socket.on('user-update', (data) => {
    const cb = $('input[type=checkbox]')[data];
    cb.checked = !cb.checked;
    cb.disabled = !cb.disabled;
  });

  $(document).on('click', 'input[type=checkbox]', (e) => {
    if ($(e.target)[0].checked) {
      totalPrice += parseInt($(e.target).parent().prev()[0].innerText, 10);
    } else {
      totalPrice -= parseInt($(e.target).parent().prev()[0].innerText, 10);
    }
    $('#totalPrice').text(totalPrice);
    socket.emit('update', getId(), $(e.target).parent().parent().index(), sessionStorage.getItem('id'), $(e.target)[0].checked);
  });

  $('#pay').click(() => {
    const indexes = [];
    $('input[type=checkbox]').each((i, el) => {
      if (el.checked && !el.disabled) indexes.push(i);
    });

    if (indexes.length > 0) {
      socket.emit('payment', getId(), indexes);
      $('input[type=checkbox]:checked').attr('disabled', 'true');
      showToast('Thank you for using our service :)');
      totalPrice = 0;
      $('#totalPrice').text(totalPrice);
    } else {
      showToast('You need to select an item');
    }
  });
});
