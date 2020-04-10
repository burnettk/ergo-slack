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

// this is designed to help debug and increase usability by telling you what the shortcut you initiated is actually doing
function logInUi(logMessage) {
  $('.hot-ui-log-message').remove()
  $(`<div style="float: right; top: 9px; position: relative; right: 2px;" class="hot-ui-log-message">${logMessage}</div>`).insertBefore('.p-top_nav__sidebar')
}

function twoUnreadChannelsAreInView() {
  return $('.p-unreads_view__header').not('.p-unreads_view__header--was_marked').length > 1
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
        logInUi('Marked specific messages unreaded')
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
  return $('.ql-container.focus .ql-editor').length === 0 || $('.ql-container.focus .ql-editor.ql-blank').length
}

var previousBottomMessage = null
var lastShortcutInitiatedAt = null

addEventListener("keydown", function(event) {
  // console.log('keydown', event.code);
  if (event.key === "d") {
    console.log('DEBUG: got d in ergoSlack contentScript.js');

    var shouldPreventDefault = false
    // if not typing a message...
    // if (mainChatInputBoxEmpty() && threadChatInputBoxNotPresentOrEmpty()) {
    if (noTextBoxFocusedOrFocusedTextBoxEmpty()) {
      console.log('no text box focused. proceeding')
      shouldPreventDefault = true

      // the last shortcut action was initiated very recently. suppress this new one to avoid accidental "power clicking"
      if (lastShortcutInitiatedAt && (Math.abs(new Date() - lastShortcutInitiatedAt) < 700)) {
        return;
      }
      lastShortcutInitiatedAt = new Date();

      // if there is a little message at the bottom of a channel on the All Unreads view that says "N new message(s)", click it
      if ($('.c-link--button.p-unreads_view__show_newer').length) {
        $('.c-link--button.p-unreads_view__show_newer').click()
        console.log('DEBUG: clicked N new message(s) link at bottom of channel')
      // if the big "there are new messages" button is at the top of the "All Unreads" page, click it
      } else if ($('#channel_header_unread_refresh').length && !$('#channel_header_unread_refresh.hidden').length) {
        console.log('DEBUG: clicking there are new messages button')
        $('#channel_header_unread_refresh').click()
        logInUi('Refreshed via new messages button at top of All Unreads page')
      // if there is a big "N New Message(s) button in the middle of the All Unreads page, click it
      } else if ($('.p-unreads_view__empty--show_new button').length) {
        console.log('DEBUG: clicking middle N New Message(s) button')
        logInUi('Refreshed by clicking middle New Message(s) button on All Unreads page')
        $('.p-unreads_view__empty--show_new button').click()
      // if there is an "N new message(s) button at the top of the All Unreads page, click it
      } else if ($('.p-classic_nav__channel_header__refresh_button button').length) {
        console.log('DEBUG: clicking top N new message(s) button')
        $('.p-classic_nav__channel_header__refresh_button button').click()
        logInUi('Refreshed by clicking N new message(s) button at top of All Unreads page')
      // if there are unread messages in Threads, go there
      } else if ($('[data-qa-channel-sidebar-link-id=Vall_threads].p-channel_sidebar__link--unread').length === 1 ) {
        console.log('DEBUG: clicking to get unread Threads')
        $('[data-qa-channel-sidebar-link-id=Vall_threads].p-channel_sidebar__link--unread').click()
        setTimeout(function() {
          logInUi('Viewed unread messages in Threads')
        }, 2000);
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
        if (lastMessageInFirstUnreadChannel.length) {
          console.log('DEBUG: got lastMessageInFirstUnreadChannel')
          console.log('DEBUG: lastMessageInFirstUnreadChannel: ', lastMessageInFirstUnreadChannel );
          console.log('DEBUG: lastMessageInFirstUnreadChannel text: ', lastMessageInFirstUnreadChannel.text());

          // if we can see two channel headers that have not been marked read...
          if (twoUnreadChannelsAreInView() || lastMessageInFirstUnreadChannel.text() === previousBottomMessage) {
            // if (isScrolledIntoView(lastMessageInFirstUnreadChannel)) {
            var channelName = $('[data-qa=all_unreads_header_mark_read]').first().closest('.p-unreads_view__header').find('[data-qa=channel_name_header]').text()
            if (channelName !== '') {
              channelName = ' ' + channelName
            }
            $('[data-qa=all_unreads_header_mark_read]').first().click()
            logInUi(`Marked all messages in${channelName} channel read`)
          } else {
            console.log('DEBUG: next unread channel is not in view. scrolling down')
            previousBottomMessage = lastMessageInFirstUnreadChannel.text()
            var hotElement = lastMessageInFirstUnreadChannel[0]
            hotElement.scrollIntoView({
              behavior: "smooth",
              block: "end",
              inline: "nearest"
            });
            var scrollableElement = $('[aria-label="All Unreads, sorted scientifically"] .c-scrollbar__hider')
            if (scrollableElement.length === 1) {
              var htmlElement = scrollableElement[0]
              var currentScrollTop = htmlElement.scrollTop
              var heightOfContainer = $('[aria-label="All Unreads, sorted scientifically"]').height()

              var scrollIt = function() {
                console.log('scrolling');
                logInUi(`Scrolled down by ${heightOfContainer} since next unread channel was not in view`)
                // logInUi(`Scrolled down by ${heightOfContainer} since next unread channel was not in view: ${new Date()}`)
                // logInUi(`Scrolled down`)
                htmlElement.scroll({
                  top: currentScrollTop + heightOfContainer,
                  left: 0,
                  behavior: 'smooth'
                });
              }
              var times = 4;
              for(var i=0; i < times; i++){
                window.setTimeout ( scrollIt, i * 2000);
              }

            } else {
              logInUi('Scrolled down to last message in dom since next unread channel was not in view')
            }
          }
        }

      // if we are not on the "All Unreads" page, go there
      } else if ($('[data-qa-channel-sidebar-link-id=Punreads]').length === 1 ) {
        console.log('DEBUG: not on all unreads page. going there')
        $('[data-qa-channel-sidebar-link-id=Punreads]').click()
        setTimeout(function() {
          logInUi('Went to All Unreads page')
        }, 2000);
      } else {
        console.log('DEBUG: nothing special to do. just let the d keypress go through')
        shouldPreventDefault = false;
      }
    }
    if (shouldPreventDefault) {
      event.preventDefault()
    }
  } // end d keypress
}) // end keydown event listener
