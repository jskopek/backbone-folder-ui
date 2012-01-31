import simplejson

class Item:
    def __init__(self):
        self.id = None
        self.constructor = "item"

    def serialize(self):
        return {
            "id": self.id,
            "constructor": self.constructor
        }

    def deserialize(self, data):
        self.id = data["id"]

    def parents(self, folder):
        parent_folders = []
        for child in folder.children:
            if isinstance(child, Folder):
                parent_folders.extend( self.parents(child) )

            if child.id == self.id and not folder in parent_folders:
                parent_folders.append(folder)
        return parent_folders



class Folder(Item):
    def __init__(self):
        self.id = None
        self.children = []
        self.hidden = False
        self.constructor = "folder"

    def add_item(self, item, at=None):
        if at is None:
            at = len(self.children)
        self.children.insert(at, item)
        
    def length(self):
        return len(self.children)

    def remove_item(self, item):
        if item in self.children:
            self.children.remove(item)

            #run again to check for multiple items
            self.remove_item(item) 
            return True
        else:
            return False

    def serialize(self):
        serialized_children = []
        for child in self.children:
            serialized_children.append( child.serialize() )

        return {
            "id": self.id,
            "title": self.id,
            "hidden": self.hidden,
            "constructor": self.constructor,
            "children": serialized_children
        }

    def deserialize(self, data):
        self.id = data["id"]
        self.hidden = data.get("hidden", False)
        
        self.children = []
        for child in data.get("children", []):
            item = self.initialize_type( child["constructor"] )
            item.deserialize( child )
            self.children.append( item )

    def get_item(self, id):
        if self.id == id:
            return self

        for child in self.children:
            if child.id == id:
                return child

            if isinstance(child, Folder):
                child_match = child.get_item(id)
                if child_match:
                    return child_match

        return False

    @staticmethod
    def initialize_type(type, id=None):
        #set up new item
        if type == "item":
            item_class = Item
        elif type == "module_item":
            item_class = ModuleItem
        elif type == "module_item_folder":
            item_class = ModuleItemFolder
        elif type == "folder":
            item_class = Folder

        item = item_class()
        item.id = id
        return item

class ModuleItem(Item):
    def __init__(self):
        self.id = None
        self.constructor = "module_item"

class ModuleItemFolder(Folder):
    def __init__(self):
        self.id = None
        self.children = []
        self.hidden = False
        self.constructor = "module_item_folder"

