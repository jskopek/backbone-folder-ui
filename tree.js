var TreeItem = Backbone.Model.extend({
    defaults: {
        onClick: false, //optional function that is called when item clicked
        selectable: false,
        selected: false
    },
    initialize: function() {
        //temp way of setting MI name really quickly
        this.set({"title": "Item " + this.cid});

        this.bind("clicked", function() {
            console.log("clicked");
            if( typeof( this.get("onClick") ) == "function" ) {
                this.get("onClick").call(this);
            }
        });
    },
    init_view: function() {
        return new TreeItemView({ "model": this });
    }
});
var TreeModuleItem = TreeItem.extend({
    defaults: _.extend({}, TreeItem.prototype.defaults, {
        status: "inactive",
        selectable: true,
        item: undefined
    }),
    init_view: function() {
        return new TreeModuleItemView({ "model": this });
    },
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

var Folder = Backbone.Model.extend({
    defaults: {
        title: "",
        children: new Backbone.Collection(),
        hidden: false,
        selectable: true,
        selected: false
    },
    get_item_by_id: function(cid) {
        return this.flatten().detect(function(item) { return item.cid == cid; });
    },
    initialize: function() {
        if( _.isArray( this.get("children") ) ) {
            this.set({"children": new Backbone.Collection(this.get("children")) });
        }

        //update the folder's selected status
        this.get("children").bind("change:selected", this.update_selected, this);
        this.get("children").bind("add", this.update_selected, this);
        this.get("children").bind("remove", this.update_selected, this);
        this.update_selected();

        //updates children when folder's selected status chagned
        this.bind("change:selected", function() { 
            var is_selected = this.get("selected");

            //if folder's status is 'mixed', don't propogate that down - this is a
            //folder-specific value
            if( is_selected == "mixed" ) {
                return false;
            }
            this.get("children").each(function(child) {
                child.set({"selected": is_selected});
            });
        });
    },
    update_selected: function() {
        var children_selected = [];
        //gets the selected status from all of the folder's selectable children
        var selectable_children = this.get("children").filter(function(child) { return child.get("selectable"); });
        var child_statuses = _.map(selectable_children, function(child) { return child.get("selected"); });
        var child_statuses = _.uniq(child_statuses);

        //calculate the status based on the number of unique child statuses
        switch( child_statuses.length ) {
            case 0:
                var selected = false;
                break;
            case 1:
                var selected = child_statuses[0];
                break;
            default:
                var selected = "mixed";
        }

        this.set({"selected": selected });
    },
    init_view: function() {
        return new FolderView({"model":this});
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

// TREE MODEL & VIEW ///
var Tree = Folder.extend({
    defaults: {
        "sortable": false,
        "children": Backbone.Collection
    }
});


////// STATUS STUFF //////
var StatusFolder = Folder.extend({
    defaults: _.extend({}, Folder.prototype.defaults, {
        status: undefined
    }),
    init_view: function() {
        return new StatusFolderView({ "model": this });
    },
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


