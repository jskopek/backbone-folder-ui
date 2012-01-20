var MIView = Backbone.View.extend({
    className: "module_item",
    tagName: "li",

    initialize: function() {
        this.render();
        this.model.bind("change:status", this.render, this);
    },
    events: {
        "click a": "change_status",
    },
    change_status: function(e) {
        e.preventDefault();
        this.model.change_status();
    },
    render: function() {
        $(this.el).attr("id", "mi_" + this.model.cid);
        
        var template = _.template("<div><b>MI: <%= cid %>: <%= title %>, Status: <%= status %>, <a href='#'>Change Status</a></b></div>");
        $(this.el).html( template({
            "cid": this.model.cid,
            "title": this.model.get("title"),
            "status": this.model.get("status")
        }) );

        this.delegateEvents();
    }
})

var FolderView = Backbone.View.extend({
    tagName: "li",
    className: "folder",

    initialize: function() {
        this.render();
        this.model.bind("change:hidden", this.render, this);
        this.model.bind("change:status", this.render, this);

        this.model.get("children").bind("add", this.render, this);
        this.model.get("children").bind("remove", this.render, this);
        this.model.get("children").bind("move", this.render, this);
    },
    toggle_hide: function(e) {
        e.preventDefault();
        var is_hidden = this.model.get("hidden");
        this.model.set({ "hidden": !is_hidden });
    },
    change_status: function(e) {
        e.preventDefault();
        var new_status = next_status( this.model.get("status") );
        this.model.set({"status": new_status});
    },
    render: function() {
        $(this.el).attr("id", "folder_" + this.model.cid);

        var template = _.template("<div><b><%= cid %>: <%= title %></b> Status: <%= status %><a href='#' class='toggle_hide'>Hide</a><a href='#' class='change_status'>Change Status<a/></div><ol></ol>");
        var html = template({
            "cid": this.model.cid,
            "title": this.model.get("title"),
            "status": this.model.get("status")
        });
        $(this.el).html(html);

        //bind hide event
        $(this.el).children("div").find("a.toggle_hide").click($.proxy(function(e) { this.toggle_hide(e); }, this));
        $(this.el).children("div").find("a.change_status").click($.proxy(function(e) { this.change_status(e); }, this));

        //loop through and add children
        var ol_el = $(this.el).find("ol");
        if( !this.model.get("hidden") ) {
            this.model.get("children").each(function(child) {
                var view = child.init_view();
                ol_el.append(view.el );
            });
        }
    }
});

var TreeView = Backbone.View.extend({
    tagName: "div",
    className: "tree",
    initialize: function() {

        this.model.get("children").bind("add", this.render, this);
        this.model.get("children").bind("remove", this.render, this);
        this.model.get("children").bind("move", this.render, this);

        var template = _.template("<ol class='sortable'></ol>");
        $(this.el).html( template() );
        this.render();

        //set sorting and bind for property updates
        this.model.bind("change:sortable", this.set_sorting, this);
        this.set_sorting();
    },
    render: function() {

        //loop through and add children
        var ol_el = $(this.el).find("ol");
        $(ol_el).html("");
        if( !this.model.get("hidden") ) {
            this.model.get("children").each(function(child) {
                var view = child.init_view({"model": this});
                ol_el.append( view.el );
            });
        }

    },
    set_sorting: function() {
        if( this.model.get("sortable") ) {
            $(this.el).children("ol").nestedSortable({
                disableNesting: 'module_item',
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
                revertOnError: 0
            });
            $(this.el).find("ol").bind("sortupdate", $.proxy(function(e) {
                var el = $(this.el).find("ol");
                var model = this.model;

                var update_order = function(data) {
                    var parent_folder = this.model.get_item_by_id( data["id"] );

                    for( var position in data["children"] ) {
                        var child_data = data["children"][position];
                        var child_item = this.model.get_item_by_id( child_data["id"] );

                        //set the position of the item
                        if( parent_folder.cid != child_item.get("parent").cid ) {
                            child_item.get("parent").remove( child_item );
                            parent_folder.add(child_item, position);
                        } else {
                            parent_folder.move(child_item, position);
                        }

                        //if the item has children, do ordering on them
                        if( child_data["children"] ) {
                            update_order.call(this, child_data);
                        }
                    }
                }

                var data = $(el).nestedSortable("toHierarchy");

                //insert the controlling tree as the 'root' parent - first-level
                //children will set themselves as the children of it, and will
                //update their positioning accordingly
                data = {
                    "id": this.model.cid,
                    "children": data
                };
                update_order.call(this, data);
            }, this));
        } else {
            $(this.el).children("ol").nestedSortable("destroy");
        }
    }

});




