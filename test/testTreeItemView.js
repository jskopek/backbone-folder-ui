$(document).ready(function() {
    module("Tree Item View");
    test("item view shows title", function() {
        var i = new TreeItem({"title": "Item 1"});
        var v1 = new TreeItemView({"model": i});
        $("#tree").html( v1.el );

        equal( $("#tree em").html(), "Item 1" );
    });
    test("item view updates title when changed", function() {
        equal( $("#tree em").html(), "Item 1" );
    });
    test("item view shows select checkbox when selectable", function() {
        undefined();
    });
    test("item view select checkbox updated when selected", function() {
        undefined();
    });
    test("item view select checkbox changes selected view when clicked", function() {
        undefined();
    });
    test("title triggers click event when clicked", function() {
        undefined();
    });
});
