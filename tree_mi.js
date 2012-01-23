//VIEWS
var TreeModuleItemView = TreeItemView.extend({
    className: "module_item no_tree_children",

    initialize: function() {
        TreeItemView.prototype.initialize.call(this);
        this.model.bind("change:status", this.render_status, this);
        this.model.bind("change:answered", this.render_answered, this);
    },
    events: _.extend({},TreeItemView.prototype.events, {
        "click a": "change_status",
    }),
    render: function() {
        TreeItemView.prototype.render.call(this);

        this.render_answered();
        this.render_status();

        this.delegateEvents();
    },
    render_answered: function() {
        var el = $(this.el).find("div span.answered");
        if( !el.length ) {
            el = $("<span class='answered'></span");
            $(this.el).find("div").append( el );
        }

        //update answered property
        if( this.model.get("answered") ) {
            el.html("Answered!");
        } else {
            el.html("Unanswered");
        }
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


//MODELS
var TreeModuleItem = TreeItem.extend({
    defaults: _.extend({}, TreeItem.prototype.defaults, {
        status: "inactive",
        selectable: true,
        answered: false,
        item: undefined,
        view_class: TreeModuleItemView
    }),
    initialize: function() {
        TreeItem.prototype.initialize.call(this);

        if( !this.get("module_item") ) {
            throw("MI cannot be initialized without `module_item` property");
        }

        this.set({ "title": this.get("module_item").get("title") });

        //set status to module_item's status, and bind for MI's status changes
        this.set({"status": this.get("module_item").get("status") });
        this.get("module_item").bind("change:status", function() {
            this.set({"status": this.get("module_item").get("status")});
        }, this);

        //set answered state to module_item's states, and bind for MI's answered changes
        this.set({"answered": this.get("module_item").get("answered") });
        this.get("module_item").bind("change:answered", function() {
            this.set({"answered": this.get("module_item").get("answered")});
        }, this);

        //update MI's status when this status is changed
        this.bind("change:status", function() {
            this.get("module_item").set({"status": this.get("status")});
        }, this);
    },
    change_status: function() {
        var status = next_status( this.get("status") );
        this.set({"status": status });
    }
});

var StatusFolder = Folder.extend({
    defaults: _.extend({}, Folder.prototype.defaults, {
        status: undefined,
        view_class: StatusFolderView
    }),
    initialize: function() {
        Folder.prototype.initialize.call(this);

        //update the folder's status based on the status of it's children
        this.get("children").bind("change:status", this.update_status, this);
        this.get("children").bind("add", this.update_status, this);
        this.get("children").bind("remove", this.update_status, this);
        this.update_status();

        //update the children when the status of the folder is changed
        this.bind("change:status", function() {
            var status = this.get("status");
            if( status == "mixed" ) {
                return false;
            }
            this.get("children").each(function(child) { 
                child.set({"status": status}); 
            });
        }, this);

    },
    update_status: function() {
        var statuses = this.get("children").pluck("status");
        var uniq_status = _.uniq(statuses);

        if( uniq_status.length == 0 ) {
            var status =  "inactive";
        } else if( uniq_status.length == 1 ) {
            var status =  uniq_status[0];
        } else {
            var status =  "mixed";
        }

        this.set({"status": status});
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


