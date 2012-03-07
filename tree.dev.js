/* Copyright (c) 2012 Top Hat Monocle, http://tophatmonocle.com/
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy 
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/

window.tree_constructors = window.tree_constructors || {};
window.tree_constructors.views = {};

var TreeItemView = Backbone.View.extend({
    className: "tree_row item no_tree_children",
    tagName: "li",
    template: _.template("<div>" +
        "<% if( selectable ) { %><input type='checkbox' <% if( selected ) { %>checked<% } %> /> <% } %>" +
        "<em <% if( typeof click != 'undefined' ) { %>class='clickable'<% } %>><%= title %></em></div>"),

    initialize: function() {
        $(this.el).attr("id", "mi_" + this.model.cid);
        $(this.el).data("model", this.model);

        this.model.bind("change:selectable", this.render, this);
        this.model.bind("change:selected", this.render, this);
        this.model.bind("change:title", this.render, this);
        this.render();
    },
    events: {
        "click em": "click",
        "click input[type=checkbox]": "toggle_select"
    },
    toggle_select: function(e) {
        var is_selected = !this.model.get("selected");
        this.model.set({"selected": is_selected});
    },
    click: function() {
        this.model.trigger("click");
    },
    render: function() {
        var html = this.template( this.model.toJSON() );
        $(this.el).html(html);
        this.delegateEvents();
    }
});
window.tree_constructors.views["item"] = TreeItemView;

var FolderView = Backbone.View.extend({
    tagName: "li",
    className: "tree_row folder",
    template: _.template("<div class='folder_details'></div><ol class='folder_items'></ol>"),

    initialize: function() {
        this.model.bind("change:title", this.render_details, this);
        this.model.bind("change:selected", this.render_details, this);

        //when folder hidden or shown, update both the items below, as well as the hide/show button in the details pane
        this.model.bind("change:hidden", this.render_items, this);
        this.model.bind("change:hidden", this.render_details, this);

        //create and remove item views when items are added to the folder; see commentary under `initialize_children_views` for details
        this.model.get("children").bind("add", function(item) { this.children_views[item.cid] = this.initialize_item_view(item); }, this);
        this.model.get("children").bind("remove", function(item) { delete this.children_views[item.cid]; }, this);
        this.model.get("children").bind("reset", this.initialize_children_views, this);
        this.initialize_children_views();
      
        this.model.get("children").bind("add", this.render_items, this);
        this.model.get("children").bind("remove", this.render_items, this);
        this.model.get("children").bind("reset", this.render_items, this);
        this.model.bind("move", this.render_items, this);

        $(this.el).attr("id", "folder_" + this.model.cid);
        $(this.el).data("model", this.model);
        this.render();
    },

    //we initialize children views when they are added to the collection, and reference those views on redraw
    //this is more efficient than creating new views each time we re-render the folder, and it allows us to remove
    //views if the child model is ever removed from the folder
    children_views: {},

    //sets up views for all children
    initialize_children_views: function() {
        this.children_views = {}; 
        this.model.get("children").each(function(item) {
            this.children_views[item.cid] = this.initialize_item_view(item); 
        }, this);
    },

    //our tree is responsible for initializing new views for the items in the tree; each item should have a default class,
    //stored as the view_class property
    initialize_item_view: function(item) {
        var view_class = window.tree_constructors.views[ item.get("constructor") ];
        return new view_class({"model": item});
    },

    toggle_hide: function(e) {
        e.preventDefault();
        var is_hidden = this.model.get("hidden");
        this.model.save_hidden(!is_hidden);
    },
    render: function() {
        $(this.el).html( this.template( this.model.toJSON() ) );

        this.render_details();
        this.render_items();
    },
    render_details: function() {
        var html = _.template(
                "<a href='#' class='toggle_hide'>Toggle Hide</a>" +
                "<% if( selectable ) { %><input type='checkbox' <% if( selected == true ) { %>checked<% } %> /> <% } %>" +
                "<em><span>Folder:</span><%= title %></em>", 
                {
                    "cid": this.model.cid,
                    "selectable": this.model.get("selectable"),
                    "selected": this.model.get("selected"),
                    "hidden": this.model.get("hidden"),
                    "title": this.model.get("title")
                });
        $(this.el).children(".folder_details").html(html);

        //add or remove a 'hidden' class to the folder based on it's state
        if( this.model.get("hidden") ) {
            $(this.el).addClass("hidden");
        } else {
            $(this.el).removeClass("hidden");
        }


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
        var ol_el = $(this.el).children("ol");

        //hide the list if the folder is hidden, otherwise show
        if( this.model.get("hidden") ) {
            $(ol_el).addClass("hidden");
        } else {
            $(ol_el).removeClass("hidden");
        }

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
window.tree_constructors.views["folder"] = FolderView;

//initialization argments: {'model': TreeModel, 'empty_message': 'Message to show w/ no items'}
var TreeView = FolderView.extend({
    tagName: "div",
    className: "tree",
    template: _.template("<% if( show_select_all ) { %><a href='#' class='select_all'>Select All/None</a><% } %>" +
        "<ol class='folder_items'></ol>"),
    events: {
        "click a.select_all": "toggle_select_all",
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
        
        if( this.options.max_height ) {
            $(this.el).css("max-height", this.options.max_height + "px");
        }
    },
    render_items: function() {
        //do not re-render the tree while it is being dragged
        if( this.options.tree_dragging ) { return false; }

        FolderView.prototype.render_items.call(this);

        //if an empty message has been provided, add it
        if( !this.model.get("children").length && this.options.empty_message ) {
            $(this.el).children("ol.folder_items").html("<div class='empty'>" + this.options.empty_message + "</div>");
        } 
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
            handle: 'div > em',
            helper:	'clone',
            items: 'li',
            maxLevels: 5,
            opacity: .6,
            placeholder: 'placeholder',
            revert: false,
            tabSize: 20,
            tolerance: 'pointer',
            toleranceElement: '> div',
            revertOnError: 0,

            scroll: true,
            scrollY: true,
            scrollX: false,

            start: function(event, ui) {
                //keep track of the fact that the tree is being dragged, as this may affect rendering of the tree
                //re-rendering the tree while dragging is occuring will cause the browser to hang, for example
                tree_view.options.tree_dragging = true;

                var start_pos = ui.item.index();
                ui.item.data('start_pos', start_pos);

                var start_parent = ui.item.parent("ol").parent("li").data("model");
                if( !start_parent ) { start_parent = tree_view.model; }
                ui.item.data('start_parent', start_parent);
            },
            update: function(event, ui) {
                tree_view.options.tree_dragging = false;

                var item = ui.item.data("model");

                var end_parent = ui.item.parent("ol").parent("li").data("model");
                if( !end_parent ) { end_parent = tree_view.model; }
                var start_parent = ui.item.data('start_parent');

                var start_pos = ui.item.data('start_pos');
                var end_pos = $(ui.item).index();

                if( start_parent != end_parent ) {
                    start_parent.remove(item);
                    end_parent.add(item, end_pos );

                    //if we are moving a child into a hidden folder, mark the folder as opened on drop
                    if( end_parent.get("hidden") ) {
                        end_parent.save_hidden(false);
                    }
                } else if( start_pos != end_pos ) {
                    start_parent.move(item, end_pos);
                }

                tree_view.model.trigger("sorted", item, start_parent, end_parent, end_pos);
            }
        }).addClass("sortable");
    }

});
window.tree_constructors.views["tree"] = TreeView;

/* Copyright (c) 2012 Top Hat Monocle, http://tophatmonocle.com/
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy 
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/

window.tree_constructors = window.tree_constructors || {};
window.tree_constructors.models = {};

var TreeItem = Backbone.Model.extend({
    defaults: {
        click: false, //optional function that is called when item clicked
        selectable: false,
        selected: false,
        constructor: "item",
        title: '-'
    },
    serialize: function () {
        var data = this.toJSON(); 
        delete data["click"];
        return data;
    },
    deserialize: function(data) { 
        this.set(data); 
    },
    initialize: function() {
        this.bind("click", function() { 
            if( this.get("click") ) {
                this.get("click").call(this);
            }
        });
    },
    is_selected: function() {
        return ( this.get("selectable") && ( this.get("selected") === true ) ) ? true : false;
    }
});
window.tree_constructors.models["item"] = TreeItem;

var Folder = Backbone.Model.extend({
    defaults: {
        title: "",
        children: undefined, //new Backbone.Collection(),
        hidden: false,
        selectable: true,
        selected: false,
        constructor: "folder"
    },
    serialize: function() {
        var data = this.toJSON();
        data["children"] = this.get("children").map(function(child) {
            return child.serialize();
        });
        delete data["view_class"];
        return data;
    },
    /* removed in favor of a more complex, optimized one */
    /*deserialize: function(data) {*/
    /*//we'll be modifying data property, so we better clone it*/
    /*var data = _.extend({}, data);*/

    /*//convert folder's children into items by initializing their corresponding models*/
    /*//and calling deserialize function on them*/
    /*data["children"] = _.map(data["children"], function(child_data) {*/
    /*var child_class = window.tree_constructors.models[ child_data["constructor"] ];*/
    /*var child_obj = new child_class();*/

    /*child_obj.deserialize(child_data);*/

    /*return child_obj;*/
    /*}, this);*/

    /*//wipe old children and set new ones*/
    /*this.get("children").reset( data["children"] );*/

    /*//delete the data so that we don't set the list's children to be a serialized array wehen we call 'set'*/
    /*delete data["children"];*/

    /*//set title and other properties*/
    /*this.set(data);*/
    /*},*/
    deserialize: function(data) {
        //we'll be modifying data property, so we better clone it
        var data = _.extend({}, data);

        var num_items = _.max([ data["children"].length, this.get("children").length ]);
        for( var index = 0; index < num_items; index++ ) {
            var folder_item = this.get("children").at(index);
            var serialized_item = data["children"][index];

            //if folder item does not exist at serialized item's position, add new item
            if( !folder_item ) {
                var child_class = window.tree_constructors.models[ serialized_item["constructor"] ];
                var child_obj = new child_class();
                child_obj.deserialize(serialized_item);
                this.get("children").add(child_obj, index);

            //if folder item exists but no corresponding serialized item exists, remove folder item
            } else if( !serialized_item ) {
                this.get("children").remove( folder_item );

            //if both folder and serialized data exist at corresponding location and match ids, update that object
            } else if( folder_item.id == serialized_item.id ) {
                folder_item.deserialize( serialized_item );

            //if folder and serialized data exist at same location but are different, replace with serialized
            } else {
                this.get("children").remove(folder_item);

                var child_class = window.tree_constructors.models[ serialized_item["constructor"] ];
                var child_obj = new child_class();
                child_obj.deserialize(serialized_item);
                this.get("children").add(child_obj, {"at": index});
            }
        }

        //delete the data so that we don't set the list's children to be a serialized array wehen we call 'set'
        //then set title and other properties
        delete data["children"];
        this.set(data);

        this.trigger("deserialize");
    },
    initialize: function() {
        if( !this.get("children") ) {
            this.set({"children": new Backbone.Collection() });
        }
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

        //propagate 'save:hidden' status changes up to this folder's parents when a user has clicked a folder
        this.get("children").bind("save:hidden", function(item) {  this.trigger("save:hidden", item); }, this);

        //propogate 'nested:add' event up to folder's parents
        this.get("children").bind("add", function(item) {  this.trigger("nested:add", item); }, this);
        this.get("children").bind("nested:add", function(item) {  this.trigger("nested:add", item); }, this);

        //propogate 'nested:remove' event up to folder's parents
        this.get("children").bind("remove", function(item) {  this.trigger("nested:remove", item); }, this);
        this.get("children").bind("nested:remove", function(item) {  this.trigger("nested:remove", item); }, this);

        //collection's remove event is triggered on model
        this.get("children").bind("remove", function(item) {  this.trigger("remove", item); }, this);

        //collection's add event is triggered on model
        this.get("children").bind("add", function(item) {  this.trigger("add", item); }, this);
    },
    //call when a user interaction results in a hidden status change
    //sets the hidden status of a tree item and triggers a special save:hidden status
    //this allows us to differentiate between user actions and data updates
    save_hidden: function(hidden_status) {
        this.set({"hidden": hidden_status});
        this.trigger("save:hidden", this);
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
        this.trigger("move");
    },

    get_item: function(id, variable_name, type) {
        var item = false;
        var type_class = type ? window.tree_constructors.models[type] : undefined;
        variable_name = variable_name || "id";

        this.nested_each(function(child) {
            if( type_class && !(child instanceof type_class) )
                return true;

            if( child.get(variable_name) == id ) {
                item = child;
                return false;
            }
        });
        return item;
    },

    each: function(fn) { this.get("children").each(fn); },
    length: function() { return this.get("children").length(); },

    nested_each: function(fn) {
        for( var index in this.get("children").models ) {
            var child = this.get("children").models[index];

            if( child instanceof Folder ) {
                result = child.nested_each(fn);
                if( result === false ) {
                    return false;
                }
            }

            result = fn.call(this, child);
            if( result === false ) {
                return false;
            }

        }
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
    },
    selected: function(exclude_folders) {
        items = this.flatten(exclude_folders).filter(function(item) {
            return item.get("selectable") && item.get("selected");
        });
        return new Backbone.Collection(items);
    },
    is_selected: function() {
        return ( this.get("selectable") && ( this.get("selected") === true ) ) ? true : false;
    }
});
window.tree_constructors.models["folder"] = Folder;

// TREE MODEL & VIEW ///
var Tree = Folder.extend({
    defaults: {
        "sortable": false,
        "show_select_all": false
    }
});
