var TreeItem = Backbone.Model.extend({
    defaults: {
        onClick: false, //optional function that is called when item clicked
        selectable: false,
        selected: false,
        view_class: TreeItemView,
        title: ''
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
});

var Folder = Backbone.Model.extend({
    defaults: {
        title: "",
        children: new Backbone.Collection(),
        hidden: false,
        selectable: true,
        selected: false,
        view_class: FolderView
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
    get_item_by_id: function(cid) {
        return this.flatten().detect(function(item) { return item.cid == cid; });
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
        "show_select_all": false,
        "children": new Backbone.Collection()
    }
});

