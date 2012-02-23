/* Copyright (c) 2012 Top Hat Monocle, http://tophatmonocle.com/
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy 
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/

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
