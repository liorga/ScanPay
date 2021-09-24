$(document).ready(() => {
  const panelOne = $('.form-panel.two').height();
  const panelTwo = $('.form-panel.two')[0].scrollHeight;

  function openRegister(e) {
    e.preventDefault();
    $('.form-toggle').addClass('visible');
    $('.form-panel.one').addClass('hidden');
    $('.form-panel.two').addClass('active');
    $('#login_form')[0].reset();
    $('#login_error')[0].innerText = '';
    $('.form').animate({ height: panelTwo }, 200);
  }

  $('.form-panel.two').not('.form-panel.two.active').on('click', openRegister);

  $('.form-toggle').on('click', (e) => {
    e.preventDefault();
    e.target.classList.remove('visible');
    $('.form-panel.one').removeClass('hidden');
    $('.form-panel.two').removeClass('active');
    $('#register_form')[0].reset();
    $('#reg_error')[0].innerText = '';
    $('.form').animate({ height: panelOne }, 200);
  });

  $('#register').on('click', openRegister);

  $('#login_form').on('submit', (e) => {
    e.preventDefault();
    $.post($(e.target).attr('action'), $(e.target).serialize(), (name) => {
      localStorage.setItem('username', name);
      window.location.href = 'profile';
    }, 'html')
      .fail((err) => {
        if (err.status === 400 || err.status === 401) {
          $('#login_password').val('');
          $('#login_error')[0].innerText = err.responseText;
        }
      });
    return false;
  });

  $('#register_btn').on('click', () => {
    if ($('#register_form')[0].checkValidity()) {
      $.post($('#register_form').attr('action'), $('#register_form').serialize(), () => {
        $('.form-toggle').click();
        $('.form-panel.two').css('background', '#FFD700');
        const toast = document.getElementById('toast');
        toast.className = 'show';
        setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 3000);
      }, 'html')
        .fail((err) => {
          if (err.status === 400) {
            $('#reg_password').val('');
            $('#cpassword').val('');
            $('#reg_error')[0].innerText = err.responseText;
          }
        });
    } else {
      $('#register_form')[0].reportValidity();
    }
    return false;
  });
});

$(() => {
  $('.dropdown-menu a').click((e) => {
    $('.btn:first-child').text($(e.target).text());
    $('.btn:first-child').val($(e.target).text());
  });
});
