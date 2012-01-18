var MI = Backbone.Model.extend({});

var Folder = Backbone.Model.extend({
    defaults: {
        title: "",
        children: []
    }
});

var FolderView = Backbone.View.extend({
    tagName: "li",
    className: "folder",

    initialize: function() {
        this.render();
    },
    render: function() {
        var template = _.template( $("#folder_template").text() );
        var html = template( this.model.toJSON() );
        $(this.el).html(html);
    }
});

