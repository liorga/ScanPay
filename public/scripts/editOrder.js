function showToast(text) {
  const toast = document.getElementById('toast');
  toast.className = 'show';
  toast.innerText = text;
  setTimeout(() => {
    toast.className = toast.className.replace('show', '');
  }, 3000);
}

async function getOrder() {
  try {
    const response = await fetch(`/api/order/${window.location.pathname.split('/').at(-1)}`);
    const data = await response.json();
    $('#orderName').val(data.orderName);
    data.items.forEach((item) => $('#myTable').append(`
              <tr>
                  <td>
                      <input type="text" class="w-5 " name="name" disabled value=${item.name}>
                  </td>
                  <td>
                      <input type="text" class="w-5 " name="price" disabled value=${item.price}>
                  </td>
                  <td>            
                      <input type="number" class="count w-25 p-1" min='0' name="qty" value=${item.quantity}>          
                  </td>
                </tr>
              `));
  } catch (err) {
    showToast(err.message);
  }
}

$(document).ready(() => {
  getOrder();

  $('#submit').click(() => {
    const order = [];
    $('input[name="name"]').each(function getItems() {
      order.push({
        name: $(this).val(),
        price: $(this).parent().next().children()[0].value,
        quantity: $(this).parent().next().next()
          .children()[0].value,
      });
    });

    $.ajax({
      url: '/api/order',
      data: {
        orderName: $('#orderName').val(),
        items: JSON.stringify(order),
      },
      type: 'PUT',
      success: () => {
        showToast('order updated');
        window.location.href = '/profile';
      },
      error: (err) => {
        showToast(err.responseText);
      },
    });
  });
});
