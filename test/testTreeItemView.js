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
        set_common_variables(this, {"title": "Item 1", "selectable": true});

        $("body").append(this.el);
        ok( !this.i.get("selected") );
        $(this.el).find(".tree_row.item:first input[type=checkbox]").click();
        ok( this.i.get("selected") );
    });
    test("title triggers click event when clicked", function() {
        undefined();
    });
});

function set_common_variables(context, item_value) {
    item_value = item_value || {"title": "Item 1"};
    context.el = $("<div id='tree'></div>");
    context.i = new TreeItem(item_value);
    context.iv = new TreeItemView({"model": context.i});
    $(context.el).html( context.iv.el );
}
