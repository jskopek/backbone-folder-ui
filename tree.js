var MIcounter = 0;
var MI = Backbone.Model.extend({
    initialize: function() {
        //temp way of setting MI name really quickly
        this.set({"title": "Module Item " + MIcounter});
        MIcounter++;

        this.set({"view": new MIView({ model: this }) });
    }
});

var MIView = Backbone.View.extend({
    className: "module_item",
    tagName: "li",

    initialize: function() {
        this.render();
    },
    render: function() {
        var template = _.template("<b>MI: <%= title %></b>");
        $(this.el).html( template( this.model.toJSON() ) );
    }
})

var Folder = Backbone.Model.extend({
    defaults: {
        title: "",
        children: new Backbone.Collection(),
        hidden: false
    },
    initialize: function() {
        if( _.isArray( this.get("children") ) ) {
            this.set({"children": new Backbone.Collection(this.get("children")) });
        }
        this.set({"view": new FolderView({ model: this }) });
    }
});

var FolderView = Backbone.View.extend({
    tagName: "li",
    className: "folder",

    initialize: function() {
        this.render();
        this.model.bind("change:hidden", this.render, this);
    },
    toggle_hide: function(e) {
        e.preventDefault();
        var is_hidden = this.model.get("hidden");
        this.model.set({ "hidden": !is_hidden });
    },
    render: function() {
        var template = _.template("<div id='<%= cid %>'><b><%= title %></b><a href='#'>Hide</a></div><ul></ul>");
        var html = template({
           "cid": this.model.cid,
           "title": this.model.get("title")
        });
        $(this.el).html(html);

        //bind hide event
        $(this.el).find("#" + this.model.cid + " a").click($.proxy(function(e) { this.toggle_hide(e); }, this));

        //loop through and add children
        var ul_el = $(this.el).find("ul");
        if( !this.model.get("hidden") ) {
            this.model.get("children").each(function(child) {
                var li = $("<li></li>");
                child.get("view").render(); //rebinds hide event
                li.html( child.get("view").el );
                ul_el.append(li);
            });
        }
    }
});

