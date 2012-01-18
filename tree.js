var MIcounter = 0;
var MI = Backbone.Model.extend({
    initialize: function() {
        //temp way of setting MI name really quickly
        this.set({"title": "Module Item " + MIcounter});
        MIcounter++;

        this.set_random_status();

        this.set({"view": new MIView({ model: this }) });
    },
    set_random_status: function() {
        var statuses = ["active_visible", "visible", "active", "review", "inactive"];
        var choice = Math.floor( Math.random() * statuses.length );
        this.set({"status": statuses[choice] });
    }
});

var MIView = Backbone.View.extend({
    className: "module_item",
    tagName: "li",

    initialize: function() {
        this.render();
        this.model.bind("change:status", this.render, this);
    },
    events: {
        "click a": "change_status",
    },
    change_status: function(e) {
        e.preventDefault();
        this.model.set_random_status();
    },
    render: function() {
        var template = _.template("<b>MI: <%= title %>, Status: <%= status %>, <a href='#'>Change Status</a></b>");
        $(this.el).html( template( this.model.toJSON() ) );

        this.delegateEvents();
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
    },
    get_status: function() {
        var statuses = this.get("children").pluck("status");
        var uniq_status = _.uniq(statuses);
        if( uniq_status.length == 0 ) {
            return "inactive";
        } else if( uniq_status.length == 1 ) {
            return uniq_status[0];
        } else {
            return "mixed";
        }
    }
});

var FolderView = Backbone.View.extend({
    tagName: "li",
    className: "folder",

    initialize: function() {
        this.render();
        this.model.bind("change:hidden", this.render, this);
        this.model.get("children").bind("change:status", this.render, this);
    },
    toggle_hide: function(e) {
        e.preventDefault();
        var is_hidden = this.model.get("hidden");
        this.model.set({ "hidden": !is_hidden });
    },
    render: function() {
        var template = _.template("<div id='<%= cid %>'><b><%= title %></b> Status: <%= status %><a href='#'>Hide</a></div><ul></ul>");
        var html = template({
            "cid": this.model.cid,
            "title": this.model.get("title"),
            "status": this.model.get_status()
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

