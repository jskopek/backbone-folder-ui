var MIcounter = 0;

var MI = Backbone.Model.extend({
    defaults: {
        status: "inactive"
    },
    initialize: function() {
        //temp way of setting MI name really quickly
        this.set({"title": "Module Item " + MIcounter});
        MIcounter++;

        this.set({"view": new MIView({ model: this }) });
    },
    change_status: function() {
        var status = next_status( this.get("status") );
        this.set({"status": status });
    }
});

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

var Folder = Backbone.Model.extend({
    defaults: {
        title: "",
        children: new Backbone.Collection(),
        hidden: false
    },
    get_item_by_id: function(cid) {
        return this.flatten().detect(function(item) { return item.cid == cid; });
    },
    view_init: function() {
        this.set({"view": new FolderView({ model: this }) });
    },
    initialize: function() {
        if( _.isArray( this.get("children") ) ) {
            this.set({"children": new Backbone.Collection(this.get("children")) });
        }

        //initialize the view - this is done in a seperate method
        //to make it easier for subclassed models to have different views (namely, Tree)
        this.view_init();

        //bubble the status update trigger up a nested set of folders
        this.get("children").bind("change:status", function() { this.trigger("change:status"); }, this);

        //set the parent property for children of the folder
        this.get("children").each(function(item) { item.set({"parent": this}); }, this);
        this.get("children").bind("add", function(item) { item.set({"parent": this}); }, this);
        this.get("children").bind("remove", function(item) { item.set({"parent": undefined}); });
    },
    get_status: function() {
        var statuses = this.flatten(true).pluck("status");
        var uniq_status = _.uniq(statuses);

        if( uniq_status.length == 0 ) {
            var status =  "inactive";
        } else if( uniq_status.length == 1 ) {
            var status =  uniq_status[0];
        } else {
            var status =  "mixed";
        }

        return status;
    },
    add: function(item, position) {
        this.get("children").add(item, {at:position});
    },
    remove: function(item) {
        this.get("children").remove(item);
    },
    move: function(item, position) {
        var from = this.get("children").indexOf(item);
        var to = parseInt(position);

        if( from == to ) {
            return false;
        }

        var children_arr = this.get("children").models;
        children_arr.splice(to,0, children_arr.splice(from,1)[0]);
        this.get("children").trigger("move");
    },
    flatten: function(exclude_folders) {
        //collections are like arrays, but with nice build-in methods
        var list = new Backbone.Collection();

        var add_to_list = function(item, list) {
            //add the item to the list
            if( !(item instanceof Folder) || !exclude_folders ) {
                list.add(item);
            }

            //if the item is a folder, add each of it's children to the list
            if( item instanceof Folder ) {
                item.get("children").each(function(item) {
                    add_to_list(item, list);
                });
            }
        }
        add_to_list(this, list);
        return list;
    }
});

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
        var new_status = next_status( this.model.get_status() );

        //change each children's status to the folder's status
        this.model.flatten(true).each(function(item) {
            item.set({"status": new_status});
        });
    },
    render: function() {
        $(this.el).attr("id", "folder_" + this.model.cid);

        var template = _.template("<div><b><%= cid %>: <%= title %></b> Status: <%= status %><a href='#' class='toggle_hide'>Hide</a><a href='#' class='change_status'>Change Status<a/></div><ol></ol>");
        var html = template({
            "cid": this.model.cid,
            "title": this.model.get("title"),
            "status": this.model.get_status()
        });
        $(this.el).html(html);

        //bind hide event
        $(this.el).children("div").find("a.toggle_hide").click($.proxy(function(e) { this.toggle_hide(e); }, this));
        $(this.el).children("div").find("a.change_status").click($.proxy(function(e) { this.change_status(e); }, this));

        //loop through and add children
        var ol_el = $(this.el).find("ol");
        if( !this.model.get("hidden") ) {
            this.model.get("children").each(function(child) {
                child.get("view").render(); //rebinds hide event
                ol_el.append( child.get("view").el );
            });
        }
    }
});



//helper function for development mode; switches statuses
function next_status(current_status) {
    var statuses = ["active_visible", "visible", "active", "review", "inactive"];
    var status_index = _.indexOf(statuses, current_status);
    if( status_index == -1 ) {
        status_index = 0;
    } else if( status_index >= statuses.length - 1 ) {
        status_index = 0;
    } else {
        status_index++;
    }
    return statuses[status_index];
}

// TREE MODEL & VIEW ///
var Tree = Folder.extend({
    defaults: {
        "sortable": false,
        "children": Backbone.Collection
    },
    view_init: function() {
        this.set({"view": new TreeView({ model: this }) });
    },
});
var TreeView = Backbone.View.extend({
    tagName: "div",
    className: "tree",
    initialize: function() {
        this.render();
    },
    render: function() {
        var template = _.template("<ol class='sortable'></ol>");
        $(this.el).html( template() );

        //loop through and add children
        var ol_el = $(this.el).find("ol");
        if( !this.model.get("hidden") ) {
            this.model.get("children").each(function(child) {
                child.get("view").render(); //rebinds hide event
                ol_el.append( child.get("view").el );
            });
        }

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

        }
    }
});


