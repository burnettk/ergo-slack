// DEBUG: uncomment me
var script = document.createElement("script");
script.src = chrome.extension.getURL("jquery-3.4.1.min.js");
document.body.appendChild(script);

function isScrolledIntoView(elem) {
  var docViewTop = $(window).scrollTop();
  var docViewBottom = docViewTop + $(window).height();

  var elemTop = $(elem).offset().top;
  var elemBottom = elemTop + $(elem).height();

  return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

function logInUi(logMessage) {
  // breaks UI
  // $(`<span>${logMessage}</span>`).insertAfter('.p-classic_nav__channel_header__title')

  // not visible, but meh
  $(`<span class="hot-ui-log-message">${logMessage}</span>`).insertAfter('.p-classic_nav__channel_header__subtitle')
}

function markVisibleMessagesUnread() {
  isScrolledIntoView($('ts-message.message_container_item.message').first())
  var lastVisibleMessage = null
  $('ts-message.message_container_item.message').each(function(ii, element) {
    if (isScrolledIntoView($(element))) {
      lastVisibleMessage = element;
    } else {
      if (lastVisibleMessage) {
        console.log('got one', lastVisibleMessage, lastVisibleMessage.id)
      } else {
        console.log('nada');
      }
      return false;
    }
  }); null

  if (lastVisibleMessage) {
    // open menu for message. this isn't actually possible since you have to hover
    // for the menu to appear. not sure if there's an easy way to simulate a hover.
    console.log('clicking menu')
    $(`#${lastVisibleMessage.id} .btn_msg_action.ts_icon_small_ellipsis`).click()
    setTimeout(function() {
      if ($('.p-message_actions_menu__mark_unread').length === 1) {
        console.log('found button')
        // mark this message unread along with all messages above it
        $('.p-message_actions_menu__mark_unread').click()
        logInUi('s')
      } else {
        console.log('found button')
      }
    }, 1000);
  }
}

function mainChatInputBoxEmpty() {
  return $('#msg_input .ql-editor.ql-blank').length
}

function threadChatInputBoxNotPresentOrEmpty() {
  return $('.p-message_input_field').length === 0 || $('.p-message_input_field .ql-editor.ql-blank').length
}

function noTextBoxFocusedOrFocusedTextBoxEmpty() {
  return $('.ql-editor.focus-ring').length === 0 || $('.ql-editor.focus-ring.ql-blank').length
}

addEventListener("keydown", function(event) {
  // console.log('keydown', event.code);
  if (event.key === "d") {
    console.log('DEBUG: got d in ergoSlack contentScript.js');

    // if not typing a message...
    // if (mainChatInputBoxEmpty() && threadChatInputBoxNotPresentOrEmpty()) {
    if (noTextBoxFocusedOrFocusedTextBoxEmpty()) {
      console.log('no text box focused. proceeding')

      // if the big "there are new messages" button is at the top of the "All Unreads" page, click it
      if ($('#channel_header_unread_refresh').length && !$('#channel_header_unread_refresh.hidden').length) {
        console.log('DEBUG: clicking there are new messages button')
        $('#channel_header_unread_refresh').click()
        logInUi('f')

      // if we are on the "All Unreads" page, mark the first unread channel all read
      } else if ($('[data-qa-channel-sidebar-link-id=Punreads].p-channel_sidebar__link--selected').length === 1) {
        console.log('DEBUG: looking for things to mark unread')
        // markVisibleMessagesUnread()

        var unreadChannels = $('.p-unreads_view__header').not('.p-unreads_view__header--was_marked')
        // .not('.collapsed')

        // special case. if the last unread channel has a jira link, go there, since that is the only way to view the jira content
        if (unreadChannels.length === 1) {
          var jiraLinkSinceItCannotShowStuffHere = $('.message_body .block_kit_error_color_bar span.sk_dark_gray').next('a')
          if (jiraLinkSinceItCannotShowStuffHere.length) {
            jiraLinkSinceItCannotShowStuffHere.first().click()
            event.preventDefault()
            return
          }
        }
        var lastMessageInFirstUnreadChannel = unreadChannels.first().closest('.c-virtual_list__scroll_container').find('[data-qa=message_container]').last()
        console.log('DEBUG: lastMessageInFirstUnreadChannel: ', lastMessageInFirstUnreadChannel );
        console.log('DEBUG: lastMessageInFirstUnreadChannel text: ', lastMessageInFirstUnreadChannel.text());
        if (lastMessageInFirstUnreadChannel.length) {
          console.log('DEBUG: got lastMessageInFirstUnreadChannel')

          // if we can see two channel headers that have not been marked read...
          if ($('.p-unreads_view__header').not('.p-unreads_view__header--was_marked').length > 1) {
          // if (isScrolledIntoView(lastMessageInFirstUnreadChannel)) {
            $('[data-qa=all_unreads_header_mark_read]').first().click()
            logInUi('r')
          } else {
            console.log('DEBUG: next unread channel is not in view. scrolling down')
            var hotElement = lastMessageInFirstUnreadChannel[0]
            hotElement.scrollIntoView({
              behavior: "smooth",
              block: "end",
              inline: "nearest"
            });
          }
        }

      // if we are not on the "All Unreads" page, go there
      } else if ($('[data-qa-channel-sidebar-link-id=Punreads]').length === 1 ) {
        console.log('DEBUG: not on all unreads page. going there')
        $('[data-qa-channel-sidebar-link-id=Punreads]').click()
        setTimeout(function() {
          logInUi('c')
        }, 2000);
      } else {
        console.log('DEBUG: nothing to do, dogg')
      }
    }
  }
})
