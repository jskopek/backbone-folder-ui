$(document).ready(function() {
    module("Tree Item");
    test("initialize tree item", function() {
        var item = new TreeItem();
        equal(item.get("title"), "-");
    });

    test("is_selected property", function() {
        var item = new TreeItem();
        equal(item.is_selected(), false);

        item.set({"selected": true});
        equal(item.is_selected(), false);

        item.set({"selectable": true});
        equal(item.is_selected(), true);

        item.set({"selectable": false});
        equal(item.is_selected(), false);
    });

    test("serializing default data", function() {
        var item = new TreeItem();

        //create new JSON object with tree item defaults, minus
        //click method; this is removed during serialize
        var data = TreeItem.prototype.defaults;
        delete data["click"];

        deepEqual( item.serialize(), data );
    });

    test("serializing custom data", function() {
        var newItemData = {"title": "+ Alpha 123", "selectable": true, "selected": false, "click": function() {} }
        var item = new TreeItem(newItemData);

        //create new JSON object with tree item defaults, minus
        //click method; this is removed during serialize
        var data = $.extend({}, TreeItem.prototype.defaults, newItemData);
        delete data["click"];

        deepEqual( item.serialize(), data );
    });

    test("deserializing", function() {
        var newItemData = {"title": "+ Alpha 123", "selectable": true, "selected": false, "click": function() {} }
        var itemA = new TreeItem(newItemData);
        var itemB = new TreeItem()
        itemB.deserialize(newItemData);

        equal(itemA.get("title"), itemB.get("title"));
        deepEqual(itemA.serialize(), itemB.serialize());
    });
});

