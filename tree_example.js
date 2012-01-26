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


    tree = new Tree(simpler_data);
    var fview = new TreeView({"model": tree});

    $("#tree").html(fview.el);
    //tree.get("children").remove( tree.get("children").at(0) );
    sd = tree.serialize();
    /*tree.deserialize(sd);*/
});


