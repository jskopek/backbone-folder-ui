$(document).ready(function() {
    module("Tree Item View");
    test("item view shows title", function() {
        set_common_variables( this );
        equal( $(this.el).find(".tree_row.item:first em").html(), "Item 1" );
    });
    test("item view updates title when changed", function() {
        set_common_variables(this);
        this.i.set({"title": "Item 1 modified"});
        equal( $(this.el).find(".tree_row.item:first em").html(), "Item 1 modified" );
    });
    test("item view shows select checkbox when selectable", function() {
        //initialize selectable item
        set_common_variables(this, {"title": "Item 1", "selectable": true});
        ok( $(this.el).find(".tree_row.item:first input[type=checkbox]").length );
        equal( $(this.el).find(".tree_row.item:first input[type=checkbox]").is(":checked"), false );
        //make it unselectable
        this.i.set({ "selectable": false });
        ok( !$(this.el).find(".tree_row.item:first input[type=checkbox]").length );

        //make it selectable
        this.i.set({ "selectable": true });
        ok( $(this.el).find(".tree_row.item:first input[type=checkbox]").length );
    });
    test("item view select checkbox updated when checked", function() {
        //initialize checked item
        set_common_variables(this, {"title": "Item 1", "selectable": true, "selected": true});
        equal( $(this.el).find(".tree_row.item:first input[type=checkbox]").is(":checked"), true );

        //make unchecked
        this.i.set({"selected": false});
        equal( $(this.el).find(".tree_row.item:first input[type=checkbox]").is(":checked"), false );
    });
    test("item view select checkbox changes checked view when clicked", function() {
        set_common_variables(this, {"title": "Item 1", "selectable": true, "selected": false});
        ok( !this.i.get("selected") );
        $(this.el).find(".tree_row.item:first input[type=checkbox]").click();
        ok( this.i.get("selected") );
    });
    test("title triggers click event when clicked", function() {
        expect(2);
        var okeydokey = function() { ok(true); }

        //initialize with binding
        set_common_variables(this, {"title": "Item 1", "click": okeydokey, "selectable": true, "selected": false});

        //post-initializing binding
        this.i.bind("click", okeydokey);

        $(this.el).find(".tree_row em").click();
    });
    test("items can be made invisible", function() {
        var el = $("<div/>");
        var tree = new Tree();
        var tree_view = new TreeView({"empty_message": "I'm Empty!", "model": tree});
        $(el).append(tree_view.el);

        var item = new TreeItem({"title": "Item 1"});
        tree.add( item );

        equal( $(el).find(".tree_row.item")[0].style.display, "" );
        item.set({"visible": false});
        equal( $(el).find(".tree_row.item")[0].style.display, "none" );
        item.set({"visible": true});
        equal( $(el).find(".tree_row.item")[0].style.display, "" );
    });

    module("Tree Folders");
    test("children are rendered in folder when they are initialized", function() {
        var el = $("<div></div>");
        var folder = new Folder({
            "children": [
                new TreeItem({"title": "Item 1"}),
                new TreeItem({"title": "Item 2"}),
            ]
        });
        var view = new FolderView({"model": folder});
        $(el).html(view.el);

        equal($(el).find(".folder .tree_row.item:first em").text(), "Item 1");
        equal($(el).find(".folder .tree_row.item:last em").text(), "Item 2");
    });

    test("folders can be made invisible", function() {
        var el = $("<div/>");
        var tree = new Tree();
        var tree_view = new TreeView({"empty_message": "I'm Empty!", "model": tree});
        $(el).append(tree_view.el);

        var folder = new Folder({"title": "Testing", children:[new TreeItem({"title": "Item 1"})]});
        tree.add( folder );

        equal( $(el).find(".tree_row.folder")[0].style.display, "" );
        folder.set({"visible": false});
        equal( $(el).find(".tree_row.folder")[0].style.display, "none" );
        folder.set({"visible": true});
        equal( $(el).find(".tree_row.folder")[0].style.display, "" );
    });
    test("children are rendered in folder as they are added", function() {
        var el = $("<div></div>");
        var folder = new Folder();
        var view = new FolderView({"model": folder});
        $(el).html(view.el);

        folder.add( new TreeItem({"title": "Item 1"}) );
        equal($(el).find(".folder .tree_row.item:first em").text(), "Item 1");
    });
    test("folder is re-rendered as items moved around", function() {
        var el = $("<div></div>");
        var folder = new Folder({
            "children": [
                new TreeItem({"title": "Item 1"}),
                new TreeItem({"title": "Item 2"}),
            ]
        });
        var view = new FolderView({"model": folder});
        $(el).html(view.el);

        //move Item 1 to position 1
        folder.move( folder.get("children").at(0), 1 );
        equal($(el).find(".folder .tree_row.item:first em").text(), "Item 2");
        equal($(el).find(".folder .tree_row.item:last em").text(), "Item 1");
    });

    module("Tree");
//    test("dragging item into hidden folder maximizes", function() {
//        var tree = new Tree({
//            "sortable": true,
//            "children": [
//                new Folder({
//                    "title": "Folder 1",
//                    "hidden": true,
//                    "children": [
//                        new TreeItem({"title": "Item 1.1"}),
//                        new TreeItem({"title": "Item 1.2"}),
//                        new TreeItem({"title": "Item 1.3"})
//                    ]
//                }),
//                new Folder({
//                    "title": "Folder 2",
//                    "hidden": true,
//                    "children": [
//                        new TreeItem({"title": "Item 2.1"}),
//                        new TreeItem({"title": "Item 2.2"}),
//                        new TreeItem({"title": "Item 2.3"})
//                    ]
//                }),
//                new TreeItem({"title": "Item 4"}),
//                new TreeItem({"title": "Item 5"})
//            ]
//        });
//        var view = new TreeView({"model": tree});
//        $("body").append(view.el);
//
//        var folder = tree.get("children").at(0);
//    });
    test("tree shows empty message when empty", function() {
        var el = $("<div/>");
        var tree = new Tree();
        var tree_view = new TreeView({"empty_message": "I'm Empty!", "model": tree});
        $(el).append(tree_view.el);

        equal( $(el).find(".tree > .folder_items > .empty").html(), "I'm Empty!" );
        equal( $(el).find(".tree > .folder_items > .empty")[0].style.display, "" );

        var item = new TreeItem({"title": "Testing"});
        tree.add( item );
        equal( $(el).find(".tree > .folder_items > .empty")[0].style.display, "none" );

        tree.remove( item );
        equal( $(el).find(".tree > .folder_items > .empty")[0].style.display, "" );
    });

    test("tree shows empty message when items invisible", function() {
        var el = $("<div/>");
        var tree = new Tree();
        var tree_view = new TreeView({"empty_message": "I'm Empty!", "model": tree});
        $(el).append(tree_view.el);

        //hide item
        var item = new TreeItem({"title": "Testing"});
        tree.add( item );
        equal( $(el).find(".tree > .folder_items > .empty")[0].style.display, "none" );
        item.set({"visible": false});
        equal( $(el).find(".tree > .folder_items > .empty")[0].style.display, "" );

        //hide folder
        var folder = new Folder({"title": "Testing"});
        tree.add( folder );
        equal( $(el).find(".tree > .folder_items > .empty")[0].style.display, "none" );
        folder.set({"visible": false});
        equal( $(el).find(".tree > .folder_items > .empty")[0].style.display, "" );
    });

});

function set_common_variables(context, item_value) {
    item_value = item_value || {"title": "Item 1"};
    context.el = $("<div id='tree'></div>");
    context.i = new TreeItem(item_value);
    context.iv = new TreeItemView({"model": context.i});
    $(context.el).html( context.iv.el );
}
