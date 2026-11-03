/* Javascript for the Copy Text module */

(function ($) {
  Backdrop.behaviors.copyTextIcon = {
    attach: function (context, settings) {
      const copyIconSVG = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>`;

      const checkIconSVG = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>`;

      // Cross-browser copy function (handles HTTPS & HTTP fallback)
      function copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
          return navigator.clipboard.writeText(text);
        } else {
          return new Promise(function (resolve, reject) {
            const $textarea = $('<textarea>')
              .val(text)
              .css({ position: 'fixed', left: '-9999px', top: '0' })
              .appendTo('body');

            $textarea.select();

            try {
              const successful = document.execCommand('copy');
              $textarea.remove();
              if (successful) resolve();
              else reject(new Error('execCommand copy failed'));
            } catch (err) {
              $textarea.remove();
              reject(err);
            }
          });
        }
      }

      // Ensure global tooltip element exists in body.
      if (!$('#copy-inline-tooltip').length) {
        $('body').append('<div id="copy-inline-tooltip" class="copy-inline-tooltip" aria-live="polite"></div>');
      }
      const $tooltip = $('#copy-inline-tooltip');

      $('.copy-text', context).each(function () {
        const $span = $(this);

        // Standard Backdrop pattern: prevent duplicate processing using a
        // '*-processed' class
        if ($span.hasClass('copy-text-processed')) {
          return;
        }
        $span.addClass('copy-text-processed');

        const $btn = $('<button>', {
          type: 'button',
          class: 'copy-btn',
          title: Backdrop.t('Copy to clipboard'),
          html: copyIconSVG
        });

        $span.after($btn);

        $btn.on('click', function () {
          const textToCopy = $.trim($span.text());

          copyToClipboard(textToCopy)
            .then(function () {
              $btn.html(checkIconSVG).addClass('copied');

              const message = Backdrop.t('Copied');
              $tooltip.text(message);

              // Position tooltip relative to viewport right next to icon
              const btnOffset = $btn.offset();
              const btnWidth = $btn.outerWidth();
              const btnHeight = $btn.outerHeight();
              const scrollTop = $(window).scrollTop();
              const scrollLeft = $(window).scrollLeft();

              $tooltip.css({
                top: (btnOffset.top - scrollTop + (btnHeight / 2)) + 'px',
                left: (btnOffset.left - scrollLeft + btnWidth + 8) + 'px'
              }).addClass('show');

              if (typeof Backdrop.announce === 'function') {
                Backdrop.announce(message);
              }

              setTimeout(function () {
                $btn.html(copyIconSVG).removeClass('copied');
                $tooltip.removeClass('show');
              }, 2000);
            })
            .catch(function (err) {
              console.error('Failed to copy text: ', err);
            });
        });
      });
    }
  };
})(jQuery);
