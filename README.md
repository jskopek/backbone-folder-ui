# Backbone Tree

The Backbone Tree is a library that allows developers to create tree sets of data. The library is built on the Backbone framework, with an object-oriented structure that allows for easy extension.

A picture is worth a thousand words, so here's a what the Backbone Tree looks like in action:

![](http://cl.ly/EQMd/Image%202012.02.21%203:26:43%20PM.png)


##Features

* Nested folders
* Select & unselect
* Drag and drop reordering
* Data persistance with serialization and deserialization
* Powerful event model
* Build on Backbone

##Getting Started

To create a new tree, first create a new instance of the `Tree` class. Next, create a `TreeView` instance and link it to the tree class. The `TreeView` renders the `Tree`'s data in it's `el` property.

    var tree_instance = new Tree();
    var tree_view = new TreeView({"model": tree_instance});
    $("#tree").html( tree_view.el )

Trees contain two types of items - `TreeItem` and `Folder` instances. Let's create an instance of each

    var item = new TreeItem({"title": "Item A"});
    var folder = new Folder({"title": "Folder 1", "children": [item]})

Trees and Folders both store their children in the `children` property, which in turn is a `Backbone.Collection` instance. As such, we can use all of the `Backbone.Collection` [methods](http://backbonejs.org/#Collection-Underscore-Methods) to add, remove, and retrieve items. Let's add the newly created folder to the tree

    tree_instance.get("children").add( folder );

Tada! The `#tree` element now shows folder `Folder 1` and it's child `Item A`. Our `TreeView` instance monitors for all changes to the tree, and automatically updates itself on every change.

##Items

###Creating items
###Methods
###Events
###Extending

##Folders
###Creating folders
###Methods
###Events
###Serialization & Deserialization
###Constructors
###Extending

##Tree
###Sorting

##Tree Views

##Download & Contribute

##License

##Examples
