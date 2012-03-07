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

Ensure that the dependent libraries - Underscore, Backbone, and jQuery - are included on your page. Next, include the library scripts:

    <link rel="stylesheet" type="text/css" href="tree.css"></script>
    <script src="js/tree_view.js"></script>
    <script src="js/tree.js"></script>

To create a new tree, first create a new instance of the `Tree` class. Next, create a `TreeView` instance and link it to the tree class by setting it's `model` property. The `TreeView` renders the `Tree`s data in its `el` property.

    var tree = new Tree();
    var tree_view = new TreeView({"model": tree});
    $("#tree").html( tree_view.el )

Trees contain two types of items - `TreeItem` and `Folder` instances. Let's create an instance of each

    var item = new TreeItem({"title": "Item A"});
    var folder = new Folder({"title": "Folder 1", "children": [item]})

Trees and folders have `add` and `remove` methods to add items after they have been initialized:

    tree.add( folder );

Tada! The `#tree` element now shows folder `Folder 1` and it's child `Item A`. Our `TreeView` instance monitors for all changes to the tree, and automatically updates itself on every change.

We can use Backbone's built in methods to view and manipulate our data

    tree.each(function(child) { console.log(child); }); //Folder 1
    tree.length(); //1
    tree.remove( folder );

We can also use built-in methods to find child items and loop through nested children
    
    tree.nested_each(function(child) { console.log(child); }); //Folder 1, Item A
    tree.flatten().length(); //2
    tree.get_item("Item A", "title"); //returns `item`

##Items

Items are the simplest data types in the tree. They look something like this:

![](http://cl.ly/EPid/Image%202012.02.21%204:52:38%20PM.png)

###Creating items

Items can be created by initializing a new instance of `TreeItem` and adding it to either a `Tree` or a `Folder` instance:

    var item = new TreeItem({"title": "Item A"});
    tree.add( item );
    item.set({"title": "Item A - modified"});

###Methods

The `TreeItem` extends `Backbone.Model`, and therefore has access to all of its [properties and methods](http://backbonejs.org/#Model).

The TreeItem has several special properties. 

* `id`: internal id of the instance
* `title`: the title to be shown
* `hidden`: a Boolean value indicating if the item is shown or not (e.g. when a containing folder is closed)
* `click`: an optional `function` callback; called when the item's title is clicked
* `selected`: a Boolean value indicating if the item has been selected
* `selectable`: a Boolean value indicating if the item is capable of being selected; determines if a select checkbox is rendered for the item
* `visible`: determines if the item is shown or hidden in the tree

These properties can be changed with Backbone's `get` and `set` methods (e.g. `item.get('title');` or `item.set({'title': 'Item A - modified'});`)

* `serialize()`: converts the item's data into a JSON object
* `deserialize( json )`: updates itself with the passed JSON object
* `is_selected()`: returns a Boolean result indicating if the item is selected; if `selectable` is set to `false`, will always return `false`

###Events

* `change:*`: the `*` will vary based on the property that was changed (e.g. `change:title`)
* `change`: triggered every time a property is changed

##Folders

The `Folder` model shares all of the methods and properties of the `TreeItem` model, and includes several methods and properties of its own. Here's what a folder looks like:

![](http://cl.ly/EPTK/Image%202012.02.21%205:00:40%20PM.png)

###Creating folders

Folders are created in much the same way as `TreeItem`s. An optional array of `children` may be passed; this will be converted into a `Backbone.Collection`

    var folder = new Folder({"title": "Folder 1", "children": [item]});
    tree.add( folder );

Trees and Folders both store their children in the `children` property, which in turn is a `Backbone.Collection` instance. As such, we can use all of the `Backbone.Collection` [methods](http://backbonejs.org/#Collection-Underscore-Methods) to add, remove, and retrieve items. Let's add the newly created folder to the tree

    tree_instance.get("children").filter(function(item) { return item.id % 2; });

###Properties

The `Folder` includes all the `TreeItem`s properties, as well as the following:

* `children`: a `Backbone.Collection` instance of all of the folder's child folders and items

###Methods

* `add( item, position )`: adds an item to the folder. Can pass in an individual item or list of item. The optional `position` value specifies where the item is added, but defaults to the end of the folder
* `remove( item )`: remove the referenced item from the folder
* `move( item, position )`: move an item from the folder to the new position
* `each( callback )`: loops thorugh each item in the folder
* `length()`: return the number of children in the folder
* `nested_each( callback )`: recursively loops through each item in the folder, including their children if they are folders 
* `get_item( value, variable_name, type )`: look for an item with the `id` of `value`. The search takes place recursively thorugh nested folders. The optional `variable_name` allows us to specify an alternative property to serach values by (e.g. title). The optional `type` property lets us limit our search to items with a specific constructor (e.g. `folder`)
* `flatten()`: returns a backbone collection of all of items in folder, including nested children
* `selected()`: returns all selected items in folder, including nested children

###Events

Folders have the following events in addition the the `TreeItem`s `change` events:

* `add`: triggered when item is added to folder
* `remove`: triggered when item is removed from folder
* `move`: triggered when a child's position is changed in the folder
* `save:hidden`: a special event that is triggered when the hidde indicator is clicked by a user; triggered in addition to the `change:hidden` event, which is fired if the value is changed programmatically
* `nested:add`: triggered when new items are added to the folder or any of the folder's children
* `nested:remove`: triggered when items are removed from the folder or any of the folder's children
* `deserialize`: triggered after a folder has been deserialized

##Tree

Trees share all of the properties of folders, but add two unique properties:

* `sortable`: A Boolean value that determines if the tree can be reordered with drag & drop
* `show_select_all`: A Boolean value that determines if we should show a "Select All/None" dialog in the tree view

###Sorting

Trees can be sorted via drag & drop, thanks to the excellent [nestedSort](http://mjsarfatti.com/sandbox/nestedSortable/) jQuery plugin. To enable drag & drop sorting, include the nestedSort library in your page and set the `sortable` Tree property  to true. The tree structure will be automatically updated as the user moves folders items around, and `add`, `remove`, and `move` events will be triggered as appropriate.

##Serialization & Deserialization

Items, Folders, and Trees can all be serialized and deserialized from JSON objects with the `serialize` and `deserialize` command. This functionality allows you to create dynamic trees on the client side, store them remotely or via local storage, and then recall them at a later time. Note that the `click` property of `TreeItem` and `Folder` objects is lost during serialization, as we are unable to serialize functions

##Constructors

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

##Tree Views

As of now, the Backbone Tree only has one way of presenting trees. The default `TreeView` ties into a `Tree` instance by setting it as the `model` property. Alternate views for tree data will be coming soon!

##Download & Contribute

To download the latest version of the library, click on the `Zip` button at the top of the page. We welcome all feature requests, issues, and pull requests.

##License

Copyright (c) 2012 Top Hat Monocle, http://tophatmonocle.com/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
