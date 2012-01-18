var MIcounter = 0;
var MI = Backbone.Model.extend({
    defaults: {
        status: "inactive"
    },
    initialize: function() {
        //temp way of setting MI name really quickly
        this.set({"title": "Module Item " + MIcounter});
        MIcounter++;

        this.set({"view": new MIView({ model: this }) });
    },
    change_status: function() {
        var statuses = ["active_visible", "visible", "active", "review", "inactive"];
        var status_index = _.indexOf(statuses, this.get("status"));
        if( status_index >= statuses.length - 1 ) {
            status_index = 0;
        } else {
            status_index++;
        }

        this.set({"status": statuses[status_index] });
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
        this.model.change_status();
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
        hidden: false,

        //should be automatically caluclated based on status of children
        //stored as property to make nested folder status changes easier
        status: undefined
    },
    initialize: function() {
        if( _.isArray( this.get("children") ) ) {
            this.set({"children": new Backbone.Collection(this.get("children")) });
        }
        this.set({"view": new FolderView({ model: this }) });

        //stored and calculated seperately for easy calculation and upating on nested folders
        this.update_status();
        this.get("children").bind("change:status", this.update_status, this);
    },
    update_status: function() {
        var statuses = this.get("children").pluck("status");
        var uniq_status = _.uniq(statuses);

        if( uniq_status.length == 0 ) {
            var status =  "inactive";
        } else if( uniq_status.length == 1 ) {
            var status =  uniq_status[0];
        } else {
            var status =  "mixed";
        }

        this.set({"status": status});
    }
});

var FolderView = Backbone.View.extend({
    tagName: "li",
    className: "folder",

    initialize: function() {
        this.render();
        this.model.bind("change:hidden", this.render, this);
        this.model.bind("change:status", this.render, this);
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
            "status": this.model.get("status")
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

