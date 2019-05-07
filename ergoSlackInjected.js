 function triggerKeyboardEventOnDocument(event, keyCode){
    var script = document.createElement('script');

    script.textContent = '(' + function(event, charCode) {

        //Create Event
        var event = new Event(event, {"bubbles":true, "cancelable":true});

        // Define custom values
        // This part requires the script to be run in the page's context
        var getterCode = {get: function() {return charCode}};
        var getterChar = {get: function() {return String.fromCharCode(charCode)}};
        Object.defineProperties(event, {
          charCode: getterCode,
          which: getterCode,
          keyCode: getterCode, // Not fully correct
          key: getterChar,     // Not fully correct
          char: getterChar
        });
        document.dispatchEvent(event);
      } + ')(' + '\"' + event + '\", '+ keyCode + ')';

    (document.head||document.documentElement).appendChild(script);
    script.parentNode.removeChild(script);
  }

function hotTriggerKeyEvent(element, charCode) {
    // We cannot pass object references, so generate an unique selector
    var attribute = 'robw_' + Date.now();
    element.setAttribute(attribute, '');
    var selector = element.tagName + '[' + attribute + ']';

    var s = document.createElement('script');
    s.textContent = '(' + function(charCode, attribute, selector) {
        // Get reference to element...
        var element = document.querySelector(selector);
        element.removeAttribute(attribute);

        // Create KeyboardEvent instance
        var event = document.createEvent('KeyboardEvents');
        event.initKeyboardEvent(
            /* type         */ 'keydown',
            /* bubbles      */ true,
            /* cancelable   */ false,
            /* view         */ window,
            /* keyIdentifier*/ '',
            /* keyLocation  */ 0,
            /* ctrlKey      */ false,
            /* altKey       */ false,
            /* shiftKey     */ false,
            /* metaKey      */ false,
            /* altGraphKey  */ false
        );
        // Define custom values
        // This part requires the script to be run in the page's context
        var getterCode = {get: function() {return charCode}};
        var getterChar = {get: function() {return String.fromCharCode(charCode)}};
        Object.defineProperties(event, {
            charCode: getterCode,
            which: getterChar,
            keyCode: getterCode, // Not fully correct
            key: getterChar,     // Not fully correct
            char: getterChar
        });

        element.dispatchEvent(event);
    } + ')(' + charCode + ', "' + attribute + '", "' + selector + '")';

    console.log('text content: ' + s.textContent);

    (document.head||doc.documentElement).appendChild(s);
    s.parentNode.removeChild(s);
}

function hotterKeypress() {
    var evt = document.createEvent("KeyboardEvent");
  //Chrome hack
  Object.defineProperty(evt, 'keyCode', {
      get : function(){
          return this.keyCodeVal;
      }
  });
  Object.defineProperty(evt, 'which', {
      get : function(){
          return this.keyCodeVal
      }
  });
  Object.defineProperty(evt, 'charCode', {
      get : function(){
          return this.charCodeVal
      }
  });
  //initKeyBoardEvent seems to have different parameters in chrome according to MDN KeyboardEvent(sorry, can't post more than 2 links), but that did not work either
  evt.initKeyboardEvent("keypress",
      true,//bubbles
      true,//cancelable
      window,
      false,//ctrlKey,
      false,//altKey,
      false,//shiftKey,
      false,//metaKey,
      114, //keyCode,
      114 //charCode
  );
}

function isScrolledIntoView(elem) {
  var docViewTop = $(window).scrollTop();
  var docViewBottom = docViewTop + $(window).height();

  var elemTop = $(elem).offset().top;
  var elemBottom = elemTop + $(elem).height();

  return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
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
    // open menu for message
    console.log('clicking menu')
    $(`#${lastVisibleMessage.id} .btn_msg_action.ts_icon_small_ellipsis`).click()
    setTimeout(function() {
      if ($('.p-message_actions_menu__mark_unread').length === 1) {
        console.log('found button')
        // mark this message unread along with all messages above it
        $('.p-message_actions_menu__mark_unread').click()
        $("<span>s</span>").insertAfter('#channel_name')
      } else {
        console.log('found button')
      }
    }, 1000);
  }
}

addEventListener("keydown", function(e) {
  // console.log('keydown', e.code);
  if (e.key === "d") {
    console.log('got d in ergoSlackInjected.js');

    // if not typing a message...
    if ($('#msg_input .ql-editor.ql-blank').length) {

      // if the big "there are new messages" button is at the top of the "All Unreads" page, click it
      if ($('#channel_header_unread_refresh').length && !$('#channel_header_unread_refresh.hidden').length) {
        $('#channel_header_unread_refresh').click()
        $("<span>f</span>").insertAfter('#channel_name')

      // if we are on the "All Unreads" page, mark the first unread channel all read
      } else if ($('.p-channel_sidebar__link--all-unreads.p-channel_sidebar__link--selected.p-channel_sidebar__link--unread').length === 1) {
        console.log('looking for things to mark unread')
        // markVisibleMessagesUnread()
        //
        var unreadChannels = $('.unread_group').not('.marked_as_read').not('.collapsed')

        // special case. if the last unread channel has a jira link, go there, since that is the only way to view the jira content
        if (unreadChannels.length === 1) {
          var jiraLinkSinceItCannotShowStuffHere = $('.message_body .block_kit_error_color_bar span.sk_dark_gray').next('a')
          if (jiraLinkSinceItCannotShowStuffHere.length) {
            jiraLinkSinceItCannotShowStuffHere.first().click()
            return
          }
        }
        var lastMessageInFirstUnreadChannel = unreadChannels.first().find('.message').last()
        console.log('lastMessageInFirstUnreadChannel: ',lastMessageInFirstUnreadChannel );
        if (lastMessageInFirstUnreadChannel.length) {
          if (isScrolledIntoView(lastMessageInFirstUnreadChannel)) {
            console.log('in view')
            $('.unread_group_mark').first().click()
            $("<span>r</span>").insertAfter('#channel_name')
          } else {
            console.log('not in view. scrolling')
            console.log('lastMessageInFirstUnreadChannel: ',lastMessageInFirstUnreadChannel[0].id );
            document.querySelector(`#${lastMessageInFirstUnreadChannel[0].id}`).scrollIntoView({
              behavior: "smooth",
              block: "end",
              inline: "nearest"
            });
          }
        }

      // if we are not on the "All Unreads" page, go there
      } else if ($('.p-channel_sidebar__link--all-unreads.p-channel_sidebar__link--unread').length === 1 ) {
        $('.p-channel_sidebar__link--all-unreads.p-channel_sidebar__link--unread').click()
        setTimeout(function() {
          $("<span>c</span>").insertAfter('#channel_name')
        }, 2000);
      }
    }
    return

    var rKey = 114;
    triggerKeyboardEventOnDocument("keydown",rKey);
    triggerKeyboardEventOnDocument("keyup",rKey);
    triggerKeyboardEventOnDocument("keypress",rKey);
    console.log('hey2ay');

    // chrome.runtime.sendMessage({ pressEnter: true });

    console.log(e.code); // never gets here
    document.dispatchEvent(new KeyboardEvent('keypress',{'key':'r'}));
    hotTriggerKeyEvent(document.body, rKey);
    hotterKeypress()
    console.log('fired r key'); // never gets here
  }
})

