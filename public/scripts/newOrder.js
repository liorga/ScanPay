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
    const response = await fetch('/api/menu');
    const data = await response.json();
    data.forEach((item) => $('#myTable').append(`
              <tr>
                  <td>
                      <input type="text" class="w-5 " name="name" disabled value=${item.name}>
                  </td>
                  <td>
                      <input type="text" class="w-5 " name="price" disabled value=${item.price}>
                  </td>
                  <td>            
                      <input type="number" class="count w-25 p-1" min='0' name="qty" value="0">          
                  </td>
                </tr>
              `));
  } catch (err) {
    showToast(err.message);
  }
}

$(document).ready(() => {
  getMenu();

  $('#submit').click(() => {
    if ($('#order_form')[0].checkValidity()) {
      const order = [];
      $('input[name="name"]').each(function getItems() {
        order.push({
          name: $(this).val(),
          price: $(this).parent().next().children()[0].value,
          quantity: $(this).parent().next().next()
            .children()[0].value,
        });
      });

      $.post(
        '/api/orders', {
          orderName: $('#order').val(),
          items: JSON.stringify(order),
        },
        () => {
          showToast('order sent');
        },
        'html',
      ).fail((err) => {
        showToast(err.responseText);
      });
    } else {
      $('#order_form')[0].reportValidity();
    }
  });
});
