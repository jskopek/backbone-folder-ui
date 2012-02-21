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

To create a new tree, first create a new instance of the `Tree` class. Next, create a `TreeView` instance and link it to the tree class by setting it's `model` property. The `TreeView` renders the `Tree`s data in its `el` property.

    var tree_instance = new Tree();
    var tree_view = new TreeView({"model": tree_instance});
    $("#tree").html( tree_view.el )

Trees contain two types of items - `TreeItem` and `Folder` instances. Let's create an instance of each

    var item = new TreeItem({"title": "Item A"});
    var folder = new Folder({"title": "Folder 1", "children": [item]})

Trees and Folders both store their children in the `children` property, which in turn is a `Backbone.Collection` instance. As such, we can use all of the `Backbone.Collection` [methods](http://backbonejs.org/#Collection-Underscore-Methods) to add, remove, and retrieve items. Let's add the newly created folder to the tree

    tree_instance.get("children").add( folder );

Tada! The `#tree` element now shows folder `Folder 1` and it's child `Item A`. Our `TreeView` instance monitors for all changes to the tree, and automatically updates itself on every change.

We can use Backbone's built in methods to view and manipulate our data

    tree.get("children").each(function(child) { console.log(child); }); //Folder 1
    tree.get("children").length(); //1
    tree.get("children").remove( folder );

We can also use built-in methods to find child items and loop through nested children
    
    tree.nested_each(function(child) { console.log(child); }); //Folder 1, Item A
    tree.flatten().length(); //2
    tree.get_item("Item A", "title"); //returns `item`

##Items

Items are the simplest data types in the tree. They contain the following properties: `title, id, hidden, click, selected, selectable`.

###Creating items

Items can be created by initializing a new instance of `TreeItem`

###Methods

The `TreeItem` extends `Backbone.Model`, and therefore has access to all of it's [methods](http://backbonejs.org/#Model). It also has the following methods:

The TreeItem has several special properties. 

* `id`: internal id of the instance
* `title`: the title to be shown
* `hidden`: a Boolean value indicating if the item is shown or not (e.g. when a containing folder is closed)
* `click`: an optional `function` callback; called when the item's title is clicked
* `selected`: a Boolean value indicating if the item has been selected
* `selectable`: a Boolean value indicating if the item is capable of being selected; determines if a select checkbox is rendered for the item

These properties can be changed with Backbone's `get` and `set` methods (e.g. `item.get('title'); item.set({'title': 'Item A - modified'});`)

* `serialize()`: converts the item's data into a JSON object
* `deserialize( json )`: updates itself with the passed JSON object
* `is_selected()`: returns a Boolean result indicating if the item is selected; if `selectable` is set to `false`, will always return `false`

###Events

* `change:*`: the `*` will vary based on the property that was changed (e.g. `change:title`)
* `change`: triggered every time a property is changed

##Folders
###Creating folders
###Methods
###Events
###Serialization & Deserialization
###Constructors

Both `TreeItem` and `Folder` classes have a `constructor` property, which is a string representing the type of object they represent. When an item is serialized, the `constructor` property is passed in to distinguish the data type. When the `deserialize` method is called on a `Tree` or a `Folder`, the `constructor` property is used to determine what classes to initialize for each child.

A global `window.tree_constructors` dictionary contains a reference to the model and view classes for each `constructor` type. This dictionary is what allows the Folder and Tree instances to know what models to initialize on deserialization. Here's what the default `tree_constructor` looks like:

    window.tree_constructors = {
        "models": {
            "item": TreeItem,
            "folder": Folder
        },
        "views": {
            "item": TreeItemView,
            "folder": FolderView
        }
    }

If you are extending the tree with your own custom types, be sure to set a `constructor` property on your model and assign corresponding properties to the tree_constructor dictionary

###Extending

##Tree
###Sorting

##Tree Views

##Download & Contribute

##License

##Examples
