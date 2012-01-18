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

    render: function() {
        var template = _.template( $("#folder_template").html() );
        var html = this.template( this.model.toJSON() );
        $(this.el).html(html);
    }
});

