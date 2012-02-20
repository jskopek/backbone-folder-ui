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
        undeclared();
    });
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
        undeclared();
    });
    test("child retrieved from nested folders", function() {
        undeclared();
    });
    test("folder can loop through nested children", function() {
        undeclared();
    });
    test("folder can return flattened list of nested children", function() {
        undeclared();
    });
    test("folder can return if it is selected or not", function() {
        undeclared();
    });
});

