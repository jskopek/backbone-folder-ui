import simplejson

#request methods
def add_item(cd, type, id, folder_id=None, position=None):
    tree = cd.initialize_tree()

    item = tree.initialize_type( type, id )
    parent_folder = tree.get_item( folder_id ) or tree
    parent_folder.add_item(item, at=position)

    cd.save_tree(tree)

def remove_item(cd, id):
    tree = cd.initialize_tree()

    item = tree.get_item(id)
    for parent in item.parents(tree):
        parent.remove_item(item)

    cd.save_tree(tree)

def move_item(cd, id, old_folder_id, new_folder_id, position):
    tree = cd.initialize_tree()

    old_folder = tree.get_item(old_folder_id)
    new_folder = tree.get_item(new_folder_id)
    item = old_folder.get_item(id)

    old_folder.remove_item(item)
    new_folder.insert_item(item, at=position)

    cd.save_tree(tree)

def set_folder_hidden(fs, folder_id, hidden_status):
    pass


##################
class Item:
    id = None
    def serialize(self):
        return {
            "id": self.id,
            "constructor": "item"
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
        self.children = []
        self.hidden = False
        
    def add_item(self, item, at=None):
        if at is None:
            at = len(self.children)
        self.children.insert(at, item)
        
    def remove_item(self, item):
        if item in self.children:
            self.children.remove(item)
            return True
        else:
            return False

    def serialize(self):
        serialized_children = []
        for child in self.children:
            serialized_children.append( child.serialize() )

        return {
            "id": self.id,
            "hidden": self.hidden,
            "constructor": "folder",
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
        elif type == "folder":
            item_class = Folder

        item = item_class()
        item.id = id
        return item


class CourseData(Folder):
    def __init__(self):
        self.folder_structure = '{"id":"", "children":[]}';
    
    def initialize_tree(self):
        json = simplejson.loads(self.folder_structure)

        tree = Folder()
        tree.deserialize(json)
        return tree
        
    def save_tree(self, tree):
        json = tree.serialize()
        self.folder_structure = simplejson.dumps(json)
        return self.folder_structure


##f = Folder()
##f.deserilize(course_data.folder_structure)
##....
##course_data.folder_structure = f.serialize()
##course_data.save()

#class FolderStructure():
    #folder_structure = '[]'

    #def decode(self):
        #return simplejson.loads(self.folder_structure)

    #def encode(self, folder_json):
        #self.folder_structure = simplejson.loads(folder_json)

    #def serialized(self):
        #structure = self.decode()
        #structure = [{"children": structure}]
        #return simplejson.dumps(structure)

    #def set_folder_hidden(self, id, hidden_status):
        #pass

    #def generate_item(self, type, id):
        #if type == "folder":
            #return {
                #"title": id,
                #"children": [],
                #"hidden": False,
                #"constructor_ref": "FolderConstructorRef"
            #}
        #elif type == "module_item":
            #return {
                #"title": id,
                #"constructor_ref": "TreeItemConstructorRef"
            #}

    #def add_child(self, folder, item):
        #pass
    #def remove_child(self, folder, item):
        #pass
    #def move_child(self, folder, item):
        #pass
##    def add_item(self, type, id):
##        structure = self.decode()
##        structure.append( self.generate_item(type, id) )
##        self.structure = self.encode(structure)
##
##    def move_item(self, type, id, parent_folder, position):
##        item = self.get_item(type, id)
##        self.remove_item(item)
##        self.add_item(item, parent_folder, position)
##
##    def remove_item(self, type, id):
##        structure = self.decode()
##
##        def navigate(items):
##            for item in items:
##                if item["title"] == id:
##                    return item
##        navigate(structure)
##
##
##        self.structure = self.encode(structure)

