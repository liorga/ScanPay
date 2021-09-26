function showToast(text) {
  const toast = document.getElementById('toast');
  toast.className = 'show';
  toast.innerText = text;
  setTimeout(() => {
    toast.className = toast.className.replace('show', '');
  }, 3000);
}

async function getMenu() {
  try {
    const response = await fetch('/api/order');
    const data = await response.json();

    data.forEach((order) => {
      $('#orders').append(`
        <div class="input-group mb-3">
          <span class="input-group-text w-50" id="orderName">${order.orderName}</span>
          <div class="input-group-append w-50">
            <button id="editOrder" type="button" class="btn btn-outline-primary">Edit</button>
            <button id="closeOrder" type="button" class="btn btn-outline-success">Close</button>
            <button id="deleteOrder" type="button" class="btn btn-outline-danger">Remove</button>
          </div>
        </div>`);
    });
  } catch (err) {
    showToast(err.message);
  }
}

$(document).ready(() => {
  $('#logout').on('click', () => {
    localStorage.removeItem('username');
    document.cookie = 'auth-token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  });

  $('#name_placeholder')[0].innerText = localStorage.getItem('username');

  $(document).on('click', '#deleteOrder', (e) => {
    $.ajax({
      url: '/api/order',
      type: 'DELETE',
      data: { orderName: $(e.target).parent().prev()[0].innerText },
      success: () => {
        $(e.target).parent().parent().remove();
        showToast('Order deleted');
      },
      error: (err) => {
        showToast(err.responseText);
      },
    });
  });

  $(document).on('click', '#editOrder', (e) => {
    window.location.href = `profile/editOrder/${$(e.target).parent().prev()[0].innerText}`;
  });

  $(document).on('click', '#closeOrder', (e) => {
    $.post(
      '/api/order/close',
      { orderName: $(e.target).parent().prev()[0].innerText },
      (res) => {
        $('#qrcode').empty();
        // eslint-disable-next-line
        new QRCode(document.getElementById('qrcode'), res);
        $('#qrurl')[0].innerText = res;
        $('#myModal').modal('show');
      },
      'html',
    ).fail((err) => {
      showToast(err.responseText);
    });
  });

  getMenu();
});
