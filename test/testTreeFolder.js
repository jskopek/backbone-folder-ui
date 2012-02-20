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
        var f = new Folder({
            "title": "Folder A",
            "children": [
                new TreeItem({ "title": "Child item 1" }),
                new Folder({ 
                    "title": "Child item 2",
                    "children": [new TreeItem({ "title": "Child item 3" })]
                })
            ]
        });

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
        var f = new Folder({
            "title": "Folder A",
            "children": [
                new TreeItem({ "title": "Child item 1" }),
                new Folder({ 
                    "title": "Child item 2",
                    "children": [new TreeItem({ "title": "Child item 3" })]
                })
            ]
        });

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
        undeclared();
    });
    test("folder selected without children", function() {
        undeclared();
    });
    test("child added to folder", function() {
        undeclared();
    });
    test("child removed from folder", function() {
        undeclared();
    });
    test("child moved in folder", function() {
        undeclared();
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

