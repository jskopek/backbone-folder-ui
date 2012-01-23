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
        this.model.get("children").bind("add", function(item) { this.children_views[item.cid] = this.initialize_item_view(item); }, this);
        this.model.get("children").bind("remove", function(item) { delete this.children_views[item.cid]; }, this);
        this.model.get("children").each(function(item) { var view_class = item.get("view_class"); this.children_views[item.cid] = this.initialize_item_view(item); }, this);

        this.model.get("children").bind("add", this.render_items, this);
        this.model.get("children").bind("remove", this.render_items, this);

        $(this.el).attr("id", "folder_" + this.model.cid);
        $(this.el).data("model", this.model);
        this.render();
    },
    //our tree is responsible for initializing new views for the items in the tree; each item should have a default class,
    //stored as the view_class property
    initialize_item_view: function(item) {
        var view_class = item.get("view_class");
        return new view_class({"model": item});
    },
    toggle_hide: function(e) {
        e.preventDefault();
        var is_hidden = this.model.get("hidden");
        this.model.set({ "hidden": !is_hidden });
    },
    render: function() {
        console.log("rendering folder", this.model.cid);

        $(this.el).html( this.template( this.model.toJSON() ) );

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

        //hide the list if the folder is hidden, then do nothing else
        if( this.model.get("hidden") ) {
            $(ol_el).css("display", "none");
            return true;
        }

        //show otherwise
        $(ol_el).css("display", "inherit");

        //if there are any child elements in the folder, do a jQuery detach on them first before wiping the html
        //of the list; this will preserve any events that were bound on the child views els
        $(ol_el).children("li").detach();
        $(ol_el).html("");

        //re-insert each children's view
        this.model.get("children").each(function(child) {
            var view = this.children_views[child.cid];
            ol_el.append( view.el );
        }, this);
    }
});

var TreeView = FolderView.extend({
    tagName: "div",
    className: "tree",
    template: _.template("<% if( show_select_all ) { %><a href='#' class='select_all'>Select All/None</a><% } %>" +
        "<ol class='folder_items sortable'></ol>"),
    events: {
        "click a.select_all": "toggle_select_all"
    },
    toggle_select_all: function(e) {
        e.preventDefault();

        var new_selected = (this.model.get("selected") == true) ? false : true;
        this.model.set({"selected": new_selected});
    },
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
