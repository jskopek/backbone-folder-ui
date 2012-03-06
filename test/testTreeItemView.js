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
        undefined();
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

    /*module("Tree");*/
    /*test("dragging item into hidden folder maximizes", function() {*/
    /*var tree = new Tree({*/
    /*"chidren": [*/
    /*new TreeItem({"title": "Item 1"}),*/
    /*new TreeItem({"title": "Item 2"}),*/
    /*new TreeItem({"title": "Item 3"})*/
    /*]*/
    /*sortable: true*/
    /*});*/
    /*var view = new TreeView({"model": tree});*/
    /*$("body").append(view.el);*/

    /*var folder = new Folder({"title": "Folder 1", "hidden": true});*/
    /*folder.add( new TreeItem({"title": "Item 1"}) );*/
    /*folder.add( new TreeItem({"title": "Item 2"}) );*/
    /*folder.add( new TreeItem({"title": "Item 3"}) );*/
    /*tree.add(folder);*/
    /*var i2 = new TreeItem({"title": "Item 4"});*/
    /*tree.add( i2 );*/
    /**//*debugger;*/
    /*tree.move(i2,0);*/
    /*view.render();*/
    /*folder.set({"hidden": false});*/
    /*});*/
});

function set_common_variables(context, item_value) {
    item_value = item_value || {"title": "Item 1"};
    context.el = $("<div id='tree'></div>");
    context.i = new TreeItem(item_value);
    context.iv = new TreeItemView({"model": context.i});
    $(context.el).html( context.iv.el );
}
