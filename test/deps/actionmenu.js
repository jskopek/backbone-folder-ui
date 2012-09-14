(function($) {
    $.fn.extend({
        "actionmenu": function(options, key, value) {

            //user can specify complete set of options ({ 'actions': ...., 'current_action': ... })
            //or may update a sepcific option in the following fashion
            //$().actionmenu("option", "current_action", "edit");
            if( options == "option" ) {
                var options = this.data("actionmenu").options;
                options[key] = value;
                this.trigger("actionmenuchanged", options.current_action);
                return true;
            }

            //set up default options
            this.options = $.extend({
                "actions": {},
                "current_action": undefined
            }, options);


            this.launch_menu = function(e) {
                e.preventDefault();
                e.stopPropagation();

                //removes any other status lists
                $(".actionmenu_popup").remove();

                //create popup
                var template = _.template("<div class='actionmenu actionmenu_popup'>" +
                        "<div class='options'>" +
                            "<span class='close'>x</span>" +
                                    "<% _.each(action_groups, function(group) { %>" +
                                        "<div class='group'><%= group.group %></div>" +
                                        "<% _.each(group.items, function(item) { %>" +
                                            "<div href='#' class='option <%= item.id %>' group='<%= group.group %>' instant='<%= item.instant %>' status='<%= item.id %>'><%= item.title || item.id %><% if( item.description ) { %><span>- <%= item.description %></span><% } %></div>" +
                                        "<% }); %>" +
                                    "<% }); %>" +
                        "</div>" +
                "</div>");

                var status_list_html = template({ "action_groups": this.options.actions });
                var actionmenu = $(status_list_html);

                var top_pos = $(this).offset().top, left_pos = $(this).offset().left
                actionmenu.css("top", top_pos);
                actionmenu.css("left", left_pos);
                $("body").append(actionmenu);
                

                //calculate if the popup dialog is off screen; if so, move it up until it is on screen
                //this must be done after the element is added to the page, as its height cannot be calculated before
                //the status_list_bottom_pos is calculated relative to the top of the window, not the document
                //i.e. the scrollbar position should not affect the status_list_bottom_pos value
                //add 5px buffer
                var status_list_bottom_pos = $(actionmenu).height() + $(actionmenu).offset().top - $(window).scrollTop() + 5;
                var num_offscreen_pixels = status_list_bottom_pos - $(window).height();
                if( num_offscreen_pixels > 0 ) {
                    top_pos -= num_offscreen_pixels;

                    //ensure that top does not go off screen
                    if( (top_pos - $(window).scrollTop()) < 0 ) {
                        top_pos = $(window).scrollTop();
                    }

                    actionmenu.css("top", top_pos);
                }

                //highlight current status
                actionmenu.find("[status=" + this.options.current_action + "]").addClass('current');

                //trigger status change event when user clicks status element
                $(actionmenu).find("div.option").bind('click', $.proxy(function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    var el = $(e.currentTarget);
                    var action = el.attr("status");

                    if( !el.attr("instant") ) {
                        this.options.current_action = action;
                    }

                    this.trigger("actionmenuclicked", action, el);
                    this.trigger("actionmenuchanged", action, el);

                    this.trigger("leave");
                }, this));

                this.bind("leave", function() { $(".actionmenu_popup").remove(); });
                $(window).bind("click",$.proxy(function(event) { this.trigger("leave"); }, this));
            }           


            //initialize
            $(this).addClass("actionmenu actionmenu_button");
            if( this.options.actions.length ) {
                $(this).addClass("modifiable");
                $(this).bind('click', $.proxy(this.launch_menu, this));
            }
            $(this).html("<div href='#' class='option'>Actions</div>");

            //show the current action in the action button
            this.render_current_action = function() {
                $(this).children(".option").attr("status", this.options.current_action );
            }
            this.render_current_action();
            $(this).bind("actionmenuchanged", $.proxy(this.render_current_action, this));


            $(this).data("actionmenu", this);
        }
    });
})(jQuery);


