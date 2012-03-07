var commonFolderStructure = {
    "title": "Folder A",
    "children": [
        new TreeItem({ "title": "Child item 1" }),
        new Folder({ 
            "title": "Child item 2",
            "children": [new TreeItem({ "title": "Child item 3" })]
        })
    ]
}

$(document).ready(function() {
    module("Tree Folder");
    test("initialize without children", function() {
        var f = new Folder();
        equal(f.get('title'), '');
        equal(f.get('children').length, 0);
    });
    test("initialize with children", function() {
        var f = new Folder({
            "title": "Folder A",
            "children": [
                new TreeItem({ "title": "Child item 1" }),
                new Folder({ "title": "Child item 2" })
            ]
        });
        equal(f.get("title"), "Folder A");
        equal(f.get("children").length, 2);
        ok( f.get("children").first() instanceof TreeItem );
        ok( f.get("children").last() instanceof Folder );
    });
    test("tree serialize", function() {
        var f = new Folder(commonFolderStructure);

        var data = f.serialize();

        //root folder data
        equal( data.title, "Folder A" );
        ok( data.children );

        //first child item data
        equal( data.children[0].constructor, "item" );
        equal( data.children[0].title, "Child item 1" );
        
        //second child folder data
        equal( data.children[1].constructor, "folder" );
        equal( data.children[1].title, "Child item 2" );
        equal( data.children[1].children.length, 1 );
    });
    test("tree deserialize", function() {
        var f = new Folder(commonFolderStructure);

        var data = f.serialize();

        //create new folder with deserialized data
        var f2 = new Folder();
        f2.deserialize( data );

        //test that deserialization was successful )
        deepEqual(f.serialize(), f2.serialize());
        equal(f2.get("title"), "Folder A")
        ok( f2.get("children").first() instanceof TreeItem );
        ok( f2.get("children").last() instanceof Folder );
        equal(f2.get("children").last().get("children").length, 1);
    });
    test("deserialize to empty", function() {
        var tree = new Tree();
        tree.add( new TreeItem({"title": "Test 1"}) );
        tree.add( new TreeItem({"title": "Test 2"}) );

        equal( tree.get("children").length, 2 );
        var emptyJSON = '{"hidden": false, "constructor": "folder", "children": [], "id": "", "title": ""}'
        tree.deserialize( JSON.parse(emptyJSON) );
        equal( tree.get("children").length, 0 );
    });

    /*test("funky deserialize", function() {*/
    /*var el = $("<div></div>");*/
    /*var folder = new Tree({*/
    /*"sortable": true,*/
    /*"children": [*/
    /*new Folder({*/
    /*"title": "Folder 1",*/
    /*"children": [*/
    /*new TreeItem({"title": "Item 1"})*/
    /*]*/
    /*}),*/
    /*new TreeItem({"title": "Item 2"})*/
    /*]*/
    /*});*/
    /*var view = new TreeView({"model": folder});*/
    /*$(el).html(view.el);*/

    /*//move Item 1 to position 1*/
    /**//*folder.move( folder.get("children").at(0), 1 );*/
    /**//*equal($(el).find(".folder .tree_row.item:first em").text(), "Item 2");*/
    /**//*equal($(el).find(".folder .tree_row.item:last em").text(), "Item 1");*/
    /*$("body").append(el);*/
    /*});*/

    test("child added to folder", function() {
        var f = new Folder();
        equal( f.get('children').length, 0 );

        //add item
        var i1 = new TreeItem({"title": "Item 1"});
        f.add(i1);
        equal( f.get('children').length, 1 );

        //add item at first index
        var i2 = new TreeItem({"title": "Item 2"});
        f.add(i2, 0);
        equal( f.get('children').length, 2 );
        equal( f.get('children').first().get("title"), "Item 2" );

        //add item at very high index
        var i3 = new TreeItem({"title": "Item 3"});
        f.add(i3, 1000);
        equal( f.get("children").length, 3);
        equal( f.get("children").at(2).get("title"), "Item 3");
    });
    test("child removed from folder", function() {
        var f = new Folder();

        //add item
        var i1 = new TreeItem({"title": "Item 1"});
        f.add(i1);
        equal( f.get('children').length, 1 );

        //attempt to remove item that is not in folder from folder
        var i2 = new TreeItem({"title": "Item 2"});
        f.remove(i2);
        equal( f.get('children').length, 1 );

        //remove item from folder
        f.remove(i1);
        equal( f.get('children').length, 0 );
    });
    test("child moved in folder", function() {
        var f = new Folder();

        //add three children to folder
        var i1 = new TreeItem({"title": "Item 1"});
        var i2 = new TreeItem({"title": "Item 2"});
        var i3 = new TreeItem({"title": "Item 3"});
        f.add([i1, i2, i3]);
        equal( f.get('children').length, 3 );

        //move item 1 to last position
        equal( f.get('children').first().get("title"), "Item 1" );
        f.move(i1, 1000);
        equal( f.get('children').first().get("title"), "Item 2" );
        equal( f.get('children').last().get("title"), "Item 1" );

        //move item 3 to first position
        f.move(i3, 0);
        equal( f.get('children').first().get("title"), "Item 3" );

        //move item 3 to middle
        f.move(i3, 1);
        equal( f.get('children').first().get("title"), "Item 2" );
        equal( f.get('children').at(1).get("title"), "Item 3" );
    });
    test("child retrieved from folder", function() {
        var f = new Folder();
        var i1 = new TreeItem({ "title": "Item 1", "id": "a1", "color": "blue" });
        var i2 = new TreeItem({ "title": "Item 2", "id": "a2", "color": "red" });
        var i3 = new TreeItem({ "title": "Item 3", "id": "a3", "color": "green" });
        var i4 = new TreeItem({ "title": "Item 4", "id": "a4", "color": "blue" });
        f.add([i1, i2, i3, i4]);

        //get by id
        equal( f.get_item("a1"), i1 );
        equal( f.get_item("a4"), i4 );
        equal( f.get_item("aUnknown"), false );

        //get by title
        equal( f.get_item("Item 2", "title"), i2 );
        equal( f.get_item("Item z", "title"), false );

        //get by color
        equal( f.get_item("blue", "color"), i1 );
        equal( f.get_item("red", "color"), i2 );

        //get by constructor
        var i5 = new TreeItem({ "title": "Apple" });
        var i6 = new Folder({ "title": "Apple" });
        f.add([i5, i6]);
        equal( f.get_item("Apple", "title", "item"), i5);
        equal( f.get_item("Apple", "title", "folder"), i6);
    });
    test("child retrieved from nested folders", function() {
        var f = new Folder(commonFolderStructure);
        var i1 = f.get("children").last().get("children").last();

        equal( f.get_item("Child item 3", "title"), i1 );
    });
    test("folder can loop through nested children", function() {
        var f = new Folder(commonFolderStructure);

        expect(3); //expect 3 ok() assertions - one for each item
        f.nested_each(function(i) {
            ok(i instanceof Backbone.Model);
        });
    });
    test("folder can return flattened list of nested children", function() {
        var f = new Folder(commonFolderStructure);

        //when flattened, expect 4 results - three children
        //and self
        var f_array = f.flatten();
        equal( f_array.length, 4 );
        f_array.each(function(i) {
            ok(i instanceof Backbone.Model);
        });

        //when folders are excluded from flatten, expect 2 results
        var f_array = f.flatten(true);
        equal( f_array.length, 2 );
        f_array.each(function(i) {
            ok(i instanceof TreeItem);
        });
    });

    module("Folder events");
    test("nested add event works", function() {
        expect(3);
        var f = new Folder();
        var f2 = new Folder();
        var i1 = new TreeItem({"title": "Item 1"});
        var i2 = new TreeItem({"title": "Item 2"});

        f.bind("nested:add", function(item) { equal(item, f2); });
        f.add( f2 );
        f.unbind("nested:add");

        f.bind("nested:add", function(item) { equal(item, i1); });
        f2.add( i1 );
        f.unbind("nested:add");

        f.bind("nested:add", function(item) { equal(item, i2); });
        f2.add( i2 );
        f.unbind("nested:add");
    });
    test("nested remove event works", function() {
        expect(3);
        var f = new Folder();
        var f2 = new Folder();
        var i1 = new TreeItem({"title": "Item 1"});
        var i2 = new TreeItem({"title": "Item 2"});
        f.add( f2 );
        f2.add( i1 );
        f2.add( i2 );

        f.bind("nested:remove", function(item) { equal(item, i1); });
        f2.remove( i1 );
        f.unbind("nested:remove");

        f.bind("nested:remove", function(item) { equal(item, i2); });
        f2.remove( i2 );
        f.unbind("nested:remove");

        f.bind("nested:remove", function(item) { equal(item, f2); });
        f.remove( f2 );
        f.unbind("nested:remove");
    });
    test("Add event works", function() {
        expect(1);
        var f = new Folder();
        var i = new TreeItem({"title": "Item 1"});
        f.bind("add", function(item) { equal(item, i); });
        f.add( i );
    });
    test("Remove event works", function() {
        expect(1);
        var f = new Folder();
        var i = new TreeItem({"title": "Item 1"});
        f.add( i );
        f.bind("remove", function(item) { equal(item, i); });
        f.remove( i );
    });

    module("Tree folder selection");
    test("folder selected changes children selected", function() {
        var f = new Folder(commonFolderStructure);
        f.nested_each(function(i) { i.set({"selectable": true}) });

        //check that all items are deselected
        var is_selected_list = f.flatten().map(function(i) { return i.is_selected(); });
        deepEqual( is_selected_list, [false, false, false, false] );

        //select root folder and ensure that all children are selected
        f.set({"selected": true});
        var is_selected_list = f.flatten().map(function(i) { return i.is_selected(); });
        deepEqual( is_selected_list, [true, true, true, true] );

        //deselect root folder and ensure all children are unselected
        f.set({"selected": false});
        var is_selected_list = f.flatten().map(function(i) { return i.is_selected(); });
        deepEqual( is_selected_list, [false, false, false, false] );
        
        //set the item that is the child of the child folder to true
        //will set it's parent's folder selected status to true, and the root folder's
        //status to mixed (but false in is_selected)
        f.flatten().last().set({"selected": true});
        var is_selected_list = f.flatten().map(function(i) { return i.is_selected(); });
        deepEqual( is_selected_list, [false, false, true, true] );
        equal( f.get("selected"), "mixed" );
    });
    test("moving selected item between folders changed folder selection", function() {
        var f1 = new Folder({"selectable": true});
        var f2 = new Folder({"selectable": true});

        var i1 = new TreeItem({ "selectable": true, "selected": true });

        //adding selected item to folder selects it
        ok( !f1.is_selected() );
        f1.add( i1 );
        ok( f1.is_selected() );

        //removing selected item makes folder unselected
        f1.remove( i1 );
        ok( !f1.is_selected() );

        //adding unselected item and selected item to folder makes it 'mixed'
        var i2 = new TreeItem({ "selectable": true, "selected": false });
        f1.add( [i1, i2] );
        ok( !f1.is_selected() );
        equal( f1.get("selected"), "mixed" );
    });
});

