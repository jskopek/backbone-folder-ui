var MIcounter = 0;

var Shared = Backbone.Model.extend({
    set_position: function(position, parent_item) {
        console.log(this.get("title"), position, parent_item.get("title"));
    },
});

var MI = Shared.extend({
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
        
        var template = _.template("<div><b>MI: <%= title %>, Status: <%= status %>, <a href='#'>Change Status</a></b></div>");
        $(this.el).html( template( this.model.toJSON() ) );

        this.delegateEvents();
    }
})


var Folder = Shared.extend({
    defaults: {
        title: "",
        children: new Backbone.Collection(),
        hidden: false,
    },
    get_item_by_id: function(cid) {
        return this.flatten().detect(function(item) { return item.cid == cid; });
    },
    initialize: function() {
        if( _.isArray( this.get("children") ) ) {
            this.set({"children": new Backbone.Collection(this.get("children")) });
        }
        this.set({"view": new FolderView({ model: this }) });

        //bubble the status update trigger up a nested set of folders
        this.get("children").bind("change:status", function() { this.trigger("change:status"); }, this);
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

        var template = _.template("<div><b><%= title %></b> Status: <%= status %><a href='#' class='toggle_hide'>Hide</a><a href='#' class='change_status'>Change Status<a/></div><ol></ol>");
        var html = template({
            "cid": this.model.cid,
            "title": this.model.get("title"),
            "status": this.model.get_status()
        });
        $(this.el).html(html);

        //bind hide event
        $(this.el).find("#folder_" + this.model.cid + " > div a.toggle_hide").click($.proxy(function(e) { this.toggle_hide(e); }, this));
        $(this.el).find("#folder_" + this.model.cid + " > div a.change_status").click($.proxy(function(e) { this.change_status(e); }, this));

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

