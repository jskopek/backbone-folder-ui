var list;
$(document).ready(function() {
    ModuleItem = Backbone.Model.extend({});
    mi = new ModuleItem({ "title": "Module Item 1", "status": "active_visible" });
    mi2 = new ModuleItem({ "title": "Module Item 2", "status": "active_visible" });
    mi3 = new ModuleItem({ "title": "Module Item 3", "status": "active_visible" });

    var simple_data = {
        "sortable": true,
        "children": [
            new Folder({
                "title": "Status Folder 1",
                "children": [new TreeItem(), new TreeItem({selectable: true, onClick:function() { 
                    alert("HELLO"); 
                }})]
            }),
            new Folder({
                "title": "SF3",
                "children": [
                    new TreeItem()
                    //new Folder({"title": "SF4", children: []})
                ]
            }),
            new TreeItem()
        ]
    };

    var simpler_data = {
        "sortable": true,
        "children": [
            new Folder({
                "title": "Status Folder 1",
                "children": [new TreeItem(), new TreeItem({selectable: true, onClick:function() { 
                    alert("HELLO"); 
                }})]
            }),
            new Folder({
                "title": "Folder 2",
                "children": [
                    new Folder({
                        "title": "Folder 3",
                        "children": [new TreeItem(), new TreeItem(), new TreeItem()]
                    }),
                    new TreeItem()
                ]
            }),
            new TreeItem()
        ]
    };
    var data = {
        "sortable": true,
        "children": [
            new ModuleItemFolder({
                "title": "Status Folder 1",
                "children": [new TreeModuleItem({"module_item":mi}), new TreeItem({selectable: true, onClick:function() { 
                    alert("HELLO"); 
                }})]
            }),
            new Folder({
                "title": "Folder 2",
                "children": [
                    new Folder({
                        "title": "Folder 3",
                        "children": [new TreeItem(), new TreeItem(), new TreeModuleItem({"module_item":mi2})]
                    }),
                    new TreeModuleItem({"module_item":mi3})
                ]
            }),
            new TreeModuleItem({"module_item":mi})
        ]
    };
    var data_new = {
        "sortable": true,
        "children": [new TreeModuleItem({"module_item":mi}), new TreeModuleItem({"module_item":mi}), new TreeModuleItem({"module_item":mi}), new TreeModuleItem({"module_item":mi})]
    };
    var data_folders = {
        "sortable": true,
        "children": [new Folder({"title": "F1"})]
    };


    tree = new Tree({"sortable": true});
    tree = new Tree(data);
    var fview = new TreeView({"model": tree});


    tree.bind("children:hidden", function(item) {
        console.log("Hidden changed", item.get("title"), this);
    });
    tree.bind("children:sorted", function(item, old_folder, new_folder, position) {
        console.log("move", item.get("title"), old_folder.get("title"), new_folder.get("title"), position);
    });

    $("#tree").html(fview.el);

    var el = $("<a href='#' class='add_folder'>Add Folder</a> | <a href='#' class='add_item'>Add Item</a> | <a href='#' class='delete'>Delete</a>");
    $("#tree").append(el);
    $("#tree").find(".add_folder").click(function(e) {
        e.preventDefault();
        var folder = new Folder();
        folder.set({"title": "Folder " + folder.cid});
        tree.add(folder);
        console.log("add", "folder", folder.get("title"));
    });

    $("#tree").find(".add_item").click(function(e) {
        e.preventDefault();
        var item = new TreeItem({"selectable": true});
        tree.add(item);
        console.log("add", "item", item.get("title"));
    });

    $("#tree").find(".delete").click(function(e) {
        e.preventDefault();
        var selected_items = tree.selected();
        console.log("deleting", selected_items.pluck("title"));
    });

    //tree.get("children").remove( tree.get("children").at(0) );
    sd = tree.serialize();
    /*tree.deserialize(sd);*/
});


