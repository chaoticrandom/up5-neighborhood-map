//requires: data.js

//paged function extends each ko subscribable
//in viewmodel it is used for pagination of computed array of places
ko.subscribable.fn.paged = function(perPage){
    var items = this;
    //current page
    items.current = ko.observable(1);
    //total pages count  = array.length / perPage, rounded to biggest value
    //for example, 17 places / 4 places per page = 5 pages totally
    items.pages = ko.computed(function(){
        var length = this().length;
        var count = Math.ceil(length / perPage);
        var pages = [];
        var i;
        //logic for displaying page number buttons in pagination menu
        //I decided to display 3 numbered buttons (previous and next included as well)
        //when current page changes, "pages" array will be filled with corresponding numbers
        //it's not so elegant, but optimization is an infinite process... =)
        if ((this.current() > 1) && (this.current() <= count)) {
          if (this.current() < count) {
            for (i = this.current() - 1; i <= this.current() + 1; i++) {
              if ((this.current() <= count) && (i <= count))
                pages.push(i);
            }
          }
          else {
            for (i = this.current()-2; i <= this.current(); i++) {
              if (i >= 1)
                pages.push(i);
            }
          }
        }
        else {
          for (i = this.current(); i <= this.current() + 2; i++) {
            if (i <= count)
              pages.push(i);
          }
        }
        return pages;
    },items);
    items.perPage = perPage;
    //currently paged items
    items.pagedItems = ko.computed(function(){
        var pg = this.current(),
            start = this.perPage * (pg-1),
            end = start + this.perPage;
        return this().slice(start,end);
    }, items);
    //function to switch css class of active page
    items.activePage = function(num) {
      return this.current() === num ? "active item" : "item";
    }.bind(this);
    //go to next page
    items.next = function(){
        if(this.next.enabled())
            this.current(this.current()+1);
    }.bind(this);
    //check if "next" button should be enabled
    items.next.enabled = ko.computed(function(){
        return this().length > this.perPage * this.current();
    },items);
    //go to previous page
    items.prev = function(){
        if(this.prev.enabled())
            this.current(this.current()-1);
    }.bind(this);
    //check if "previous" button should be enabled
    items.prev.enabled = ko.computed(function(){
        return this.current() > 1;
    },items);
    //select page from pagination menu
    items.select = function(num){
      this.current(num);
    }.bind(this);

    return items;
};
//custom binding to toggle boolean value
ko.bindingHandlers.toggle = {
    init: function (element, valueAccessor) {
        var value = valueAccessor();
        ko.applyBindingsToNode(element, {
            click: function () {
                value(!value());
            }
        });
    }
};
//custom binding to init ko checked binding and temporary add disabled attribute to element
//I used this binding to avoid multiple user clicks on checkbox which led to wrong behaviour
//of markers animation
ko.bindingHandlers.toggleAndDelay = {
  init: function(element, valueAccessor) {
    ko.bindingHandlers.checked.init(element, valueAccessor);
    $(element).on('click', function() {
      $(element).prop('disabled', true);
      setTimeout(function() {
        $(element).prop('disabled', false);
      }, 1000);
    });
  }
};
//simple stringStartWith function
ko.utils.stringStartsWith = function (string, startsWith) {
    string = string || '';
    if (startsWith.length > string.length)
        return false;
    return string.substring(0, startsWith.length) === startsWith;
};
