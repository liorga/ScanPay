function showToast(text) {
  const toast = document.getElementById('toast');
  toast.className = 'show';
  toast.innerText = text;
  setTimeout(() => {
    toast.className = toast.className.replace('show', '');
  }, 3000);
}

function newItem(name = '', price = '') {
  return `<div class="input-group row m-1">
            <input type="text" name="name" class="form-control w-50" placeholder="Item" autocomplete="off" required="required" value=${name}>
            <input type="number" min="0" max="1000" name="price" class="form-control w-25" placeholder="Price" autocomplete="off" required="required" value=${price}>
            <div class="input-group-append w-25">
              <button id="removeRow" type="button" class="btn btn-outline-danger">Remove</button>
            </div>
          </div>`;
}

function newWorker() {
  return `<div class="input-group row m-1">
            <input type="email" name="email" class="form-control w-50" placeholder="Worker's email address" required="required">
            <div class="input-group-append w-25">
                <button id="addWorker" type="button" class="btn btn-outline-success">Add</button>
            </div>
          </div>`;
}

$(document).ready(() => {
  $.get('/api/menu', (data, status) => {
    if (status === 'success' && data.length > 0) {
      data.forEach((e) => $('#menu_form').append(newItem(e.name, e.price)));
    }
  });

  $('#logout').on('click', () => {
    document.cookie = 'auth-token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  });

  $('#addItem').click(() => {
    $('#menu_form').append(newItem());
  });

  $('#submit').click(() => {
    if ($('#menu_form')[0].checkValidity()) {
      const menu = [];

      $('input[name="name"]').each(function getItems() {
        menu.push({
          name: $(this).val(),
          price: parseInt($(this).next().val(), 10),
        });
      });

      $.post(
        '/api/menu',
        { items: JSON.stringify(menu) },
        () => {
          showToast('Menu saved');
        },
        'html',
      ).fail((err) => {
        if (err.status === 409) {
          $.ajax({
            url: '/api/menu',
            data: { items: JSON.stringify(menu) },
            type: 'PUT',
            success: () => {
              showToast('Menu updated');
            },
            error: () => {
              showToast('Cant update the menu');
            },
          });
        }
        showToast('Error with saving the menu');
      });
    } else {
      $('#menu_form')[0].reportValidity();
    }
  });

  $('#delete').click(() => {
    $.ajax({
      url: '/api/menu',
      type: 'DELETE',
      success: () => {
        $('#menu_form .input-group.row.m-1').remove();
        showToast('Menu deleted');
      },
      error: () => {
        showToast('Cant delete the menu');
      },
    });
  });

  $(document).on('click', '#removeRow', (e) => {
    e.target.parentElement.parentElement.remove();
  });

  $(document).on('click', '#addWorker', (e) => {
    if ($('#workers')[0].checkValidity()) {
      $.post('/api/user/worker', { email: $(e.target.parentElement).prev().val() }, () => {
        $(e.target).addClass('btn-outline-danger').removeClass('btn-outline-success')[0].innerText = 'Remove';
        $(e.target).attr('id', 'removeWorker');
        $(e.target.parentElement).prev().attr('disabled', 'disabled').removeAttr('required');
        $('#workers').append(newWorker());
      }, 'html')
        .fail((err) => {
          showToast(err.responseText);
        });
    } else {
      $('#workers')[0].reportValidity();
    }
  });

  $(document).on('click', '#removeWorker', (e) => {
    e.target.parentElement.parentElement.remove();
  });
});
