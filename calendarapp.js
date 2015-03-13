if (Meteor.isClient) {

  // DIALOG

  Template.dialog.events({
    'click .closeDialog': function(event, template){
      Session.set('editing_event',null);
    }
    // 'click .updateTitle':function(evt,tmpl){
    //   var title = tmpl.find('#title').value;
    //   Meteor.call('updateTitle',Session.get('editing_event'),title);
    //   Session.set('editing_event',null);
    // }
  });

  Template.dialog.helpers({
    title: function(){
      var ce = CalEvent.findOne({_id:Session.get('editing_event')});
      ceID = ce._id;
      return ce.title;
    },
    description: function(){
      var ce = CalEvent.findOne({_id:Session.get('editing_event')});
      return ce.description;
    },
    start: function(){
      var ce = CalEvent.findOne({_id:Session.get('editing_event')});
      return ce.eventStart;
      //return ce.start;
      // console.log(this);
    },
    end: function(){
      var ce = CalEvent.findOne({_id:Session.get('editing_event')});
      return ce.eventEnd;
    }
  });

  Template.dialog.rendered = function(){
    if(Session.get('editDialog')){
      var calevent = CalEvent.findOne({_id:Session.get('editDialog')});
      if(calevent){
        $('#title').val(calevent.title);
        $('#description').val(calevent.description);
      }
    }
  }
// ========== Search Source ===============

  var options = {
  keepHistory: 1000 * 60 * 5,
  localSearch: true
  };

  var fields = ['eventTitle', 'description'];

  eventSearch = new SearchSource('calevent', fields, options);



  Template.searchResult.helpers({
    getEvents: function() {
      return eventSearch.getData({
        transform: function(matchText, regExp) {
          return matchText.replace(regExp, "<b>$&</b>")
        },
        sort: {isoScore: -1}
      });
    },

    isLoading: function() {
      return eventSearch.getStatus().loading;
    }
  });

  Template.searchResult.rendered = function() {
    eventSearch.search('');
  };

  Template.search.events({
    "keyup #search-box": _.throttle(function(e) {
      var text = $(e.target).val().trim();
      eventSearch.search(text);
    }, 200)
  });

  Template.chat.helpers({
    chatLog:function(){
      // console.log(modalID);
      //modalID:modalID
      x = ceID;
      return Chatter.find({modalID:x}, {sort:{timestamp: 1}});
      
    },
    userName: function(){
      console.log(this);
      return this.user.emails[0].address;
    }
  });

  Template.chat.events({
      'keypress input': function(e) {
        if(e.keyCode != 13)
          return;

        var message = document.getElementById("chat-box").value;

        if(message.length == 0)
          return;

        Meteor.call("newMessage", message, ceID);
        document.getElementById("chat-box").value = "";
      }
  });


//=========================================
  // DIALOG




  Template.main.helpers({
    // addresses: function(){
    //   return Addresses.find();
    // },
    editing_event: function(){
      return Session.get('editing_event');
    }
  });
 

  Template.main.rendered = function(){
    $(document).ready(function() {
        var calendar = $('#calendar').fullCalendar({
          //input for API key from user
            googleCalendarApiKey: 'AIzaSyA0uxTs_BpYPrCEa7K8bG_lsMWlrEMUCcc',
            events: {
                googleCalendarId: 'slugcal@gmail.com',
                color: 'darkred',
                borderColor: 'black',
                className: 'noDec'
            },
            header: {
              left:   'prev',
              center: 'title',
              right:  'next',
            },
            // console.log(document);

            eventClick: function(calevent) {
              Session.set('editing_event', calevent._id);

              if (calevent.url){
                return false;
              }
            },

            eventMouseover: function(calEvent, jsEvent, view, date) {
              console.log(calendar);
              // change the day's background color just for fun
              $(this).css('background-color', 'red');


              // Session.set('editing_event', event._id);

              // var description = event.description;
              // var start = event.start; //start index 16 + 4

              // //bool if allDay true then no time
              // var allDay = event.allDay;
              // var calID = event.source.googleCalendarId;
              // var diaTitle = event.title.val;
              // console.log(diaTitle);
              console.log(event);
            },  
            eventAfterAllRender: function(view) {
              cal = calendar.fullCalendar('clientEvents');
              var calObj = JSON.stringify(cal);
              // console.log("XXX"+calObj);

              calStart = [];
              calEnd = [];

              cal.forEach(function(item) {
                eventStart = item.start._d;
                eventEnd = item.end._d;
                eventID = item._id;
                // calStart.push(item.start._d);
                // calEnd.push(item._end._d)
                CalEvent.update({_id:item._id}, {$set:{"eventStart":item.start._d}});
                CalEvent.update({_id:item._id}, {$set:{"eventEnd":item.end._d}});
                
                // CalEvent.push(eventStart);
                CalEvent.insert(item);
              })
              // CalEvent.insert(c);
              // calLength = cal.length;
              // Meteor.call('allRender', cal);
              // return calendarEvents;

            }
        });
    });
  //   var calendar = $('#calendar').fullCalendar({
  //     eventClick: function(calEvent){
  //       console.log(cal2);
  //     }

  //   });
  
   }
}