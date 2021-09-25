$(document).ready(() => {
  $('#logout').on('click', () => {
    document.cookie = 'auth-token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  });

  async function getMenu() {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();

      console.log(data);
      data.forEach((order) => {
        order.items.forEach((item) => {
          $('#orders').append(`


              <tr>
                  order
                  <td>
                      <input type="text" class="w-5 " name="name" disabled value=${item.name}>
                  </td>

                  <td>
                      <input type="text" class="w-5 " name="price" disabled value=${item.price}>
                  </td>

                  <td>
              
                      <input type="number" class="count w-5 " min='0' disabled name="qty" value=${item.quantity}>
              
                  </td>

                </tr>
              `);
        });
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err.message);
    }
  }
  getMenu();
});
