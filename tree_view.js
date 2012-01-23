var TreeItemView = Backbone.View.extend({
    className: "item no_tree_children",
    tagName: "li",
    template: _.template("<div>" +
        "<% if( selectable ) { %><input type='checkbox' <% if( selected ) { %>checked<% } %> /> <% } %>" +
        "<b <% if( onClick ) { %>style='text-decoration:underline'<% } %>><%= title %></b></div>"),

    initialize: function() {
        $(this.el).attr("id", "mi_" + this.model.cid);
        $(this.el).data("model", this.model);

        this.model.bind("change:selectable", this.render, this);
        this.model.bind("change:selected", this.render, this);
        this.render();
    },
    events: {
        "click b": "clicked",
        "click input[type=checkbox]": "toggle_select"
    },
    toggle_select: function(e) {
        var is_selected = $(e.currentTarget).is(":checked");
        this.model.set({"selected": is_selected});
    },
    clicked: function() {
        this.model.trigger("clicked");
    },
    render: function() {
        console.log("rendering item", this.model.cid);
        var html = this.template( this.model.toJSON() );
        $(this.el).html(html);
        this.delegateEvents();
    }
});
var TreeModuleItemView = TreeItemView.extend({
    className: "module_item no_tree_children",

    initialize: function() {
        TreeItemView.prototype.initialize.call(this);
        this.model.bind("change:status", this.render_status, this);
    },
    events: _.extend({},TreeItemView.prototype.events, {
        "click a": "change_status",
    }),
    render: function() {
        TreeItemView.prototype.render.call(this);
        this.render_status();
        this.delegateEvents();
    },
    render_status: function() {
        var el = $(this.el).find("div span.status");
        if( !el.length ) {
            el = $("<span class='status'></span");
            $(this.el).find("div").append( el );
        }

        var template = _.template("Status: <%= status %>, <a href='#'>Change Status</a>");
        var html = template( this.model.toJSON() );
        $(el).html(html);
    },
    change_status: function(e) {
        e.preventDefault();
        this.model.change_status();
    }
});

var FolderView = Backbone.View.extend({
    tagName: "li",
    className: "folder",
    template: _.template("<div class='folder_details'></div><ol class='folder_items'></ol>"),
    children_views: {},

    initialize: function() {
        this.model.bind("change:hidden", this.render_items, this);
        this.model.bind("change:title", this.render_details, this);
        this.model.bind("change:selected", this.render_details, this);

        //create and remove item views when items are added to the folder
        //this is more efficient than creating new views each time we re-render the folder, and it allows us to remove
        //views if the child model is ever removed from the folder
        this.model.get("children").bind("add", function(item) { this.children_views[item.cid] = item.init_view(); }, this);
        this.model.get("children").bind("remove", function(item) { delete this.children_views[item.cid]; }, this);
        this.model.get("children").each(function(item) { this.children_views[item.cid] = item.init_view(); }, this);

        this.model.get("children").bind("add", this.render_items, this);
        this.model.get("children").bind("remove", this.render_items, this);
        this.model.get("children").bind("move", this.render_items, this);

        $(this.el).attr("id", "folder_" + this.model.cid);
        $(this.el).data("model", this.model);
        this.render();
    },
    toggle_hide: function(e) {
        e.preventDefault();
        var is_hidden = this.model.get("hidden");
        this.model.set({ "hidden": !is_hidden });
    },
    render: function() {
        console.log("rendering folder", this.model.cid);

        $(this.el).html( this.template() );

        this.render_details();
        this.render_items();
    },
    render_details: function() {
        /*if( this.model.cid == "c7" ) { debugger; }*/
        var html = _.template(
                "<% if( selectable ) { %><input type='checkbox' <% if( selected == true ) { %>checked<% } %> /> <% } %>" +
                "<b><%= cid %>: <%= title %></b> <a href='#' class='toggle_hide'>Hide</a>", 
                {
                    "cid": this.model.cid,
                    "selectable": this.model.get("selectable"),
                    "selected": this.model.get("selected"),
                    "title": this.model.get("title")
                });
        $(this.el).children(".folder_details").html(html);

        //set the 'indeterminate' property for the selected checkbox if it is mixed
        //this can only be done in JS
        if( this.model.get("selected") == "mixed" ) {
            $(this.el).children(".folder_details").find("input[type=checkbox]").prop("indeterminate", true);
        }

        //bind hide event
        $(this.el).children(".folder_details").find("a.toggle_hide").click($.proxy(function(e) { this.toggle_hide(e); }, this));
        $(this.el).children(".folder_details").find("input[type=checkbox]").click($.proxy(function(e) { 
            var is_selected = $(e.currentTarget).is(":checked");
            this.model.set({"selected": is_selected});
        }, this));
    },
    render_items: function() {
        //get the list that we will be putting our children into
        var ol_el = $(this.el).children("ol.folder_items");

        //if there are any child elements in the folder, do a jQuery detach on them first before wiping the html
        //of the list; this will preserve any events that were bound on the child views els
        $(ol_el).children("li").detach();

        //wipe the list
        $(ol_el).html("");

        if( this.model.get("hidden") ) {
            return true;
        }

        this.model.get("children").each(function(child) {
            var view = this.children_views[child.cid]; //get the view from the dictionary of views
            ol_el.append( view.el );
        }, this);

    }
});

var TreeView = FolderView.extend({
    tagName: "div",
    className: "tree",
    template: _.template("<ol class='folder_items sortable'></ol>"),
    initialize: function() {
        FolderView.prototype.initialize.call(this);

        //set sorting and bind for property updates
        this.model.bind("change:sortable", this.set_sorting, this);
    },
    render: function() {
        FolderView.prototype.render.call(this);
        this.set_sorting();
    },
    set_sorting: function() {
        if( !this.model.get("sortable") ) {
            $(this.el).children("ol").nestedSortable("destroy");
            return true;
        }

        var tree_view = this;
        $(this.el).children("ol").nestedSortable({
            disableNesting: 'no_tree_children',
            forcePlaceholderSize: true,
            handle: 'div',
            helper:	'clone',
            items: 'li',
            maxLevels: 30,
            opacity: .6,
            placeholder: 'placeholder',
            revert: 250,
            tabSize: 25,
            tolerance: 'pointer',
            toleranceElement: '> div',
            revertOnError: 0,

            start: function(event, ui) {
                var start_pos = ui.item.index();
                ui.item.data('start_pos', start_pos);

                var start_parent = ui.item.parent("ol").parent("li").data("model");
                if( !start_parent ) { start_parent = tree_view.model; }
                ui.item.data('start_parent', start_parent);
            },
            update: function(event, ui) {
                var item = ui.item.data("model");

                var end_parent = ui.item.parent("ol").parent("li").data("model");
                if( !end_parent ) { end_parent = tree_view.model; }
                var start_parent = ui.item.data('start_parent');

                var start_pos = ui.item.data('start_pos');
                var end_pos = $(ui.item).index();

                if( start_parent != end_parent ) {
                    start_parent.remove(item);
                    end_parent.add(item, end_pos );
                    console.log("Removing item", item.get("title"), "from", start_parent.get("title"), "adding to", end_parent.get("title"), "at", end_pos);
                } else if( start_pos != end_pos ) {
                    start_parent.move(item, end_pos);
                    console.log("Moving item", item.get('title'), "to position", end_pos, "in parent", start_parent.get("title"));
                }
            }
        });
    }

});

///// STATUS STUFF ////

var StatusFolderView = FolderView.extend({
    initialize: function() {
        FolderView.prototype.initialize.call(this);
        this.model.bind("change:status", this.render_details, this);
    },
    render_details: function() {
        var html = _.template("<b><%= cid %>: <%= title %></b> Status: <%= status %><a href='#' class='toggle_hide'>Hide</a><a href='#' class='change_status'>Change Status<a/>", {
            "cid": this.model.cid,
            "title": this.model.get("title"),
            "status": this.model.get("status")
        });
        $(this.el).find(".folder_details").html(html);

        //bind hide event
        $(this.el).children(".folder_details").find("a.toggle_hide").click($.proxy(function(e) { this.toggle_hide(e); }, this));
        $(this.el).children(".folder_details").find("a.change_status").click($.proxy(function(e) { this.change_status(e); }, this));
    },
    change_status: function(e) {
        e.preventDefault();
        var new_status = next_status( this.model.get("status") );
        this.model.set({"status": new_status});
    }
});

