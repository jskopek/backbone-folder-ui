var TreeActionItem = TreeItem.extend({
    defaults: _.extend({}, TreeItem.prototype.defaults, {
        actions: [],
        current_action: undefined,
        constructor: "action_item"
    }),
});
window.tree_constructors.models["action_item"] = TreeActionItem;

var TreeActionItemView = TreeItemView.extend({
    className: "tree_row module_item no_tree_children",
    initialize: function() {
        TreeItemView.prototype.initialize.call(this);
        this.model.bind("change:actions", this.render_action, this);
        this.model.bind("change:current_action", this.render_action, this);
    },
    render: function() {
        TreeItemView.prototype.render.call(this);
        this.render_action();
    },
    render_action: function() {
        var el = $(this.el).children("div").find("span.status");
        if( el.length ) {
            $(this.el).find(".status").actionmenu("option", "current_action", this.model.get("current_action"));
        } else {
            el = $("<span class='status'></span>");
            $(this.el).children("div").append( el );

            //set up the actions dropdown
            $(this.el).find(".status").actionmenu({
                "actions": this.model.get("actions"),
                "current_action": this.model.get("current_action")
            });
            $(this.el).find(".status").bind("actionmenuclicked", $.proxy(function(e, action) {
                this.model.set({"current_action": action});
                this.model.trigger("click:current_action");
            }, this));
        }
    }
});
window.tree_constructors.views["action_item"] = TreeActionItemView;
