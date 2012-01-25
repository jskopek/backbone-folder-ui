//VIEWS
var TreeModuleItemView = TreeItemView.extend({
    className: "tree_row module_item no_tree_children",

    initialize: function() {
        TreeItemView.prototype.initialize.call(this);
        this.model.bind("change:status", this.render_status, this);
        this.model.bind("change:answered", this.render_answered, this);
    },
    render: function() {
        TreeItemView.prototype.render.call(this);

        this.render_answered();
        this.render_status();
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
        var el = $(this.el).children("div").find("span.status");
        if( !el.length ) {
            el = $("<span class='status'></span");
            $(this.el).children("div").append( el );
        }

        var template = _.template("Status: <%= status %>, <a href='#'>Change Status</a>");
        var html = template( this.model.toJSON() );
        $(el).html(html);

        $(el).find("a").click($.proxy(this.change_status, this));
    },
    change_status: function(e) {
        e.preventDefault();
        var status = next_status( this.model.get("status") );
        this.model.set({"status": status });
    }
});

var ModuleItemFolderView = FolderView.extend({
    initialize: function() {
        FolderView.prototype.initialize.call(this);
        this.model.bind("change:status", this.render_status, this);
    },
    render_details: function() {
        FolderView.prototype.render_details.call(this);
        this.render_status();
    },
    render_status: function() {
        TreeModuleItemView.prototype.render_status.call(this);
    },
    change_status: function(e) {
        e.preventDefault();
        var status = next_status( this.model.get("status") );
        this.model.set({"status": status });
    }
});


//MODELS
var TreeModuleItem = TreeItem.extend({
    defaults: _.extend({}, TreeItem.prototype.defaults, {
        status: "inactive",
        selectable: true,
        answered: false,
        item: undefined,
        view_class: TreeModuleItemView,
        title: '- Undefined -'
    }),
    initialize: function() {
        TreeItem.prototype.initialize.call(this);

        if( !this.get("module_item") ) {
            throw("MI cannot be initialized without `module_item` property");
        }

        this.set({ "title": this.get("module_item").get("title") || this.defaults.title });

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
    }
});

var ModuleItemFolder = Folder.extend({
    defaults: _.extend({}, Folder.prototype.defaults, {
        status: undefined,
        view_class: ModuleItemFolderView
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

/*
 * ModuleItemTree extends Tree with extra methods that simplify
 * process of adding and removing module items from tree. User can
 * pass in ModuleItem instances, and ModuleItemTree instances will
 * be created, stored, and referenced automatically
 */
var ModuleItemTree = Tree.extend({

    //functions that simplify adding and removing module items from tree
    //automate the process of creating TreeModuleItem
    _module_items: {},
    add_module_item: function(item) {
        if( this.get_module_item(item) ) {
            throw("Method does not allow module item to be inserted multiple times; You must do this manually");
        }

        var module_item = new TreeModuleItem({"module_item": item});
        this.add(module_item);

        this._module_items[item.cid] = module_item;
    },
    remove_module_item: function(item) {
        var module_item = this.get_module_item(item);
        delete this._module_items[item.cid];

        this.remove(module_item);
    },
    get_module_item: function(item) {
        return this._module_items[item.cid];
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


