function showToast(text) {
  const toast = document.getElementById('toast');
  toast.className = 'show';
  toast.innerText = text;
  setTimeout(() => {
    toast.className = toast.className.replace('show', '');
  }, 3000);
}
$(document).ready(() => {
  // remove row
  $(document).on('click', '#removeRow', function () {
    $(this).closest('#inputFormRow').remove();
  });

  // submit form
  let order = [];

  $('#submit').click(() => {
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
        items: JSON.stringify(order),
      },
      () => {
        showToast('order sent');
      },
      'html',
    ).fail(() => {
      showToast('Error with sanding the order');
    });

    order = [];
  });

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
      console.log(err.message);
    }
  }
  getMenu();
});
