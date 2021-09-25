$(document).ready(() => {
  $('#logout').on('click', () => {
    document.cookie = 'auth-token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  });

  async function getMenu() {
    try {
      const response = await fetch('/api/orders');
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
      // eslint-disable-next-line no-console
      console.log(err.message);
    }
  }
  getMenu();
});
